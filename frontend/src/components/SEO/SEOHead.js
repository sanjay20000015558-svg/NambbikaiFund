import React from 'react';
import { Helmet } from 'react-helmet-async';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'kn', name: 'Kannada' },
  { code: 'bn', name: 'Bengali' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' },
];

const SEOHead = ({ 
  title = 'Nambikkai Fund - Crowdfunding for Medical Causes',
  description = 'Support leukemia patients and those in need through trusted crowdfunding. Create or donate to campaigns that make a difference.',
  canonical,
  alternateUrls = {}
}) => {
  const currentLang = typeof window !== 'undefined' ? document.documentElement.lang || 'en' : 'en';
  
  return (
    <Helmet>
      <html lang={currentLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Alternate language URLs */}
      {SUPPORTED_LANGUAGES.map(lang => (
        <link
          key={lang.code}
          rel="alternate"
          hrefLang={lang.code}
          href={alternateUrls[lang.code] || `${window.location.origin}/${lang.code}${window.location.pathname}`}
        />
      ))}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
};

export default SEOHead;