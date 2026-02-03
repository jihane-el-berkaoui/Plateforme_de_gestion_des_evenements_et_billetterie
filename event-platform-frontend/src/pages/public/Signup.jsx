import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Card,
  CardContent,
  Fade
} from '@mui/material';
import { PersonAdd, ArrowBack, Visibility, VisibilityOff, Event } from '@mui/icons-material';
import { authService } from '../../api/authService';

const Signup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'CLIENT'
  });

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await authService.register(formData);
    
    console.log('✅ Inscription réussie:', response);
    
    navigate('/verify-pending', { 
      state: { 
        email: formData.email,
        message: 'Un code de vérification a été envoyé à votre email' 
      }
    });
    
  } catch (err) {
    console.error('❌ Erreur inscription:', err);
    setError(err.response?.data?.message || 'Erreur lors de l\'inscription');
  } finally {
    setLoading(false);
  }
};

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        position: 'relative',
        overflow: 'hidden',
        py: 4,
        px: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)
          `,
          animation: 'pulse 4s ease-in-out infinite',
        },
      }}
    >
      <IconButton
        onClick={() => navigate('/')}
        sx={{
          position: 'absolute',
          top: 24,
          left: 24,
          color: '#94A3B8',
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 10,
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 0.5)',
            color: '#3B82F6',
            transform: 'translateX(-4px)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
          },
        }}
      >
        <ArrowBack />
      </IconButton>

      <Fade in={true} timeout={500}>
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Event 
              sx={{ 
                fontSize: 70, 
                color: '#3B82F6',
                mb: 2,
                filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))',
                animation: 'float 3s ease-in-out infinite',
              }} 
            />
            <Typography 
              variant="h2" 
              gutterBottom 
              sx={{ 
                fontWeight: 900,
                fontSize: { xs: '2rem', md: '2.5rem' },
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              GoEvent
            </Typography>
          </Box>

          <Card
            sx={{
              borderRadius: 3,
              background: 'rgba(30, 41, 59, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
              },
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <PersonAdd 
                  sx={{ 
                    fontSize: 50, 
                    color: '#3B82F6', 
                    mb: 2,
                    filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))',
                  }} 
                />
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{ fontWeight: 700, color: '#f8fafc' }}
                >
                  Créer un compte
                </Typography>
                <Typography sx={{ color: '#94A3B8' }}>
                  Inscrivez-vous pour réserver des billets
                </Typography>
              </Box>

              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                  }}
                >
                  {error}
                </Alert>
              )}

              {success && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    borderColor: 'rgba(16, 185, 129, 0.4)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                  }}
                >
                  {success}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    fullWidth
                    label="Prénom"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    required
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    label="Nom"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    required
                    disabled={loading}
                  />
                </Box>

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  margin="normal"
                  required
                  disabled={loading}
                />

                <TextField
                  fullWidth
                  label="Mot de passe"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  margin="normal"
                  required
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{
                            color: '#94A3B8',
                            '&:hover': { color: '#3B82F6' },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  helperText="Minimum 6 caractères"
                  sx={{
                    '& .MuiFormHelperText-root': {
                      color: '#94A3B8',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Téléphone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  margin="normal"
                  disabled={loading}
                />

                <TextField
                  fullWidth
                  label="Adresse"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  margin="normal"
                  multiline
                  rows={2}
                  disabled={loading}
                />

                <TextField
                  select
                  fullWidth
                  label="Rôle"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  margin="normal"
                  required
                  disabled={loading}
                  helperText="Choisissez votre type de compte"
                  sx={{
                    '& .MuiFormHelperText-root': {
                      color: '#94A3B8',
                    },
                  }}
                >
                  <MenuItem value="CLIENT">Client (Réserver des événements)</MenuItem>
                  <MenuItem value="ADMIN">Administrateur (Gérer la plateforme)</MenuItem>
                </TextField>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ 
                    mt: 3,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      boxShadow: '0 12px 40px rgba(59, 130, 246, 0.5)',
                      transform: 'translateY(-2px)',
                    },
                    '&:disabled': {
                      background: 'rgba(148, 163, 184, 0.2)',
                      color: '#94A3B8',
                    },
                  }}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} sx={{ color: '#94A3B8' }} /> : null}
                >
                  {loading ? 'Inscription en cours...' : 'S\'inscrire'}
                </Button>
              </form>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  Vous avez déjà un compte?{' '}
                  <Link 
                    to="/login" 
                    style={{ 
                      textDecoration: 'none',
                      color: '#3B82F6',
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#60A5FA'}
                    onMouseLeave={(e) => e.target.style.color = '#3B82F6'}
                  >
                    Connectez-vous
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Fade>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </Box>
  );
};

export default Signup;