import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from './theme/theme';
import { store } from './redux/store';
import { setUser, logout as authLogout } from './redux/slices/authSlice';
import axiosInstance from './services/api';

import Layout from './components/Layout/Layout';
import AuthLayout from './components/Layout/AuthLayout';
import ProtectedRoute from './components/Common/ProtectedRoute';
import RoleRoute from './components/Common/RoleRoute';
import AlertSnackbar from './components/Common/AlertSnackbar';

import LandingPage from './pages/LandingPage';
import Login from './pages/Auth/Login';
import AdminLogin from './pages/Auth/AdminLogin';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import VerifyEmail from './pages/Auth/VerifyEmail';
import CampaignList from './pages/Campaigns/CampaignList';
import CampaignDetail from './pages/Campaigns/CampaignDetail';
import CampaignCreate from './pages/Campaign/CampaignCreate';
import CampaignEdit from './pages/Campaign/CampaignEdit';
import Dashboard from './pages/User/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import CampaignRequests from './pages/Admin/CampaignRequests';
import UserProfile from './pages/User/Profile';
import PaymentCheckout from './pages/Payment/PaymentCheckout';
import PaymentResponse from './pages/Payment/PaymentResponse';
import NotFound from './pages/NotFound';

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axiosInstance.get('/auth/me');
          dispatch(setUser(res.data.user));
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          dispatch(authLogout());
        }
      }
    };
    loadUser();
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* Auth Routes - Clean standalone pages */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
        </Route>

        {/* Public Routes - With navbar/footer */}
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/campaigns" element={<CampaignList />} />
          <Route path="/campaign/:id" element={<CampaignDetail />} />
          <Route path="/about" element={<LandingPage />} />
<Route path="/contact" element={<LandingPage />} />
           <Route path="/terms" element={<LandingPage />} />
          <Route path="/privacy" element={<LandingPage />} />
        </Route>

        {/* Payment Routes */}
        <Route path="/payment/checkout" element={<PaymentCheckout />} />
        <Route path="/payment/response" element={<PaymentResponse />} />

        {/* Protected User Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/start-campaign" element={<CampaignCreate />} />
          <Route path="/campaign/:id/edit" element={<CampaignEdit />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<UserProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route
          element={
            <RoleRoute allowedRoles={['admin', 'verifier']}>
              <Layout />
            </RoleRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/campaign-requests" element={<CampaignRequests />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Global Snackbar */}
      <AlertSnackbar />
    </ThemeProvider>
  );
}

export default App;