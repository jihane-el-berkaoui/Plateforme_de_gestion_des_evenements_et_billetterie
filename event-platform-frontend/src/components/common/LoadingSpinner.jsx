import React from 'react';
import { CircularProgress, Box } from '@mui/material';

const LoadingSpinner = ({ fullScreen = false, size = 40 }) => {
  if (fullScreen) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.paper'
        }}
      >
        <CircularProgress size={size} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 4
      }}
    >
      <CircularProgress size={size} />
    </Box>
  );
};

export default LoadingSpinner;