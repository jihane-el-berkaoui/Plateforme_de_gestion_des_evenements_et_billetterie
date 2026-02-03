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
  Alert,
  Snackbar,
  Grid,
  Chip
} from '@mui/material';
import { Add, Search, CheckCircle, Cancel, Block } from '@mui/icons-material';
import BookingCard from '../../components/cards/BookingCard';
import { bookingService, eventService, userService } from '../../api';
import { checkinService } from '../../api/checkinService'; 

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [openDialog, setOpenDialog] = useState(false);
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [newBooking, setNewBooking] = useState({
    eventId: '',
    userId: '',
    quantity: 1,
    notes: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [bookingsData, eventsData, usersData] = await Promise.all([
          bookingService.getAllBookings(),
          eventService.getAllEvents(),
          userService.getAllUsers()
        ]);
        
        const bookingsWithScanStatus = await Promise.all(
          bookingsData.map(async (booking) => {
            try {
              const stats = await checkinService.getBookingStats(booking.confirmationCode);
              
              return {
                ...booking,
                scanStats: stats,
                allTicketsScanned: stats.availableTickets === 0 && stats.usedTickets > 0,
                isPartiallyScanned: stats.usedTickets > 0 && stats.availableTickets > 0
              };
            } catch (err) {
              console.error(`Error checking scan status for booking ${booking.id}:`, err);
              return {
                ...booking,
                scanStats: null,
                allTicketsScanned: false,
                isPartiallyScanned: false
              };
            }
          })
        );
        
        setBookings(Array.isArray(bookingsWithScanStatus) ? bookingsWithScanStatus : []);
        setFilteredBookings(Array.isArray(bookingsWithScanStatus) ? bookingsWithScanStatus : []);
        setEvents(Array.isArray(eventsData) ? eventsData : []);
        setUsers(Array.isArray(usersData) ? usersData : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        showSnackbar('Error fetching data', 'error');
        setBookings([]);
        setFilteredBookings([]);
        setEvents([]);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!Array.isArray(bookings)) {
      setFilteredBookings([]);
      return;
    }

    let filtered = [...bookings];

    if (search) {
      filtered = filtered.filter(booking =>
        booking.confirmationCode?.toLowerCase().includes(search.toLowerCase()) ||
        booking.notes?.toLowerCase().includes(search.toLowerCase()) ||
        booking.userName?.toLowerCase().includes(search.toLowerCase()) ||
        booking.eventName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      if (statusFilter === 'SCANNED') {
        filtered = filtered.filter(booking => booking.allTicketsScanned);
      } else if (statusFilter === 'PARTIALLY_SCANNED') {
        filtered = filtered.filter(booking => booking.isPartiallyScanned && !booking.allTicketsScanned);
      } else if (statusFilter === 'NOT_SCANNED') {
        filtered = filtered.filter(booking => !booking.allTicketsScanned && !booking.isPartiallyScanned);
      } else {
        filtered = filtered.filter(booking => booking.status === statusFilter);
      }
    }

    setFilteredBookings(filtered);
  }, [bookings, search, statusFilter]);

  const handleCreateBooking = async () => {
    try {
      await bookingService.createBooking(newBooking);
      setOpenDialog(false);
      setNewBooking({
        eventId: '',
        userId: '',
        quantity: 1,
        notes: ''
      });
      
      const bookingsData = await bookingService.getAllBookings();
      const bookingsWithScanStatus = await Promise.all(
        bookingsData.map(async (booking) => {
          try {
            const stats = await checkinService.getBookingStats(booking.confirmationCode);
            return {
              ...booking,
              scanStats: stats,
              allTicketsScanned: stats.availableTickets === 0 && stats.usedTickets > 0,
              isPartiallyScanned: stats.usedTickets > 0 && stats.availableTickets > 0
            };
          } catch (err) {
            return { ...booking, scanStats: null, allTicketsScanned: false, isPartiallyScanned: false };
          }
        })
      );
      
      setBookings(Array.isArray(bookingsWithScanStatus) ? bookingsWithScanStatus : []);
      setFilteredBookings(Array.isArray(bookingsWithScanStatus) ? bookingsWithScanStatus : []);
      
      showSnackbar('Booking created successfully!', 'success');
    } catch (error) {
      console.error('Error creating booking:', error);
      showSnackbar(error.response?.data?.message || 'Error creating booking', 'error');
    }
  };

  const handleCancelBooking = async (id) => {
    const booking = bookings.find(b => b.id === id);
    
    if (booking?.allTicketsScanned || booking?.isPartiallyScanned) {
      showSnackbar('Cannot cancel booking with scanned tickets!', 'error');
      return;
    }
    
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await bookingService.cancelBooking(id);
        
        setBookings(prev => prev.map(b => 
          b.id === id ? { ...b, status: 'CANCELLED' } : b
        ));
        
        showSnackbar('Booking cancelled successfully!', 'success');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        showSnackbar('Error cancelling booking', 'error');
      }
    }
  };

  const handleForceCancel = async (id) => {
    if (window.confirm('⚠️ WARNING: This booking has scanned tickets!\nForce cancel will delete QR codes.\nAre you sure?')) {
      try {
        await bookingService.cancelBooking(id);
        
        setBookings(prev => prev.map(b => 
          b.id === id ? { ...b, status: 'CANCELLED' } : b
        ));
        
        showSnackbar('Booking force cancelled!', 'warning');
      } catch (error) {
        console.error('Error force cancelling booking:', error);
        showSnackbar('Error force cancelling booking', 'error');
      }
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const statuses = [
    'ALL', 
    'CONFIRMED', 
    'CANCELLED', 
    'COMPLETED',
    'SCANNED',
    'PARTIALLY_SCANNED',
    'NOT_SCANNED'
  ];

  const getScanStatusChip = (booking) => {
    if (booking.allTicketsScanned) {
      return (
        <Chip 
          icon={<CheckCircle />}
          label="ALL SCANNED"
          color="success"
          size="small"
          sx={{ ml: 1 }}
        />
      );
    } else if (booking.isPartiallyScanned) {
      const used = booking.scanStats?.usedTickets || 0;
      const total = booking.scanStats?.totalTickets || booking.quantity || 1;
      return (
        <Chip 
          icon={<CheckCircle />}
          label={`${used}/${total} SCANNED`}
          color="warning"
          size="small"
          sx={{ ml: 1 }}
        />
      );
    } else {
      return (
        <Chip 
          icon={<Block />}
          label="NOT SCANNED"
          color="default"
          size="small"
          sx={{ ml: 1 }}
        />
      );
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 3 }}>
        <Typography variant="h4">
          Bookings Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Create Booking
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search bookings"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statuses.map(status => (
                  <MenuItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box>
        {Array.isArray(filteredBookings) && filteredBookings.map(booking => (
          <Card key={booking.id} sx={{ mb: 2, opacity: booking.allTicketsScanned ? 0.8 : 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box>
                  <Typography variant="h6">
                    {booking.eventName || `Event #${booking.eventId}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Code: {booking.confirmationCode} | 
                    User: {booking.userName || `User #${booking.userId}`} | 
                    {booking.quantity} ticket(s) - ${booking.totalPrice}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Chip 
                    label={booking.status}
                    color={
                      booking.status === 'CONFIRMED' ? 'success' :
                      booking.status === 'CANCELLED' ? 'error' :
                      booking.status === 'COMPLETED' ? 'info' : 'default'
                    }
                    size="small"
                  />
                  {getScanStatusChip(booking)}
                </Box>
              </Box>
              
              {booking.scanStats && (
                <Box sx={{ mb: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Scan Status:</strong> {booking.scanStats.usedTickets} used / {booking.scanStats.totalTickets} total
                  </Typography>
                  {booking.scanStats.usedTickets > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Last scanned: {new Date(booking.scanStats.lastScanTime || booking.bookingDate).toLocaleString()}
                    </Typography>
                  )}
                </Box>
              )}
              
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => window.open(`/bookings/${booking.id}`, '_blank')}
                >
                  View Details
                </Button>
                
                {booking.status === 'CONFIRMED' && !booking.allTicketsScanned && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel
                  </Button>
                )}
                
                {booking.status === 'CONFIRMED' && (booking.allTicketsScanned || booking.isPartiallyScanned) && (
                  <Button
                    variant="outlined"
                    color="warning"
                    size="small"
                    onClick={() => handleForceCancel(booking.id)}
                    startIcon={<Cancel />}
                  >
                    Force Cancel
                  </Button>
                )}
                
                
              </Box>
            </CardContent>
          </Card>
        ))}
        
        {(!Array.isArray(filteredBookings) || filteredBookings.length === 0) && (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No bookings found matching your criteria
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Booking</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              select
              fullWidth
              label="Event"
              value={newBooking.eventId}
              onChange={(e) => setNewBooking({...newBooking, eventId: e.target.value})}
              margin="normal"
              required
            >
              <MenuItem value="">Select Event</MenuItem>
              {Array.isArray(events) && events.map(event => (
                <MenuItem key={event.id} value={event.id}>
                  {event.name} (Available: {event.availableTickets})
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              select
              fullWidth
              label="User"
              value={newBooking.userId}
              onChange={(e) => setNewBooking({...newBooking, userId: e.target.value})}
              margin="normal"
              required
            >
              <MenuItem value="">Select User</MenuItem>
              {Array.isArray(users) && users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={newBooking.quantity}
              onChange={(e) => setNewBooking({...newBooking, quantity: parseInt(e.target.value) || 1})}
              margin="normal"
              required
              inputProps={{ min: 1 }}
            />
            
            <TextField
              fullWidth
              label="Notes"
              value={newBooking.notes}
              onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
              margin="normal"
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateBooking} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminBookings;