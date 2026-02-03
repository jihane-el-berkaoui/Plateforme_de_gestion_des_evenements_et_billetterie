import api from './api';

export const checkinService = {
  getQRCodeByBooking: async (bookingId) => {
    try {
      console.log(`🔄 Fetching QR code for booking ${bookingId}...`);
      
      const response = await api.get(`/api/qr-codes/booking/${bookingId}`, {
        timeout: 10000,
        validateStatus: function (status) {
          return status >= 200 && status < 500; 
        }
      });
      
      console.log(`📊 Response for booking ${bookingId}:`, response.data);
      
      if (response.data.success === true) {
        return {
          success: true,
          qrCode: response.data.qrCode,
          qrImage: response.data.qrImage,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Aucun QR code disponible",
          bookingId: bookingId,
          generated: response.data.generated || false
        };
      }
      
    } catch (error) {
      console.error(`❌ Error fetching QR code for booking ${bookingId}:`, error);
      
      if (error.response?.status === 404) {
        return {
          success: false,
          message: "Réservation non trouvée",
          bookingId: bookingId,
          error: "NOT_FOUND"
        };
      }
      
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: "Délai d'attente dépassé",
          bookingId: bookingId,
          error: "TIMEOUT"
        };
      }
      
      return {
        success: false,
        message: "Erreur de connexion",
        bookingId: bookingId,
        error: "CONNECTION_ERROR"
      };
    }
  },

  scanUniqueCode: async (uniqueCode, scannerId) => {
    try {
      const response = await api.post(
        `/api/qr-codes/scan-unique/${uniqueCode}?scannerId=${scannerId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error scanning unique code:', error);
      throw error;
    }
  },
  
  verifyCode: async (code) => {
    try {
      const response = await api.get(`/api/qr-codes/verify/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying code:', error);
      throw error;
    }
  },
  
  getRecentCheckins: async (limit = 20) => {
    try {
      const response = await api.get(`/api/checkins/recent?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching checkins:', error);
      throw error;
    }
  },

  generateQRCode: async (bookingId) => {
    try {
      const response = await api.post(`/api/qr-codes/generate/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },

  scanByConfirmationCode: async (confirmationCode, scannerId) => {
    try {
      const response = await api.post(
        `/api/qr-codes/scan-bk/${confirmationCode}?scannerId=${scannerId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error scanning by confirmation code:', error);
      throw error;
    }
  },

  generateAllQRForExistingBookings: async () => {
    try {
      const response = await api.post('/api/qr-codes/generate-all-existing');
      return response.data;
    } catch (error) {
      console.error('Error generating QR codes for all bookings:', error);
      throw error;
    }
  },

  scanQRCode: async (qrId, scannerId) => {
    try {
      if (qrId.startsWith('BK')) {
        return await checkinService.scanByConfirmationCode(qrId, scannerId);
      }
      
      const response = await api.post(
        `/api/qr-codes/scan/${qrId}?scannerId=${scannerId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error scanning QR code:', error);
      throw error;
    }
  },

  generateAndEmailQRCode: async (requestData) => {
    try {
      const response = await api.post('/api/qr-codes/generate-and-email', requestData);
      return response.data;
    } catch (error) {
      console.error('Error generating and emailing QR code:', error);
      throw error;
    }
  },

  testEmail: async (bookingId, email) => {
    try {
      const response = await api.post(`/api/qr-codes/test-email/${bookingId}?email=${email}`);
      return response.data;
    } catch (error) {
      console.error('Error testing email:', error);
      throw error;
    }
  },

  createCheckIn: async (checkInData) => {
    try {
      const response = await api.post('/api/checkin', checkInData);
      return response.data;
    } catch (error) {
      console.error('Error creating check-in:', error);
      throw error;
    }
  },

  getCheckInsByEvent: async (eventId) => {
    try {
      const response = await api.get(`/api/checkin/event/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      throw error;
    }
  },

  getTodayCheckIns: async () => {
    try {
      const response = await api.get('/api/checkin/today');
      return response.data;
    } catch (error) {
      console.error('Error fetching today check-ins:', error);
      throw error;
    }
  },

  getCheckInStats: async (eventId) => {
    try {
      const response = await api.get(`/api/checkin/event/${eventId}/count`);
      return response.data;
    } catch (error) {
      console.error('Error fetching check-in stats:', error);
      throw error;
    }
  },   
  getBookingStats: async (confirmationCode) => {
    try {
      const response = await api.get(`/api/qr-codes/booking-stats/${confirmationCode}`);
      return response.data;
    } catch (error) {
      console.error('Error getting booking stats:', error);
      return {
        success: false,
        totalTickets: 0,
        usedTickets: 0,
        availableTickets: 0,
        percentageUsed: 0,
        status: "UNKNOWN"
      };
    }
  },
  
  getTicketStatus: async (identifier) => {
    try {
      const response = await api.get(`/api/qr-codes/ticket-status/${identifier}`);
      return response.data;
    } catch (error) {
      console.error('Error checking ticket status:', error);
      return {
        found: false,
        error: error.message
      };
    }
  },
  
  getAdminCheckins: async (scannerId, date) => {
    try {
      let url = '/api/qr-codes/admin/checkins';
      const params = new URLSearchParams();
      
      if (scannerId) params.append('scannerId', scannerId);
      if (date) params.append('date', date.toISOString().split('T')[0]);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching admin checkins:', error);
      throw error;
    }
  },
  
  adminScanTicket: async (identifier, scannerId) => {
    try {
      const response = await api.post(
        `/api/qr-codes/admin/scan/${identifier}?scannerId=${scannerId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error scanning ticket as admin:', error);
      throw error;
    }
  },
  
  adminMarkAsScanned: async (uniqueCode, scannerId) => {
    try {
      const response = await api.post(
        `/api/qr-codes/admin/mark-scanned/${uniqueCode}?scannerId=${scannerId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error marking as scanned:', error);
      throw error;
    }
  },
};