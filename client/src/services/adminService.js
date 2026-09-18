import api from './api';

export const adminService = {
  // GET /api/admin/stats
  getStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },

  // GET /api/admin/users
  getUsers: async () => {
    const response = await api.get('/api/admin/users');
    return response.data;
  },

  // PUT /api/admin/users/:id/block
  toggleBlockUser: async (id) => {
    const response = await api.put(`/api/admin/users/${id}/block`);
    return response.data;
  },

  // GET /api/admin/pharmacies
  getPharmacies: async () => {
    const response = await api.get('/api/admin/pharmacies');
    return response.data;
  },

  // PUT /api/admin/pharmacies/:id/verify
  toggleVerifyPharmacy: async (id) => {
    const response = await api.put(`/api/admin/pharmacies/${id}/verify`);
    return response.data;
  },
};

export default adminService;
