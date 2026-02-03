import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  alpha
} from '@mui/material';
import {
  MusicNote,
  SportsSoccer,
  School,
  Celebration,
  TheaterComedy,
  Brush,
  Restaurant,
  MoreHoriz
} from '@mui/icons-material';
import { eventService } from '../../api';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryConfig = {
    CONCERT: {
      icon: <MusicNote />,
      color: '#1976d2',
      description: 'Concerts live, festivals de musique'
    },
    SPORTS: {
      icon: <SportsSoccer />,
      color: '#2e7d32',
      description: 'Matchs, compétitions, événements sportifs'
    },
    CONFERENCE: {
      icon: <School />,
      color: '#ed6c02',
      description: 'Conférences, séminaires, ateliers'
    },
    FESTIVAL: {
      icon: <Celebration />,
      color: '#9c27b0',
      description: 'Festivals culturels, événements communautaires'
    },
    THEATER: {
      icon: <TheaterComedy />,
      color: '#d32f2f',
      description: 'Pièces de théâtre, comédies, spectacles'
    },
    ART: {
      icon: <Brush />,
      color: '#0288d1',
      description: 'Expositions, vernissages, ateliers artistiques'
    },
    FOOD: {
      icon: <Restaurant />,
      color: '#5d4037',
      description: 'Festivals gastronomiques, dégustations'
    },
    OTHER: {
      icon: <MoreHoriz />,
      color: '#757575',
      description: 'Autres types d\'événements'
    }
  };

  useEffect(() => {
    const loadCategoryStats = async () => {
      try {
        setLoading(true);
        const events = await eventService.getAllEvents();
        const eventsArray = Array.isArray(events) ? events : [];

        const categoryStats = Object.keys(categoryConfig).map(category => {
          const categoryEvents = eventsArray.filter(event => 
            event.category === category && 
            event.status === 'ACTIVE' && 
            event.availableTickets > 0
          );

          return {
            name: category,
            count: categoryEvents.length,
            ...categoryConfig[category],
            upcomingEvents: categoryEvents
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 3)
          };
        });

        setCategories(categoryStats.filter(cat => cat.count > 0));
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategoryStats();
  }, []);

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 6, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Catégories d'événements
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Découvrez les événements par catégorie
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.name}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                borderTop: `4px solid ${category.color}`,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 8px 24px ${alpha(category.color, 0.2)}`
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: alpha(category.color, 0.1),
                      color: category.color,
                      mr: 2
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {category.name}
                    </Typography>
                    <Chip 
                      label={`${category.count} événements`} 
                      size="small" 
                      variant="outlined"
                      sx={{ color: category.color, borderColor: alpha(category.color, 0.5) }}
                    />
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {category.description}
                </Typography>

                {category.upcomingEvents.length > 0 && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                      Prochains événements :
                    </Typography>
                    {category.upcomingEvents.map(event => (
                      <Box
                        key={event.id}
                        sx={{
                          p: 1,
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: alpha(category.color, 0.05),
                          cursor: 'pointer',
                          '&:hover': { bgcolor: alpha(category.color, 0.1) }
                        }}
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        <Typography variant="body2">
                          {event.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(event.date).toLocaleDateString()} • {event.location}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>

              <CardContent>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate(`/events?category=${category.name}`)}
                  sx={{
                    bgcolor: category.color,
                    '&:hover': { bgcolor: category.color, opacity: 0.9 }
                  }}
                >
                  Voir les événements {category.name}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {categories.length === 0 && (
        <EmptyState
          type="events"
          message="Aucune catégorie d'événements disponible pour le moment."
          onAction={() => navigate('/events')}
        />
      )}
    </Container>
  );
};

export default Categories;