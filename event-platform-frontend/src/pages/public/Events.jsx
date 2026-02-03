import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Chip,
  Slider,
  FormControlLabel,
  Checkbox,
  Paper,
  InputAdornment,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  DateRange,
  Euro,
  ArrowBack
} from '@mui/icons-material';
import EventCard from '../../components/cards/EventCard';
import { eventService } from '../../api';
import { useAuth } from '../../contexts/AuthContext';

const Events = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: 'ALL',
    dateRange: [null, null],
    priceRange: [0, 500],
    showOnlyAvailable: true
  });
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const data = await eventService.getAllEvents();
        const eventsArray = Array.isArray(data) ? data : [];
        const availableEvents = eventsArray.filter(event => 
          event.status === 'ACTIVE' && event.availableTickets > 0
        );
        setEvents(availableEvents);
        setFilteredEvents(availableEvents);
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    let filtered = [...events];

    if (filters.search) {
      filtered = filtered.filter(event =>
        event.name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.location?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category !== 'ALL') {
      filtered = filtered.filter(event => event.category === filters.category);
    }

    filtered = filtered.filter(event => 
      event.price >= filters.priceRange[0] && event.price <= filters.priceRange[1]
    );

    if (filters.showOnlyAvailable) {
      filtered = filtered.filter(event => event.availableTickets > 0);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date) - new Date(b.date);
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredEvents(filtered);
  }, [events, filters, sortBy]);

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet événement?')) {
      try {
        await eventService.deleteEvent(eventId);
        const data = await eventService.getAllEvents();
        const eventsArray = Array.isArray(data) ? data : [];
        const availableEvents = eventsArray.filter(event => 
          event.status === 'ACTIVE' && event.availableTickets > 0
        );
        setEvents(availableEvents);
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleEditEvent = (event) => {
    navigate(`/admin/events/edit/${event.id}`);
  };

  const categories = [
    'ALL', 'CONCERT', 'SPORTS', 'CONFERENCE', 
    'FESTIVAL', 'THEATER', 'ART', 'FOOD', 'OTHER'
  ];

  const sortOptions = [
    { value: 'date', label: 'Date (plus proche)' },
    { value: 'price_asc', label: 'Prix (croissant)' },
    { value: 'price_desc', label: 'Prix (décroissant)' },
    { value: 'name', label: 'Nom (A-Z)' }
  ];

  if (loading) return <LinearProgress />;

  return (
    <Box sx={{ position: 'relative', minHeight: '100vh' }}>
      <IconButton
        onClick={() => navigate('/')}
        sx={{
          position: 'fixed',
          top: 24,
          left: 24,
          color: '#94A3B8',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1000,
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            color: '#3B82F6',
            transform: 'translateX(-4px)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          },
        }}
      >
        <ArrowBack />
      </IconButton>

      <Container maxWidth="xl">
        <Box sx={{ mb: 6, mt: 3 }}>
          <Typography 
            variant="h4" 
            gutterBottom
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Tous les événements
          </Typography>
          <Typography variant="body1" sx={{ color: '#94A3B8' }}>
            Découvrez et réservez vos billets pour les meilleurs événements
          </Typography>
          
          {isAdmin && (
            <Button
              variant="contained"
              onClick={() => navigate('/admin/events')}
              sx={{ 
                mt: 2,
                background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 40px rgba(59, 130, 246, 0.5)',
                },
              }}
            >
              Gérer les événements (Admin)
            </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Paper 
              sx={{ 
                p: 3, 
                position: 'sticky', 
                top: 20,
                background: 'rgba(30, 41, 59, 0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: '#f8fafc',
                  fontWeight: 700,
                }}
              >
                <FilterList sx={{ mr: 1, color: '#3B82F6' }} />
                Filtres
              </Typography>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: '#94A3B8' }} />
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ color: '#94A3B8' }}>
                  Catégorie
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  size="small"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>
                      {cat === 'ALL' ? 'Toutes les catégories' : cat}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" gutterBottom sx={{ color: '#94A3B8' }}>
                  Prix: €{filters.priceRange[0]} - €{filters.priceRange[1]}
                </Typography>
                <Slider
                  value={filters.priceRange}
                  onChange={(_, value) => setFilters({...filters, priceRange: value})}
                  valueLabelDisplay="auto"
                  min={0}
                  max={500}
                  sx={{ 
                    color: '#3B82F6',
                    '& .MuiSlider-thumb': {
                      boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
                    },
                  }}
                />
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={filters.showOnlyAvailable}
                    onChange={(e) => setFilters({...filters, showOnlyAvailable: e.target.checked})}
                    sx={{
                      color: '#94A3B8',
                      '&.Mui-checked': {
                        color: '#3B82F6',
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                    Afficher seulement les événements disponibles
                  </Typography>
                }
              />

              <Button
                fullWidth
                variant="outlined"
                onClick={() => setFilters({
                  search: '',
                  category: 'ALL',
                  dateRange: [null, null],
                  priceRange: [0, 500],
                  showOnlyAvailable: true
                })}
                sx={{ 
                  mt: 2,
                  borderColor: '#8B5CF6',
                  color: '#8B5CF6',
                  '&:hover': {
                    borderColor: '#7C3AED',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  },
                }}
              >
                Réinitialiser les filtres
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={9}>
            <Paper 
              sx={{ 
                p: 2, 
                mb: 3,
                background: 'rgba(30, 41, 59, 0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(148, 163, 184, 0.1)',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip 
                    label={`${filteredEvents.length} événements`} 
                    sx={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      color: '#fff',
                      fontWeight: 600,
                    }}
                  />
                  <Chip 
                    label={`${events.reduce((sum, event) => sum + event.availableTickets, 0)} places disponibles`} 
                    sx={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      fontWeight: 600,
                    }}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Sort sx={{ color: '#94A3B8' }} />
                  <TextField
                    select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    size="small"
                    sx={{ minWidth: 200 }}
                  >
                    {sortOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
            </Paper>

            {filteredEvents.length > 0 ? (
              <Grid container spacing={3}>
                {filteredEvents.map(event => (
                  <Grid item xs={12} sm={6} lg={4} key={event.id}>
                    <EventCard 
                      event={event}
                      onDelete={isAdmin ? handleDeleteEvent : null}
                      onEdit={isAdmin ? handleEditEvent : null}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper 
                sx={{ 
                  p: 6, 
                  textAlign: 'center',
                  background: 'rgba(30, 41, 59, 0.9)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(148, 163, 184, 0.1)',
                }}
              >
                <Typography variant="h6" sx={{ color: '#94A3B8' }} gutterBottom>
                  Aucun événement ne correspond à vos critères
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => setFilters({
                    search: '',
                    category: 'ALL',
                    dateRange: [null, null],
                    priceRange: [0, 500],
                    showOnlyAvailable: false
                  })}
                  sx={{
                    mt: 2,
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(59, 130, 246, 0.5)',
                    },
                  }}
                >
                  Voir tous les événements
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Events;