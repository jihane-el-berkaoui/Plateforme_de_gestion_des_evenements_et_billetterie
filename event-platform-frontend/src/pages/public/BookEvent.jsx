import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Grid,
  Stepper,
  Step,
  StepLabel,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  Euro,
  Person,
  Event,
  Warning,
  Download,
  Print
} from '@mui/icons-material';
import { bookingService, eventService, ticketTypeService } from '../../api';
import { useAuth } from '../../contexts/AuthContext';
import TicketTypeSelector from '../../components/tickets/TicketTypeSelector';
import {Chip,
 TextField
} from '@mui/material';
const BookEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [event, setEvent] = useState(null);
  const [selectedTickets, setSelectedTickets] = useState({}); 
  const [ticketTypes, setTicketTypes] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [bookingResult, setBookingResult] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
const [selectedTicketTypeId, setSelectedTicketTypeId] = useState(null);
const [selectedTicketType, setSelectedTicketType] = useState(null);
const [quantity, setQuantity] = useState(1);
useEffect(() => {
  const loadEventAndTicketTypes = async () => {
    try {
      setLoading(true);
      const eventData = await eventService.getEventById(id);
      setEvent(eventData);
      
      const ticketTypesData = await ticketTypeService.getTicketTypesByEvent(id);
      console.log('Loaded ticket types for event', id, ':', ticketTypesData);
      
      const activeTypes = (ticketTypesData || []).filter(t => 
        t.isActive && t.availableTickets > 0
      );
      
      setTicketTypes(activeTypes);
      
      if (!isAuthenticated) {
        setError('Vous devez être connecté pour réserver');
        setStep(0);
      } else {
        setStep(1);
      }
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Événement non trouvé');
    } finally {
      setLoading(false);
    }
  };

  loadEventAndTicketTypes();
}, [id, isAuthenticated]);
useEffect(() => {
  if (selectedTicketType) {
    setTotalPrice(selectedTicketType.price * quantity);
    setTotalQuantity(quantity);
  } else {
    setTotalPrice(0);
    setTotalQuantity(0);
  }
}, [quantity, selectedTicketType]);
const handleQuantityChange = (newQuantity) => {
  if (selectedTicketType) {
    const qty = Math.max(1, Math.min(selectedTicketType.availableTickets, newQuantity));
    setQuantity(qty);
    setTotalPrice(selectedTicketType.price * qty);
    setTotalQuantity(qty);
  }
};
const handleSelectTicketType = (ticketType) => {
  console.log('Selected ticket type:', ticketType);
  setSelectedTicketTypeId(ticketType.id);
  setSelectedTicketType(ticketType);
  setQuantity(1);
  
  setTotalPrice(ticketType.price * 1);
  setTotalQuantity(1);
};
const handleSubmit = async () => {
  try {
    setLoading(true);
    setError('');
    
    if (!isAuthenticated || !user) {
      throw new Error('Vous devez être connecté');
    }
    
    if (!selectedTicketTypeId) {
      throw new Error('Veuillez sélectionner un type de billet');
    }
    
    if (quantity <= 0) {
      throw new Error('Quantité invalide');
    }
    
    console.log('Creating booking with:', {
      eventId: parseInt(id),
      userId: user.id,
      ticketTypeId: parseInt(selectedTicketTypeId),
      quantity: parseInt(quantity)
    });
    
    const bookingData = {
      eventId: parseInt(id),
      userId: user.id,
      ticketTypeId: parseInt(selectedTicketTypeId),
      quantity: parseInt(quantity)
    };
    
    const bookingResult = await bookingService.createBooking(bookingData);
    console.log('Booking result:', bookingResult);
    
    setBookingResult(bookingResult);
    setSuccess(true);
    
    setSnackbar({
      open: true,
      message: 'Réservation confirmée!',
      severity: 'success'
    });
    
  } catch (err) {
    console.error('Error creating booking:', err);
    const errorMessage = err.response?.data?.message || err.message || 'Erreur de réservation';
    setError(errorMessage);
    setSnackbar({
      open: true,
      message: errorMessage,
      severity: 'error'
    });
  } finally {
    setLoading(false);
  }
};
const validateBooking = () => {
  const errors = [];
  
  if (!selectedTicketTypeId) {
    errors.push('Veuillez sélectionner un type de billet');
  }
  
  if (!selectedTicketType) {
    errors.push('Type de billet non trouvé');
  }
  
  if (quantity <= 0) {
    errors.push('La quantité doit être positive');
  }
  
  if (selectedTicketType && quantity > selectedTicketType.availableTickets) {
    errors.push(`Il ne reste que ${selectedTicketType.availableTickets} billet(s) disponible(s)`);
  }
  
  return {
    valid: errors.length === 0,
    message: errors.join('. ')
  };
};

