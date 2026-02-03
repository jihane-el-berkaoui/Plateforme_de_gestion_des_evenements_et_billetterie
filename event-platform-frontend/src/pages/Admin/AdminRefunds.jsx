import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  AttachMoney,
  CheckCircle,
  Cancel,
  Visibility,
  Refresh,
  Person
} from '@mui/icons-material';
import { refundService } from '../../api'; 
import { useAuth } from '../../contexts/AuthContext';

const AdminRefunds = () => {
  const { user, isAdmin } = useAuth();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [processDialog, setProcessDialog] = useState(false);
  const [approve, setApprove] = useState(true);
  const [notes, setNotes] = useState('');
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState(null);

  useEffect(() => {
    if (isAdmin) {
      loadRefunds();
    }
  }, [isAdmin]);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      const pendingRefunds = await refundService.getPendingRefunds();
      console.log('Pending refunds from API:', pendingRefunds); 
      setRefunds(pendingRefunds);
    } catch (error) {
      console.error('Error loading refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedRefund) return;

    try {
      await refundService.processRefund(selectedRefund.id, approve, notes);
      alert(`Remboursement ${approve ? 'approuvé' : 'rejeté'} !`);
      setProcessDialog(false);
      setSelectedRefund(null);
      setNotes('');
      loadRefunds();
    } catch (error) {
      console.error('Error processing refund:', error);
      alert(`Erreur: ${error.response?.data?.message || error.message}`);
    }
  };

  const showDetails = (refund) => {
    setSelectedDetails(refund);
    setDetailsDialog(true);
  };

  const getEventInfo = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/events/${eventId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  };

  const getUserInfo = async (userId) => {
    try {
      const response = await fetch(`http://localhost:8083/api/users/${userId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  if (!isAdmin) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 4 }}>
          Accès réservé aux administrateurs
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 3 }}>
        <AttachMoney sx={{ mr: 2, verticalAlign: 'middle' }} />
        Gestion des Remboursements
      </Typography>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Demandes en attente ({refunds.length})
            </Typography>
            <Button
              startIcon={<Refresh />}
              onClick={loadRefunds}
              variant="contained"
              color="primary"
            >
              Actualiser
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : refunds.length === 0 ? (
            <Alert severity="info">
              Aucune demande de remboursement en attente
            </Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Booking ID</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Montant</TableCell>
                    <TableCell>Raison</TableCell>
                    <TableCell>Date demande</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {refunds.map(refund => (
                    <TableRow key={refund.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            #{refund.confirmationCode}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {refund.id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Person color="action" />
                          <Typography>
                            Client #{refund.userId}
                          </Typography>
                        </Box>
                        {refund.userEmail && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            {refund.userEmail}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`€${(refund.refundAmount || refund.totalPrice || 0).toFixed(2)}`}
                          color="primary"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title={refund.refundReason || 'Aucune raison spécifiée'}>
                          <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {refund.refundReason || 'N/A'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {refund.refundRequestDate ? (
                          <Box>
                            <Typography variant="body2">
                              {new Date(refund.refundRequestDate).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(refund.refundRequestDate).toLocaleTimeString()}
                            </Typography>
                          </Box>
                        ) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            onClick={() => showDetails(refund)}
                          >
                            Détails
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircle />}
                            onClick={() => {
                              setSelectedRefund(refund);
                              setApprove(true);
                              setProcessDialog(true);
                            }}
                            sx={{ minWidth: 100 }}
                          >
                            Approuver
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => {
                              setSelectedRefund(refund);
                              setApprove(false);
                              setProcessDialog(true);
                            }}
                            sx={{ minWidth: 100 }}
                          >
                            Rejeter
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={processDialog} onClose={() => setProcessDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {approve ? 'Approuver le remboursement' : 'Rejeter le remboursement'}
        </DialogTitle>
        <DialogContent>
          {selectedRefund && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Réservation: #{selectedRefund.confirmationCode}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Client: #{selectedRefund.userId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Montant: €{(selectedRefund.refundAmount || selectedRefund.totalPrice || 0).toFixed(2)}
              </Typography>
            </Box>
          )}
          <TextField
            autoFocus
            margin="dense"
            label={approve ? "Notes (optionnel)" : "Raison du rejet *"}
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required={!approve}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setProcessDialog(false);
            setSelectedRefund(null);
            setNotes('');
          }}>
            Annuler
          </Button>
          <Button
            onClick={handleProcessRefund}
            color={approve ? "success" : "error"}
            variant="contained"
            disabled={!approve && !notes.trim()}
          >
            {approve ? 'Confirmer l\'approbation' : 'Confirmer le rejet'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailsDialog} onClose={() => setDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Détails de la demande</DialogTitle>
        <DialogContent>
          {selectedDetails && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>Informations de réservation</Typography>
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell><strong>ID:</strong></TableCell>
                    <TableCell>{selectedDetails.id}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Code confirmation:</strong></TableCell>
                    <TableCell>{selectedDetails.confirmationCode}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Client ID:</strong></TableCell>
                    <TableCell>{selectedDetails.userId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Événement ID:</strong></TableCell>
                    <TableCell>{selectedDetails.eventId}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Quantité:</strong></TableCell>
                    <TableCell>{selectedDetails.quantity}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Prix total:</strong></TableCell>
                    <TableCell>€{selectedDetails.totalPrice?.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Montant remboursement:</strong></TableCell>
                    <TableCell>€{selectedDetails.refundAmount?.toFixed(2)}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Raison:</strong></TableCell>
                    <TableCell>{selectedDetails.refundReason || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Date demande:</strong></TableCell>
                    <TableCell>
                      {selectedDetails.refundRequestDate ? 
                        new Date(selectedDetails.refundRequestDate).toLocaleString() : 
                        'N/A'}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell><strong>Statut:</strong></TableCell>
                    <TableCell>
                      <Chip
                        label={selectedDetails.status}
                        color={
                          selectedDetails.status === 'REFUND_REQUESTED' ? 'warning' :
                          selectedDetails.status === 'REFUNDED' ? 'success' :
                          selectedDetails.status === 'REFUND_REJECTED' ? 'error' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminRefunds;