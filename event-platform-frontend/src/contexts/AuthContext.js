import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../api/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const user = JSON.parse(userStr);
        setUser(user);
        setRole(user.role || 'CLIENT');
        setIsAuthenticated(true);
        console.log("✅ Utilisateur restauré. Rôle:", user.role);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        localStorage.setItem('role', response.user.role || 'CLIENT');
        
        setUser(response.user);
        setRole(response.user.role || 'CLIENT');
        setIsAuthenticated(true);
        
        console.log("✅ Connexion réussie. Rôle:", response.user.role);
        return response;
      }
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      throw error;
    }
  };

  const updateUser = (updatedUser) => {
    try {
      if (!updatedUser || !updatedUser.id) {
        throw new Error('Invalid user data');
      }

      const currentUserStr = localStorage.getItem('user');
      const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;
      
      if (currentUser && currentUser.id === updatedUser.id) {
        const mergedUser = {
          ...currentUser,
          ...updatedUser,
          id: currentUser.id,
          role: updatedUser.role || currentUser.role,
          enabled: currentUser.enabled 
        };
        
        localStorage.setItem('user', JSON.stringify(mergedUser));
        
        setUser(mergedUser);
        setRole(mergedUser.role || 'CLIENT');
        
        console.log("✅ Utilisateur mis à jour:", mergedUser);
        return mergedUser;
      }
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de l'utilisateur:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
    console.log("👋 Déconnexion");
  };

  const value = {
    user,
    role,
    login,
    logout,
    updateUser, 
    isAuthenticated,
    isAdmin: role === 'ADMIN',
    isClient: role === 'CLIENT',
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};