import api from './api';
export const bookingService = {
  getAllBookings: async () => {
    try {
      const response = await api.get('/api/bookings');
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }
  },

  getBookingById: async (id) => {
    try {
      const response = await api.get(`/api/bookings/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching booking ${id}:`, error);
      throw error;
    }
  },

  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/api/bookings', bookingData);
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  cancelBooking: async (id) => {
    try {
      const response = await api.put(`/api/bookings/${id}/cancel`);
      return response.data;
    } catch (error) {
      console.error(`Error cancelling booking ${id}:`, error);
      throw error;
    }
  },

  getBookingsByUser: async (userId) => {
    try {
      const response = await api.get(`/api/bookings/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bookings for user ${userId}:`, error);
      throw error;
    }
  },

  getBookingsByEvent: async (eventId) => {
    try {
      const response = await api.get(`/api/bookings/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching bookings for event ${eventId}:`, error);
      throw error;
    }
  }
};