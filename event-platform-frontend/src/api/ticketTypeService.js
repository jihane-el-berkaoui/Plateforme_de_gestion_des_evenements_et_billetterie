import api from './api';

export const ticketTypeService = {
  getTicketTypesByEvent: async (eventId) => {
    try {
      console.log(`Fetching ticket types for event ${eventId}`);
      const response = await api.get(`/api/events/${eventId}/ticket-types`);
      console.log('Ticket types response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching ticket types:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  createTicketType: async (eventId, ticketTypeData) => {
    try {
      console.log('Creating ticket type:', { eventId, ticketTypeData });
      const response = await api.post(
        `/api/events/${eventId}/ticket-types`, 
        ticketTypeData
      );
      console.log('Create ticket type response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating ticket type:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  updateTicketType: async (ticketTypeId, ticketTypeData) => {
    try {
      console.log('Updating ticket type:', { ticketTypeId, ticketTypeData });
      const response = await api.put(
        `/api/events/ticket-types/${ticketTypeId}`, 
        ticketTypeData
      );
      console.log('Update ticket type response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating ticket type:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  deleteTicketType: async (ticketTypeId) => {
    try {
      console.log(`Deleting ticket type ${ticketTypeId}`);
      await api.delete(`/api/events/ticket-types/${ticketTypeId}`);
      console.log('Ticket type deleted successfully');
    } catch (error) {
      console.error('Error deleting ticket type:', error);
      console.error('Error details:', error.response?.data);
      throw error;
    }
  },

  checkAvailability: async (ticketTypeId, quantity) => {
    try {
      const response = await api.get(
        `/api/events/ticket-types/${ticketTypeId}/availability?quantity=${quantity}`
      );
      return response.data;
    } catch (error) {
      console.error('Error checking availability:', error);
      throw error;
    }
  },

  reserveTicketType: async (ticketTypeId, quantity) => {
    try {
      const response = await api.post(
        `/api/events/ticket-types/${ticketTypeId}/reserve?quantity=${quantity}`
      );
      return response.data;
    } catch (error) {
      console.error('Error reserving ticket type:', error);
      throw error;
    }
  }
};