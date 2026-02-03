import api from './api';
export const eventService = {
  getAllEvents: async () => {
    try {
      const response = await api.get('/api/events');
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  getEventById: async (id) => {
    try {
      const response = await api.get(`/api/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
  },

  createEvent: async (eventData) => {
    try {
      const response = await api.post('/api/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  updateEvent: async (id, eventData) => {
    try {
      const response = await api.put(`/api/events/${id}`, eventData);
      return response.data;
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      throw error;
    }
  },

  deleteEvent: async (id) => {
    try {
      const response = await api.delete(`/api/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw error;
    }
  },

  checkAvailability: async (id, quantity) => {
    try {
      const response = await api.get(`/api/events/${id}/availability?quantity=${quantity}`);
      return response.data;
    } catch (error) {
      console.error(`Error checking availability for event ${id}:`, error);
      throw error;
    }
  }
};