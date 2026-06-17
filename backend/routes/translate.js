const express = require('express');
const router = express.Router();
const { translateText, translateObject } = require('../services/translationService');

/**
 * @route POST /api/translate
 * @desc Translate text using Google Cloud Translation API
 * @access Public
 * @body { text: string, targetLanguage: string, sourceLanguage?: string }
 */
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'Text and targetLanguage are required'
      });
    }

    const translated = await translateText(text, targetLanguage, sourceLanguage || 'en');

    res.status(200).json({
      success: true,
      translation: translated
    });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Translation failed',
      translation: req.body.text
    });
  }
});

/**
 * @route POST /api/translate/batch
 * @desc Translate multiple texts using Google Cloud Translation API
 * @access Public
 * @body { texts: string[], targetLanguage: string, sourceLanguage?: string }
 */
router.post('/translate/batch', async (req, res) => {
  try {
    const { texts, targetLanguage, sourceLanguage } = req.body;

    if (!texts || !Array.isArray(texts) || texts.length === 0 || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'texts array and targetLanguage are required'
      });
    }

    const translations = [];
    for (const text of texts) {
      try {
        const translated = await translateText(text, targetLanguage, sourceLanguage || 'en');
        translations.push({ original: text, translation: translated });
      } catch (err) {
        translations.push({ original: text, translation: text });
      }
    }

    res.status(200).json({
      success: true,
      translations
    });
  } catch (error) {
    console.error('Batch translation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Batch translation failed',
      translations: texts.map(text => ({ original: text, translation: text }))
    });
  }
});

/**
 * @route POST /api/translate/object
 * @desc Translate object values using Google Cloud Translation API
 * @access Public
 */
router.post('/translate/object', async (req, res) => {
  try {
    const { obj, targetLanguage, sourceLanguage } = req.body;

    if (!obj || typeof obj !== 'object' || !targetLanguage) {
      return res.status(400).json({
        success: false,
        message: 'obj and targetLanguage are required'
      });
    }

    const translated = await translateObject(obj, targetLanguage, sourceLanguage || 'en');

    res.status(200).json({
      success: true,
      translation: translated
    });
  } catch (error) {
    console.error('Object translation error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Object translation failed',
      translation: obj
    });
  }
});

module.exports = router;