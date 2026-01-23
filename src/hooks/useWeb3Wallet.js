import { useEffect, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { secureStorage } from '../utils/encryption';

/**
 * Hook React pour intégration Web3 Wallet - PHASE 1
 * Gère la connexion/déconnexion de portefeuille
 */
export const useWeb3Wallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [alwafraId, setAlwafraId] = useState(null);

  // Wagmi hooks
  const { address, isConnected: wagmiConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  // Sync wallet state
  useEffect(() => {
    if (wagmiConnected && address) {
      setIsConnected(true);
      setWalletAddress(address);
      
      // Stockage sécurisé de l'adresse wallet
      secureStorage.setItem('userWallet', {
        address,
        connectedAt: new Date().toISOString()
      });
    } else {
      setIsConnected(false);
      setWalletAddress(null);
    }
  }, [wagmiConnected, address]);

  // Récupère l'Alwafra ID depuis localStorage (créé lors de l'inscription)
  useEffect(() => {
    const storedId = secureStorage.getItem('alwafraId');
    if (storedId) {
      setAlwafraId(storedId);
    }
  }, []);

  const connectWallet = async (connectorName = 'injected') => {
    try {
      const connector = connectors.find(c => c.id === connectorName);
      if (connector) {
        connect({ connector });
      }
    } catch (error) {
      console.error('Erreur connexion wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = () => {
    disconnect();
    secureStorage.removeItem('userWallet');
    setIsConnected(false);
    setWalletAddress(null);
  };

  const linkWalletToAlwafra = (alwafraIdParam) => {
    if (!isConnected || !walletAddress) {
      throw new Error('Wallet non connecté');
    }

    const linkData = {
      alwafraId: alwafraIdParam,
      walletAddress,
      linkedAt: new Date().toISOString()
    };

    secureStorage.setItem('walletLink', linkData);
    setAlwafraId(alwafraIdParam);
    return linkData;
  };

  return {
    isConnected,
    walletAddress,
    alwafraId,
    connectWallet,
    disconnectWallet,
    linkWalletToAlwafra
  };
};

export default useWeb3Wallet;
