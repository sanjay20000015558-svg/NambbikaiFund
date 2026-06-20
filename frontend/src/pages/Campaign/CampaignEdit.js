import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Box,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Upload, Delete } from '@mui/icons-material';

import { campaignAPI } from '../../services/campaignService';
import { updateCampaign } from '../../redux/slices/campaignSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const CampaignEdit = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [existingDocuments, setExistingDocuments] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      category: '',
      shortDescription: '',
      description: '',
      targetAmount: '',
      deadline: '',
      urgency: 'medium',
      isUrgent: false,
      location: { city: '', state: '', country: 'India' },
      patientDetails: {}
    }
  });

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const res = await campaignAPI.getCampaign(id);
      const data = res.data.data;

      setExistingDocuments(data.supportingDocuments || []);

      reset({
        title: data.title,
        category: data.category,
        shortDescription: data.shortDescription,
        description: data.description,
        targetAmount: data.targetAmount,
        deadline: data.deadline?.split('T')[0],
        urgency: data.urgency,
        isUrgent: data.isUrgent || false,
        location: data.location || { city: '', state: '', country: 'India' },
        patientDetails: data.patientDetails || {},
        medicalDetails: data.medicalDetails || {}
      });
    } catch (err) {
      setError(err.response?.data?.message || t('campaign.notFound'));
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files || []);
    const remaining = 10 - existingDocuments.length - uploadedDocuments.length;
    const toAdd = files.slice(0, remaining);
    setUploadedDocuments(prev => [...prev, ...toAdd]);
  };

  const removeDocument = (index, isExisting = false) => {
    if (isExisting) {
      setExistingDocuments(existingDocuments.filter((_, i) => i !== index));
    } else {
      setUploadedDocuments(uploadedDocuments.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const formData = new FormData();

      formData.append('title', data.title);
      formData.append('category', data.category);
      formData.append('shortDescription', data.shortDescription);
      formData.append('description', data.description);
      formData.append('targetAmount', data.targetAmount);
      formData.append('deadline', data.deadline);
      formData.append('urgency', data.urgency);
      formData.append('isUrgent', data.isUrgent);

      formData.append('patientDetails', JSON.stringify(data.patientDetails || {}));
      formData.append('medicalDetails', JSON.stringify(data.medicalDetails || {}));
      formData.append('location', JSON.stringify(data.location));

      uploadedDocuments.forEach((doc) => {
        formData.append('documents', doc);
      });

      if (existingDocuments.length > 0) {
        formData.append('supportingDocuments', JSON.stringify(existingDocuments));
      }

      const res = await campaignAPI.updateCampaign(id, formData);
      dispatch(updateCampaign(res.data.data));
      dispatch(showSnackbar({ message: t('common.campaignUpdated'), severity: 'success' }));
    } catch (err) {
      dispatch(showSnackbar({
        message: err.response?.data?.message || t('common.campaignUpdateFailed'),
        severity: 'error'
      }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/dashboard')}>
          {t('navigation.dashboard')}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom>
        {t('campaign.edit')}
      </Typography>

      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                rules={{ required: t('common.titleRequired'), minLength: 10 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('campaign.form.title')}
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="category"
                control={control}
                rules={{ required: t('common.categoryRequired') }}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>{t('campaign.form.category')}</InputLabel>
                    <Select {...field} label={t('campaign.form.category')}>
                      <MenuItem value="leukemia">{t('campaign.categories.leukemia')}</MenuItem>
                      <MenuItem value="medical">{t('campaign.categories.medical')}</MenuItem>
                      <MenuItem value="education">{t('campaign.categories.education')}</MenuItem>
                      <MenuItem value="startup">{t('campaign.categories.startup')}</MenuItem>
                      <MenuItem value="agriculture">{t('campaign.categories.agriculture')}</MenuItem>
                      <MenuItem value="emergency">{t('campaign.categories.emergency')}</MenuItem>
                      <MenuItem value="social-cause">{t('campaign.categories.socialCause')}</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="targetAmount"
                control={control}
                rules={{ required: t('common.amountRequired'), min: 1000 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('campaign.form.goal')}
                    type="number"
                    error={!!errors.targetAmount}
                    helperText={errors.targetAmount?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="shortDescription"
                control={control}
                rules={{ required: true, maxLength: 500 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('shortDescription')}
                    multiline
                    rows={2}
                    error={!!errors.shortDescription}
                    helperText={`${500 - (field.value?.length || 0)} characters remaining`}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                rules={{ required: t('common.descRequired'), minLength: 200 }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('campaign.form.story')}
                    multiline
                    rows={6}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="deadline"
                control={control}
                rules={{ required: t('common.deadlineRequired') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('campaign.form.deadline')}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    error={!!errors.deadline}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="urgency"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>{t('common.urgencyLabel')}</InputLabel>
                    <Select {...field} label={t('common.urgencyLabel')}>
                      <MenuItem value="low">{t('common.low')}</MenuItem>
                      <MenuItem value="medium">{t('common.medium')}</MenuItem>
                      <MenuItem value="high">{t('common.high')}</MenuItem>
                      <MenuItem value="critical">{t('common.critical')}</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Controller
                    name="isUrgent"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onChange={(e) => field.onChange(e.target.checked)} />
                    )}
                  />
                }
                label={t('campaign.form.urgent')}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Controller
                name="location.city"
                control={control}
                rules={{ required: t('common.cityRequired') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('profile.city')}
                    error={!!errors.location?.city}
                    helperText={errors.location?.city?.message}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Controller
                name="location.state"
                control={control}
                rules={{ required: t('common.stateRequired') }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('profile.state')}
                    error={!!errors.location?.state}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t('campaign.supportingDocuments')}
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
              disabled={existingDocuments.length + uploadedDocuments.length >= 10}
            >
              {t('campaign.uploadDocuments')}
              <input
                type="file"
                hidden
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleDocumentUpload}
              />
            </Button>
            <Typography variant="caption" sx={{ ml: 2 }}>
              {t('campaign.maxFiles')}
            </Typography>

            {existingDocuments.length > 0 && (
              <List dense sx={{ mt: 2 }}>
                {existingDocuments.map((doc, i) => (
                  <ListItem
                    key={doc.publicId || i}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => removeDocument(i, true)}>
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={doc.name || `${t('campaign.documentsCount')} ${i + 1}`}
                      secondary={doc.type}
                    />
                  </ListItem>
                ))}
              </List>
            )}

            {uploadedDocuments.length > 0 && (
              <List dense sx={{ mt: 1 }}>
                {uploadedDocuments.map((doc, i) => (
                  <ListItem
                    key={`new-${i}`}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => removeDocument(i, false)}>
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={doc.name} secondary={doc.type} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={() => navigate('/dashboard')}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="contained"
              type="submit"
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : null}
            >
              {saving ? t('campaign.saving') : t('common.save')}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CampaignEdit;