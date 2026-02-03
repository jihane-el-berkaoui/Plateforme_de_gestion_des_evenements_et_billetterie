import api from './api';
export const userService = {
   getAllUsers: async () => {
    try {
      const response = await api.get('/api/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  getUsersByRole: async (role) => {
    try {
      const response = await api.get(`/api/users/role/${role}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching users with role ${role}:`, error);
      throw error;
    }
  },

  updateUserRole: async (id, role) => {
    try {
      const response = await api.patch(`/api/users/${id}/role`, { role });
      return response.data;
    } catch (error) {
      console.error(`Error updating user role ${id}:`, error);
      throw error;
    }
  },

  getUserById: async (id) => {
    try {
      const response = await api.get(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const response = await api.post('/api/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const updateData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        address: userData.address
      };
      
      const response = await api.put(`/api/users/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },
  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/api/users/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  }
};