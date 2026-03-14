import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TokenContext = createContext();

export const useTokens = () => useContext(TokenContext);

export const TokenProvider = ({ children }) => {
  const [tokens, setTokensState] = useState(150);

  useEffect(() => {
    const loadTokens = async () => {
      try {
         const t = await AsyncStorage.getItem('focusTokens');
         if (t) setTokensState(parseInt(t, 10));
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

  return (
    <TokenContext.Provider value={{ tokens, addTokens, spendTokens }}>
      {children}
    </TokenContext.Provider>
  );
};
