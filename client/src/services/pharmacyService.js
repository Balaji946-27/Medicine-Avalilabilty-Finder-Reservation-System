import api from './api';

export const pharmacyService = {
  // GET /api/pharmacies
  getPharmacies: async (params = {}) => {
    const response = await api.get('/api/pharmacies', { params });
    return response.data;
  },

  // GET /api/pharmacies/profile
  getProfile: async () => {
    const response = await api.get('/api/pharmacies/profile');
    return response.data;
  },

  // POST /api/pharmacies/profile
  createProfile: async (data) => {
    const response = await api.post('/api/pharmacies/profile', data);
    return response.data;
  },

  // PUT /api/pharmacies/profile
  updateProfile: async (data) => {
    const response = await api.put('/api/pharmacies/profile', data);
    return response.data;
  },

  // GET /api/pharmacies/:id
  getPharmacyById: async (id) => {
    const response = await api.get(`/api/pharmacies/${id}`);
    return response.data;
  },

  // GET /api/pharmacies/:id/medicines
  getPharmacyMedicines: async (id) => {
    const response = await api.get(`/api/pharmacies/${id}/medicines`);
    return response.data;
  },
};

export default pharmacyService;
