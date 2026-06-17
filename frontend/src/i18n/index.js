export const initTranslation = async () => {
  const i18n = (await import('./i18n')).default;
  
  // Wait for i18n to be ready
  await new Promise((resolve) => {
    if (i18n.isInitialized) {
      resolve(true);
    } else {
      i18n.on('initialized', resolve);
    }
  });

  // Load RTL styles if needed
  const currentLang = i18n.language;
  const rtlLanguages = ['ar', 'fa', 'he', 'ur'];
  
  if (rtlLanguages.includes(currentLang)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/rtl.css';
    document.head.appendChild(link);
  }

  return i18n;
};

export const preloadLanguage = async (language) => {
  const i18n = (await import('./i18n')).default;
  await i18n.changeLanguage(language);
  return i18n;
};

export const getTranslationKey = (namespace, key) => {
  return `${namespace}.${key}`;
};

export const formatTranslation = (key, values = {}) => {
  if (typeof values === 'object' && values !== null) {
    return key.replace(/\{\{(\w+)\}\}/g, (match, prop) => values[prop] !== undefined ? values[prop] : match);
  }
  return key;
};