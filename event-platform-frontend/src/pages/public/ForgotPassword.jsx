import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Email, ArrowBack, CheckCircle } from '@mui/icons-material';
import { authService } from '../../api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/login')}
        sx={{ mt: 3, mb: 2 }}
      >
        Retour
      </Button>
      
      <Paper elevation={3} sx={{ p: 4 }}>
        {success ? (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Email envoyé !
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Nous avons envoyé un lien de réinitialisation à <strong>{email}</strong>
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/login')}
            >
              Retour à la connexion
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Email sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Mot de passe oublié
              </Typography>
              <Typography color="text.secondary">
                Entrez votre email pour recevoir un lien de réinitialisation
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Votre email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                required
                disabled={loading}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3 }}
                disabled={loading || !email}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </Button>
            </form>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Typography component="span" color="primary">
                    Retour à la connexion
                  </Typography>
                </Link>
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default ForgotPassword;