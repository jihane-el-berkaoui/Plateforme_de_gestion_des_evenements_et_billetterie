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
  Card,
  CardContent,
  Fade,
  IconButton
} from '@mui/material';
import { Login as LoginIcon, Event, Lock, Email, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect');
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
                fontSize: 80, 
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
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              GoEvent
            </Typography>
            <Typography variant="h6" sx={{ color: '#94A3B8', mb: 1 }}>
              Plateforme de gestion d'événements
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', opacity: 0.8 }}>
              Connectez-vous pour accéder à votre compte
            </Typography>
          </Box>

          <Card 
            sx={{ 
              borderRadius: 3,
              overflow: 'hidden',
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
                <LoginIcon 
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
                  sx={{
                    fontWeight: 700,
                    color: '#f8fafc',
                  }}
                >
                  Connexion
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

              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  margin="normal"
                  required
                  disabled={loading}
                  autoComplete="email"
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: '#94A3B8' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                      '& input': {
                        color: '#000000',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#94A3B8',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#3B82F6',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  margin="normal"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 1, color: '#94A3B8' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                      '& input': {
                        color: '#000000',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#94A3B8',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: '#3B82F6',
                    },
                  }}
                />

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
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1, color: '#94A3B8' }} />
                      Connexion en cours...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>
              </form>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  Pas encore de compte?{' '}
                  <Link 
                    to="/signup" 
                    style={{ 
                      textDecoration: 'none',
                      color: '#3B82F6',
                      fontWeight: 600,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#60A5FA'}
                    onMouseLeave={(e) => e.target.style.color = '#3B82F6'}
                  >
                    Inscrivez-vous
                  </Link>
                </Typography>
                <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1 }}>
                  <Link 
                    to="/forgot-password" 
                    style={{ 
                      textDecoration: 'none',
                      color: '#8B5CF6',
                      fontWeight: 500,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#A78BFA'}
                    onMouseLeave={(e) => e.target.style.color = '#8B5CF6'}
                  >
                    Mot de passe oublié?
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

export default Login;