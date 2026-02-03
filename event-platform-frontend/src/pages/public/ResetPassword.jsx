import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Lock, Visibility, VisibilityOff, CheckCircle, Error } from '@mui/icons-material';
import { authService } from '../../api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!token) {
      setError('Token manquant');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      await authService.resetPassword(token, formData.newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Token invalide ou expiré');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        {success ? (
          <Box sx={{ textAlign: 'center' }}>
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom>
              Mot de passe réinitialisé !
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Votre mot de passe a été modifié avec succès
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirection vers la page de connexion...
            </Typography>
          </Box>
        ) : error && error.includes('Token') ? (
          <Box sx={{ textAlign: 'center' }}>
            <Error sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
            <Typography variant="h4" gutterBottom>
              Lien invalide
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/forgot-password')}
            >
              Demander un nouveau lien
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Lock sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" gutterBottom>
                Nouveau mot de passe
              </Typography>
              <Typography color="text.secondary">
                Créez un nouveau mot de passe pour votre compte
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
                label="Nouveau mot de passe"
                type={showPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                margin="normal"
                required
                disabled={loading}
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                helperText="Minimum 6 caractères"
              />

              <TextField
                fullWidth
                label="Confirmer le mot de passe"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                margin="normal"
                required
                disabled={loading}
                InputProps={{
                  startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ mt: 3 }}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
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

export default ResetPassword;