const handleContinueToStep2 = () => {
  const validation = validateBooking();
  if (!validation.valid) {
    setSnackbar({
      open: true,
      message: validation.message,
      severity: 'error'
    });
    return;
  }
  setStep(2);
};

  const calculateTotal = () => {
    return totalPrice;
  };

  const steps = isAuthenticated 
    ? ['Événement', 'Sélection des billets', 'Confirmation']
    : ['Événement', 'Connexion', 'Sélection des billets', 'Confirmation'];

  if (loading && !event) return <LinearProgress />;
  if (error && !event) return <Alert severity="error">{error}</Alert>;
  if (!event) return null;

  return (
    <Container maxWidth="lg">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/events/${id}`)}
        sx={{ mb: 3, mt: 2 }}
      >
        Retour à l'événement
      </Button>
      
      <Typography variant="h4" gutterBottom>
        Réserver: {event.name}
      </Typography>
      
      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success ? (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Réservation Confirmée!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {totalQuantity} billet(s) réservé(s) avec succès.
              </Typography>
            </Box>

            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
              <Tab label="Récapitulatif" />
              <Tab label="Instructions" />
            </Tabs>

            {activeTab === 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Détails de la réservation
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText 
                      primary="Événement" 
                      secondary={event.name} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Nom" 
                      secondary={`${user?.firstName} ${user?.lastName}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText 
                      primary="Nombre total de billets" 
                      secondary={totalQuantity} 
                    />
                  </ListItem>
                   <ListItem>
      <ListItemText 
        primary="Total payé" 
        secondary={`€${bookingResult?.totalPrice?.toFixed(2) || calculateTotal().toFixed(2)}`} 
      />
    </ListItem>
                  {bookingResult && (
                    <ListItem>
                      <ListItemText 
                        primary="Code de confirmation" 
                        secondary={bookingResult.confirmationCode} 
                      />
                    </ListItem>
                  )}
                </List>
                
                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  
                </Typography>
                {Object.entries(selectedTickets).map(([ticketTypeId, quantity]) => {
                  if (quantity > 0) {
                    const ticketType = ticketTypes.find(t => t.id === parseInt(ticketTypeId));
                    if (ticketType) {
                      return (
                        <Paper key={ticketTypeId} sx={{ p: 2, mb: 2 }}>
                          <Typography variant="subtitle1">{ticketType.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {quantity} x €{ticketType.price} = €{(quantity * ticketType.price).toFixed(2)}
                          </Typography>
                          <Typography variant="caption" display="block">
                            {ticketType.description}
                          </Typography>
                        </Paper>
                      );
                    }
                  }
                  return null;
                })}
              </Paper>
            )}

            {activeTab === 1 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Instructions importantes
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Chaque type de billet nécessite une présentation séparée" 
                      secondary="Présentez les QR codes correspondants à chaque type" 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Pièce d'identité requise" 
                      secondary="Pour vérification des billets nominatifs" 
                    />
                  </ListItem>
                </List>
              </Paper>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 3 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/my-bookings')}
              >
                Voir mes réservations
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate(`/events/${id}`)}
              >
                Retour à l'événement
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                {step === 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      Événement sélectionné
                    </Typography>
                    <Paper sx={{ p: 2, mb: 3 }}>
                      <Typography variant="h6" color="primary">
                        {event.name}
                      </Typography>
                      <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Date: {new Date(event.date).toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Lieu: {event.location}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                    
                    {!isAuthenticated ? (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Vous devez vous connecter pour continuer
                      </Alert>
                    ) : null}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                      <Button onClick={() => navigate('/events')}>
                        Annuler
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => isAuthenticated ? setStep(1) : navigate('/login')}
                      >
                        {isAuthenticated ? 'Continuer' : 'Se connecter'}
                      </Button>
                    </Box>
                  </>
                )}
                
