import React, { useState } from 'react';
import {
  Container,
  Typography,  
  Box,
  Grid,
  Paper,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  CardMedia,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  Switch,
  CircularProgress
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Upload as UploadIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

import { campaignAPI } from '../../services/campaignService';
import { showSnackbar } from '../../redux/slices/uiSlice';
import { useDispatch } from 'react-redux';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const steps = ['campaign basicInfo', 'campaign Details', 'campaign Images', 'campaign supporting Documents', 'campaign review'];

const CampaignCreate = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [coverImage, setCoverImage] = useState(null);

  const defaultFormValues = {
    title: '',
    category: '',
    shortDescription: '',
    description: '',
    targetAmount: '',
    deadline: '',
    urgency: 'medium',
    isUrgent: false,
    patientDetails: { name: '', age: '', gender: '', relationship: '' },
    medicalDetails: { hospitalName: '', doctorName: '', diagnosis: '', treatmentPlan: '' },
    educationDetails: { institutionName: '', courseName: '', academicYear: '', reasonForNeed: '' },
    startupDetails: { businessIdea: '', businessPlan: null, marketPotential: '', expectedGrowth: '' },
    agricultureDetails: { farmSize: '', cropType: '', lossReason: '', requiredSupport: '' },
    emergencyDetails: { emergencyType: '', description: '', immediateNeed: '' },
    socialCauseDetails: { causeType: '', beneficiaries: '', impactDescription: '' },
    location: { city: '', state: '', country: 'India' }
  };

  const defaultCategory = '';

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: defaultFormValues
  });

  const watchCategory = watch('category');

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedImages([...uploadedImages, ...files].slice(0, 10));
  };

  const removeImage = (index) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleCoverImageUpload = (e) => {
    if (e.target.files[0]) {
      setCoverImage(e.target.files[0]);
    }
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedDocuments([...uploadedDocuments, ...files].slice(0, 10));
  };

  const removeDocument = (index) => {
    setUploadedDocuments(uploadedDocuments.filter((_, i) => i !== index));
  };

  const onSubmit = async (data) => {
    setLoading(true);
    console.log('FORM DATA', data);
    console.log('DOCUMENTS', uploadedDocuments);
    console.log('COVER', coverImage);
    try {
      const formData = new FormData();

      // Append flat fields explicitly
      formData.append('title', data.title);
      formData.append('category', data.category);
      formData.append('shortDescription', data.shortDescription);
      formData.append('description', data.description);
      formData.append('targetAmount', data.targetAmount);
      formData.append('deadline', data.deadline);
      formData.append('urgency', data.urgency);
      formData.append('isUrgent', data.isUrgent);

      // Append nested objects as JSON strings
      formData.append('patientDetails', JSON.stringify(data.patientDetails));
      formData.append('medicalDetails', JSON.stringify(data.medicalDetails));
      formData.append('educationDetails', JSON.stringify(data.educationDetails));
      formData.append('startupDetails', JSON.stringify(data.startupDetails));
      formData.append('agricultureDetails', JSON.stringify(data.agricultureDetails));
      formData.append('emergencyDetails', JSON.stringify(data.emergencyDetails));
      formData.append('socialCauseDetails', JSON.stringify(data.socialCauseDetails));
      formData.append('location', JSON.stringify(data.location));

      // Append images as files
      uploadedImages.forEach((img) => {
        formData.append('images', img);
      });

      // Append documents as files
      uploadedDocuments.forEach((doc) => {
        formData.append('documents', doc);
      });

      // Append cover image as file
      if (coverImage) {
        formData.append('coverImage', coverImage);
      }

      const res = await campaignAPI.createCampaign(formData);
      dispatch(showSnackbar({ message: t('common.campaignSubmitted'), severity: 'success' }));
      navigate(`/campaign/${res.data.data._id}`);
    } catch (error) {
      console.error('Campaign creation error:', error.response?.data || error.message);
      dispatch(showSnackbar({
        message: error.response?.data?.message || t('common.campaignSubmitFailed'),
        severity: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Get category-specific fields to render
  const renderCategoryFields = () => {
    switch (watchCategory) {
      case 'medical':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <Controller
                name="medicalDetails.hospitalName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label={t('campaign.hospitalName')} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="medicalDetails.doctorName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label={t('campaign.doctorName')} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="medicalDetails.diagnosis"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label={t('campaign.diagnosis')} multiline rows={2} />
                )}
              />
            </Grid>
          </>
        );
      case 'education':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <Controller
                name="educationDetails.institutionName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label={t('campaign.collegeName')} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="educationDetails.courseName"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label={t('campaign.courseName')} />
                )}
              />
            </Grid>
          </>
        );
      case 'startup':
        return (
          <Grid item xs={12}>
            <Controller
              name="startupDetails.businessIdea"
              control={control}
              render={({ field }) => (
                <TextField {...field} fullWidth label={t('campaign.businessIdea')} multiline rows={4} />
              )}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('campaign.businessPlanHelp')}
            </Typography>
          </Grid>
        );
      case 'agriculture':
        return (
          <>
            <Grid item xs={12} sm={6}>
              <Controller
                name="agricultureDetails.farmSize"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label={t('Farm Size')} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="agricultureDetails.cropType"
                control={control}
                render={({ field }) => (
                  <TextField {...field} fullWidth label={t('Crop Type')} />
                )}
              />
            </Grid>
          </>
        );
      default:
        return null;
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Controller
                  name="title"
                  control={control}
                  rules={{ required: t('common.titleRequired') }}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label={t('campaign.form.title')} error={!!errors.title} helperText={errors.title?.message} />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: t('categoryRequired') }}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category}>
                      <InputLabel>{t('category')}</InputLabel>
                      <Select {...field} label={t('campaign.categories.category')}>
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
                  rules={{ required: t('common.amountRequired') }}
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
                  rules={{ required: t('common.shortDescRequired') }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('shortDescription')}
                      multiline
                      rows={2}
                      error={!!errors.shortDescription}
                      helperText={errors.shortDescription?.message || `${500 - (field.value?.length || 0)} characters remaining`}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: t('common.descRequired') }}
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
                      helperText={errors.deadline?.message}
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
                      <InputLabel>{t('urgencyLabel')}</InputLabel>
                      <Select {...field} label={t('urgencyLabel')}>
                        <MenuItem value="low">{t('low')}</MenuItem>
                        <MenuItem value="medium">{t('medium')}</MenuItem>
                        <MenuItem value="high">{t('high')}</MenuItem>
                        <MenuItem value="critical">{t('critical')}</MenuItem>
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
            </Grid>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>{t('Campaign Beneficiary Details')}</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="Name"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label={t('Name')} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="Age"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label={t('age')} type="number" />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>{t('genderLabel')}</InputLabel>
                      <Select {...field} label={t('genderLabel')}>
                        <MenuItem value="male">{t('male')}</MenuItem>
                        <MenuItem value="female">{t('female')}</MenuItem>
                        <MenuItem value="other">{t('other')}</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="relationship"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} fullWidth label={t('relationship')} />
                  )}
                />
              </Grid>

              {renderCategoryFields()}

              <Grid item xs={12}>
                <Controller
                  name="city"
                  control={control}
                  rules={{ required: t('cityRequired') }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('city')}
                      error={!!errors.location?.city}
                      helperText={errors.location?.city?.message}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Controller
                  name="state"
                  control={control}
                  rules={{ required: t('stateRequired') }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('state')}
                      error={!!errors.location?.state}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>{t('Campaign Images')}</Typography>

            {/* Cover Image */}
            <Box mb={3}>
              <Typography gutterBottom>{t('Cover Image')} {t()}</Typography>
              <input
                accept="image/*"
                type="file"
                onChange={handleCoverImageUpload}
                style={{ display: 'none' }}
                id="cover-image-upload"
              />
              <label htmlFor="cover-image-upload">
                <Button variant="outlined" startIcon={<UploadIcon />} component="span">
                  {t('Upload Cover Image')}
                </Button>
              </label>
              {coverImage && (
                <Box mt={2}>
                  <Typography variant="body2">{coverImage.name}</Typography>
                </Box>
              )}
            </Box>

            {/* Campaign Images */}
            <Box mb={3}>
              <Typography gutterBottom>{t('imagesCount', { count: uploadedImages.length })}</Typography>
              <input
                accept="image/*"
                multiple
                type="file"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                id="images-upload"
              />
              <label htmlFor="images-upload">
                <Button variant="outlined" startIcon={<AddIcon />} component="span" disabled={uploadedImages.length >= 10}>
                  {t('Campaign Images')}
                </Button>
              </label>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                {uploadedImages.map((img, idx) => (
                  <Grid item xs={4} sm={3} key={idx}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="100"
                        image={URL.createObjectURL(img)}
                        alt={`Upload ${idx}`}
                      />
                      <CardContent sx={{ p: 1 }}>
                        <IconButton size="small" onClick={() => removeImage(idx)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>{t('Campaign supporting Documents')}</Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {t('Documents Help')}
            </Typography>

            <input
              accept=".pdf,.doc,.docx,image/*,.mp4,.mov"
              multiple
              type="file"
              onChange={handleDocumentUpload}
              style={{ display: 'none' }}
              id="documents-upload"
            />
            <label htmlFor="documents-upload">
              <Button variant="outlined" startIcon={<UploadIcon />} component="span">
                {t('Upload Documents')}
              </Button>
            </label>

            <Box sx={{ mt: 2 }}>
              {uploadedDocuments.map((doc, idx) => (
                <Paper key={idx} sx={{ p: 2, mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2">{doc.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {(doc.size / 1024).toFixed(1)} KB
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => removeDocument(idx)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Paper>
              ))}
            </Box>
          </Box>
        );

      case 4:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>{t('Campaign review')}</Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h5">{watch('title') || t('Untitled Campaign')}</Typography>
              <Chip label={t(`Campaign Categories.${watch('category')}`)} size="small" sx={{ mt: 1 }} />

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" gutterBottom>{t('Goal')}: ₹{watch('Target Amount')}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('Deadline')}: {new Date(watch('Deadline')).toLocaleDateString()}
              </Typography>

              <Typography variant="body1" paragraph>
                {watch('description')}
              </Typography>

              {watchCategory === 'medical' && watch('Hospital Name') && (
                <Box>
                  <Typography variant="subtitle2">{t('Medical Details')}</Typography>
                  <Typography variant="body2">{t('Hospital Name')}: {watch('Hospital Name')}</Typography>
                </Box>
              )}
            </Paper>

            <Alert severity="info">
              {t('Review after submit')}
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
<Typography variant="h3" gutterBottom align="center" sx={{ fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2rem' } }}>
         {t('Start')}
       </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label, idx) => (
          <Step key={idx}>
            <StepLabel>{t(label)}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        {renderStepContent(activeStep)}

<Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, justifyContent: 'space-between', mt: 4, gap: 2 }}>
           <Button disabled={activeStep === 0} onClick={handleBack} fullWidth={ isMobile }>
             {t('Back')}
           </Button>
           <Box>
             {activeStep === steps.length - 1 ? (
               <Button
                 variant="contained"
                 onClick={handleSubmit(onSubmit)}
                 disabled={loading}
                 startIcon={loading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                 fullWidth={ isMobile }
               >
                 {t('Submit')}
               </Button>
             ) : (
               <Button variant="contained" onClick={handleNext} fullWidth={ isMobile }>
                 {t('Next')}
               </Button>
             )}
           </Box>
         </Box>
      </Paper>
    </Container>
  );
};

export default CampaignCreate;