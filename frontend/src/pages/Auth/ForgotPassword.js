import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
  CircularProgress,
  Stack
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';

import { authAPI } from '../../services/authService';
import { showSnackbar } from '../../redux/slices/uiSlice';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      await authAPI.forgotPassword(data);
      setSubmitted(true);
      dispatch(showSnackbar({ message: t('auth.resetLinkSent'), severity: 'success' }));
    } catch (err) {
      setError(err.response?.data?.message || t('auth.sendResetLinkFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
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
            }}
          >
            <Typography variant="h2" sx={{ color: 'success.main' }}>
              📧
            </Typography>
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            {t('auth.checkYourEmail')}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto' }}>
            {t('auth.resetEmailSent')}
          </Typography>
          <Button
            variant="text"
            component={Link}
            to="/login"
            sx={{ mt: 4, fontWeight: 600 }}
          >
            {t('auth.backToLogin')}
          </Button>
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
          {t('auth.forgotPassword')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
          {t('auth.forgotPasswordSubtitle')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={control}
          rules={{
            required: t('auth.emailRequiredError'),
            pattern: { value: /^\S+@\S+$/i, message: t('auth.invalidEmailError') }
          }}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label={t('auth.emailAddress')}
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
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
            mb: 3,
            background: 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)',
            '&:hover': {
              boxShadow: '0 8px 24px rgba(47, 124, 123, 0.35)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.sendResetLink')}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link
            component={RouterLink}
            to="/login"
            sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
          >
            {t('auth.backToLoginArrow')}
          </Link>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ForgotPassword;