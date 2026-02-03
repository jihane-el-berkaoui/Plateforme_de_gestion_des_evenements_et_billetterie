import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Grid
} from '@mui/material';
import {
  Event,
  LocationOn,
  DateRange,
  People,
  Euro,
  Category
} from '@mui/icons-material';

const EventCard = ({ event, onDelete, onEdit }) => {
  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'CANCELLED': return 'error';
      case 'COMPLETED': return 'info';
      default: return 'default';
    }
  };

  const handleViewDetails = () => {
    navigate(`/events/${event.id}`);
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div">
            <Event sx={{ mr: 1, verticalAlign: 'middle', fontSize: 20 }} />
            {event.name}
          </Typography>
          <Chip
            label={event.status}
            color={getStatusColor(event.status)}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {event.description?.substring(0, 100)}...
        </Typography>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography variant="body2" display="flex" alignItems="center">
              <DateRange sx={{ mr: 0.5, fontSize: 16 }} />
              {new Date(event.date).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" display="flex" alignItems="center">
              <LocationOn sx={{ mr: 0.5, fontSize: 16 }} />
              {event.location}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" display="flex" alignItems="center">
              <People sx={{ mr: 0.5, fontSize: 16 }} />
              {event.availableTickets}/{event.capacity}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" display="flex" alignItems="center">
              <Euro sx={{ mr: 0.5, fontSize: 16 }} />
              {event.price}€
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Chip
              label={event.category}
              variant="outlined"
              size="small"
              icon={<Category sx={{ fontSize: 14 }} />}
            />
          </Grid>
        </Grid>

        {event.ticketTypes && event.ticketTypes.length > 0 && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Types de billets:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {event.ticketTypes.slice(0, 3).map(ticketType => (
                <Chip
                  key={ticketType.id}
                  label={`${ticketType.name} (${ticketType.availableTickets})`}
                  size="small"
                  variant="outlined"
                />
              ))}
              {event.ticketTypes.length > 3 && (
                <Chip
                  label={`+${event.ticketTypes.length - 3} autres`}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        )}
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
        <Button size="small" onClick={handleViewDetails}>
          Détails
        </Button>
        
        {event.availableTickets > 0 && event.status === 'ACTIVE' && (
          <Button
            size="small"
            variant="contained"
            onClick={() => navigate(`/book-event/${event.id}`)}
          >
            Réserver
          </Button>
        )}

        {onEdit && onDelete && (
          <Box>
            <Button size="small" onClick={() => onEdit(event)} color="primary">
              Modifier
            </Button>
            <Button size="small" onClick={() => onDelete(event.id)} color="error">
              Supprimer
            </Button>
          </Box>
        )}
      </CardActions>
    </Card>
  );
};

export default EventCard;