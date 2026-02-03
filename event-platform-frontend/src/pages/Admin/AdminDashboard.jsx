import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Chip,
  IconButton
} from '@mui/material';
import {
  Event,
  Book,
  People,
  TrendingUp,
  CalendarToday,
  Euro,
  ArrowForward
} from '@mui/icons-material';
import { eventService, bookingService, userService } from '../../api';
import { formatDate, formatPrice } from '../../utils/helpers';

const AdminDashboard = () => {
  const navigate = useNavigate(); 
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalBookings: 0,
    totalUsers: 0,
    revenue: 0,
    todayBookings: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [events, bookings, users] = await Promise.all([
          eventService.getAllEvents(),
          bookingService.getAllBookings(),
          userService.getAllUsers()
        ]);

        const eventsArray = Array.isArray(events) ? events : [];
        const bookingsArray = Array.isArray(bookings) ? bookings : [];
        const usersArray = Array.isArray(users) ? users : [];

        const activeEvents = eventsArray.filter(event => event.status === 'ACTIVE');
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = bookingsArray.filter(booking => 
          booking.bookingDate?.split('T')[0] === today
        );

        const revenue = bookingsArray
          .filter(b => b.status === 'CONFIRMED')
          .reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);

        setStats({
          totalEvents: eventsArray.length,
          activeEvents: activeEvents.length,
          totalBookings: bookingsArray.length,
          totalUsers: usersArray.length,
          revenue: revenue,
          todayBookings: todayBookings.length
        });

        setRecentEvents(
          eventsArray
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
        );

        setRecentBookings(
          bookingsArray
            .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate))
            .slice(0, 5)
        );

      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const statCards = [
    {
      title: 'Événements',
      value: stats.totalEvents,
      icon: <Event />,
      color: '#1976d2',
      description: `${stats.activeEvents} actifs`
    },
    {
      title: 'Réservations',
      value: stats.totalBookings,
      icon: <Book />,
      color: '#2e7d32',
      description: `${stats.todayBookings} aujourd'hui`
    },
    {
      title: 'Utilisateurs',
      value: stats.totalUsers,
      icon: <People />,
      color: '#ed6c02',
      description: 'Utilisateurs inscrits'
    },
    {
      title: 'Revenus',
      value: formatPrice(stats.revenue),
      icon: <TrendingUp />,
      color: '#9c27b0',
      description: 'Total généré'
    }
  ];

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 4 }}>
        Tableau de bord administrateur
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h3" gutterBottom>
                      {stat.value}
                    </Typography>
                    <Typography variant="h6" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.description}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Événements récents
                </Typography>
                <IconButton 
                  size="small"
                  onClick={() => navigate('/admin/events')} 
                >
                  <ArrowForward />
                </IconButton>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Événement</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Places</TableCell>
                      <TableCell>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentEvents.map(event => (
                      <TableRow key={event.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {event.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(event.date)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {event.availableTickets}/{event.capacity}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={event.status}
                            size="small"
                            color={event.status === 'ACTIVE' ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  Réservations récentes
                </Typography>
                <IconButton 
                  size="small"
                  onClick={() => navigate('/admin/bookings')} 
                >
                  <ArrowForward />
                </IconButton>
              </Box>
              
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Montant</TableCell>
                      <TableCell>Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentBookings.map(booking => (
                      <TableRow key={booking.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {booking.confirmationCode}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(booking.bookingDate)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2">
                            {formatPrice(booking.totalPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={booking.status}
                            size="small"
                            color={booking.status === 'CONFIRMED' ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;