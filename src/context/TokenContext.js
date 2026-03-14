import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TokenContext = createContext();

export const useTokens = () => useContext(TokenContext);

export const TokenProvider = ({ children }) => {
  const [tokens, setTokensState] = useState(150);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    const loadTokens = async () => {
      try {
         const t = await AsyncStorage.getItem('focusTokens');
         if (t) setTokensState(parseInt(t, 10));

         const w = await AsyncStorage.getItem('walletAddress');
         if (w) {
           setWalletConnected(true);
           setWalletAddress(w);
         }
      } catch(e) {}
    };
    loadTokens();
  }, []);

  const addTokens = async (amount) => {
    const newCount = tokens + amount;
    setTokensState(newCount);
    try {
      await AsyncStorage.setItem('focusTokens', newCount.toString());
    } catch(e) {}
  };

  const spendTokens = async (amount) => {
    if (tokens >= amount) {
      const newCount = tokens - amount;
      setTokensState(newCount);
      try {
        await AsyncStorage.setItem('focusTokens', newCount.toString());
      } catch(e) {}
      return true;
    }
    return false;
  };

  const connectWallet = async () => {
    const fakeAddress = "0x8F9a...2B1c";
    setWalletConnected(true);
    setWalletAddress(fakeAddress);
    try { await AsyncStorage.setItem('walletAddress', fakeAddress); } catch(e){}
  };

  const disconnectWallet = async () => {
    setWalletConnected(false);
    setWalletAddress(null);
    try { await AsyncStorage.removeItem('walletAddress'); } catch(e){}
  };

  return (
    <TokenContext.Provider value={{ 
      tokens, addTokens, spendTokens, 
      walletConnected, walletAddress, connectWallet, disconnectWallet 
    }}>
      {children}
    </TokenContext.Provider>
  );
};
