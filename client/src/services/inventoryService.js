import api from './api';

export const inventoryService = {
  // GET /api/inventory
  getInventory: async (params = {}) => {
    const response = await api.get('/api/inventory', { params });
    return response.data;
  },

  // POST /api/inventory (pharmacy role)
  addInventoryItem: async (data) => {
    const response = await api.post('/api/inventory', data);
    return response.data;
  },

  // PUT /api/inventory/:id (pharmacy role)
  updateInventoryItem: async (id, data) => {
    const response = await api.put(`/api/inventory/${id}`, data);
    return response.data;
  },

  // DELETE /api/inventory/:id (pharmacy role)
  deleteInventoryItem: async (id) => {
    const response = await api.delete(`/api/inventory/${id}`);
    return response.data;
  },
};

export default inventoryService;
