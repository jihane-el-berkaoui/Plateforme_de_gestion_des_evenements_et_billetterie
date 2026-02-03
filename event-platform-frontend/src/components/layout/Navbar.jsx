import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Avatar,
  Container,
  InputBase,
  alpha,
  Chip,
  Divider
} from '@mui/material';
import { AttachMoney } from '@mui/icons-material';
import {
  Event,
  Search,
  Person,
  ShoppingCart,
  Menu as MenuIcon,
  Dashboard,
  ExitToApp,
  Book,
  People,
  AdminPanelSettings,
  QrCodeScanner,
  CheckCircle
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isClient, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setAnchorEl(null);
    setMobileMenuAnchor(null);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        bgcolor: 'rgba(15, 23, 42, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h5"
            component={Link}
            to="/"
            sx={{
              mr: 4,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              fontFamily: '"Sora", sans-serif',
            }}
          >
            <Event sx={{ mr: 1, color: '#3B82F6' }} />
            GoEvent
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button 
              component={Link} 
              to="/" 
              sx={{ 
                color: location.pathname === '/' ? '#3B82F6' : '#94A3B8',
                fontWeight: location.pathname === '/' ? 700 : 500,
                '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
              }}
            >
              Accueil
            </Button>
            <Button 
              component={Link} 
              to="/events" 
              sx={{ 
                color: location.pathname === '/events' ? '#3B82F6' : '#94A3B8',
                fontWeight: location.pathname === '/events' ? 700 : 500,
                '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
              }}
            >
              Événements
            </Button>
            
            {isAdmin && (
              <>
                <Button 
                  component={Link} 
                  to="/admin" 
                  sx={{ 
                    color: location.pathname === '/admin' ? '#3B82F6' : '#94A3B8',
                    fontWeight: location.pathname === '/admin' ? 700 : 500,
                    '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                  }}
                >
                  <Dashboard sx={{ mr: 0.5, fontSize: 20 }} />
                  Dashboard
                </Button>
                <Button 
                  component={Link} 
                  to="/admin/events" 
                  sx={{ 
                    color: location.pathname === '/admin/events' ? '#3B82F6' : '#94A3B8',
                    fontWeight: location.pathname === '/admin/events' ? 700 : 500,
                    '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                  }}
                >
                  Événements
                </Button>
                <Button 
                  component={Link} 
                  to="/admin/bookings" 
                  sx={{ 
                    color: location.pathname === '/admin/bookings' ? '#3B82F6' : '#94A3B8',
                    fontWeight: location.pathname === '/admin/bookings' ? 700 : 500,
                    '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                  }}
                >
                  Réservations
                </Button>
                <Button 
                  component={Link} 
                  to="/admin/users" 
                  sx={{ 
                    color: location.pathname === '/admin/users' ? '#3B82F6' : '#94A3B8',
                    fontWeight: location.pathname === '/admin/users' ? 700 : 500,
                    '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                  }}
                >
                  Utilisateurs
                </Button>
                <Button 
                  component={Link} 
                  to="/admin/checkin" 
                  sx={{ 
                    color: location.pathname === '/admin/checkin' ? '#3B82F6' : '#94A3B8',
                    fontWeight: location.pathname === '/admin/checkin' ? 700 : 500,
                    '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                  }}
                >
                  <QrCodeScanner sx={{ mr: 0.5, fontSize: 20 }} />
                  Check-in
                </Button>
              </>
            )}
            
            {isClient && (
              <>
                <Button 
                  component={Link} 
                  to="/my-bookings" 
                  sx={{ 
                    color: location.pathname === '/my-bookings' ? '#3B82F6' : '#94A3B8',
                    fontWeight: location.pathname === '/my-bookings' ? 700 : 500,
                    '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                  }}
                >
                  Mes réservations
                </Button>
                <Button 
                  component={Link} 
                  to="/my-refunds" 
                  sx={{ 
                    color: location.pathname === '/my-refunds' ? '#3B82F6' : '#94A3B8',
                    fontWeight: location.pathname === '/my-refunds' ? 700 : 500,
                    '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                  }}
                >
                  Mes remboursements
                </Button>
              </>
            )}
            
            
          </Box>

          

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isAdmin && (
              <Chip
                icon={<AdminPanelSettings />}
                label="Admin"
                size="small"
                sx={{
                  mr: 1,
                  background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                }}
              />
            )}
            {isClient && (
              <Chip
                label="Client"
                size="small"
                sx={{
                  mr: 1,
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                }}
              />
            )}
            
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar 
                sx={{ 
                  width: 36, 
                  height: 36, 
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  fontWeight: 700,
                }}
              >
                {user?.firstName?.charAt(0)}
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: 2,
                  minWidth: 220,
                  background: 'rgba(30, 41, 59, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ color: '#F1F5F9', fontWeight: 600 }}>
                  {user?.firstName} {user?.lastName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  {user?.email}
                </Typography>
              </Box>
              
              <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.2)' }} />
              
              <MenuItem 
                onClick={() => { navigate('/profile'); setAnchorEl(null); }}
                sx={{ 
                  py: 1.5,
                  color: '#94A3B8',
                  '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                }}
              >
                <Person sx={{ mr: 2 }} />
                Mon profil
              </MenuItem>
              
              {isAdmin && (
                <>
                  <MenuItem 
                    onClick={() => { navigate('/admin'); setAnchorEl(null); }}
                    sx={{ 
                      py: 1.5,
                      color: '#94A3B8',
                      '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                    }}
                  >
                    <Dashboard sx={{ mr: 2 }} />
                    Tableau de bord
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { navigate('/admin/events'); setAnchorEl(null); }}
                    sx={{ 
                      py: 1.5,
                      color: '#94A3B8',
                      '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                    }}
                  >
                    <Event sx={{ mr: 2 }} />
                    Gérer événements
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { navigate('/admin/users'); setAnchorEl(null); }}
                    sx={{ 
                      py: 1.5,
                      color: '#94A3B8',
                      '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                    }}
                  >
                    <People sx={{ mr: 2 }} />
                    Gérer utilisateurs
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { navigate('/admin/checkin'); setAnchorEl(null); }}
                    sx={{ 
                      py: 1.5,
                      color: '#94A3B8',
                      '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                    }}
                  >
                    <QrCodeScanner sx={{ mr: 2 }} />
                    Gérer check-ins
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { navigate('/admin/refunds'); setAnchorEl(null); }}
                    sx={{ 
                      py: 1.5,
                      color: '#94A3B8',
                      '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                    }}
                  >
                    <AttachMoney sx={{ mr: 2 }} />
                    Gérer remboursements
                  </MenuItem>
                </>
              )}
              
              {isClient && (
                <>
                  <MenuItem 
                    onClick={() => { navigate('/my-bookings'); setAnchorEl(null); }}
                    sx={{ 
                      py: 1.5,
                      color: '#94A3B8',
                      '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                    }}
                  >
                    <Book sx={{ mr: 2 }} />
                    Mes réservations
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { navigate('/my-qrcodes'); setAnchorEl(null); }}
                    sx={{ 
                      py: 1.5,
                      color: '#94A3B8',
                      '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                    }}
                  >
                    <QrCodeScanner sx={{ mr: 2 }} />
                    Mes QR Codes
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { navigate('/my-refunds'); setAnchorEl(null); }}
                    sx={{ 
                      py: 1.5,
                      color: '#94A3B8',
                      '&:hover': { color: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' },
                    }}
                  >
                    <AttachMoney sx={{ mr: 2 }} />
                    Mes remboursements
                  </MenuItem>
                </>
              )}
              
              <Divider sx={{ borderColor: 'rgba(148, 163, 184, 0.2)' }} />
              
              <MenuItem 
                onClick={handleLogout}
                sx={{ 
                  py: 1.5,
                  color: '#EF4444',
                  '&:hover': { 
                    color: '#DC2626', 
                    background: 'rgba(239, 68, 68, 0.1)',
                  },
                }}
              >
                <ExitToApp sx={{ mr: 2 }} />
                Déconnexion
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;