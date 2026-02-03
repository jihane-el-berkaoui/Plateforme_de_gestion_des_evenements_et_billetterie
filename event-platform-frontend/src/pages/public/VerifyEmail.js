import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Fade
} from '@mui/material';
import { CheckCircle, Error, ArrowForward, Info, Event } from '@mui/icons-material';
import { authService } from '../../api/authService';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (verificationAttempted.current) {
        console.log('⚠️ Vérification déjà tentée, appel ignoré');
        return;
      }

      verificationAttempted.current = true;

      if (!token) {
        setError('Token manquant');
        setLoading(false);
        return;
      }

      try {
        console.log('🔍 Vérification du token:', token);
        await authService.verifyEmail(token);
        console.log('✅ Vérification réussie');
        setVerified(true);
      } catch (err) {
        console.error('❌ Erreur de vérification:', err);
        
        const errorMessage = err.response?.data?.error || err.message || 'Erreur inconnue';
        
        if (errorMessage.includes('déjà utilisé') || 
            errorMessage.includes('already verified') ||
            errorMessage.includes('invalide ou déjà')) {
          setAlreadyVerified(true);
          setError('Ce code a déjà été utilisé. Votre compte est peut-être déjà activé.');
        } else if (errorMessage.includes('expiré') || errorMessage.includes('expired')) {
          setError('Le code de vérification a expiré. Veuillez vous réinscrire.');
        } else {
          setError(errorMessage);
        }
        
        setVerified(false);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      verifyToken();
    }, 300);

    return () => clearTimeout(timer);
  }, [token]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          position: 'relative',
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
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Card
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'rgba(30, 41, 59, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 3,
            }}
          >
            <CircularProgress 
              size={60} 
              sx={{ 
                mb: 3,
                color: '#3B82F6',
                filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))',
              }} 
            />
            <Typography variant="h6" sx={{ color: '#f8fafc' }}>
              Vérification en cours...
            </Typography>
            <Typography variant="body2" sx={{ color: '#94A3B8', mt: 2 }}>
              Ne fermez pas cette page
            </Typography>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
        position: 'relative',
        py: 4,
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
      <Fade in={true} timeout={500}>
        <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Card
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'rgba(30, 41, 59, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 3,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            }}
          >
            {verified ? (
              <>
                <CheckCircle 
                  sx={{ 
                    fontSize: 80, 
                    color: '#10b981', 
                    mb: 3,
                    filter: 'drop-shadow(0 0 30px rgba(16, 185, 129, 0.5))',
                    animation: 'float 3s ease-in-out infinite',
                  }} 
                />
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{ color: '#f8fafc', fontWeight: 700 }}
                >
                  Email vérifié !
                </Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', mb: 4 }}>
                  Votre compte a été activé avec succès
                </Typography>
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: 4,
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    borderColor: 'rgba(16, 185, 129, 0.4)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                  }}
                >
                  ✅ Vous pouvez maintenant vous connecter et réserver des événements
                </Alert>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/login')}
                  endIcon={<ArrowForward />}
                  sx={{
                    py: 1.5,
                    px: 4,
                    background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                    boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 40px rgba(59, 130, 246, 0.5)',
                    },
                  }}
                >
                  Se connecter
                </Button>
              </>
            ) : alreadyVerified ? (
              <>
                <Info 
                  sx={{ 
                    fontSize: 80, 
                    color: '#3B82F6', 
                    mb: 3,
                    filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))',
                    animation: 'float 3s ease-in-out infinite',
                  }} 
                />
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{ color: '#f8fafc', fontWeight: 700 }}
                >
                  Compte déjà vérifié
                </Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', mb: 4 }}>
                  {error}
                </Typography>
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 4,
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    borderColor: 'rgba(59, 130, 246, 0.4)',
                    color: '#60A5FA',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                  }}
                >
                  ℹ️ Si votre compte est activé, vous pouvez vous connecter directement
                </Alert>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    sx={{
                      borderColor: '#8B5CF6',
                      color: '#8B5CF6',
                      '&:hover': {
                        borderColor: '#7C3AED',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      },
                    }}
                  >
                    Retour à l'accueil
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                    endIcon={<ArrowForward />}
                    sx={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(59, 130, 246, 0.5)',
                      },
                    }}
                  >
                    Se connecter
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Error 
                  sx={{ 
                    fontSize: 80, 
                    color: '#ef4444', 
                    mb: 3,
                    filter: 'drop-shadow(0 0 30px rgba(239, 68, 68, 0.5))',
                    animation: 'float 3s ease-in-out infinite',
                  }} 
                />
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{ color: '#f8fafc', fontWeight: 700 }}
                >
                  Échec de vérification
                </Typography>
                <Typography variant="body1" sx={{ color: '#94A3B8', mb: 4 }}>
                  {error}
                </Typography>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 4,
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    borderColor: 'rgba(239, 68, 68, 0.4)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                  }}
                >
                  ❌ Le code de vérification est invalide ou a expiré
                </Alert>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                    sx={{
                      borderColor: '#8B5CF6',
                      color: '#8B5CF6',
                      '&:hover': {
                        borderColor: '#7C3AED',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                      },
                    }}
                  >
                    Retour à l'accueil
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/signup')}
                    sx={{
                      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 40px rgba(59, 130, 246, 0.5)',
                      },
                    }}
                  >
                    S'inscrire à nouveau
                  </Button>
                </Box>
              </>
            )}
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

export default VerifyEmail;