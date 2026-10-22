import api from './api';

export const authService = {
  // POST /api/auth/register
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  // POST /api/auth/login
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  // GET /api/auth/me
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // PUT /api/auth/profile
  updateProfile: async (profileData) => {
    const response = await api.put('/api/auth/profile', profileData);
    return response.data;
  },

  // Client-side logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default authService;
