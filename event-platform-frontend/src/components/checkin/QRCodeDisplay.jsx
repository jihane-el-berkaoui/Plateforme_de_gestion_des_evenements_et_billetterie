import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Paper  
} from '@mui/material';
import { QrCode2, Download, Refresh, Event, Person } from '@mui/icons-material';
import { checkinService } from '../../api/checkinService';

const QRCodeDisplay = ({ bookingId, eventName, userName, quantity }) => {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingInfo, setBookingInfo] = useState(null);

  const loadQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await checkinService.getQRCodeByBooking(bookingId);
      setQrData(data);
      
      if (data.qrCode) {
        setBookingInfo({
          id: data.qrCode.bookingId || bookingId,
          confirmationCode: extractConfirmationCode(data.qrCode.data) || 'N/A'
        });
      }
    } catch (err) {
      console.error('Error loading QR code:', err);
      setError('Erreur de chargement du QR code');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await checkinService.generateQRCode(bookingId);
      setQrData(data);
      
      if (data.qrCode) {
        setBookingInfo({
          id: data.qrCode.bookingId || bookingId,
          confirmationCode: extractConfirmationCode(data.qrCode.data) || 'N/A'
        });
      }
    } catch (err) {
      console.error('Error generating QR code:', err);
      setError('Erreur de génération du QR code');
    } finally {
      setLoading(false);
    }
  };

  const extractConfirmationCode = (qrDataString) => {
    try {
      if (!qrDataString) return null;
      const qrData = JSON.parse(qrDataString);
      return qrData.bookingData?.confirmationCode || 
             qrData.confirmationCode || 
             `BK${bookingId}`;
    } catch (e) {
      console.error('Error parsing QR data:', e);
      return `BK${bookingId}`;
    }
  };

  const downloadQRCode = () => {
    if (!qrData?.qrImage) return;
    
    const link = document.createElement('a');
    link.href = qrData.qrImage;
    link.download = `qr-code-booking-${bookingId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (bookingId) {
      loadQRCode();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <QrCode2 sx={{ mr: 1, verticalAlign: 'middle' }} />
            Votre billet électronique
          </Typography>
          {qrData && (
            <Chip 
              label={qrData.qrCode?.isUsed ? 'Utilisé' : 'Valide'} 
              color={qrData.qrCode?.isUsed ? 'default' : 'success'}
              size="small"
            />
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {qrData ? (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <img 
                src={qrData.qrImage} 
                alt="QR Code" 
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  margin: '0 auto',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px'
                }}
              />
              <Typography variant="caption" color="text.secondary">
                Scannez ce code à l'entrée
              </Typography>
            </Box>
{qrData?.qrCode?.id && (
  <Box sx={{ mt: 1, p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
    <Typography variant="caption" color="text.secondary">
      ID QR: {qrData.qrCode.id.substring(0, 8)}...
    </Typography>
  </Box>
)}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Event sx={{ mr: 1, fontSize: 16 }} />
                Événement: {eventName}
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Person sx={{ mr: 1, fontSize: 16 }} />
                Pour: {userName}
              </Typography>
              <Typography variant="body2">
                Quantité: {quantity} billet(s)
              </Typography>
            </Box>

            <Box sx={{ mt: 2, mb: 3, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
              <Typography variant="body2" gutterBottom>
                <strong>Code pour scan manuel :</strong>
              </Typography>
             <Paper sx={{ 
  p: 1.5, 
  bgcolor: 'white', 
  fontFamily: 'monospace',
  borderRadius: 1,
  border: '1px dashed #1976d2',
  textAlign: 'center',
  cursor: 'pointer',
  '&:hover': { bgcolor: '#f0f7ff' }
}}
onClick={() => {
  const text = `BOOKING-${bookingInfo?.confirmationCode || 'BK' + bookingId}`;
  navigator.clipboard.writeText(text);
  alert('Code copié !');
}}>
  BOOKING-{bookingInfo?.confirmationCode || 'BK' + bookingId}
</Paper>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Cliquez pour copier • Donnez ce code à l'organisateur si vous ne pouvez pas montrer le QR code
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Download />}
                onClick={downloadQRCode}
                fullWidth
              >
                Télécharger
              </Button>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={generateQRCode}
                fullWidth
              >
                Régénérer
              </Button>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <QrCode2 sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Aucun QR code généré pour cette réservation
            </Typography>
            <Button
              variant="contained"
              onClick={generateQRCode}
              disabled={loading}
            >
              Générer QR Code
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;