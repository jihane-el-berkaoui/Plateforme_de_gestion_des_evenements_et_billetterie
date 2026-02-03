import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Snackbar,
  LinearProgress,
  Typography
} from '@mui/material';
import { Add, Edit, Delete, Warning } from '@mui/icons-material';
import { ticketTypeService, eventService } from '../../api'; 

const TicketTypeManager = ({ eventId, open, onClose }) => {
  const [ticketTypes, setTicketTypes] = useState([]);
  const [event, setEvent] = useState(null); 
  const [editDialog, setEditDialog] = useState(false);
  const [currentTicketType, setCurrentTicketType] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    capacity: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('TicketTypeManager mounted, open:', open, 'eventId:', eventId);
    if (open && eventId) {
      loadEventAndTicketTypes(); 
    }
  }, [open, eventId]);

  const loadEventAndTicketTypes = async () => {
    try {
      setLoading(true);
      console.log('Loading event and ticket types for event:', eventId);
      
      const eventData = await eventService.getEventById(eventId);
      setEvent(eventData);
      console.log('Event loaded:', eventData);
      
      const ticketTypesData = await ticketTypeService.getTicketTypesByEvent(eventId);
      setTicketTypes(ticketTypesData || []);
      console.log('Loaded ticket types:', ticketTypesData);
      
    } catch (err) {
      console.error('Error loading event or ticket types:', err);
      setError('Erreur de chargement: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    console.log('Creating new ticket type for event:', event);
    
    if (!event) {
      setSnackbar({
        open: true,
        message: 'Événement non chargé',
        severity: 'error'
      });
      return;
    }
    
    setCurrentTicketType(null);
    setForm({ 
      name: '', 
      description: '', 
      price: event.price || 0,
      capacity: 1 
    });
    setEditDialog(true);
  };

  const handleEdit = (ticketType) => {
    console.log('Editing ticket type:', ticketType);
    setCurrentTicketType(ticketType);
    setForm({
      name: ticketType.name,
      description: ticketType.description,
      price: ticketType.price,
      capacity: ticketType.capacity
    });
    setEditDialog(true);
  };

  const handleSave = async () => {
    try {
      console.log('Saving ticket type for event:', event);
      
      const errors = [];
      
      if (!form.name.trim()) {
        errors.push('Le nom est obligatoire');
      }
      
      if (form.price <= 0) {
        errors.push('Le prix doit être positif');
      }
      
      if (form.capacity <= 0) {
        errors.push('La capacité doit être positive');
      }
      
      if (event) {
        const existingTypes = ticketTypes.filter(tt => 
          !currentTicketType || tt.id !== currentTicketType.id
        );
        const existingCapacity = existingTypes.reduce((sum, tt) => sum + tt.capacity, 0);
        const newTotalCapacity = existingCapacity + form.capacity;
        
        if (newTotalCapacity > event.capacity) {
          const remaining = event.capacity - existingCapacity;
          errors.push(
            `Capacité dépassée! L'événement a ${event.capacity} places max. ` +
            `Il reste ${remaining > 0 ? remaining : 0} places disponibles.`
          );
        }
      }
      
      if (errors.length > 0) {
        setSnackbar({
          open: true,
          message: errors.join('. '),
          severity: 'error'
        });
        return;
      }

      if (currentTicketType) {
        console.log('Updating ticket type:', currentTicketType.id);
        const updated = await ticketTypeService.updateTicketType(currentTicketType.id, form);
        console.log('Updated:', updated);
        setSnackbar({
          open: true,
          message: 'Type de billet mis à jour',
          severity: 'success'
        });
      } else {
        console.log('Creating ticket type for event:', eventId);
        const created = await ticketTypeService.createTicketType(eventId, form);
        console.log('Created:', created);
        setSnackbar({
          open: true,
          message: 'Type de billet créé',
          severity: 'success'
        });
      }
      setEditDialog(false);
      loadEventAndTicketTypes();
    } catch (err) {
      console.error('Error saving ticket type:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde';
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
    }
  };
const handleDelete = async (ticketTypeId) => {
  if (window.confirm('Supprimer ce type de billet ? Cette action le désactivera.')) {
    try {
      console.log('Deleting ticket type:', ticketTypeId);
      await ticketTypeService.deleteTicketType(ticketTypeId);
      setSnackbar({
        open: true,
        message: 'Type de billet désactivé',
        severity: 'success'
      });
      loadEventAndTicketTypes();
    } catch (err) {
      console.error('Error deleting ticket type:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Erreur lors de la suppression';
      setSnackbar({
        open: true,
        message: errorMsg,
        severity: 'error'
      });
    }
  }
};
  const calculateUsedCapacity = () => {
    return ticketTypes.reduce((sum, tt) => sum + tt.capacity, 0);
  };

  const calculateRemainingCapacity = () => {
    if (!event) return 0;
    return event.capacity - calculateUsedCapacity();
  };

  if (!open) return null;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              Gestion des types de billets
              {event && (
                <Typography variant="subtitle2" color="text.secondary">
                  Événement: {event.name} | Capacité totale: {event.capacity} places
                </Typography>
              )}
            </Box>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={handleCreate}
            >
              Ajouter un type
            </Button>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {event && (
            <Alert 
              severity={calculateRemainingCapacity() <= 0 ? "error" : "info"}
              sx={{ mb: 2 }}
              icon={<Warning />}
            >
              <Typography variant="body2">
                <strong>Capacité :</strong> {calculateUsedCapacity()}/{event.capacity} places utilisées
                {calculateRemainingCapacity() > 0 && (
                  <span> | {calculateRemainingCapacity()} places restantes</span>
                )}
                {calculateRemainingCapacity() <= 0 && (
                  <span> | <strong>Capacité maximale atteinte!</strong></span>
                )}
              </Typography>
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <LinearProgress sx={{ width: '100%' }} />
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Prix (€)</TableCell>
                  <TableCell>Capacité</TableCell>
                  <TableCell>Disponibles</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ticketTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      Aucun type de billet trouvé. Créez-en un !
                    </TableCell>
                  </TableRow>
                ) : (
                  ticketTypes.map(type => (
                    <TableRow key={type.id}>
                      <TableCell>{type.name}</TableCell>
                      <TableCell>{type.description}</TableCell>
                      <TableCell>€{type.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {type.capacity}
                          {type.capacity > (event?.availableTickets || 0) && (
                            <Chip 
                              label="Dépassé" 
                              size="small" 
                              color="error" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>{type.availableTickets}</TableCell>
                      <TableCell>
                        <Chip 
                          label={type.isActive ? 'Actif' : 'Inactif'}
                          color={type.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton onClick={() => handleEdit(type)} size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(type.id)} size="small" color="error">
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)}>
        <DialogTitle>
          {currentTicketType ? 'Modifier' : 'Créer'} un type de billet
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, minWidth: 400 }}>
            <TextField
              fullWidth
              label="Nom *"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              margin="normal"
              required
              error={!form.name.trim()}
              helperText={!form.name.trim() ? "Le nom est obligatoire" : ""}
            />
            <TextField
              fullWidth
              label="Description"
              value={form.description}
              onChange={(e) => setForm({...form, description: e.target.value})}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Prix (€) *"
              type="number"
              value={form.price}
              onChange={(e) => setForm({...form, price: parseFloat(e.target.value) || 0})}
              margin="normal"
              required
              inputProps={{ min: 0, step: 0.01 }}
              error={form.price <= 0}
              helperText={form.price <= 0 ? "Le prix doit être positif" : ""}
            />
            <TextField
              fullWidth
              label="Capacité *"
              type="number"
              value={form.capacity}
              onChange={(e) => setForm({...form, capacity: parseInt(e.target.value) || 0})}
              margin="normal"
              required
              inputProps={{ 
                min: 1,
                max: calculateRemainingCapacity() + (currentTicketType?.capacity || 0)
              }}
              error={form.capacity <= 0}
              helperText={
                form.capacity <= 0 ? "La capacité doit être positive" :
                event ? `Maximum: ${calculateRemainingCapacity() + (currentTicketType?.capacity || 0)} places` : ""
              }
            />
            
            {event && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Capacité restante pour l'événement :</strong> {calculateRemainingCapacity() + (currentTicketType?.capacity || 0)} places
                </Typography>
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Annuler</Button>
          <Button onClick={handleSave} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default TicketTypeManager;