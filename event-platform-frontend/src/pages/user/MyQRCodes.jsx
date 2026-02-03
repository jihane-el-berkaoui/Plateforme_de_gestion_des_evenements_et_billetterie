import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Tabs,
  Tab,
  Paper,
  Snackbar
} from '@mui/material';
import {
  QrCode2,
  Download,
  Event,
  Person,
  CalendarToday,
  ConfirmationNumber,
  Refresh,
  CheckCircle,
  Cancel,
  Email,
  ContentCopy,
  Info,
  Block
} from '@mui/icons-material';
import { bookingService } from '../../api/bookingService';
import { checkinService } from '../../api/checkinService';
import { useAuth } from '../../contexts/AuthContext';
import MuiAlert from '@mui/material/Alert';

const MyQRCodes = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [tabValue, setTabValue] = useState(0);
  const [regenerating, setRegenerating] = useState({});

  useEffect(() => {
    if (user && user.id) {
      loadBookings();
    }
  }, [user]);

  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const checkTicketStatus = async (bookingId, confirmationCode) => {
    try {
      const statusResponse = await checkinService.getTicketStatus(confirmationCode || `BK${bookingId}`);
      
      if (statusResponse.found) {
        return {
          isUsed: statusResponse.isUsed,
          usedAt: statusResponse.usedAt,
          scannerId: statusResponse.scannerId,
          scannerType: statusResponse.scannerType,
          status: statusResponse.status || (statusResponse.isUsed ? "SCANNED" : "VALID"),
          eventName: statusResponse.eventName,
          userName: statusResponse.userName
        };
      }
    } catch (err) {
      console.error("Error checking ticket status:", err);
    }
    return { isUsed: false, status: "UNKNOWN" };
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!user || !user.id) {
        throw new Error('User not authenticated');
      }
      
      const data = await bookingService.getBookingsByUser(user.id);
      
      const bookingsWithStatus = await Promise.all(
        data.map(async (booking) => {
          try {
            const qrResult = await checkinService.getQRCodeByBooking(booking.id);
            const ticketStatus = await checkTicketStatus(booking.id, booking.confirmationCode);
            
            return { 
              ...booking, 
              qrResult,
              ticketStatus, 
              isScanned: ticketStatus.isUsed, 
              scannedAt: ticketStatus.usedAt,
              scannedBy: ticketStatus.scannerId,
              eventName: booking.event?.name || booking.eventName || ticketStatus.eventName || 'Événement',
              userName: booking.user?.name || user.name || user.email || ticketStatus.userName || 'Utilisateur',
              eventDate: booking.event?.date || booking.eventDate || new Date(),
              quantity: booking.quantity || 1,
              totalPrice: booking.totalPrice || 0
            };
          } catch (err) {
            console.error(`Error loading QR for booking ${booking.id}:`, err);
            return { 
              ...booking,
              qrResult: { success: false, message: "Erreur de chargement" },
              ticketStatus: { isUsed: false, status: "ERROR" },
              isScanned: false,
              eventName: booking.event?.name || booking.eventName || 'Événement',
              userName: booking.user?.name || user.name || user.email || 'Utilisateur',
              eventDate: booking.event?.date || booking.eventDate || new Date(),
              quantity: booking.quantity || 1,
              totalPrice: booking.totalPrice || 0
            };
          }
        })
      );
      
      setBookings(bookingsWithStatus);
      showSnackbar(`${bookingsWithStatus.length} réservations chargées`, 'success');
      
    } catch (err) {
      console.error('Error loading bookings:', err);
      
      if (err.message.includes('not authenticated') || err.message.includes('User not authenticated')) {
        setError('Veuillez vous connecter pour voir vos QR codes');
      } else if (err.message.includes('Network Error')) {
        setError('Problème de connexion au serveur');
      } else {
        setError('Erreur de chargement des réservations');
      }
      
      showSnackbar('Erreur de chargement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (bookingId) => {
    try {
      setRegenerating(prev => ({ ...prev, [bookingId]: true }));
      const result = await checkinService.generateQRCode(bookingId);
      
      if (result.success) {
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, qrResult: result }
            : booking
        ));
        showSnackbar('QR code généré avec succès', 'success');
      } else {
        showSnackbar('Erreur lors de la génération du QR code', 'error');
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
      showSnackbar('Erreur lors de la génération du QR code', 'error');
    } finally {
      setRegenerating(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showSnackbar('Code copié dans le presse-papier', 'success');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        showSnackbar('Erreur lors de la copie', 'error');
      });
  };

  const downloadQRCode = (bookingId, qrImage) => {
    if (!qrImage) {
      showSnackbar('Aucune image QR code disponible', 'warning');
      return;
    }
    
    try {
      const link = document.createElement('a');
      link.href = qrImage;
      link.download = `qr-code-booking-${bookingId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showSnackbar('QR code téléchargé', 'success');
    } catch (err) {
      console.error('Error downloading QR code:', err);
      showSnackbar('Erreur lors du téléchargement', 'error');
    }
  };

  const getBookingStatusColor = (status, isScanned) => {
    if (isScanned) {
      return 'default'; 
    }
    
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'CONFIRMED':
      case 'CONFIRMÉ':
        return 'success';
      case 'PENDING':
      case 'EN_ATTENTE':
        return 'warning';
      case 'CANCELLED':
      case 'CANCELED':
      case 'ANNULÉ':
        return 'error';
      case 'REFUNDED':
      case 'REMBOURSÉ':
        return 'info';
      case 'COMPLETED':
      case 'TERMINÉ':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusText = (status, isScanned) => {
    if (isScanned) {
      return 'DÉJÀ UTILISÉ';
    }
    
    const statusUpper = (status || '').toUpperCase();
    switch (statusUpper) {
      case 'CONFIRMED':
      case 'CONFIRMÉ':
        return 'Confirmé';
      case 'PENDING':
      case 'EN_ATTENTE':
        return 'En attente';
      case 'CANCELLED':
      case 'CANCELED':
      case 'ANNULÉ':
        return 'Annulé';
      case 'REFUNDED':
      case 'REMBOURSÉ':
        return 'Remboursé';
      case 'COMPLETED':
      case 'TERMINÉ':
        return 'Terminé';
      default:
        return status || 'Inconnu';
    }
  };

  const activeBookings = bookings.filter(b => 
    ['CONFIRMED', 'CONFIRMÉ'].includes((b.status || '').toUpperCase()) && !b.isScanned
  );
  
  const pastBookings = bookings.filter(b => 
    ['COMPLETED', 'TERMINÉ', 'CANCELLED', 'CANCELED', 'ANNULÉ', 'REFUNDED', 'REMBOURSÉ'].includes((b.status || '').toUpperCase()) || b.isScanned
  );
  
  const pendingBookings = bookings.filter(b => 
    ['PENDING', 'EN_ATTENTE'].includes((b.status || '').toUpperCase()) && !b.isScanned
  );

  const displayBookings = tabValue === 0 ? activeBookings : pastBookings;

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">
          Vous devez être connecté pour accéder à vos QR codes.
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Chargement de vos réservations...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={4000} 
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Email sx={{ mr: 2, color: 'primary.main' }} />
          Mes Codes de Check-in
        </Typography>
        
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          icon={<Info />}
        >
          <Typography variant="body2">
            📧 Vos codes de check-in sont envoyés par email lors de chaque réservation.
            <br />
            Consultez votre boîte mail : <strong>{user?.email}</strong>
          </Typography>
        </Alert>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

  
<Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
  <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
    <Tab 
      label={`Actifs (${activeBookings.length})`} 
      icon={<CheckCircle fontSize="small" />}
      iconPosition="start"
    />
    <Tab 
      label={`Historique (${pastBookings.length})`} 
      icon={<Event fontSize="small" />}
      iconPosition="start"
    />
  </Tabs>
</Box>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {displayBookings.length} réservation(s) trouvée(s)
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadBookings}
          disabled={loading}
        >
          Actualiser
        </Button>
      </Box>

      {displayBookings.length === 0 ? (
          <Alert severity="info">
    {tabValue === 0 && "Aucune réservation active"}
    {tabValue === 1 && "Aucune réservation dans l'historique"}
  </Alert>
      ) : (
        <Grid container spacing={3}>
          {displayBookings.map((booking) => (
            <Grid item xs={12} md={6} key={booking.id}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                opacity: booking.isScanned ? 0.8 : 1,
                position: 'relative'
              }}>
                {booking.isScanned && (
                  <Box sx={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    zIndex: 1
                  }}>
                    
                  </Box>
                )}
                
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {booking.eventName}
                    </Typography>
                    <Chip 
                      label={getStatusText(booking.status, booking.isScanned)} 
                      color={getBookingStatusColor(booking.status, booking.isScanned)} 
                      size="small" 
                    />
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarToday sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      {new Date(booking.eventDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <ConfirmationNumber sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      {booking.quantity} billet(s) • {booking.totalPrice?.toFixed(2)} €
                    </Typography>
                    
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Person sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      Réservé par: {booking.userName}
                    </Typography>
                    
                    {booking.isScanned && booking.scannedAt && (
                      <Alert severity="warning" sx={{ mt: 2, mb: 1 }} icon={<CheckCircle />}>
                        <Typography variant="body2">
                          <strong>Scanné le:</strong> {new Date(booking.scannedAt).toLocaleDateString('fr-FR')} à {new Date(booking.scannedAt).toLocaleTimeString('fr-FR')}
                          {booking.scannedBy && (
                            <>
                              <br />
                              <strong>Par:</strong> {booking.scannedBy}
                            </>
                          )}
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                  
                  <Paper sx={{ 
                    p: 2, 
                    mb: 2, 
                    bgcolor: booking.isScanned ? '#f5f5f5' : '#f0f7ff', 
                    border: booking.isScanned ? '1px solid #999' : '1px solid #1976d2'
                  }}>
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      Code de confirmation:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography 
                        variant="body1" 
                        fontWeight="bold" 
                        sx={{ 
                          fontFamily: 'monospace',
                          color: booking.isScanned ? '#666' : 'inherit'
                        }}
                      >
                        {booking.confirmationCode || `BK${booking.id}`}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<ContentCopy />}
                        onClick={() => copyToClipboard(booking.confirmationCode || `BK${booking.id}`)}
                        disabled={booking.isScanned}
                      >
                        Copier
                      </Button>
                    </Box>
                  </Paper>
                  
                  {booking.isScanned ? (
                    <Box sx={{ mb: 2 }}>
                      <Alert 
                        severity="warning" 
                        icon={<Block />}
                        sx={{ mb: 1 }}
                      >
                        <Typography variant="body2" fontWeight="bold">
                          TICKET DÉJÀ UTILISÉ
                        </Typography>
                        <Typography variant="caption" display="block">
                          Ce billet a été validé à l'entrée et n'est plus valable
                        </Typography>
                      </Alert>
                    </Box>
                  ) : booking.qrResult?.success ? (
                    <Box sx={{ mb: 2 }}>
                      <Alert 
                        severity="success" 
                        icon={<QrCode2 />}
                        sx={{ mb: 1 }}
                      >
                        QR code disponible
                      </Alert>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        
                        
                        
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ mb: 2 }}>
                      <Alert 
                        severity={booking.qrResult?.generated ? "success" : "info"}
                        icon={booking.qrResult?.generated ? <CheckCircle /> : <Info />}
                        sx={{ mb: 1 }}
                      >
                        {booking.qrResult?.message || "Génération du QR code..."}
                      </Alert>
                      
                     
                    </Box>
                  )}
                  
                  <Alert 
                    severity={booking.isScanned ? "error" : "warning"} 
                    sx={{ mt: 2 }}
                    icon={booking.isScanned ? <Block /> : <Info />}
                  >
                    <Typography variant="body2">
                      {booking.isScanned ? (
                        <>
                          ❌ Ce billet a déjà été utilisé à l'entrée.
                          <br />
                          <strong>Vous ne pouvez plus l'utiliser pour accéder à l'événement.</strong>
                        </>
                      ) : (
                        <>
                          ⚠️ Présentez votre code de confirmation ou QR code à l'entrée.
                          <br />
                          Consultez votre email pour plus de détails.
                        </>
                      )}
                    </Typography>
                  </Alert>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Pour toute question concernant vos codes de check-in, contactez le support.
        </Typography>
      </Box>
    </Container>
  );
};

export default MyQRCodes;