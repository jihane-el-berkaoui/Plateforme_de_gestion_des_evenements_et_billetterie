import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Fade,
  IconButton
} from '@mui/material';
import { 
  CheckCircle, 
  VpnKey, 
  ContentCopy,
  Home,
  Event,
  ArrowBack
} from '@mui/icons-material';

const VerifyPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  
  const email = location.state?.email || 'votre email';

  const handleVerify = async () => {
    if (verifying || loading) {
      console.log('⚠️ Vérification déjà en cours, requête ignorée');
      return;
    }

    if (!token.trim()) {
      setError('Veuillez entrer le code de vérification');
      return;
    }

    setVerifying(true);
    setLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      console.log('🔍 Vérification du token:', token.trim());
      navigate(`/verify/${token.trim()}`);
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Code invalide');
      setVerifying(false);
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setToken(text.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur de collage:', err);
      setError('Collez manuellement le code (Ctrl+V)');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && token.trim() && !verifying) {
      handleVerify();
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
          </Box>

          <Card
            sx={{
              p: 4,
              background: 'rgba(30, 41, 59, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(148, 163, 184, 0.1)',
              borderRadius: 3,
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)',
                borderColor: 'rgba(59, 130, 246, 0.3)',
              },
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <CheckCircle 
                sx={{ 
                  fontSize: 60, 
                  color: '#3B82F6', 
                  mb: 2,
                  filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.5))',
                }} 
              />
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ color: '#f8fafc', fontWeight: 700 }}
              >
                Vérifiez votre email
              </Typography>
              <Typography sx={{ color: '#94A3B8' }}>
                Code envoyé à: <strong style={{ color: '#3B82F6' }}>{email}</strong>
              </Typography>
            </Box>

            <Alert 
              severity="info" 
              sx={{ 
                mb: 3,
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                borderColor: 'rgba(59, 130, 246, 0.4)',
                color: '#60A5FA',
                border: '1px solid rgba(59, 130, 246, 0.4)',
              }}
            >
              📧 Consultez votre email et copiez le <strong>code de vérification</strong> reçu
            </Alert>

            <Card
              sx={{
                p: 2,
                mb: 2,
                border: '2px solid',
                borderColor: error ? '#ef4444' : '#3B82F6',
                bgcolor: error ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                borderRadius: 2,
              }}
            >
              <Typography 
                variant="body2" 
                gutterBottom 
                sx={{ fontWeight: 'bold', color: '#f8fafc' }}
              >
                Code de vérification
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Collez votre code ici (36 caractères)"
                  value={token}
                  onChange={(e) => {
                    setToken(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  disabled={loading || verifying}
                  InputProps={{
                    startAdornment: <VpnKey sx={{ mr: 1, color: '#3B82F6' }} />
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                      color: '#000000',
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handlePaste}
                  disabled={loading || verifying}
                  startIcon={copied ? <CheckCircle /> : <ContentCopy />}
                  sx={{ 
                    minWidth: 100,
                    borderColor: '#3B82F6',
                    color: '#3B82F6',
                    '&:hover': {
                      borderColor: '#2563EB',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    },
                  }}
                >
                  {copied ? 'Collé' : 'Coller'}
                </Button>
              </Box>
            </Card>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  borderColor: 'rgba(239, 68, 68, 0.4)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                }} 
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={handleVerify}
              disabled={loading || verifying || !token.trim()}
              startIcon={loading ? <CircularProgress size={20} sx={{ color: '#94A3B8' }} /> : <CheckCircle />}
              sx={{ 
                mb: 2,
                py: 1.5,
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
            >
              {loading || verifying ? 'Vérification en cours...' : 'Vérifier mon compte'}
            </Button>

            <Alert 
              severity="warning" 
              sx={{ 
                mb: 2,
                backgroundColor: 'rgba(245, 158, 11, 0.15)',
                borderColor: 'rgba(245, 158, 11, 0.4)',
                color: '#fbbf24',
                border: '1px solid rgba(245, 158, 11, 0.4)',
              }}
            >
              ⏰ Le code expire dans <strong>24 heures</strong>
            </Alert>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/')}
              startIcon={<Home />}
              disabled={loading || verifying}
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

            <Typography 
              variant="body2" 
              sx={{ mt: 3, textAlign: 'center', color: '#94A3B8' }}
            >
              Vous n'avez pas reçu l'email ? Vérifiez vos spams ou contactez le support
            </Typography>
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

export default VerifyPending;