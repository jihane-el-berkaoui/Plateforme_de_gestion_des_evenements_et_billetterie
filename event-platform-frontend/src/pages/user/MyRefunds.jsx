import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Button
} from '@mui/material';
import { AttachMoney, History, Refresh, Visibility } from '@mui/icons-material';
import { refundService, bookingService } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const MyRefunds = () => {
  const { user } = useAuth();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadRefunds();
    }
  }, [user]);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      setError('');
      
      const bookings = await bookingService.getBookingsByUser(user.id);
      
      const refundBookings = bookings.filter(b => 
        b.status === 'REFUND_REQUESTED' || 
        b.status === 'REFUNDED' || 
        b.status === 'REFUND_REJECTED'
      );
      
      setRefunds(refundBookings);
    } catch (err) {
      console.error('Error loading refunds:', err);
      setError('Erreur de chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'REFUND_REQUESTED': return 'warning';
      case 'REFUNDED': return 'success';
      case 'REFUND_REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'REFUND_REQUESTED': return 'En attente';
      case 'REFUNDED': return 'Remboursé';
      case 'REFUND_REJECTED': return 'Rejeté';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 3 }}>
        <AttachMoney sx={{ mr: 2, verticalAlign: 'middle' }} />
        Mes demandes de remboursement
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Historique des demandes ({refunds.length})
            </Typography>
            <Button
              startIcon={<Refresh />}
              onClick={loadRefunds}
              variant="outlined"
              size="small"
            >
              Actualiser
            </Button>
          </Box>

          {refunds.length === 0 ? (
            <Alert severity="info">
              Aucune demande de remboursement
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Réservation</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Date demande</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Raison</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {refunds.map(refund => (
                    <TableRow key={refund.id}>
                      <TableCell>
                        #{refund.confirmationCode}
                      </TableCell>
                      <TableCell>
                        €{refund.refundAmount?.toFixed(2) || refund.totalPrice?.toFixed(2) || '0.00'}
                      </TableCell>
                      <TableCell>
                        {refund.refundRequestDate ? 
                          new Date(refund.refundRequestDate).toLocaleDateString() : 
                          'N/A'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(refund.status)}
                          color={getStatusColor(refund.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {refund.refundReason ? 
                          refund.refundReason.substring(0, 50) + 
                          (refund.refundReason.length > 50 ? '...' : '') : 
                          'N/A'}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          component={Link}
                          to={`/bookings/${refund.id}`}
                          startIcon={<Visibility />}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <History sx={{ mr: 1, verticalAlign: 'middle' }} />
            Procédure de remboursement
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            1. Les demandes sont traitées sous 48h ouvrables
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            2. Les remboursements sont effectués sur le moyen de paiement d'origine
          </Typography>
          <Typography variant="body2" color="text-secondary" paragraph>
            3. En cas de rejet, vous recevrez une explication par email
          </Typography>
          <Button
            variant="contained"
            component={Link}
            to="/my-bookings"
            sx={{ mt: 2 }}
          >
            Retour à mes réservations
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default MyRefunds;