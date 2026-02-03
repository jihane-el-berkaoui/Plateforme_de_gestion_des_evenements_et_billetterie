import api from './api';

export const ticketService = {
  getTicketTypesByEvent: async (eventId) => {
    try {
      const response = await api.get(`/api/events/${eventId}/ticket-types`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ticket types:', error);
      return [];
    }
  },

  reserveTicketType: async (ticketTypeId, quantity) => {
    try {
      const response = await api.post(`/api/ticket-types/${ticketTypeId}/reserve`, { quantity });
      return response.data;
    } catch (error) {
      console.error('Error reserving ticket type:', error);
      throw error;
    }
  },

  createTicketType: async (eventId, ticketTypeData) => {
    try {
      const response = await api.post(`/api/events/${eventId}/ticket-types`, ticketTypeData);
      return response.data;
    } catch (error) {
      console.error('Error creating ticket type:', error);
      throw error;
    }
  }
};