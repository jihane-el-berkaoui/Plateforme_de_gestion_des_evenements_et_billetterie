import api from './api';

export const refundService = {
  requestRefund: async (bookingId, reason, requestedAmount = null) => {
    try {
      const response = await api.post('/api/refunds/request', {
        bookingId,
        reason,
        requestedAmount
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting refund:', error);
      throw error;
    }
  },

  getPendingRefunds: async () => {
    try {
      const response = await api.get('/api/refunds/pending');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending refunds:', error);
      throw error;
    }
  },

  processRefund: async (refundId, approve, adminNotes) => {
    try {
      const response = await api.put(`/api/refunds/${refundId}/process`, {
        approve,
        adminNotes
      });
      return response.data;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw error;
    }
  }
};