import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const EthereumContext = createContext();

export const EthereumProvider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [address, setAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Memoized setup function to avoid recreating on every render
  const setupProviderAndSigner = useCallback(async () => {
    try {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();
      const address = await newSigner.getAddress();
      const network = await newProvider.getNetwork();
      const balance = await newProvider.getBalance(address);

      setProvider(newProvider);
      setSigner(newSigner);
      setAddress(address);
      setChainId(network.chainId);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error("Error setting up provider/signer:", error);
      throw error;
    }
  }, []);

  // ✅ Handlers are memoized to avoid recreation
  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      setAddress(accounts[0]);
      // Refresh balance/chainId if account changes
      setupProviderAndSigner().catch(console.error);
    }
  }, [setupProviderAndSigner]);

  const handleChainChanged = useCallback(() => {
    window.location.reload(); // Hard refresh to ensure state consistency
  }, []);

  // ✅ Single disconnect logic reused everywhere
  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setChainId(null);
    setBalance(null);
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  }, [handleAccountsChanged, handleChainChanged]);

  // ✅ Main wallet connection logic
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) throw new Error("Please install MetaMask!");
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await setupProviderAndSigner();
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }, [setupProviderAndSigner]);

  // ✅ Single useEffect to rule them all
  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      if (!window.ethereum) {
        setIsLoading(false);
        return;
      }

      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await setupProviderAndSigner();
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      } finally {
        setIsLoading(false); // Always set loading to false
      }
    };

    checkIfWalletIsConnected();

    // Setup event listeners
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    // Cleanup
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [setupProviderAndSigner, handleAccountsChanged, handleChainChanged]);

  return (
    <EthereumContext.Provider
      value={{
        provider,
        signer,
        address,
        chainId,
        balance,
        isLoading, 
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </EthereumContext.Provider>
  );
};

export const useEthereum = () => useContext(EthereumContext);