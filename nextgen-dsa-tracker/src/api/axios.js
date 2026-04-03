// src/api/axios.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Make sure this matches your backend!
});

api.interceptors.request.use((config) => {
  // 1. Grab the token from local storage
  let token = localStorage.getItem('token');
  
  // Fallback: If it's saved inside the user object instead
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
    // 2. Strip accidental double quotes (Common bug!)
    token = token.replace(/^"(.*)"$/, '$1'); 
    
    // 3. Attach it to BOTH headers to be 100% safe
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['x-auth-token'] = token;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;