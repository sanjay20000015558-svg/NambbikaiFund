import React, { useState } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Grid,
  InputAdornment,
  IconButton,
  Stack,
  MenuItem
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Favorite,
  Phone,
  Person
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';

import { authAPI } from '../../services/authService';
import { registerSuccess } from '../../redux/slices/authSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'Tamil' },
  { value: 'hi', label: 'Hindi' },
  { value: 'te', label: 'Telugu' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'kn', label: 'Kannada' },
  { value: 'bn', label: 'Bengali' },
  { value: 'mr', label: 'Marathi' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'pa', label: 'Punjabi' },
  { value: 'ur', label: 'Urdu' },
];

const states = [
  'Andhra Pradesh', 'Karnataka', 'Kerala', 'Tamil Nadu', 'Telangana',
  'Maharashtra', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Delhi',
  'West Bengal', 'Odisha', 'Madhya Pradesh', 'Punjab', 'Haryana'
];

const Register = () => {
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
      fullName: '',
      email: '',
      mobileNumber: '',
      password: '',
      confirmPassword: '',
      state: '',
      language: 'en',
      agreeTerms: false
    }
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      // Confirm password validation
      if (data.password !== data.confirmPassword) {
        setError(t('auth.passwordsDontMatch'));
        setLoading(false);
        return;
      }

      const res = await authAPI.register(data);
      dispatch(registerSuccess(res.data));
      dispatch(showSnackbar({
        message: 'Account created! Please check your email to verify your account.',
        severity: 'success'
      }));

      navigate('/verify-email');
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map(e => e.message).join(', ');
        setError(errorMessages);
      } else {
        const requestedUrl = `${err.config?.baseURL || ''}${err.config?.url || ''}`;
        const backendMessage = err.response?.data?.message;
        const message = !err.response
          ? `Cannot connect to backend. Check backend URL/CORS. Requested: ${requestedUrl}`
          : backendMessage || 'Registration failed. Please try again.';
        setError(message);
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
      {/* Trust header */}
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
          <Favorite sx={{ color: 'white', fontSize: 32 }} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1.5 }}>
          {t('auth.register')}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', lineHeight: 1.6 }}>
          Create your free account to start fundraising or support campaigns.
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
        <Grid container spacing={2.5}>
          {/* Full name */}
          <Grid item xs={12}>
            <Controller
              name="fullName"
              control={control}
              rules={{
                required: 'Full Name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' },
                maxLength: { value: 100, message: 'Name is too long' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth.fullName')}
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default' },
                  }}
                />
              )}
            />
          </Grid>

          {/* Email */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="email"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth.email')}
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
                    '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default' },
                  }}
                />
              )}
            />
          </Grid>

          {/* Mobile */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="mobileNumber"
              control={control}
              rules={{
                required: 'Mobile number is required',
                pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid mobile number' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth.mobile')}
                  placeholder="9876543210"
                  error={!!errors.mobileNumber}
                  helperText={errors.mobileNumber?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default' },
                  }}
                />
              )}
            />
          </Grid>

          {/* Password */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
                  message: 'Password must contain uppercase, lowercase, and numbers'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message || 'Min 8 chars, with uppercase, lowercase, numbers'}
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
                    '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default' },
                  }}
                />
              )}
            />
          </Grid>

          {/* Confirm password */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: 'Please confirm your password',
                validate: value => value === control._formValues.password || 'Passwords do not match'
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth.confirmPassword')}
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
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default' },
                  }}
                />
              )}
            />
          </Grid>

          {/* State */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="state"
              control={control}
              rules={{ required: 'State is required' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="State"
                  error={!!errors.state}
                  helperText={errors.state?.message}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default' },
                  }}
                >
                  {states.map((state) => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Language */}
          <Grid item xs={12} sm={6}>
            <Controller
              name="language"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  select
                  label="Preferred Language"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'background.default' },
                  }}
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.value} value={lang.value}>{lang.label}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>

          {/* Terms */}
          <Grid item xs={12}>
            <Controller
              name="agreeTerms"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={field.onChange}
                      sx={{
                        color: 'primary.main',
                        '&.Mui-checked': { color: 'primary.main' },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" color="text.secondary">
                      I agree to the{' '}
                      <Link component={RouterLink} to="/terms" target="_blank" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Terms
                      </Link>{' '}
                      and{' '}
                      <Link component={RouterLink} to="/privacy" target="_blank" sx={{ color: 'primary.main', fontWeight: 600 }}>
                        Privacy
                      </Link>
                    </Typography>
                  }
                />
              )}
            />
            {errors.agreeTerms && (
              <Typography variant="caption" color="error">
                Please agree to the Terms and Privacy Policy
              </Typography>
            )}
          </Grid>

          {/* Submit */}
          <Grid item xs={12}>
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
                boxShadow: '0 8px 24px rgba(47, 124, 123, 0.3)',
                '&:hover': {
                  boxShadow: '0 12px 32px rgba(47, 124, 123, 0.4)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.register')}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Login link */}
      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
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

      {/* Trust messaging */}
      <Box
        sx={{
          mt: 5,
          p: 3,
          borderRadius: 3,
          bgcolor: 'rgba(16, 185, 129, 0.04)',
          border: '1px solid rgba(16, 185, 129, 0.12)',
          textAlign: 'center',
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.main', display: 'block', mb: 1 }}>
          Your privacy is protected
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.5 }}>
          Your personal information is secure and will never be shared without your permission.
        </Typography>
      </Box>
    </motion.div>
  );
};

export default Register;