import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Lock,
  CheckCircle
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';

import { authAPI } from '../../services/authService';
import { showSnackbar } from '../../redux/slices/uiSlice';

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const token = searchParams.get('token');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: { password: '', confirmPassword: '' }
  });

  if (!token) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'error.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <Typography variant="h2" sx={{ color: 'error.main' }}>
              ⚠️
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'error.main' }}>
            {t('auth.invalidExpiredLink')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            {t('auth.invalidExpiredLinkDesc')}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/forgot-password')}
            sx={{
              background: 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4a9a98 0%, #5BA8B3 100%)',
              },
            }}
          >
            {t('auth.requestNewLink')}
          </Button>
        </Box>
      </motion.div>
    );
  }

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      setError(t('auth.passwordsDontMatch'));
      return;
    }

    try {
      setLoading(true);
      setError('');

      await authAPI.resetPassword(token, data.password);
      setSuccess(true);
      dispatch(showSnackbar({ message: t('auth.passwordUpdated'), severity: 'success' }));

      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || t('auth.resetPasswordFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'success.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              animation: 'pulse 2s infinite',
            }}
          >
            <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'success.main' }}>
            {t('auth.resetPasswordSuccess')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {t('auth.resetPasswordSuccessRedirect')}
          </Typography>
        </Box>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 5 }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            mb: 1.5,
            background: 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {t('auth.setNewPassword')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
          {t('auth.newPasswordDesc')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="password"
          control={control}
          rules={{
            required: t('auth.passwordRequired'),
            minLength: { value: 8, message: t('auth.passwordMinLength') },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
              message: t('auth.passwordPatternDesc')
            }
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={t('auth.newPassword')}
              type={showPassword ? 'text' : 'password'}
              error={!!errors.password}
              helperText={errors.password?.message || t('auth.passwordMinLengthDesc')}
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
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default' },
              }}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          rules={{
            required: t('auth.confirmPasswordRequired'),
            validate: value => value === control._formValues.password || t('auth.passwordsDontMatch')
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={t('auth.confirmNewPassword')}
              type={showPassword ? 'text' : 'password'}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 4,
                '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default' },
              }}
            />
          )}
        />

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
            background: 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #4a9a98 0%, #5BA8B3 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 24px rgba(47, 124, 123, 0.35)',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.resetPassword')}
        </Button>
      </Box>
    </motion.div>
  );
};

export default ResetPassword;