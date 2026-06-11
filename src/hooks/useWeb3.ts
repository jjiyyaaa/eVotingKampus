import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const SEPOLIA_CHAIN_ID = '0xaa36a7'; // 11155111 in hex

// Declare global window interface for MetaMask's ethereum object
declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface Web3State {
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  account: string;
  chainId: string;
  isConnected: boolean;
  isCorrectNetwork: boolean;
  loading: boolean;
}

export const useWeb3 = () => {
  const [state, setState] = useState<Web3State>({
    provider: null,
    signer: null,
    account: '',
    chainId: '',
    isConnected: false,
    isCorrectNetwork: false,
    loading: true,
  });

  const checkNetwork = useCallback((currentChainId: string): boolean => {
    // Standard Sepolia Chain IDs (Hex: 0xaa36a7, Decimal: 11155111)
    const isSepolia = 
      currentChainId === SEPOLIA_CHAIN_ID || 
      currentChainId === '11155111' || 
      parseInt(currentChainId, 16) === 11155111;
    return isSepolia;
  }, []);

  const switchNetwork = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
    } catch (switchError: any) {
      // Error code 4902 indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia Test Network',
                nativeCurrency: {
                  name: 'Sepolia Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
        } catch (addError) {
          console.error('Gagal menambahkan jaringan Sepolia:', addError);
        }
      } else {
        console.error('Gagal memindahkan jaringan:', switchError);
      }
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined') return;
    if (!window.ethereum) {
      alert('MetaMask tidak terdeteksi. Silakan instal MetaMask terlebih dahulu.');
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const network = await browserProvider.getNetwork();
      const currentChainId = '0x' + network.chainId.toString(16);
      
      const currentSigner = await browserProvider.getSigner();
      const isSepolia = checkNetwork(currentChainId);

      setState({
        provider: browserProvider,
        signer: currentSigner,
        account: accounts[0],
        chainId: currentChainId,
        isConnected: true,
        isCorrectNetwork: isSepolia,
        loading: false,
      });

      if (!isSepolia) {
        await switchNetwork();
      }
    } catch (error) {
      console.error('Gagal menyambungkan ke MetaMask:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [checkNetwork, switchNetwork]);

  const disconnectWallet = useCallback(() => {
    setState({
      provider: null,
      signer: null,
      account: '',
      chainId: '',
      isConnected: false,
      isCorrectNetwork: false,
      loading: false,
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const network = await browserProvider.getNetwork();
          const currentChainId = '0x' + network.chainId.toString(16);
          const currentSigner = await browserProvider.getSigner();
          const isSepolia = checkNetwork(currentChainId);

          setState({
            provider: browserProvider,
            signer: currentSigner,
            account: accounts[0],
            chainId: currentChainId,
            isConnected: true,
            isCorrectNetwork: isSepolia,
            loading: false,
          });
        } catch (err) {
          console.error('Error saat update account:', err);
        }
      } else {
        disconnectWallet();
      }
    };

    const handleChainChanged = async (hexChainId: string) => {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        const isConnected = accounts.length > 0;
        
        let currentSigner: ethers.JsonRpcSigner | null = null;
        if (isConnected) {
          currentSigner = await browserProvider.getSigner();
        }
        
        const isSepolia = checkNetwork(hexChainId);

        setState({
          provider: browserProvider,
          signer: currentSigner,
          account: isConnected ? accounts[0] : '',
          chainId: hexChainId,
          isConnected: isConnected,
          isCorrectNetwork: isSepolia,
          loading: false,
        });
      } catch (err) {
        console.error('Error saat update chain:', err);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Cek koneksi awal (auto-connect jika sudah ter-authorized)
    const checkInitialConnection = async () => {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);
          const network = await browserProvider.getNetwork();
          const currentChainId = '0x' + network.chainId.toString(16);
          const currentSigner = await browserProvider.getSigner();
          const isSepolia = checkNetwork(currentChainId);

          setState({
            provider: browserProvider,
            signer: currentSigner,
            account: accounts[0],
            chainId: currentChainId,
            isConnected: true,
            isCorrectNetwork: isSepolia,
            loading: false,
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        console.error('Error checking initial connection:', err);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    checkInitialConnection();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [checkNetwork, disconnectWallet]);

  return {
    ...state,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };
};
