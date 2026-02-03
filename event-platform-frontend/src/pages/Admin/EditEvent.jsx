import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Paper
} from '@mui/material';
import { ArrowBack, Save, Cancel } from '@mui/icons-material';
import { eventService } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [event, setEvent] = useState({
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
    if (!isAdmin) {
      navigate('/admin/events');
      return;
    }

    const loadEvent = async () => {
      try {
        setLoading(true);
        const eventData = await eventService.getEventById(id);
        
        const formattedDate = new Date(eventData.date)
          .toISOString()
          .slice(0, 16);
        
        setEvent({
          name: eventData.name || '',
          description: eventData.description || '',
          date: formattedDate,
          location: eventData.location || '',
          capacity: eventData.capacity || 0,
          price: eventData.price || 0,
          category: eventData.category || 'OTHER',
          status: eventData.status || 'ACTIVE'
        });
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Erreur de chargement de l\'événement');
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!event.name.trim() || !event.location.trim() || !event.date) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (event.capacity <= 0) {
      setError('La capacité doit être supérieure à 0');
      return;
    }

    if (event.price < 0) {
      setError('Le prix ne peut pas être négatif');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      await eventService.updateEvent(id, event);
      
      setSuccess('Événement mis à jour avec succès!');
      
      setTimeout(() => {
        navigate('/admin/events');
      }, 2000);
      
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'capacity') {
      setEvent({ ...event, [name]: parseInt(value) || 0 });
    } else if (name === 'price') {
      setEvent({ ...event, [name]: parseFloat(value) || 0 });
    } else {
      setEvent({ ...event, [name]: value });
    }
  };

  const categories = ['CONCERT', 'SPORTS', 'CONFERENCE', 'FESTIVAL', 'THEATER', 'OTHER'];
  const statuses = ['ACTIVE', 'CANCELLED', 'COMPLETED', 'POSTPONED'];

  if (!isAdmin) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Accès réservé aux administrateurs
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/admin/events')}
        sx={{ mb: 3, mt: 2 }}
      >
        Retour aux événements
      </Button>

      <Typography variant="h4" gutterBottom>
        Modifier l'événement
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nom de l'événement *"
                  name="name"
                  value={event.name}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Lieu *"
                  name="location"
                  value={event.location}
                  onChange={handleChange}
                  required
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={event.description}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date & Heure *"
                  type="datetime-local"
                  name="date"
                  value={event.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  disabled={saving}
                />
              </Grid>

              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  label="Capacité *"
                  type="number"
                  name="capacity"
                  value={event.capacity}
                  onChange={handleChange}
                  required
                  disabled={saving}
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={6} md={3}>
                <TextField
                  fullWidth
                  label="Prix *"
                  type="number"
                  name="price"
                  value={event.price}
                  onChange={handleChange}
                  InputProps={{ startAdornment: '€' }}
                  required
                  disabled={saving}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              <Grid item xs={6} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Catégorie"
                  name="category"
                  value={event.category}
                  onChange={handleChange}
                  disabled={saving}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={6} md={6}>
                <TextField
                  select
                  fullWidth
                  label="Statut"
                  name="status"
                  value={event.status}
                  onChange={handleChange}
                  disabled={saving}
                >
                  {statuses.map(status => (
                    <MenuItem key={status} value={status}>{status}</MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2" color="text.secondary">
                    * Champs obligatoires
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/admin/events')}
                    disabled={saving}
                    startIcon={<Cancel />}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  >
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default EditEvent;