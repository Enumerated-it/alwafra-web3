import React from 'react';

/**
 * Error Boundary Component - PHASE 1 SÉCURITÉ
 * Capture les erreurs React et affiche une interface gracieuse
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log erreur pour monitoring
    console.error('Error Boundary caught:', error);
    console.error('Error Info:', errorInfo);

    // Send to monitoring service (Sentry, etc.)
    if (window.Sentry) {
      window.Sentry.captureException(error, { contexts: { react: errorInfo } });
    }
  }
    // logErrorService.captureException(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <h1 style={styles.title}>⚠️ Erreur Application</h1>
            <p style={styles.message}>
              Une erreur est survenue. Nos équipes ont été notifiées.
            </p>

            {process.env.NODE_ENV === 'development' && (
              <details style={styles.details}>
                <summary style={styles.summary}>Détails (Mode Dev)</summary>
                <pre style={styles.preError}>
                  {this.state.error && this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <button
              onClick={this.handleReset}
              style={styles.button}
            >
              🔄 Réessayer
            </button>
            
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{ ...styles.button, background: '#ff6b6b' }}
            >
              🗑️ Réinitialiser l'App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#050505',
    padding: '20px',
    fontFamily: 'Segoe UI, sans-serif'
  },
  card: {
    background: '#111',
    border: '2px solid #c1272d',
    borderRadius: '10px',
    padding: '30px',
    maxWidth: '600px',
    color: '#e0e0e0'
  },
  title: {
    color: '#c1272d',
    marginTop: 0,
    marginBottom: '15px'
  },
  message: {
    fontSize: '1rem',
    marginBottom: '20px',
    lineHeight: '1.6'
  },
  details: {
    background: '#222',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
    cursor: 'pointer',
    border: '1px solid #333'
  },
  summary: {
    fontWeight: 'bold',
    color: '#00ff41',
    outline: 'none'
  },
  preError: {
    background: '#000',
    color: '#ff6b6b',
    padding: '10px',
    borderRadius: '3px',
    fontSize: '0.8rem',
    overflow: 'auto',
    maxHeight: '300px',
    marginTop: '10px'
  },
  button: {
    background: '#00ff41',
    color: 'black',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginRight: '10px',
    marginBottom: '10px',
    fontSize: '1rem'
  }
};

export default ErrorBoundary;
