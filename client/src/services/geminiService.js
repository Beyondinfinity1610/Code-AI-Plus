import { api } from './api';

export const geminiService = {
  async explainError(errorMessage, code) {
    const response = await api.post('/ai/explain-error', {
      errorMessage,
      code
    });
    return response.data;
  },

  async answerQuestion(question, code) {
    const response = await api.post('/ai/answer-question', {
      question,
      code
    });
    return response.data;
  },

  async improveCode(code, language) {
    const response = await api.post('/ai/improve-code', {
      code,
      language
    });
    return response.data;
  }
};
