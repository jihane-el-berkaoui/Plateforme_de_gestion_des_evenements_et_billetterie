import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <strong>Accès interdit</strong> - Cette section est réservée aux administrateurs.
        </Alert>
      </Box>
    );
  }

  return children;
};

export default AdminRoute;