import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from './styles/theme';

import { AuthProvider } from './contexts/AuthContext';

import Navbar from './components/layout/Navbar';
import AdminRoute from './components/layout/AdminRoute';
import ClientRoute from './components/layout/ClientRoute';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';
import EditEvent from './pages/Admin/EditEvent';
import MyRefunds from './pages/user/MyRefunds';
import MyQRCodes from './pages/user/MyQRCodes';
import AdminCheckin from './pages/Admin/AdminCheckin'; 

import Home from './pages/public/Home';
import Events from './pages/public/Events';
import EventDetails from './pages/public/EventDetails';
import BookEvent from './pages/public/BookEvent';
import Categories from './pages/public/Categories';
import Login from './pages/public/Login';
import Signup from './pages/public/Signup';
import VerifyEmail from './pages/public/VerifyEmail';
import VerifyPending from './pages/public/VerifyPending';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

import MyBookings from './pages/user/MyBookings';
import Profile from './pages/user/Profile';
import BookingDetails from './pages/user/BookingDetails';

import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminEvents from './pages/Admin/AdminEvents';
import AdminBookings from './pages/Admin/AdminBookings';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminRefunds from './pages/Admin/AdminRefunds';
import TicketTypeSelector from './components/tickets/TicketTypeSelector';
import TicketTypeManager from './pages/Admin/TicketTypeManager';
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Navbar />
              <main style={{ flex: 1, padding: '20px 0', backgroundColor: '#f5f5f5' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/verify/:token" element={<VerifyEmail />} />
                  <Route path="/verify-pending" element={<VerifyPending />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password/:token" element={<ResetPassword />} />
                  
                  <Route path="/book-event/:id" element={
                    <ClientRoute>
                      <BookEvent />
                    </ClientRoute>
                  } />
                  <Route path="/my-refunds" element={
                    <ClientRoute>
                      <MyRefunds />
                    </ClientRoute>
                  } />
                  
                  <Route path="/my-qrcodes" element={
                    <ClientRoute>
                      <MyQRCodes />
                    </ClientRoute>
                  } />
                  
                  <Route path="/my-refunds" element={
  <ClientRoute>
    <MyRefunds />
  </ClientRoute>
} />
                  <Route path="/my-bookings" element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  } />
                  <Route path="/bookings/:id" element={
                    <ProtectedRoute>
                      <BookingDetails />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/events/edit/:id" element={
                    <AdminRoute>
                      <EditEvent />
                    </AdminRoute>
                  } />
                  <Route path="/admin/events/:id/ticket-types" element={
  <AdminRoute>
    <TicketTypeManager />
  </AdminRoute>
} />
                  <Route path="/admin/checkin" element={
                    <AdminRoute>
                      <AdminCheckin /> 
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin/refunds" element={
                    <AdminRoute>
                      <AdminRefunds />
                    </AdminRoute>
                  } />
                  <Route path="/admin" element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } />
                  <Route path="/admin/events" element={
                    <AdminRoute>
                      <AdminEvents />
                    </AdminRoute>
                  } />
                  <Route path="/admin/bookings" element={
                    <AdminRoute>
                      <AdminBookings />
                    </AdminRoute>
                  } />
                  <Route path="/admin/users" element={
                    <AdminRoute>
                      <AdminUsers />
                    </AdminRoute>
                  } />
                  
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </main>
            </div>
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;