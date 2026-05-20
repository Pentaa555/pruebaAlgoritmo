import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { LoginPage } from '../pages/LoginPage';
import { AuthContext } from '../context/AuthContext';
import type { AuthUser } from '../context/AuthContext';
import api from '../api/axiosInstance';

vi.mock('../api/axiosInstance', () => ({
  default: { post: vi.fn() },
}));

const mockLogin = vi.fn();
const mockCtx = {
  user: null,
  accessToken: null,
  login: mockLogin,
  logout: vi.fn(),
  updateUser: vi.fn(),
  isAdmin: () => false,
};

function setup() {
  return render(
    <AuthContext.Provider value={mockCtx}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders email and password fields', () => {
    setup();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitted empty', async () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('calls login on successful response', async () => {
    const mockUser: AuthUser = { id: '1', name: 'Admin', email: 'admin@demo.com', role: 'admin' };
    vi.mocked(api.post).mockResolvedValueOnce({
      data: { accessToken: 'tok', refreshToken: 'ref', user: mockUser },
    });
    setup();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'admin@demo.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Admin123!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('tok', 'ref', mockUser));
  });

  it('shows server error on failed login', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { message: 'Invalid credentials.' } },
    });
    setup();
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'bad@demo.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i)
    );
  });
});
