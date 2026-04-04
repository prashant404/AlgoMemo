import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('token');
  
  if (!token) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userObj = JSON.parse(userStr);
        token = userObj.token;
      } catch(e) {}
    }
  }

  if (token) {
    token = token.replace(/^"(.*)"$/, '$1'); 
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-auth-token'] = token;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;