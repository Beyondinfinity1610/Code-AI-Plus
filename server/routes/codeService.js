import { api } from './api';

export const codeService = {
  async loadCode(id) {
    const response = await api.get(`/code/load/${id}`);
    return response.data;
  },

  
  async getAllCodes() {
    const response = await api.get('/code');
    return response.data;
  },

  async searchCodes(query) {
    const response = await api.get(`/code?search=${encodeURIComponent(query)}`);
    return response.data;
  }
};
