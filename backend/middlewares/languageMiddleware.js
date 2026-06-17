const { getSupportedLanguages } = require('../services/translationService');
const User = require('../models/User');

const supportedLanguageCodes = getSupportedLanguages().map(l => l.code);
const rtlLanguages = ['ar', 'fa', 'he', 'ur'];

const languageMiddleware = async (req, res, next) => {
  // Get language from header, user preference, or default to English
  const headerLang = req.headers['accept-language']?.split(',')[0]?.slice(0, 2) || 'en';
  let language = req.headers['accept-language'];

  // Check for full language code in header (e.g., zh-CN)
  if (req.headers['accept-language']) {
    const headerFull = req.headers['accept-language'].split(',')[0];
    if (supportedLanguageCodes.includes(headerFull)) {
      language = headerFull;
    } else if (supportedLanguageCodes.includes(headerLang)) {
      language = headerLang;
    }
  }

  // If user is authenticated, use their preferred language
  if (req.user && req.user.language) {
    language = req.user.language;
  }

  // Validate and set language
  req.language = supportedLanguageCodes.includes(language) ? language : 'en';
  req.isRtl = rtlLanguages.includes(req.language);

  res.setHeader('Content-Language', req.language);
  next();
};

const getLocalizedMessage = (key, language = 'en') => {
  const messages = {
    en: {
      user_exists: 'User already exists',
      invalid_credentials: 'Invalid credentials',
      campaign_not_found: 'Campaign not found',
      donation_success: 'Donation successful',
      donation_failed: 'Donation failed'
    },
    hi: {
      user_exists: 'उपयोगकर्ता पहले से मौजूद है',
      invalid_credentials: 'अमान्य क्रेडेंशियल',
      campaign_not_found: 'कैंपेन नहीं मिला',
      donation_success: 'दान सफल',
      donation_failed: 'दान विफल'
    },
    ta: {
      user_exists: 'பயனர் ஏற்கனவே ஡�재 ஆகிறார்',
      invalid_credentials: 'தவறான � credentials',
      campaign_not_found: 'விழைப்பு கண்டறியப்படவில்லை',
      donation_success: 'அஞ்சலி வெற்றிகள்',
      donation_failed: 'அஞ்சலி தோல்முறைப்பு'
    },
    es: {
      user_exists: 'El usuario ya existe',
      invalid_credentials: 'Credenciales inválidas',
      campaign_not_found: 'Campaña no encontrada',
      donation_success: 'Donación exitosa',
      donation_failed: 'Donación fallida'
    },
    fr: {
      user_exists: "L'utilisateur existe déjà",
      invalid_credentials: 'Identifiants invalides',
      campaign_not_found: 'Campagne non trouvée',
      donation_success: 'Don réussi',
      donation_failed: 'Don échoué'
    },
    ar: {
      user_exists: 'المستخدم موجود بالفعل',
      invalid_credentials: 'بيانات اعتماد غير صالحة',
      campaign_not_found: 'لم يتم العثور على الحملة',
      donation_success: 'التبرع ناجح',
      donation_failed: 'التبرع فشل'
    }
  };

  return messages[language]?.[key] || messages['en']?.[key] || key;
};

module.exports = {
  languageMiddleware,
  getLocalizedMessage
};