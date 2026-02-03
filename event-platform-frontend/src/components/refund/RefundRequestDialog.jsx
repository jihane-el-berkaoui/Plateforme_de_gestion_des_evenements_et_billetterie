import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Alert,
  Box,
  CircularProgress
} from '@mui/material';
import { AttachMoney, Warning } from '@mui/icons-material';

const RefundRequestDialog = ({ 
  open, 
  onClose, 
  booking, 
  onRequestRefund, 
  loading 
}) => {
  const [reason, setReason] = useState('');
  const [requestedAmount, setRequestedAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!reason.trim()) {
      setError('Veuillez fournir une raison');
      return;
    }
    
    const amount = requestedAmount ? parseFloat(requestedAmount) : null;
    
    if (amount !== null) {
      if (isNaN(amount) || amount <= 0) {
        setError('Montant invalide');
        return;
      }
      if (amount > booking.totalPrice) {
        setError(`Le montant ne peut pas dépasser ${booking.totalPrice.toFixed(2)}€`);
        return;
      }
    }
    
    onRequestRefund(booking.id, reason, amount);
    setReason('');
    setRequestedAmount('');
    setError('');
  };

  const handleClose = () => {
    setReason('');
    setRequestedAmount('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AttachMoney />
          Demander un remboursement
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Warning sx={{ mr: 1, mt: 0.2 }} />
            <Box>
              <Typography variant="body2" fontWeight="bold">
                Conditions de remboursement:
              </Typography>
              <Typography variant="body2">
                • Uniquement pour les réservations confirmées<br/>
                • Délai: jusqu'à 24h avant l'événement<br/>
                • Montant maximum: {booking?.totalPrice?.toFixed(2)}€
              </Typography>
            </Box>
          </Box>
        </Alert>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Réservation #{booking?.confirmationCode} - {booking?.quantity} billet(s)
        </Typography>
        
        <TextField
          fullWidth
          label="Raison du remboursement *"
          multiline
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Expliquez pourquoi vous demandez un remboursement..."
          disabled={loading}
          sx={{ mb: 2 }}
        />
        
        <TextField
          fullWidth
          label="Montant demandé (optionnel)"
          type="number"
          value={requestedAmount}
          onChange={(e) => setRequestedAmount(e.target.value)}
          placeholder="Laisser vide pour remboursement total"
          disabled={loading}
          InputProps={{
            startAdornment: '€'
          }}
          helperText="Si vide, remboursement total du montant payé"
        />
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Votre demande sera examinée par notre équire sous 48h.
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Annuler
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="warning"
          disabled={loading || !reason.trim()}
          startIcon={loading ? <CircularProgress size={20} /> : <AttachMoney />}
        >
          {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefundRequestDialog;