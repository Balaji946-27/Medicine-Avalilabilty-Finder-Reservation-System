import api from './api';

const reservationService = {
  // POST /api/reservations — patient creates a reservation
  createReservation: async (data) => {
    const response = await api.post('/api/reservations', data);
    return response.data;
  },

  // GET /api/reservations/my — patient's own reservations
  getMyReservations: async () => {
    const response = await api.get('/api/reservations/my');
    return response.data;
  },

  // GET /api/reservations/:id — single reservation
  getReservationById: async (id) => {
    const response = await api.get(`/api/reservations/${id}`);
    return response.data;
  },

  // PATCH /api/reservations/:id/cancel — patient cancels
  cancelReservation: async (id) => {
    const response = await api.patch(`/api/reservations/${id}/cancel`);
    return response.data;
  },

  // GET /api/reservations/pharmacy — pharmacy's incoming reservations
  getPharmacyReservations: async (params = {}) => {
    const response = await api.get('/api/reservations/pharmacy', { params });
    return response.data;
  },

  // PATCH /api/reservations/:id/confirm — pharmacy confirms
  confirmReservation: async (id) => {
    const response = await api.patch(`/api/reservations/${id}/confirm`);
    return response.data;
  },

  // PATCH /api/reservations/:id/reject — pharmacy rejects
  rejectReservation: async (id) => {
    const response = await api.patch(`/api/reservations/${id}/reject`);
    return response.data;
  },

  // PATCH /api/reservations/:id/complete — pharmacy marks as completed
  completeReservation: async (id) => {
    const response = await api.patch(`/api/reservations/${id}/complete`);
    return response.data;
  },
};

export default reservationService;
