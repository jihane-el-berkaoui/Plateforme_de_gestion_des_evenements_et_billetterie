import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ClientRoute = ({ children }) => {
  const { isAuthenticated, isClient, loading } = useAuth();
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

  if (!isClient) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          <strong>Accès réservé</strong> - Cette section est pour les clients seulement.
        </Alert>
      </Box>
    );
  }

  return children;
};

export default ClientRoute;