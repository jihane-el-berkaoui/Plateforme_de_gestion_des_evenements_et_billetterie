import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography
} from '@mui/material';
import { Warning, CheckCircle, Error } from '@mui/icons-material';

const ConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning', 
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  loading = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />;
      case 'error':
        return <Error sx={{ fontSize: 40, color: 'error.main', mb: 2 }} />;
      case 'warning':
        return <Warning sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />;
      default:
        return null;
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'primary';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getIcon()}
          <Typography variant="h6">{title}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          color={getConfirmButtonColor()}
          variant="contained"
          disabled={loading}
          autoFocus
        >
          {loading ? 'Traitement...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;