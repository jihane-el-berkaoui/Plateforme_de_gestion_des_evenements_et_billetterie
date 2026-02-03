import api from './api';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('role', response.data.user.role || 'CLIENT'); 
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
forgotPassword: async (email) => {
    try {
      const response = await api.post('/api/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post('/api/auth/reset-password', { token, newPassword });
      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }
,
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await api.get(`/api/auth/verify/${token}`);
      return response.data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  }
};