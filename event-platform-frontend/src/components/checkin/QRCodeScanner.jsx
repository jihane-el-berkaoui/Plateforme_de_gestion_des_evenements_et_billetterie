import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  TextField,
  Paper
} from '@mui/material';
import { QrCodeScanner, CheckCircle, Error, Refresh } from '@mui/icons-material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { checkinService } from '../../api/checkinService';

const QRCodeScanner = ({ open, onClose, scannerId, onScanSuccess }) => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [manualCode, setManualCode] = useState('');
  const scannerRef = useRef(null);
  const qrCodeScannerRef = useRef(null);

  useEffect(() => {
    if (open && !scannerRef.current) {
      initializeScanner();
    }

    return () => {
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.clear();
        qrCodeScannerRef.current = null;
      }
    };
  }, [open]);

  const initializeScanner = () => {
    if (!scannerRef.current) {
      scannerRef.current = document.getElementById('qr-reader');
    }

    if (scannerRef.current && !qrCodeScannerRef.current) {
      qrCodeScannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      );

      qrCodeScannerRef.current.render(
        (decodedText) => handleScan(decodedText),
        (error) => console.log('QR Code scan error:', error)
      );
    }
  };

  const handleScan = async (qrCodeId) => {
    if (scanning || !qrCodeId) return;

    try {
      setScanning(true);
      setError('');
      setResult(null);

      const result = await checkinService.scanQRCode(qrCodeId, scannerId);
      setResult(result);
      
      if (onScanSuccess) {
        onScanSuccess(result);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du scan');
      console.error('Scan error:', err);
    } finally {
      setScanning(false);
      if (qrCodeScannerRef.current) {
        qrCodeScannerRef.current.clear();
        setTimeout(() => {
          qrCodeScannerRef.current = null;
          initializeScanner();
        }, 2000);
      }
    }
  };

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) {
      setError('Veuillez entrer un code');
      return;
    }

    await handleScan(manualCode.trim());
  };

  const handleReset = () => {
    setResult(null);
    setError('');
    setManualCode('');
    if (qrCodeScannerRef.current) {
      qrCodeScannerRef.current.clear();
      qrCodeScannerRef.current = null;
    }
    initializeScanner();
  };

  const handleClose = () => {
    if (qrCodeScannerRef.current) {
      qrCodeScannerRef.current.clear();
      qrCodeScannerRef.current = null;
    }
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <QrCodeScanner />
          Scanner QR Code
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {result ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            {result.success ? (
              <>
                <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h5" color="success.main" gutterBottom>
                  Check-in Réussi!
                </Typography>
                <Typography variant="body1">
                  {result.booking?.userName} - {result.booking?.eventName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {result.booking?.quantity} billet(s)
                </Typography>
              </>
            ) : (
              <>
                <Error sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                <Typography variant="h5" color="error.main" gutterBottom>
                  Échec du Check-in
                </Typography>
                <Typography variant="body1">
                  {result.message}
                </Typography>
              </>
            )}
          </Box>
        ) : (
          <>
            <Paper 
              sx={{ 
                p: 2, 
                mb: 3, 
                bgcolor: 'grey.50', 
                border: '1px dashed grey',
                minHeight: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {scanning ? (
                <CircularProgress />
              ) : (
                <div id="qr-reader" style={{ width: '100%' }}></div>
              )}
            </Paper>
            
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
              OU
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                label="Code manuel"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                disabled={scanning}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleManualSubmit}
                disabled={scanning || !manualCode.trim()}
              >
                Valider
              </Button>
            </Box>
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleReset} startIcon={<Refresh />}>
          Nouveau scan
        </Button>
        <Button onClick={handleClose}>
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QRCodeScanner;