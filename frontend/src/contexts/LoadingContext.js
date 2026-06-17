import React, { createContext, useState, useContext, useEffect } from 'react';

const LoadingContext = createContext();

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const showLoading = (text = 'Loading...') => {
    setLoadingText(text);
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
    setLoadingText('');
  };

  return (
    <LoadingContext.Provider value={{ loading, loadingText, showLoading, hideLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};
