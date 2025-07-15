const axios = require('axios');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash'; // Updated model name

const callGeminiAPI = async (prompt) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{ text: prompt }]
        }]
      },
      {
        headers: { 
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response structure from Gemini API');
    }

    return response.data.candidates[0].content.parts[0].text;
    
  } catch (error) {
    console.error('Gemini API error:', error.message);
    
    if (error.response?.status === 404) {
      throw new Error('Gemini model not found. Please check model availability.');
    }
    
    throw new Error('AI service temporarily unavailable');
  }
};

const explainError = async (req, res) => {
  try {
    const { errorMessage, code } = req.body;

    if (!errorMessage || !code) {
      return res.status(400).json({ message: 'Error message and code are required' });
    }

    const prompt = `You are a helpful coding assistant. A user encountered this error:

Error: ${errorMessage}

Code:
${code}

Please provide a clear, concise explanation of what this error means and suggest how to fix it. Keep your response under 100 words and focus on practical solutions assume the user is learning and not asking for corrected code but only for hints small hints and help so never give any kind of code.`;

    const explanation = await callGeminiAPI(prompt);
    res.json({ explanation });
    
  } catch (error) {
    console.error('Error in explainError:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const answerQuestion = async (req, res) => {
  try {
    const { question, code } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'Question is required' });
    }

    const prompt = `You are a helpful coding assistant. A user is asking:

Question: ${question}

${code ? `Code context:\n${code}` : ''}

Please provide a helpful, accurate answer. Keep your response concise and practical.`;

    const answer = await callGeminiAPI(prompt);
    res.json({ answer });
    
  } catch (error) {
    console.error('Error in answerQuestion:', error.message);
    res.status(500).json({ message: error.message });
  }
};

const improveCode = async (req, res) => {
  try {
    const { code, language } = req.body;

    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }

    const prompt = `You are a coding expert. Please analyze this ${language} code and suggest improvements:

Code:
${code}

Provide specific suggestions with explanations. Focus on practical improvements.`;

    const suggestion = await callGeminiAPI(prompt);
    res.json({ suggestion });
    
  } catch (error) {
    console.error('Error in improveCode:', error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  explainError,
  answerQuestion,
  improveCode
};
