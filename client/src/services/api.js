import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Generate/Get User ID, currently using localStorage which is not safe
const getUserId = () => {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
  }
  return userId;
};

const api = {
  getGameData: async () => {
    const response = await axios.get(`${API_BASE_URL}/game/${getUserId()}`);
    return response.data;
  },
  
  click: async (resourceType) => {
    const response = await axios.post(`${API_BASE_URL}/game/${getUserId()}/click`, {
      resourceType 
    });
    return response.data;
  },
  
  buyUpgrade: async (toolType, upgradeType) => {
    const response = await axios.post(`${API_BASE_URL}/game/${getUserId()}/upgrade`, {
      toolType,
      upgradeType
    });
    return response.data;
  }
};

export default api;