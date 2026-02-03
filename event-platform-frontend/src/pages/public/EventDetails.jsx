import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Grid,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  Event,
  LocationOn,
  DateRange,
  People,
  Euro,
  Category,
  Delete,
  Edit
} from '@mui/icons-material';
import { eventService, bookingService } from '../../api';
import { useAuth } from '../../contexts/AuthContext'; 

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isClient, isAuthenticated } = useAuth(); 
  const [event, setEvent] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventData, bookingsData] = await Promise.all([
          eventService.getEventById(id),
          bookingService.getBookingsByEvent(id)
        ]);
        
        setEvent(eventData);
        setBookings(Array.isArray(bookingsData) ? bookingsData : []);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(id);
        navigate('/events');
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('Failed to delete event');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'CANCELLED': return 'error';
      case 'COMPLETED': return 'info';
      default: return 'default';
    }
  };

  if (loading) return <LinearProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!event) return <Alert severity="warning">Event not found</Alert>;

  return (
    <Container maxWidth="lg">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/events')}
        sx={{ mb: 3, mt: 2 }}
      >
        Back to Events
      </Button>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4">
                  <Event sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {event.name}
                </Typography>
                <Box>
                  <Chip
                    label={event.status}
                    color={getStatusColor(event.status)}
                    sx={{ mr: 1 }}
                  />
                  <Chip label={event.category} variant="outlined" />
                </Box>
              </Box>

              <Typography variant="body1" paragraph>
                {event.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <DateRange sx={{ mr: 1, verticalAlign: 'middle' }} />
                    <strong>Date & Time:</strong> {new Date(event.date).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                    <strong>Location:</strong> {event.location}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <People sx={{ mr: 1, verticalAlign: 'middle' }} />
                    <strong>Capacity:</strong> {event.availableTickets}/{event.capacity} tickets available
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    <Euro sx={{ mr: 1, verticalAlign: 'middle' }} />
                    <strong>Price:</strong> €{event.price.toFixed(2)}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                {isClient && event.availableTickets > 0 && event.status === 'ACTIVE' && (
                  <Button
                    variant="contained"
                    component={Link}
                    to={`/book-event/${event.id}`}
                  >
                    Réserver des billets
                  </Button>
                )}
                
                {isAdmin && (
                  <>
                    <Button
                      variant="outlined"
                      component={Link}
                      to={`/admin/events/edit/${event.id}`}
                      startIcon={<Edit />}
                    >
                      Modifier
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                      onClick={handleDelete}
                    >
                      Supprimer
                    </Button>
                  </>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {isAdmin && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Recent Bookings ({bookings.length})
              </Typography>
              {bookings.length > 0 ? (
                <List>
                  {bookings.slice(0, 5).map(booking => (
                    <ListItem key={booking.id} divider>
                      <ListItemText
                        primary={`Booking #${booking.confirmationCode}`}
                        secondary={
                          <>
                            <Typography variant="body2">
                              {booking.quantity} ticket(s) - €{booking.totalPrice.toFixed(2)}
                            </Typography>
                            <Typography variant="caption">
                              Status: {booking.status}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" align="center" py={2}>
                  No bookings yet
                </Typography>
              )}
              {bookings.length > 5 && (
                <Button fullWidth onClick={() => navigate(`/admin/bookings?eventId=${event.id}`)}>
                  View All Bookings
                </Button>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default EventDetails;