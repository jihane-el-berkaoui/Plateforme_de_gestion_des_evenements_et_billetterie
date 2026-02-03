import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Chip,
  Alert,
  Button,
  Divider
} from '@mui/material';
import { Add, Remove, Euro, ConfirmationNumber } from '@mui/icons-material';
import { ticketTypeService } from '../../api';

const TicketTypeSelector = ({ eventId, onSelectionChange }) => {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selections, setSelections] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTicketTypes();
  }, [eventId]);

  const loadTicketTypes = async () => {
    try {
      setLoading(true);
      const data = await ticketTypeService.getTicketTypesByEvent(eventId);
      
      const activeTypes = data.filter(t => t.isActive);
      setTicketTypes(activeTypes);

      const initialSelections = {};
      activeTypes.forEach(type => {
        initialSelections[type.id] = 0;
      });
      setSelections(initialSelections);
    } catch (err) {
      console.error('Error loading ticket types:', err);
      setError('Impossible de charger les types de billets');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (ticketTypeId, newQuantity) => {
    const ticketType = ticketTypes.find(t => t.id === ticketTypeId);
    
    if (newQuantity > ticketType.availableTickets) {
      return;
    }

    if (newQuantity < 0) {
      return;
    }

    const newSelections = {
      ...selections,
      [ticketTypeId]: newQuantity
    };
    
    setSelections(newSelections);

    const total = calculateTotal(newSelections);
    const totalQuantity = Object.values(newSelections).reduce((sum, qty) => sum + qty, 0);

    onSelectionChange({
      selections: newSelections,
      total: total,
      quantity: totalQuantity,
      ticketTypes: ticketTypes.filter(t => newSelections[t.id] > 0)
    });
  };

  const calculateTotal = (currentSelections) => {
    return ticketTypes.reduce((total, type) => {
      return total + (type.price * (currentSelections[type.id] || 0));
    }, 0);
  };

  const getTotalQuantity = () => {
    return Object.values(selections).reduce((sum, qty) => sum + qty, 0);
  };

  if (loading) {
    return <Typography>Chargement des types de billets...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (ticketTypes.length === 0) {
    return (
      <Alert severity="info">
        Aucun type de billet disponible pour cet événement
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Sélectionnez vos billets
      </Typography>

      <Grid container spacing={2}>
        {ticketTypes.map((ticketType) => (
          <Grid item xs={12} key={ticketType.id}>
            <Card 
              sx={{ 
                border: selections[ticketType.id] > 0 ? '2px solid' : '1px solid',
                borderColor: selections[ticketType.id] > 0 ? 'primary.main' : 'divider'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6">
                      {ticketType.name}
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
                      color={ticketType.availableTickets > 10 ? 'success' : 'warning'}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuantityChange(ticketType.id, selections[ticketType.id] - 1)}
                    disabled={selections[ticketType.id] === 0}
                  >
                    <Remove />
                  </Button>

                  <TextField
                    type="number"
                    value={selections[ticketType.id]}
                    onChange={(e) => handleQuantityChange(ticketType.id, parseInt(e.target.value) || 0)}
                    inputProps={{ 
                      min: 0, 
                      max: ticketType.availableTickets,
                      style: { textAlign: 'center' }
                    }}
                    sx={{ width: 80 }}
                  />

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleQuantityChange(ticketType.id, selections[ticketType.id] + 1)}
                    disabled={selections[ticketType.id] >= ticketType.availableTickets}
                  >
                    <Add />
                  </Button>

                  {selections[ticketType.id] > 0 && (
                    <Typography variant="body2" sx={{ ml: 'auto' }}>
                      Sous-total: €{(ticketType.price * selections[ticketType.id]).toFixed(2)}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {getTotalQuantity() > 0 && (
        <Card sx={{ mt: 3, bgcolor: 'primary.light', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">
                  <ConfirmationNumber sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Total: {getTotalQuantity()} billet(s)
                </Typography>
              </Box>
              <Typography variant="h5">
                <Euro sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                {calculateTotal(selections).toFixed(2)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default TicketTypeSelector;