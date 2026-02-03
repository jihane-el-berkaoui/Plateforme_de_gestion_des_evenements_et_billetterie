import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  TextField,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  MenuItem
} from '@mui/material';
import { Add, Search, Edit, Delete, Person } from '@mui/icons-material';

const userService = {
  getAllUsers: async () => {
    try {
      const response = await fetch('http://localhost:8080/api/users');
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  createUser: async (userData) => {
    try {
      const response = await fetch('http://localhost:8080/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      return response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      return response.json();
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${id}`, {
        method: 'DELETE'
      });
      return response.ok;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await userService.getAllUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching users:', error);
        showSnackbar('Error fetching users', 'error');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, userForm);
        showSnackbar('User updated successfully!', 'success');
      } else {
        await userService.createUser(userForm);
        showSnackbar('User created successfully!', 'success');
      }
      setOpenDialog(false);
      resetForm();
      
      const data = await userService.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      showSnackbar('Error saving user', 'error');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setUserForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || ''
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(id);
        showSnackbar('User deleted successfully!', 'success');
        
        const data = await userService.getAllUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        showSnackbar('Error deleting user', 'error');
      }
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: ''
    });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''} ${user.email || ''}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  }) : [];

  if (loading) return <LinearProgress />;

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: 3 }}>
        <Typography variant="h4">
          <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
          Users Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
        >
          Create User
        </Button>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            label="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1 }} />
            }}
          />
        </CardContent>
      </Card>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map(user => (
              <TableRow key={user.id}>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone || '-'}</TableCell>
                <TableCell>{user.address || '-'}</TableCell>
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(user)}>
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(user.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="First Name"
              value={userForm.firstName}
              onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Last Name"
              value={userForm.lastName}
              onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={userForm.email}
              onChange={(e) => setUserForm({...userForm, email: e.target.value})}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Phone"
              value={userForm.phone}
              onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Address"
              value={userForm.address}
              onChange={(e) => setUserForm({...userForm, address: e.target.value})}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
  select
  fullWidth
  label="Role"
  value={userForm.role || 'CLIENT'}
  onChange={(e) => setUserForm({...userForm, role: e.target.value})}
  margin="normal"
  required
>
  <MenuItem value="CLIENT">Client</MenuItem>
  <MenuItem value="ADMIN">Admin</MenuItem>
</TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AdminUsers;