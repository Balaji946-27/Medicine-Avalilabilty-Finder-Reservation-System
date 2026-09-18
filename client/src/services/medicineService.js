import api from './api';

export const medicineService = {
  // GET /api/medicines (search & filter)
  getMedicines: async (params = {}) => {
    const response = await api.get('/api/medicines', { params });
    return response.data;
  },

  // GET /api/medicines/:id
  getMedicineById: async (id) => {
    const response = await api.get(`/api/medicines/${id}`);
    return response.data;
  },

  // GET /api/medicines/:id/availability
  getMedicineAvailability: async (id) => {
    const response = await api.get(`/api/medicines/${id}/availability`);
    return response.data;
  },

  // POST /api/medicines
  createMedicine: async (data) => {
    const response = await api.post('/api/medicines', data);
    return response.data;
  },

  // PUT /api/medicines/:id
  updateMedicine: async (id, data) => {
    const response = await api.put(`/api/medicines/${id}`, data);
    return response.data;
  },

  // DELETE /api/medicines/:id
  deleteMedicine: async (id) => {
    const response = await api.delete(`/api/medicines/${id}`);
    return response.data;
  },
};

export default medicineService;
