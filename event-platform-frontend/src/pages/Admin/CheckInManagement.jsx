import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Button,
  LinearProgress,
  Alert,
  TextField,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Tabs,
  Tab
} from '@mui/material';
import {
  QrCodeScanner,
  Search,
  Refresh,
  Download,
  FilterList,
  CheckCircle,
  Cancel,
  Event,
  Person,
  Today,
  LocationOn,
  BarChart,
  QrCode2,
  Scanner
} from '@mui/icons-material';
import { checkinService, bookingService, eventService } from '../../api';
import QRCodeScanner from '../../components/checkin/QRCodeScanner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CheckInManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkIns, setCheckIns] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({});
  const [selectedEvent, setSelectedEvent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerId] = useState(`SCANNER-${Math.floor(Math.random() * 1000)}`);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [todayStats, setTodayStats] = useState({ total: 0, byEvent: {} });

  useEffect(() => {
    loadData();
    loadEvents();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [checkInsData, todayData] = await Promise.all([
        checkinService.getTodayCheckIns(),
        getTodayStats()
      ]);
      
      setCheckIns(checkInsData);
      setTodayStats(todayData);
    } catch (err) {
      console.error('Error loading check-ins:', err);
      setError('Erreur de chargement des check-ins');
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    try {
      const eventsData = await eventService.getAllEvents();
      setEvents(eventsData);
    } catch (err) {
      console.error('Error loading events:', err);
    }
  };

  const getTodayStats = async () => {
    const stats = { total: 0, byEvent: {} };
    
    try {
      const todayCheckIns = await checkinService.getTodayCheckIns();
      stats.total = todayCheckIns.length;
      
      todayCheckIns.forEach(checkIn => {
        if (!stats.byEvent[checkIn.eventId]) {
          stats.byEvent[checkIn.eventId] = 0;
        }
        stats.byEvent[checkIn.eventId]++;
      });
    } catch (err) {
      console.error('Error loading today stats:', err);
    }
    
    return stats;
  };

  const handleScanSuccess = (result) => {
    if (result.success) {
      showSnackbar('Check-in enregistré avec succès!', 'success');
      loadData(); 
    } else {
      showSnackbar(result.message, 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredCheckIns = checkIns.filter(checkIn => {
    if (selectedEvent && checkIn.eventId !== parseInt(selectedEvent)) {
      return false;
    }
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (checkIn.userName && checkIn.userName.toLowerCase().includes(searchLower)) ||
        (checkIn.bookingId && checkIn.bookingId.toString().includes(searchTerm)) ||
        (checkIn.scannerId && checkIn.scannerId.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const exportCSV = () => {
    const csvContent = [
      ['ID', 'Booking ID', 'Event ID', 'User ID', 'Date', 'Scanner', 'Location', 'Status'],
      ...filteredCheckIns.map(c => [
        c.id,
        c.bookingId,
        c.eventId,
        c.userId,
        format(new Date(c.checkInTime), 'dd/MM/yyyy HH:mm'),
        c.scannerId,
        c.location,
        c.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checkins_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 2 }}>
        <Scanner sx={{ mr: 1, verticalAlign: 'middle' }} />
        Gestion des Check-ins
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {todayStats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Check-ins aujourd'hui
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {checkIns.filter(c => c.status === 'CHECKED_IN').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Validés
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {checkIns.filter(c => c.status === 'PENDING').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                En attente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {Object.keys(todayStats.byEvent).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Événements
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<QrCodeScanner />}
          onClick={() => setScannerOpen(true)}
        >
          Ouvrir le scanner
        </Button>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadData}
          disabled={loading}
        >
          Actualiser
        </Button>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={exportCSV}
          disabled={checkIns.length === 0}
        >
          Exporter CSV
        </Button>
      </Box>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rechercher"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1 }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Événement"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                InputProps={{
                  startAdornment: <FilterList sx={{ mr: 1 }} />
                }}
              >
                <option value="">Tous les événements</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Statut"
                value=""
                onChange={() => {}}
              >
                <option value="">Tous les statuts</option>
                <option value="CHECKED_IN">Validés</option>
                <option value="PENDING">En attente</option>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Liste des check-ins ({filteredCheckIns.length})
          </Typography>
          
          {filteredCheckIns.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>Événement</TableCell>
                    <TableCell>Utilisateur</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Scanner</TableCell>
                    <TableCell>Statut</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCheckIns.map(checkIn => (
                    <TableRow key={checkIn.id}>
                      <TableCell>{checkIn.id}</TableCell>
                      <TableCell>{checkIn.bookingId}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Event sx={{ mr: 1, fontSize: 16 }} />
                          {events.find(e => e.id === checkIn.eventId)?.name || checkIn.eventId}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ mr: 1, fontSize: 16 }} />
                          {checkIn.userName || `User ${checkIn.userId}`}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {format(new Date(checkIn.checkInTime), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        {checkIn.scannerId || '-'}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={checkIn.status} 
                          color={checkIn.status === 'CHECKED_IN' ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small">
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                Aucun check-in trouvé
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      
      <QRCodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        scannerId={scannerId}
        onScanSuccess={handleScanSuccess}
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

export default CheckInManagement;