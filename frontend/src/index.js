import React, { useMemo, useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider } from '@emotion/react';
import { I18nextProvider } from 'react-i18next';
import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';

import App from './App';
import { store } from './redux/store';
import { createAppTheme } from './theme/theme';
import i18n from './i18n/i18n';
import { LoadingProvider } from './contexts/LoadingContext';
import { NotificationProvider } from './contexts/NotificationContext';

const isRtlLanguage = (code) => ['ur', 'ar', 'fa', 'he'].includes(code);

const getInitialDirection = () => {
  const savedLang = localStorage.getItem('nambikkai_lang');
  return isRtlLanguage(savedLang) ? 'rtl' : 'ltr';
};

const root = ReactDOM.createRoot(document.getElementById('root'));

const Root = () => {
  const [direction, setDirection] = useState(getInitialDirection);

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setDirection(isRtlLanguage(lng) ? 'rtl' : 'ltr');
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, []);

  const theme = useMemo(() => createAppTheme(direction), [direction]);

  const cache = useMemo(() => 
    createCache({
      key: direction === 'rtl' ? 'mui-rtl' : 'mui',
      stylisPlugins: direction === 'rtl' ? [rtlPlugin] : [],
    }),
    [direction]
  );

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoadingProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </LoadingProvider>
      </ThemeProvider>
    </CacheProvider>
  );
};

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <I18nextProvider i18n={i18n}>
          <Root />
        </I18nextProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);