import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
  Stack
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Favorite,
  AdminPanelSettings
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';

import { authAPI } from '../../services/authService';
import { getAxiosErrorMessage } from '../../services/api';
import { loginSuccess } from '../../redux/slices/authSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

const AdminLogin = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      const res = await authAPI.login(data);

      const token =
        res.data?.token ||
        res.data?.data?.token ||
        res.data?.user?.token;

      if (token) {
        localStorage.setItem('token', token);
      }

      dispatch(loginSuccess(res.data));

      dispatch(
        showSnackbar({
          message: t('auth.adminWelcomeSnackbar'),
          severity: 'success',
        })
      );

      navigate('/admin/campaign-requests', { replace: true });
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map(e => e.message).join(', ');
        setError(errorMessages);
      } else {
        setError(getAxiosErrorMessage(err, t('auth.loginFailed')));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            boxShadow: '0 8px 28px rgba(47, 124, 123, 0.25)',
          }}
        >
          <AdminPanelSettings sx={{ color: 'white', fontSize: 32 }} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5 }}>
          {t('auth.adminLogin')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
          {t('auth.adminLoginSubtitle')}
        </Typography>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 3,
            '& .MuiAlert-message': { fontWeight: 500 },
          }}
        >
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.5}>
          <Controller
            name="email"
            control={control}
            rules={{
              required: t('auth.emailRequired'),
              pattern: { value: /^\S+@\S+$/i, message: t('auth.invalidEmail') }
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('auth.adminEmail')}
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'background.default',
                  },
                }}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            rules={{ required: t('auth.passwordRequired') }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    bgcolor: 'background.default',
                  },
                }}
              />
            )}
          />
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, mb: 4 }}>
          <FormControlLabel
            control={<Checkbox size="small" sx={{ color: 'primary.main' }} />}
            label={t('auth.rememberMe')}
          />
          <Link
            component={RouterLink}
            to="/forgot-password"
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {t('auth.forgotPasswordLink')}
          </Link>
        </Box>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={loading}
          sx={{
            py: 1.75,
            borderRadius: 3,
            fontSize: '1rem',
            fontWeight: 700,
            boxShadow: loading ? 'none' : '0 6px 20px rgba(47, 124, 123, 0.3)',
            '&:hover': {
              boxShadow: '0 8px 28px rgba(47, 124, 123, 0.4)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.signInAsAdmin')}
        </Button>
      </Box>

      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('auth.regularLoginQuestion')}{' '}
          <Link
            component={RouterLink}
            to="/login"
            sx={{
              color: 'primary.main',
              fontWeight: 700,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {t('auth.login')}
          </Link>
        </Typography>
      </Box>
    </motion.div>
  );
};

export default AdminLogin;