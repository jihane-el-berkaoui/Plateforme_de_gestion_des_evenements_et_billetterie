import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Grid,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  LocationOn,
  Save,
  Cancel,
  Visibility,
  VisibilityOff,
  Lock
} from '@mui/icons-material';
import { userService } from '../../api/userService'; 
import { useAuth } from '../../contexts/AuthContext'; 

const Profile = () => {
  const { user, updateUser } = useAuth(); 
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      setLoading(false);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
      if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
        throw new Error('Les champs Prénom, Nom et Email sont obligatoires');
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        throw new Error('Adresse email invalide');
      }
      
      const updatedUser = await userService.updateUser(user.id, form);
      
      updateUser(updatedUser);
      
      setSuccess('Profil mis à jour avec succès');
      setEditMode(false);
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || err.response?.data?.message || 'Erreur de mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      
      if (passwordForm.newPassword.length < 6) {
        throw new Error('Le mot de passe doit contenir au moins 6 caractères');
      }
      

      
      setSuccess('Mot de passe changé avec succès');
      setPasswordDialog(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    if (user) {
      setForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md">
        <Alert severity="info" sx={{ mt: 3 }}>
          Veuillez vous connecter pour accéder à votre profil
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ mt: 3, mb: 2 }}>
        <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
        Mon profil
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">
            Informations personnelles
          </Typography>
          {!editMode ? (
            <Box sx={{ display: 'flex', gap: 1 }}>
              
              <Button
                variant="contained"
                onClick={() => setEditMode(true)}
              >
                Modifier le profil
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={saving}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </Box>
          )}
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Prénom
              </Typography>
              {editMode ? (
                <TextField
                  fullWidth
                  value={form.firstName}
                  onChange={(e) => setForm({...form, firstName: e.target.value})}
                  required
                  disabled={saving}
                  size="small"
                />
              ) : (
                <Typography variant="body1">
                  {user.firstName || 'Non spécifié'}
                </Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Nom
              </Typography>
              {editMode ? (
                <TextField
                  fullWidth
                  value={form.lastName}
                  onChange={(e) => setForm({...form, lastName: e.target.value})}
                  required
                  disabled={saving}
                  size="small"
                />
              ) : (
                <Typography variant="body1">
                  {user.lastName || 'Non spécifié'}
                </Typography>
              )}
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Email sx={{ mr: 2, color: 'text.secondary' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Email
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    required
                    disabled={saving}
                    size="small"
                  />
                ) : (
                  <Typography variant="body1">
                    {user.email}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Phone sx={{ mr: 2, color: 'text.secondary' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Téléphone
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    value={form.phone}
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    disabled={saving}
                    size="small"
                    placeholder="Ex: +33 1 23 45 67 89"
                  />
                ) : (
                  <Typography variant="body1">
                    {user.phone || 'Non spécifié'}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <LocationOn sx={{ mr: 2, color: 'text.secondary', mt: 0.5 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Adresse
                </Typography>
                {editMode ? (
                  <TextField
                    fullWidth
                    value={form.address}
                    onChange={(e) => setForm({...form, address: e.target.value})}
                    disabled={saving}
                    multiline
                    rows={2}
                    size="small"
                    placeholder="Adresse complète"
                  />
                ) : (
                  <Typography variant="body1">
                    {user.address || 'Non spécifié'}
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
        
        {!editMode && (
          <>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Rôle
                </Typography>
                <Typography variant="body1">
                  {user.role === 'ADMIN' ? 'Administrateur' : 'Client'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Membre depuis
                </Typography>
                <Typography variant="body1">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                </Typography>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>
      
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Changer le mot de passe</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Mot de passe actuel"
              type={showPassword.current ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword({...showPassword, current: !showPassword.current})}>
                      {showPassword.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Nouveau mot de passe"
              type={showPassword.new ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword({...showPassword, new: !showPassword.new})}>
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Confirmer le nouveau mot de passe"
              type={showPassword.confirm ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
              margin="normal"
              error={passwordForm.newPassword !== passwordForm.confirmPassword}
              helperText={passwordForm.newPassword !== passwordForm.confirmPassword ? 'Les mots de passe ne correspondent pas' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})}>
                      {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Annuler</Button>
          <Button 
            onClick={handleChangePassword}
            variant="contained"
            disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
          >
            Changer le mot de passe
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;