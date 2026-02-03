import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Fade
} from '@mui/material';
import {
  Event,
  Security,
  TrendingUp,
  Groups,
  Login,
  PersonAdd,
  Explore
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const features = [
    {
      icon: <Event sx={{ fontSize: 48 }} />,
      title: 'Événements variés',
      description: 'Concerts, conférences, sports, festivals et plus'
    },
    {
      icon: <Security sx={{ fontSize: 48 }} />,
      title: 'Réservation sécurisée',
      description: 'Paiements cryptés et billets électroniques'
    },
    {
      icon: <TrendingUp sx={{ fontSize: 48 }} />,
      title: 'Meilleurs prix',
      description: 'Tarifs compétitifs garantis'
    },
    {
      icon: <Groups sx={{ fontSize: 48 }} />,
      title: 'Communauté active',
      description: 'Rejoignez des milliers de passionnés'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
          position: 'relative',
          overflow: 'hidden',
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
        <Fade in={true} timeout={1000}>
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Event 
                sx={{ 
                  fontSize: { xs: 80, md: 120 }, 
                  mb: 4,
                  color: '#3B82F6',
                  filter: 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))',
                  animation: 'float 3s ease-in-out infinite',
                }} 
              />

              <Typography 
                variant="h1" 
                gutterBottom 
                sx={{ 
                  fontWeight: 900,
                  fontSize: { xs: '3rem', md: '5rem' },
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 50%, #06B6D4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3,
                  letterSpacing: '-0.03em',
                }}
              >
                GoEvent
              </Typography>

              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 6, 
                  color: '#94A3B8',
                  fontWeight: 500,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                }}
              >
                Votre plateforme de réservation d'événements
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  justifyContent: 'center', 
                  flexWrap: 'wrap',
                  mb: 8,
                }}
              >
                {!isAuthenticated ? (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PersonAdd />}
                      onClick={() => navigate('/signup')}
                      sx={{
                        px: 5,
                        py: 2,
                        fontSize: '1.125rem',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                          transform: 'translateY(-4px)',
                          boxShadow: '0 12px 40px rgba(59, 130, 246, 0.5)',
                        },
                      }}
                    >
                      S'inscrire gratuitement
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<Login />}
                      onClick={() => navigate('/login')}
                      sx={{
                        px: 5,
                        py: 2,
                        fontSize: '1.125rem',
                        borderRadius: 3,
                        borderWidth: 2,
                        borderColor: '#3B82F6',
                        color: '#3B82F6',
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: '#2563EB',
                          background: 'rgba(59, 130, 246, 0.1)',
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      Se connecter
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={isAdmin ? <Event /> : <Explore />}
                    onClick={() => navigate(isAdmin ? '/admin' : '/events')}
                    sx={{
                      px: 5,
                      py: 2,
                      fontSize: '1.125rem',
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                      boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(59, 130, 246, 0.5)',
                      },
                    }}
                  >
                    {isAdmin ? 'Tableau de bord' : 'Explorer les événements'}
                  </Button>
                )}

                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<Explore />}
                  onClick={() => navigate('/events')}
                  sx={{
                    px: 5,
                    py: 2,
                    fontSize: '1.125rem',
                    borderRadius: 3,
                    borderWidth: 2,
                    borderColor: '#8B5CF6',
                    color: '#8B5CF6',
                    '&:hover': {
                      borderWidth: 2,
                      borderColor: '#7C3AED',
                      background: 'rgba(139, 92, 246, 0.1)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  Consulter les événements
                </Button>
              </Box>

              <Box
                sx={{
                  animation: 'float 2s ease-in-out infinite',
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.7 },
                }}
                onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
              >
                <Typography variant="body2" sx={{ color: '#94A3B8', mb: 1 }}>
                  Découvrez plus
                </Typography>
                <Box
                  sx={{
                    width: 30,
                    height: 50,
                    border: '2px solid #3B82F6',
                    borderRadius: 20,
                    mx: 'auto',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 8,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: '#3B82F6',
                      animation: 'scrollDown 2s ease-in-out infinite',
                    },
                  }}
                />
              </Box>
            </Box>
          </Container>
        </Fade>
      </Box>

      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Fade in={true} timeout={1500}>
          <Box>
            <Typography 
              variant="h2" 
              align="center" 
              gutterBottom
              sx={{
                fontWeight: 800,
                mb: 2,
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Pourquoi choisir GoEvent?
            </Typography>
            <Typography 
              variant="h6" 
              align="center" 
              sx={{ 
                color: '#94A3B8',
                mb: 8,
                fontWeight: 400,
              }}
            >
              La plateforme ultime pour vos événements
            </Typography>

            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      textAlign: 'center',
                      p: 3,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        transform: 'translateY(-12px)',
                        boxShadow: '0 20px 40px rgba(59, 130, 246, 0.25)',
                      },
                    }}
                  >
                    <Box 
                      sx={{ 
                        color: '#3B82F6',
                        mb: 3,
                        display: 'flex',
                        justifyContent: 'center',
                      }}
                    >
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                      {feature.title}
                    </Typography>
                    <Typography sx={{ color: '#94A3B8' }}>
                      {feature.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </Container>

      <Container maxWidth="md" sx={{ py: 12 }}>
        <Fade in={true} timeout={2000}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              gutterBottom
              sx={{
                fontWeight: 700,
                mb: 2,
              }}
            >
              Prêt à découvrir?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#94A3B8',
                mb: 5,
                fontWeight: 400,
              }}
            >
              Rejoignez des milliers d'utilisateurs satisfaits
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => {
                if (isAuthenticated) {
                  navigate(isAdmin ? '/admin' : '/events');
                } else {
                  navigate('/signup');
                }
              }}
              endIcon={<Explore />}
              sx={{
                px: 6,
                py: 2.5,
                fontSize: '1.125rem',
                borderRadius: 3,
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(59, 130, 246, 0.5)',
                },
              }}
            >
              {isAuthenticated 
                ? (isAdmin ? 'Accéder au dashboard' : 'Voir les événements')
                : 'Créer un compte gratuit'
              }
            </Button>
          </Box>
        </Fade>
      </Container>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes scrollDown {
          0% {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
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

export default Home;