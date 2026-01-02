import { ConnectButton } from '@rainbow-me/rainbowkit';

function App() {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '2rem',
      textAlign: 'center',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
        🚀 Alwafra Web3 - Souveraineté Financière
      </h1>
      
      <div style={{ margin: '2rem 0' }}>
        <ConnectButton />
      </div>
      
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '3rem',
        borderRadius: '20px',
        marginTop: '3rem'
      }}>
        <h2>✨ Révolution du Paiement Différé</h2>
        <p>Connectez votre wallet pour activer le système "Pay When You Earn"</p>
      </div>
    </div>
  );
}

export default App;
