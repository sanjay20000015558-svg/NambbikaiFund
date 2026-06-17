import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Button,
  Alert,
  Link
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { authAPI } from '../../services/authService';
import { verifyEmail as verifyEmailAction } from '../../redux/slices/authSlice';
import { useDispatch } from 'react-redux';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    verify();
  }, [token]);

  const verify = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    try {
      const res = await authAPI.verifyEmail(token);
      setStatus('success');
      setMessage(res.data.message);
      dispatch(verifyEmailAction());
    } catch (err) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Verification failed');
    }
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      {status === 'loading' && (
        <>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="h6">Verifying your email...</Typography>
        </>
      )}

      {status === 'success' && (
        <>
          <Typography variant="h5" color="success.main" gutterBottom>
            ✅ Email Verified!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {message}
          </Typography>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </>
      )}

      {status === 'error' && (
        <>
          <Typography variant="h5" color="error" gutterBottom>
            Verification Failed
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {message}
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </>
      )}
    </Box>
  );
};

export default VerifyEmail;
