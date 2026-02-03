import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  MenuItem,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  Snackbar,
  IconButton,
  CardActions 
} from '@mui/material';
import { 
  Add, 
  Search, 
  FilterList, 
  Delete, 
  Edit, 
  ConfirmationNumber 
} from '@mui/icons-material';
import EventCard from '../../components/cards/EventCard';
import { eventService } from '../../api';
import { useAuth } from '../../contexts/AuthContext'; 
import { useNavigate } from 'react-router-dom';
import TicketTypeManager from '../Admin/TicketTypeManager';

const AdminEvents = () => {
  const { isAdmin } = useAuth(); 
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate(); 
  
  const [ticketTypeDialog, setTicketTypeDialog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  
  const [newEvent, setNewEvent] = useState({
    name: '',
    description: '',
    date: '',
    location: '',
    capacity: 0,
    price: 0,
    category: 'OTHER',
    status: 'ACTIVE'
  });
  
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      
      const data = await eventService.getAllEvents();
      const eventsArray = Array.isArray(data) ? data : [];
      
      setEvents(eventsArray);
      setFilteredEvents(eventsArray);
      
    } catch (error) {
      console.error('❌ Erreur chargement événements:', error);
      setError('Erreur de chargement');
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Array.isArray(events)) {
      setFilteredEvents([]);
      return;
    }

    let filtered = [...events];

    if (search) {
      filtered = filtered.filter(event =>
        event.name?.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase()) ||
        event.location?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter !== 'ALL') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  }, [events, search, categoryFilter, statusFilter]);

  const handleManageTicketTypes = (eventId) => {
    setSelectedEventId(eventId);
    setTicketTypeDialog(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      setLoading(true);
      await eventService.deleteEvent(eventId);
      
      await loadEvents();
      
      setSnackbar({
        open: true,
        message: 'Événement supprimé avec succès!',
        severity: 'success'
      });
    } catch (error) {
      console.error('❌ Erreur suppression:', error);
      setSnackbar({
        open: true,
        message: 'Erreur lors de la suppression',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event) => {
    navigate(`/admin/events/edit/${event.id}`);
  };

  const handleCreateEvent = async () => {
    if (submitting) {
      return;
    }

    const errors = [];
    
    if (!newEvent.name?.trim()) errors.push('Le nom est obligatoire');
    if (!newEvent.location?.trim()) errors.push('Le lieu est obligatoire');
    if (!newEvent.date) errors.push('La date est obligatoire');
    if (newEvent.capacity <= 0) errors.push('La capacité doit être > 0');
    if (newEvent.price < 0) errors.push('Le prix ne peut pas être négatif');
    
    if (newEvent.date) {
      const dateObj = new Date(newEvent.date);
      if (isNaN(dateObj.getTime())) {
        errors.push('Format de date invalide');
      } else if (dateObj < new Date()) {
        errors.push('La date doit être dans le futur');
      }
    }

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    const eventData = {
      name: newEvent.name.trim(),
      description: newEvent.description?.trim() || '',
      date: newEvent.date,
      location: newEvent.location.trim(),
      capacity: parseInt(newEvent.capacity),
      price: parseFloat(newEvent.price),
      category: newEvent.category,
      status: newEvent.status,
      availableTickets: parseInt(newEvent.capacity)
    };

    try {
      setSubmitting(true);
      setError('');
      
      const response = await eventService.createEvent(eventData);
      
      setOpenDialog(false);
      
      setNewEvent({
        name: '',
        description: '',
        date: '',
        location: '',
        capacity: 100,
        price: 0,
        category: 'OTHER',
        status: 'ACTIVE'
      });
      
      await loadEvents();
      
      setSnackbar({
        open: true,
        message: 'Événement créé avec succès!',
        severity: 'success'
      });
      
    } catch (error) {
      let errorMessage = 'Erreur lors de la création';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `Erreur ${error.response.status}: ${error.response.statusText}`;
      } else if (error.request) {
        errorMessage = 'Le serveur ne répond pas';
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['ALL', 'CONCERT', 'SPORTS', 'CONFERENCE', 'FESTIVAL', 'THEATER', 'OTHER'];
  const statuses = ['ALL', 'ACTIVE', 'CANCELLED', 'COMPLETED', 'POSTPONED'];

  if (loading) return <LinearProgress />;

  if (!isAdmin) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h6">Accès refusé</Typography>
            <Typography>
              Cette section est réservée aux administrateurs. 
              Veuillez vous connecter avec un compte administrateur.
            </Typography>
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 3 }}>
        <Typography variant="h4">
          Gestion des événements (Admin)
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Créer un événement
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rechercher événements"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                select
                fullWidth
                label="Catégorie"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                InputProps={{
                  startAdornment: <FilterList sx={{ mr: 1 }} />
                }}
              >
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat === 'ALL' ? 'Toutes' : cat}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6} md={4}>
              <TextField
                select
                fullWidth
                label="Statut"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>{status === 'ALL' ? 'Tous' : status}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <Grid item key={event.id} xs={12} md={6} lg={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div">
                      {event.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleManageTicketTypes(event.id)}
                        startIcon={<ConfirmationNumber />}
                      >
                        Types
                      </Button>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {event.description?.substring(0, 100)}...
                  </Typography>

                  <Typography variant="body2">
                    📅 {new Date(event.date).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    📍 {event.location}
                  </Typography>
                  <Typography variant="body2">
                    🎫 {event.availableTickets}/{event.capacity} places
                  </Typography>
                  <Typography variant="body2">
                    💰 €{event.price}
                  </Typography>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Box>
                    <Button
                      size="small"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      Voir
                    </Button>
                    <Button
                      size="small"
                      onClick={() => handleEditEvent(event)}
                      startIcon={<Edit />}
                    >
                      Modifier
                    </Button>
                  </Box>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDeleteEvent(event.id)}
                    startIcon={<Delete />}
                  >
                    Supprimer
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  {events.length === 0 
                    ? 'Aucun événement. Créez-en un !' 
                    : 'Aucun événement ne correspond aux filtres'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

<Dialog 
  open={openDialog} 
  onClose={submitting ? undefined : () => setOpenDialog(false)} 
  maxWidth="md" 
  fullWidth
>
  <DialogTitle>Créer un nouvel événement</DialogTitle>
  <DialogContent>
    {error && (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    )}
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Nom de l'événement *"
          value={newEvent.name}
          onChange={(e) => setNewEvent({...newEvent, name: e.target.value})}
          error={!newEvent.name?.trim()}
          helperText={!newEvent.name?.trim() ? "Le nom est obligatoire" : ""}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          value={newEvent.description}
          onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
          multiline
          rows={3}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Date et heure *"
          type="datetime-local"
          value={newEvent.date}
          onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
          InputLabelProps={{ shrink: true }}
          error={!newEvent.date}
          helperText={!newEvent.date ? "La date est obligatoire" : ""}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Lieu *"
          value={newEvent.location}
          onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
          error={!newEvent.location?.trim()}
          helperText={!newEvent.location?.trim() ? "Le lieu est obligatoire" : ""}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Capacité *"
          type="number"
          value={newEvent.capacity}
          onChange={(e) => setNewEvent({...newEvent, capacity: parseInt(e.target.value) || 0})}
          inputProps={{ min: 1 }}
          error={newEvent.capacity <= 0}
          helperText={newEvent.capacity <= 0 ? "La capacité doit être > 0" : ""}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Prix (€) *"
          type="number"
          value={newEvent.price}
          onChange={(e) => setNewEvent({...newEvent, price: parseFloat(e.target.value) || 0})}
          inputProps={{ min: 0, step: 0.01 }}
          error={newEvent.price < 0}
          helperText={newEvent.price < 0 ? "Le prix ne peut pas être négatif" : ""}
        />
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="Catégorie"
          value={newEvent.category}
          onChange={(e) => setNewEvent({...newEvent, category: e.target.value})}
        >
          <MenuItem value="CONCERT">Concert</MenuItem>
          <MenuItem value="SPORTS">Sports</MenuItem>
          <MenuItem value="CONFERENCE">Conférence</MenuItem>
          <MenuItem value="FESTIVAL">Festival</MenuItem>
          <MenuItem value="THEATER">Théâtre</MenuItem>
          <MenuItem value="OTHER">Autre</MenuItem>
        </TextField>
      </Grid>
      
      <Grid item xs={12} md={6}>
        <TextField
          select
          fullWidth
          label="Statut"
          value={newEvent.status}
          onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
        >
          <MenuItem value="ACTIVE">Actif</MenuItem>
          <MenuItem value="CANCELLED">Annulé</MenuItem>
          <MenuItem value="COMPLETED">Terminé</MenuItem>
          <MenuItem value="POSTPONED">Reporté</MenuItem>
        </TextField>
      </Grid>
      
      <Grid item xs={12}>
        <Alert severity="info">
          <Typography variant="body2">
            Après la création, vous pourrez ajouter des types de tickets (VIP, Standard, etc.) dans la gestion des types de tickets.
          </Typography>
        </Alert>
      </Grid>
    </Grid>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenDialog(false)} disabled={submitting}>
      Annuler
    </Button>
    <Button 
      onClick={handleCreateEvent} 
      variant="contained" 
      disabled={submitting}
    >
      {submitting ? 'Création...' : 'Créer'}
    </Button>
  </DialogActions>
</Dialog>
      <TicketTypeManager
        eventId={selectedEventId}
        open={ticketTypeDialog}
        onClose={() => setTicketTypeDialog(false)}
      />

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

export default AdminEvents;