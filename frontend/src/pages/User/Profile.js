import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  CircularProgress,
  MenuItem
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { PhotoCamera } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { authAPI } from '../../services/authService';
import { updateProfile as updateProfileAction } from '../../redux/slices/authSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const UserProfile = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      fullName: '',
      mobileNumber: '',
      email: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      language: 'en'
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || '',
        mobileNumber: user.mobileNumber || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        gender: user.gender || '',
        address: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        language: user.language || 'en'
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const submitData = {
        ...data,
        address: {
          street: data.address,
          city: data.city,
          state: data.state
        }
      };
      const res = await authAPI.updateProfile(submitData);
      dispatch(updateProfileAction(res.data.user));
      dispatch(showSnackbar({ message: t('profile.profileUpdated'), severity: 'success' }));
    } catch (error) {
      dispatch(showSnackbar({
        message: error.response?.data?.message || t('profile.profileUpdateFailed'),
        severity: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      setLoading(true);
      const res = await authAPI.uploadProfilePicture(formData);
      dispatch(updateProfileAction(res.data.user));
      dispatch(showSnackbar({ message: t('profile.profilePictureUpdated'), severity: 'success' }));
    } catch (error) {
      dispatch(showSnackbar({ message: t('profile.failedToUploadImage'), severity: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        {t('profile.myProfile')}
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box position="relative" display="inline-block">
              <Avatar
                src={user.profilePicture || ''}
                sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
              >
                {user.fullName ? user.fullName[0] : '?'}
              </Avatar>
              <input
                accept="image/*"
                type="file"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
                id="profile-photo-upload"
              />
              <label htmlFor="profile-photo-upload">
                <IconButton
                  component="span"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  <PhotoCamera />
                </IconButton>
              </label>
            </Box>
            <Typography variant="h6">{user.fullName}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            <Typography variant="body2" color="text.secondary">{user.role}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Controller
                    name="fullName"
                    control={control}
                    rules={{ required: t('profile.fullName') + ' is required' }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t('profile.fullName')}
                        error={!!errors.fullName}
                        helperText={errors.fullName?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="mobileNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t('profile.mobileNumber')}
                        disabled
                        helperText={t('profile.mobileHelp')}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t('profile.email')}
                        disabled
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="dateOfBirth"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t('profile.dateOfBirth')}
                        type="date"
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        select
                        label={t('profile.gender')}
                      >
                        <MenuItem value="">{t('profile.selectGender')}</MenuItem>
                        <MenuItem value="male">{t('profile.male')}</MenuItem>
                        <MenuItem value="female">{t('profile.female')}</MenuItem>
                        <MenuItem value="other">{t('profile.other')}</MenuItem>
                        <MenuItem value="prefer-not-to-say">{t('profile.preferNotToSay')}</MenuItem>
                      </TextField>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t('profile.addressLine')}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t('profile.city')}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t('profile.state')}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} /> : null}
                  >
                    {loading ? t('profile.saving') : t('profile.saveChanges')}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfile;