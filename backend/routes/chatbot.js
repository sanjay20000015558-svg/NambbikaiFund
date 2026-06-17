const express = require('express');
const router = express.Router();
const axios = require('axios');

const SYSTEM_PROMPT = `You are the official Nambikkai Fund AI Assistant, a compassionate and knowledgeable helper for a medical crowdfunding platform focused on leukemia patients and medical causes.

Key Information:
- Nambikkai Fund helps leukemia patients and those in need receive life-saving medical treatment
- Users can create fundraising campaigns for medical expenses
- Donations can be made to any approved campaign
- Campaigns must be approved by admin before going live
- We use Razorpay for secure payment processing

How to help users:
1. Campaign Creation: Explain how to start a campaign, required documents, verification process
2. Donations: Guide users on how to donate, payment methods, tax benefits
3. Navigation: Help users find campaigns, FAQ, contact pages, their dashboard
4. Account: Assist with login, registration, profile management
5. General Questions: Answer about our mission, fees (we are free), trust & safety

Be concise, empathetic, and professional. Use markdown for formatting. If unsure, be honest and suggest contacting support@nambikkai.fund.`;

const getGroqKey = () => {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  return key.trim().replace(/[\r\n]+/g, '');
};

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid messages format'
      });
    }

    const groqApiKey = getGroqKey();
    if (!groqApiKey) {
      console.warn('Groq Error: Missing API Key');
      return res.status(500).json({
        success: false,
        message: 'Groq API key not configured on server'
      });
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1024,
        stream: false
      },
      {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    const reply = response.data.choices[0]?.message?.content || 'Sorry, I am unable to respond at the moment.';

    res.status(200).json({
      success: true,
      message: reply
    });
  } catch (error) {
    const errorDetail = error.response?.data?.error?.message || error.message;
    console.warn('Groq Error:', errorDetail);
    res.status(500).json({
      success: false,
      message: errorDetail || 'Failed to get AI response. Please try again later.'
    });
  }
});

module.exports = router;