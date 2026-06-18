const axios = require('axios');
const { Translate } = require('@google-cloud/translate').v2;
const CampaignTranslation = require('../models/CampaignTranslation');
const supportedLanguages = [
  'en',
  'hi',
  'ta',
  'te',
  'ml',
  'kn',
  'bn',
  'mr',
  'gu',
  'pa',
  'ur'
];

let translateClient = null;

const initializeTranslationService = () => {
  if (process.env.GOOGLE_CLOUD_API_KEY && !translateClient) {
    translateClient = new Translate({
      key: process.env.GOOGLE_CLOUD_API_KEY
    });
  }
};

const translateText = async (text, targetLanguage, sourceLanguage = 'en') => {
  if (!text || !targetLanguage) return text;
  
  // English is NEVER translated - always use the professional source copy
  if (targetLanguage === 'en') {
    return text;
  }

  try {
    if (translateClient) {
      const [translation] = await translateClient.translate(text, {
        to: targetLanguage,
        from: sourceLanguage
      });
      return translation;
    }

    // Fallback to REST API
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
      {
        q: text,
        target: targetLanguage,
        source: sourceLanguage,
        format: 'text'
      }
    );

    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation error:', error.message);
    return text;
  }
};

const translateObject = async (obj, targetLanguage, sourceLanguage = 'en') => {
  // English is NEVER translated - always use the professional source copy
  if (targetLanguage === 'en') {
    return obj;
  }

  const result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = await translateText(value, targetLanguage, sourceLanguage);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = await translateObject(value, targetLanguage, sourceLanguage);
    } else {
      result[key] = value;
    }
  }
  
  return result;
};

const translateCampaign = async (campaign, targetLanguages) => {
  if (!campaign || !targetLanguages || targetLanguages.length === 0) {
    return;
  }

  const translationsToCreate = [];
  const sourceLanguage = campaign.originalLanguage || 'en';

  for (const lang of targetLanguages) {
    // English is NEVER translated - always use the professional source copy
    if (lang === 'en') continue;
    
    // Skip if translation already exists
    const existing = await CampaignTranslation.findOne({
      campaign: campaign._id,
      language: lang
    });

    if (existing) continue;

    // Translate campaign fields
    const translatedTitle = await translateText(campaign.title, lang, sourceLanguage);
    const translatedStory = await translateText(campaign.description, lang, sourceLanguage);
    const translatedPatientName = campaign.patientName 
      ? await translateText(campaign.patientName, lang, sourceLanguage) 
      : null;
    const translatedHospitalName = campaign.hospitalName 
      ? await translateText(campaign.hospitalName, lang, sourceLanguage) 
      : null;

    translationsToCreate.push({
      campaign: campaign._id,
      language: lang,
      title: translatedTitle,
      story: translatedStory,
      patientName: translatedPatientName,
      hospitalName: translatedHospitalName,
      diagnosis: campaign.medicalDetails?.diagnosis 
        ? await translateText(campaign.medicalDetails.diagnosis, lang, sourceLanguage) 
        : null,
      treatment: campaign.medicalDetails?.treatment 
        ? await translateText(campaign.medicalDetails.treatment, lang, sourceLanguage) 
        : null,
      budget: campaign.targetAmount 
        ? `₹${campaign.targetAmount.toLocaleString('en-IN')}` 
        : null
    });
  }

  if (translationsToCreate.length > 0) {
    await CampaignTranslation.insertMany(translationsToCreate, { ordered: false });
  }
};

const getSupportedLanguages = () => {
  return [
    { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', dir: 'ltr' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', dir: 'ltr' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', dir: 'ltr' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', dir: 'ltr' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', dir: 'ltr' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', dir: 'ltr' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', dir: 'ltr' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', dir: 'ltr' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', dir: 'ltr' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', dir: 'rtl' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', dir: 'ltr' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', dir: 'ltr' },
    { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', dir: 'ltr' },
    { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', dir: 'ltr' },
    { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', dir: 'ltr' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
    { code: 'fa', name: 'Persian', nativeName: 'فارسی', dir: 'rtl' },
    { code: 'he', name: 'Hebrew', nativeName: 'עברית', dir: 'rtl' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', dir: 'ltr' },
    { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', dir: 'ltr' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', dir: 'ltr' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', dir: 'ltr' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', dir: 'ltr' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', dir: 'ltr' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', dir: 'ltr' },
    { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', dir: 'ltr' },
    { code: 'fil', name: 'Filipino', nativeName: 'Filipino', dir: 'ltr' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', dir: 'ltr' },
    { code: 'fr', name: 'French', nativeName: 'Français', dir: 'ltr' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', dir: 'ltr' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', dir: 'ltr' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', dir: 'ltr' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', dir: 'ltr' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', dir: 'ltr' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', dir: 'ltr' },
    { code: 'ro', name: 'Romanian', nativeName: 'Română', dir: 'ltr' },
    { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', dir: 'ltr' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', dir: 'ltr' },
    { code: 'sv', name: 'Swedish', nativeName: 'Svenska', dir: 'ltr' },
    { code: 'no', name: 'Norwegian', nativeName: 'Norsk', dir: 'ltr' },
    { code: 'fi', name: 'Finnish', nativeName: 'Suomi', dir: 'ltr' },
    { code: 'da', name: 'Danish', nativeName: 'Dansk', dir: 'ltr' },
    { code: 'cs', name: 'Czech', nativeName: 'Čeština', dir: 'ltr' },
    { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', dir: 'ltr' },
    { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', dir: 'ltr' },
    { code: 'sr', name: 'Serbian', nativeName: 'Српски', dir: 'ltr' },
    { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', dir: 'ltr' },
    { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', dir: 'ltr' },
    { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', dir: 'ltr' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', dir: 'ltr' },
    { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', dir: 'ltr' },
    { code: 'zu', name: 'Zulu', nativeName: 'IsiZulu', dir: 'ltr' },
    { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', dir: 'ltr' }
  ];
};

const isRtlLanguage = (code) => {
  const rtlLanguages = ['ar', 'fa', 'he', 'ur'];
  return rtlLanguages.includes(code);
};

module.exports = {
  initializeTranslationService,
  translateText,
  translateObject,
  translateCampaign,
  getSupportedLanguages,
  isRtlLanguage
};