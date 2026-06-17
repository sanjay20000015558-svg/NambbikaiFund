# Enterprise-Grade Internationalization (i18n) Implementation

## Installation Commands

```bash
# Frontend dependencies (already installed)
npm install react-i18next i18next i18next-browser-languagedetector i18next-http-backend

# Backend dependencies
npm install @google-cloud/translate
```

## Folder Structure

```
/frontend
  ├── src
  │   ├── i18n
  │   │   ├── i18n.js           # Main i18n configuration
  │   │   └── index.js           # Helper functions
  │   ├── hooks
  │   │   └── useCampaignTranslation.js
  │   ├── contexts
  │   │   └── LanguageContext.js
  │   ├── components
  │   │   ├── Layout
  │   │   │   └── LanguageSelector.js   # Enhanced language selector
  │   │   └── SEO
  │   │       └── SEOHead.js
  │   └── pages
  │       └── Admin
  │           └── LanguageManagement.js
  └── public
      ├── locales/
      │   ├── en/translation.json
      │   ├── hi/translation.json
      │   ├── ta/translation.json
      │   ├── es/translation.json
      │   ├── fr/translation.json
      │   └── de/translation.json
      └── rtl.css

/backend
  ├── models
  │   └── CampaignTranslation.js
  ├── services
  │   └── translationService.js
  ├── middlewares
  │   └── languageMiddleware.js
  └── controllers
      └── adminController.js   # Added language management functions
```

## Key Features Implemented

### 1. Language Selector Component
- Searchable language dropdown
- Country flags for visual identification
- Native language names
- Favorites and recently used languages
- Responsive mobile-friendly design

### 2. RTL Support
- Automatic `dir="rtl"` attribute switching
- CSS file with RTL layout adjustments
- Applied to Arabic, Persian, Hebrew, Urdu

### 3. Automatic Detection
- Browser language detection via i18next-browser-languagedetector
- User profile preference loading on login
- localStorage caching

### 4. Campaign Translation Collection
- MongoDB collection for storing translated campaign content
- Auto-translation via Google Cloud Translation API
- Caching - translate once, serve forever

### 5. Admin Panel
- Language statistics dashboard
- Export/import translation files
- Translation coverage percentage

### 6. SEO Support
- hreflang tags for all languages
- Canonical URLs
- Meta tags

### 7. Performance
- Lazy loading via i18next-http-backend
- Code splitting
- Translation caching in localStorage

## Usage Examples

### In React Components
```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  return <Typography>{t('home.title')}</Typography>;
}
```

### Language Switching
```jsx
import { changeLanguage } from '@/i18n';
changeLanguage('hi'); // Switch to Hindi
```

### Getting Campaign Translation
```javascript
const response = await campaignAPI.getCampaignTranslation(campaignId, 'hi');
const translatedTitle = response.data.translations.title;
```