{step === 1 && isAuthenticated && (
  <>
    <Typography variant="h6" gutterBottom>
      Sélectionnez vos billets
    </Typography>
    
    {ticketTypes.length > 0 ? (
      <Box>
        <Alert severity="info" sx={{ mb: 2 }}>
          Choisissez parmi les types de billets disponibles:
        </Alert>
        
        <Grid container spacing={2}>
          {ticketTypes.map(ticketType => {
            const isAvailable = ticketType.availableTickets > 0;
            const isSelected = selectedTicketTypeId === ticketType.id;
            
            return (
              <Grid item xs={12} key={ticketType.id}>
                <Card 
                  sx={{ 
                    border: isSelected ? '2px solid' : '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    opacity: isAvailable ? 1 : 0.6,
                    '&:hover': isAvailable ? { borderColor: 'primary.main' } : {}
                  }}
                  onClick={() => isAvailable && handleSelectTicketType(ticketType)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">
                          {ticketType.name}
                          {!isAvailable && (
                            <Chip 
                              label="COMPLET" 
                              size="small" 
                              color="error" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {ticketType.description}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="h6" color="primary">
                          €{ticketType.price.toFixed(2)}
                        </Typography>
                        <Chip 
                          label={`${ticketType.availableTickets} disponibles`}
                          size="small"
                          color={ticketType.availableTickets > 0 ? 'success' : 'error'}
                        />
                      </Box>
                    </Box>
                    
                    <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Capacité: {ticketType.capacity} places
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Prix unitaire: €{ticketType.price}
                      </Typography>
                    </Box>
                    
                    {isSelected && (
                      <Box sx={{ mt: 2, p: 1, bgcolor: 'primary.light', color: 'white', borderRadius: 1 }}>
                        <Typography variant="body2" align="center">
                          ✅ Sélectionné | Maximum: {ticketType.availableTickets} billet(s) disponible(s)
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        
        {selectedTicketType && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle1" gutterBottom>
              Quantité pour <strong>{selectedTicketType.name}</strong>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
  variant="outlined"
  onClick={() => handleQuantityChange(quantity - 1)}
  disabled={quantity <= 1}
>
                -
              </Button>
              <TextField
  type="number"
  value={quantity}
  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
  inputProps={{ 
    min: 1, 
    max: selectedTicketType?.availableTickets || 1
  }}
  sx={{ width: 100 }}
/>
              <Button
  variant="outlined"
  onClick={() => handleQuantityChange(quantity + 1)}
  disabled={quantity >= (selectedTicketType?.availableTickets || 1)}
>
                +
              </Button>
              <Typography variant="body2" sx={{ ml: 'auto' }}>
                Sous-total: <strong>€{(selectedTicketType.price * quantity).toFixed(2)}</strong>
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {selectedTicketType.availableTickets} billet(s) disponible(s) pour ce type
            </Typography>
          </Box>
        )}
        
        {selectedTicketType && (
          <Paper sx={{ p: 2, mt: 3, bgcolor: 'primary.light', color: 'white' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">
                  Récapitulatif
                </Typography>
                <Typography variant="body2">
                  {quantity} × {selectedTicketType.name} @ €{selectedTicketType.price}
                </Typography>
              </Box>
              <Typography variant="h5">
                Total: €{(selectedTicketType.price * quantity).toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    ) : (
      <Alert severity="warning" sx={{ mb: 3 }}>
        Aucun type de billet disponible pour cet événement
      </Alert>
    )}
    
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
      <Button onClick={() => setStep(0)}>Retour</Button>
      <Button
  variant="contained"
  onClick={handleContinueToStep2} 
  disabled={!selectedTicketTypeId || quantity === 0}
>
  Continuer
</Button>
    </Box>
  </>
)}
                
              {step === 2 && (
  <>
    <Typography variant="h6" gutterBottom>
      Confirmation finale
    </Typography>
    
    <Alert severity="info" sx={{ mb: 3 }}>
      Vérifiez les détails avant de confirmer
    </Alert>
    
    <Paper sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Typography variant="subtitle1">
            Pour: {user?.firstName} {user?.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="body1" gutterBottom>
            <strong>Événement:</strong> {event?.name}
          </Typography>
        </Grid>
        
        {selectedTicketType && (
          <>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Type de billet:</strong> {selectedTicketType.name}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" align="right">
                <strong>Quantité:</strong> {quantity}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2">
                <strong>Prix unitaire:</strong> €{selectedTicketType.price.toFixed(2)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" align="right">
                <strong>Total:</strong> €{(selectedTicketType.price * quantity).toFixed(2)}
              </Typography>
            </Grid>
          </>
        )}
        
        <Grid item xs={12}>
          <Typography variant="h6" align="right" color="primary">
  Total à payer: €{selectedTicketType ? (selectedTicketType.price * quantity).toFixed(2) : 
                  bookingResult?.totalPrice ? bookingResult.totalPrice.toFixed(2) : '0.00'}
</Typography>
        </Grid>
      </Grid>
    </Paper>
    
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
      <Button onClick={() => setStep(1)}>
        Retour
      </Button>
      <Button
        variant="contained"
        color="success"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Traitement...' : 'Confirmer la réservation'}
      </Button>
    </Box>
  </>
)}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Votre compte
              </Typography>
              <Typography variant="body1">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Types de billets disponibles
              </Typography>
              {ticketTypes.map(ticketType => (
                <Box key={ticketType.id} sx={{ mb: 2, p: 1, border: '1px solid #ddd', borderRadius: 1 }}>
                  <Typography variant="subtitle2">{ticketType.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    €{ticketType.price} - {ticketType.availableTickets} disponibles
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default BookEvent;