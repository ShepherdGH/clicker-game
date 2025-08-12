import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = {
  setAuthToken: (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  },

  getGameData: async () => {
    const response = await axios.get(`${API_BASE_URL}/game`);
    return response.data;
  },
  
  click: async (resourceType) => {
    const response = await axios.post(`${API_BASE_URL}/game/click`, {
      resourceType 
    });
    return response.data;
  },
  
  buyUpgrade: async (toolType, upgradeType) => {
    const response = await axios.post(`${API_BASE_URL}/game/upgrade`, {
      toolType,
      upgradeType
    });
    return response.data;
  },
  
  sell: async (resourceType, quantity) => {
    const response = await axios.post(`${API_BASE_URL}/game/sell`, {
      resourceType,
      quantity
    });
    return response.data;
  },

  saveGame: async () => {
    const response = await axios.post(`${API_BASE_URL}/game/save`);
    return response.data;
  }
};

export default api;
