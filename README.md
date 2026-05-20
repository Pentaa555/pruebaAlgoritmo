# UserApp — Auth + User CRUD

Full-stack application with React 18 + Vite frontend and .NET 8 Clean Architecture backend, using SQL Server in Docker.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 18+](https://nodejs.org/)
- dotnet-ef tool: `dotnet tool install --global dotnet-ef`

## Quick Start

### 1. Start SQL Server

```bash
docker compose up -d
```

### 2. Configure backend secrets

```bash
cd backend/UserApp.Api
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=localhost,1433;Database=UserAppDb;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True"
dotnet user-secrets set "Jwt:Key" "super-secret-jwt-key-that-is-at-least-32-characters-long"
cd ../..
```

### 3. Run the backend

```bash
cd backend
dotnet run --project UserApp.Api/UserApp.Api.csproj
```

API starts on `https://localhost:5001`. Migrations apply automatically. Seed data is inserted on first run.

### 4. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on `http://localhost:5173`.

## Swagger

Open `https://localhost:5001/swagger` to explore and test the API.
Click **Authorize** and paste your access token from a login response.

## Demo Credentials

| Email | Password | Role |
|---|---|---|
| admin@demo.com | Admin123! | admin |
| user@demo.com | User123! | user |

## Run Tests

```bash
# Backend
cd backend && dotnet test

# Frontend
cd frontend && npx vitest run
```

## Environment Variables (frontend)

Copy `frontend/.env.example` to `frontend/.env` and update `VITE_API_BASE_URL` if your backend runs on a different port.

## Architecture

```
backend/
  UserApp.Api/           Controllers, JWT middleware, Swagger, CORS, Serilog
  UserApp.Application/   Services, DTOs, interfaces, entities, exceptions
  UserApp.Infrastructure/ EF Core, repositories, BCrypt, JWT token service, migrations
frontend/src/
  api/                   Axios instance with token refresh interceptor
  context/               AuthContext (user state, login/logout)
  components/            Route guards, Layout navbar
  pages/                 Login, Register, Users, UserForm, Profile
```

## Security

- Passwords hashed with BCrypt (salt embedded in hash)
- JWT access tokens (HS256, 30-minute expiry)
- Refresh tokens stored in database, rotated on use, revoked on logout
- Role-based access: `admin` has full CRUD; `user` can only view and edit own profile
- Soft delete: users are deactivated (`IsActive = false`), never physically removed
