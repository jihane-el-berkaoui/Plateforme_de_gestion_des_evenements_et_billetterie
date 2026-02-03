import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Alert
} from '@mui/material';
import { CheckCircle, Cancel, Block, Info } from '@mui/icons-material';

const BookingCard = ({ booking, onCancel, onForceCancel }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'success';
      case 'CANCELLED': return 'error';
      case 'COMPLETED': return 'info';
      default: return 'default';
    }
  };

  const getScanStatus = () => {
    if (booking.allTicketsScanned) {
      return { label: 'ALL SCANNED', color: 'success', icon: <CheckCircle /> };
    }
    if (booking.isPartiallyScanned) {
      const used = booking.scanStats?.usedTickets || 0;
      const total = booking.scanStats?.totalTickets || booking.quantity || 1;
      return { 
        label: `${used}/${total} SCANNED`, 
        color: 'warning', 
        icon: <CheckCircle /> 
      };
    }
    return { label: 'NOT SCANNED', color: 'default', icon: <Block /> };
  };

  const scanStatus = getScanStatus();

  return (
    <Card sx={{ mb: 2, opacity: booking.allTicketsScanned ? 0.8 : 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {booking.eventName || `Event #${booking.eventId}`}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>Code:</strong> {booking.confirmationCode} | 
              <strong>User:</strong> {booking.userName || `User #${booking.userId}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Tickets:</strong> {booking.quantity} | 
              <strong>Total:</strong> ${booking.totalPrice?.toFixed(2) || '0.00'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Booked: {new Date(booking.bookingDate).toLocaleString()}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
            <Chip 
              label={booking.status}
              color={getStatusColor(booking.status)}
              size="small"
            />
            <Chip 
              icon={scanStatus.icon}
              label={scanStatus.label}
              color={scanStatus.color}
              size="small"
            />
          </Box>
        </Box>

        {(booking.allTicketsScanned || booking.isPartiallyScanned) && (
          <Alert 
            severity={booking.allTicketsScanned ? "success" : "warning"}
            icon={<Info />}
            sx={{ mb: 2 }}
          >
            {booking.allTicketsScanned 
              ? "All tickets have been scanned. Booking is completed."
              : `Partially scanned: ${booking.scanStats?.usedTickets || 0} of ${booking.scanStats?.totalTickets || booking.quantity} tickets used.`
            }
          </Alert>
        )}

        {booking.scanStats && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            mb: 2,
            p: 1.5,
            bgcolor: 'background.default',
            borderRadius: 1,
            fontSize: '0.875rem'
          }}>
            <Box>
              <Typography variant="caption" display="block" color="text.secondary">
                Tickets Used
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {booking.scanStats.usedTickets} / {booking.scanStats.totalTickets}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" display="block" color="text.secondary">
                Available
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {booking.scanStats.availableTickets}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" display="block" color="text.secondary">
                Status
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {booking.scanStats.status}
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
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
              onClick={() => onCancel(booking.id)}
              startIcon={<Cancel />}
            >
              Cancel Booking
            </Button>
          )}
          
          {booking.status === 'CONFIRMED' && (booking.allTicketsScanned || booking.isPartiallyScanned) && (
            <Button
              variant="outlined"
              color="warning"
              size="small"
              onClick={() => onForceCancel(booking.id)}
              startIcon={<Cancel />}
            >
              Force Cancel
            </Button>
          )}
          
          <Button
            variant="contained"
            size="small"
            onClick={() => window.open(`/admin/checkin?code=${booking.confirmationCode}`, '_blank')}
          >
            Check-in
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BookingCard;