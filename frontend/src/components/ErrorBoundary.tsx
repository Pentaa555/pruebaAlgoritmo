import { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 24,
        }}>
          <p style={{ fontSize: 40 }}>⚠</p>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Algo salió mal</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 14 }}>
            Ocurrió un error inesperado. Por favor recarga la página.
          </p>
          <button className="btn accent" onClick={() => window.location.reload()}>
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
