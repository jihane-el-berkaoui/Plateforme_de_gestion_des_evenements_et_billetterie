import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Paper,
  Divider,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ArrowBack,
  ConfirmationNumber,
  Event,
  Person,
  Euro,
  CalendarToday,
  LocationOn,
  QrCode,
  Print,
  Cancel,
  Email
} from '@mui/icons-material';
import { bookingService, eventService } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatPrice } from '../../utils/helpers';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [booking, setBooking] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialog, setCancelDialog] = useState(false);

  useEffect(() => {
    const loadBookingDetails = async () => {
      try {
        setLoading(true);
        const bookingData = await bookingService.getBookingById(id);
        
        if (user.role !== 'ADMIN' && bookingData.userId !== user.id) {
          throw new Error('Accès non autorisé');
        }
        
        setBooking(bookingData);
        
        const eventData = await eventService.getEventById(bookingData.eventId);
        setEvent(eventData);
      } catch (err) {
        console.error('Error loading booking details:', err);
        setError(err.message || 'Erreur de chargement des détails');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadBookingDetails();
    }
  }, [id, user]);

  const handleCancelBooking = async () => {
    try {
      await bookingService.cancelBooking(id);
      setBooking({ ...booking, status: 'CANCELLED' });
      setCancelDialog(false);
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Erreur lors de l\'annulation');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'CANCELLED': return 'error';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!booking) return <Alert severity="warning">Réservation non trouvée</Alert>;

  return (
    <Container maxWidth="lg">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/my-bookings')}
        sx={{ mb: 3, mt: 2 }}
      >
        Retour à mes réservations
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                  <ConfirmationNumber sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Réservation #{booking.confirmationCode}
                </Typography>
                <Chip 
                  label={booking.status}
                  color={getStatusColor(booking.status)}
                />
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Informations de réservation
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <ConfirmationNumber sx={{ mr: 1, fontSize: 16 }} />
                        Code: <strong style={{ marginLeft: 4 }}>{booking.confirmationCode}</strong>
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CalendarToday sx={{ mr: 1, fontSize: 16 }} />
                        Date de réservation: {formatDate(booking.bookingDate)}
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Person sx={{ mr: 1, fontSize: 16 }} />
                        Quantité: {booking.quantity} billet(s)
                      </Typography>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Euro sx={{ mr: 1, fontSize: 16 }} />
                        Total: {formatPrice(booking.totalPrice)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Informations de l'événement
                    </Typography>
                    {event && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <Event sx={{ mr: 1, fontSize: 16 }} />
                          Événement: {event.name}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarToday sx={{ mr: 1, fontSize: 16 }} />
                          Date: {formatDate(event.date)}
                        </Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOn sx={{ mr: 1, fontSize: 16 }} />
                          Lieu: {event.location}
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {booking.cancelledDate && (
                <Alert severity="info" sx={{ mt: 3 }}>
                  Cette réservation a été annulée le {formatDate(booking.cancelledDate)}
                </Alert>
              )}
            </CardContent>
          </Card>

          {booking.status === 'CONFIRMED' && event && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Votre billet électronique
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                      <QrCode sx={{ fontSize: 120, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Présentez ce code QR à l'entrée de l'événement
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Code: {booking.confirmationCode}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Instructions importantes:
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        • Présentez votre billet électronique ou code QR
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        • Arrivez 30 minutes avant le début
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        • Pièce d'identité requise
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Print />}
                  onClick={handlePrint}
                >
                  Imprimer le billet
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Email />}
                  onClick={() => {/* Envoyer par email */}}
                >
                  Envoyer par email
                </Button>
                {booking.status === 'CONFIRMED' && event && (
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    Voir l'événement
                  </Button>
                )}
                {booking.status === 'CONFIRMED' && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => setCancelDialog(true)}
                  >
                    Annuler la réservation
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>

        </Grid>
      </Grid>

      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
        <DialogTitle>Annuler la réservation</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Êtes-vous sûr de vouloir annuler la réservation #{booking.confirmationCode} ?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2 }}>
            Cette action est irréversible. {booking.quantity} billet(s) seront remis en vente.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>
            Non, garder
          </Button>
          <Button onClick={handleCancelBooking} color="error" variant="contained">
            Oui, annuler
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingDetails;