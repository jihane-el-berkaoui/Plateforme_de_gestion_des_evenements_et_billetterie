import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Alert,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  ConfirmationNumber,
  Event,
  Person,
  Euro,
  CalendarToday,
  Cancel,
  Receipt,
  AttachMoney,
  CheckCircle,
  Block
} from '@mui/icons-material';
import { bookingService, eventService, refundService } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

import RefundRequestDialog from '../../components/refund/RefundRequestDialog';
import { checkinService } from '../../api/checkinService';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialog, setCancelDialog] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [refundDialog, setRefundDialog] = useState(null);
  const [refundLoading, setRefundLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const bookingsData = await bookingService.getBookingsByUser(user.id);

        if (Array.isArray(bookingsData)) {
          const eventIds = [...new Set(bookingsData.map(b => b.eventId))];
          const eventsData = {};

          for (const eventId of eventIds) {
            try {
              eventsData[eventId] = await eventService.getEventById(eventId);
            } catch (e) {
              console.error('Event load error', e);
            }
          }

          setEvents(eventsData);
          
          const bookingsWithScanStatus = await Promise.all(
            bookingsData.map(async (booking) => {
              try {
                const statusResponse = await checkinService.getTicketStatus(
                  booking.confirmationCode || `BK${booking.id}`
                );
                
                return {
                  ...booking,
                  isScanned: statusResponse.found && statusResponse.isUsed,
                  scannedAt: statusResponse.usedAt,
                  scannerId: statusResponse.scannerId
                };
              } catch (err) {
                console.error('Error checking scan status:', err);
                return { ...booking, isScanned: false };
              }
            })
          );
          
          setBookings(bookingsWithScanStatus);
        }
      } catch (e) {
        setError('Erreur de chargement des réservations');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isAuthenticated, navigate]);

  const handleCancel = async (bookingId) => {
    try {
      setLoading(true);
      await bookingService.cancelBooking(bookingId);

      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId
            ? { ...b, status: 'CANCELLED', cancelledDate: new Date().toISOString() }
            : b
        )
      );

      setCancelDialog(null);
      showSnackbar('Réservation annulée avec succès', 'success');
    } catch {
      showSnackbar('Erreur lors de l’annulation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRefund = async (bookingId, reason, requestedAmount) => {
    try {
      setRefundLoading(true);
      await refundService.requestRefund(bookingId, reason, requestedAmount);

      showSnackbar('Demande de remboursement envoyée', 'success');
      setRefundDialog(null);

      const updated = await bookingService.getBookingsByUser(user.id);
      setBookings(updated);
    } catch (e) {
      showSnackbar(e.message || 'Erreur lors de la demande', 'error');
    } finally {
      setRefundLoading(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status, isScanned) => {
    if (isScanned) {
      return 'default'; 
    }
    
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'CANCELLED': return 'error';
      case 'REFUND_REQUESTED': return 'warning';
      case 'REFUNDED': return 'info';
      case 'REFUND_REJECTED': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status, isScanned) => {
    if (isScanned) {
      return 'DÉJÀ UTILISÉ';
    }
    
    switch (status) {
      case 'CONFIRMED': return 'CONFIRMÉ';
      case 'CANCELLED': return 'ANNULÉ';
      case 'REFUND_REQUESTED': return 'REMBOURSEMENT DEMANDÉ';
      case 'REFUNDED': return 'REMBOURSÉ';
      case 'REFUND_REJECTED': return 'REMBOURSEMENT REFUSÉ';
      default: return status;
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <LinearProgress />;

  const activeBookings = bookings.filter(b => b.status === 'CONFIRMED');

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mt: 3, mb: 3 }}>
        <ConfirmationNumber sx={{ mr: 1 }} />
        Mes réservations
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      

      <Grid container spacing={3}>
        {activeBookings.map((booking) => {
          const event = events[booking.eventId];

          return (
            <Grid item xs={12} key={booking.id}>
              <Card sx={{ 
                position: 'relative',
                opacity: booking.isScanned ? 0.8 : 1
              }}>
                {booking.isScanned && (
                  <Box sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1
                  }}>
                   
                  </Box>
                )}
                
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">
                      <Event sx={{ mr: 1 }} />
                      {event?.name || `Événement #${booking.eventId}`}
                    </Typography>
                    <Chip 
                      label={getStatusText(booking.status, booking.isScanned)} 
                      color={getStatusColor(booking.status, booking.isScanned)} 
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <ConfirmationNumber sx={{ mr: 1 }} />
                        Code: <strong>{booking.confirmationCode}</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <CalendarToday sx={{ mr: 1 }} />
                        Réservé le : {new Date(booking.bookingDate).toLocaleString()}
                      </Typography>
                      
                      {booking.isScanned && booking.scannedAt && (
                        <Alert severity="warning" sx={{ mt: 2 }} icon={<CheckCircle />}>
                          <Typography variant="body2">
                            <strong>Scanné le:</strong> {new Date(booking.scannedAt).toLocaleDateString('fr-FR')} à {new Date(booking.scannedAt).toLocaleTimeString('fr-FR')}
                            {booking.scannerId && (
                              <>
                                <br />
                                <strong>Par:</strong> {booking.scannerId}
                              </>
                            )}
                          </Typography>
                        </Alert>
                      )}
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="body2">
                        <Person sx={{ mr: 1 }} />
                        {booking.quantity} billet(s)
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <Euro sx={{ mr: 1 }} />
                        Total : €{booking.totalPrice?.toFixed(2)}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Alert severity={booking.isScanned ? "error" : "info"} sx={{ mt: 3 }}>
                    <Typography variant="body2">
                      {booking.isScanned ? (
                        <>
                          ❌ Ce billet a déjà été utilisé à l'entrée.
                          <br />
                          <strong>Vous ne pouvez plus l'utiliser pour accéder à l'événement.</strong>
                        </>
                      ) : (
                        <>
                          ✅ Votre QR code a été envoyé à votre email :
                          <strong> {user.email}</strong>
                          <br />
                          <strong>Code unique pour le check-in :</strong>{' '}
                          {booking.uniqueCode || `EVT-${booking.id}`}
                          <br />
                          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                            Présentez ce code à l'entrée de l'événement
                          </Typography>
                        </>
                      )}
                    </Typography>
                  </Alert>

                  <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      component={Link}
                      to={`/bookings/${booking.id}`}
                      startIcon={<Receipt />}
                      disabled={booking.isScanned}
                    >
                      Détails
                    </Button>

                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<AttachMoney />}
                      onClick={() => setRefundDialog(booking)}
                      disabled={booking.isScanned || booking.status !== 'CONFIRMED'}
                    >
                      Demander remboursement
                    </Button>

                    {event && (
                      <Button
                        variant="contained"
                        component={Link}
                        to={`/events/${booking.eventId}`}
                      >
                        Voir l'événement
                      </Button>
                    )}
                    
                    
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <RefundRequestDialog
        open={!!refundDialog}
        booking={refundDialog}
        loading={refundLoading}
        onClose={() => setRefundDialog(null)}
        onRequestRefund={handleRequestRefund}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MyBookings;