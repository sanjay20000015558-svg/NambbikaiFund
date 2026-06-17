import React, { useEffect, useState } from 'react';
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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
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
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Favorite,
  Share,
  AccessTime,
  Groups,
  CheckCircle,
  Description
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { campaignAPI } from '../../services/campaignService';
import { donationAPI } from '../../services/donationService';
import { updateCampaign } from '../../redux/slices/campaignSlice';
import { addDonation } from '../../redux/slices/donationSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';

const presetAmounts = [100, 500, 1000, 5000];

const CampaignDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showLoading, hideLoading } = useLoading();
  const { markOneAsRead, markAllAsRead } = useNotification();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [donationDialogOpen, setDonationDialogOpen] = useState(false);
  const [donationStep, setDonationStep] = useState(0);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentOrder, setPaymentOrder] = useState(null);
  const [processing, setProcessing] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const donationForm = useForm({
    defaultValues: {
      amount: '',
      isAnonymous: false,
      dedicatedTo: '',
      message: ''
    }
  });

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const res = await campaignAPI.getCampaign(id);
      setCampaign(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || t('campaign.notFound'));
    } finally {
      setLoading(false);
    }
  };

  const handleDonateClick = () => {
    if (!campaign) return;

    if (campaign.status !== 'approved') {
      dispatch(showSnackbar({ message: t('campaign.notAcceptingDonations'), severity: 'warning' }));
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/campaign/${id}` } } });
      return;
    }

    setDonationDialogOpen(true);
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    donationForm.setValue('amount', amount);
  };

  const handleCustomAmount = (e) => {
    const value = e.target.value;
    setCustomAmount(value);
    if (value) {
      setSelectedAmount('custom');
      donationForm.setValue('amount', parseFloat(value));
    }
  };

  const handleProceedToPayment = async (data) => {
    if (!data.amount) {
      dispatch(showSnackbar({ message: t('donation.selectAmountError'), severity: 'error' }));
      return;
    }

    if (parseFloat(data.amount) < 1) {
      dispatch(showSnackbar({ message: t('donation.minimumAmount'), severity: 'error' }));
      return;
    }

    setDonationStep(1);
    showLoading(t('payment.processingPayment'));

    try {
      // Create payment order
      const res = await donationAPI.createOrder({
        campaignId: campaign._id,
        amount: parseFloat(data.amount),
        isAnonymous: data.isAnonymous,
        dedicatedTo: data.dedicatedTo,
        message: data.message
      });

      setPaymentOrder(res.data.data || res.data);
      hideLoading();

      // Redirect to Razorpay checkout with amount and donor info
      const checkoutUrl = `/payment/checkout?orderId=${res.data.data?.orderId || res.data.orderId}&amount=${data.amount}&donorName=${encodeURIComponent(user?.fullName || 'Anonymous')}&donorEmail=${encodeURIComponent(user?.email || '')}`;
      window.location.href = checkoutUrl;
    } catch (error) {
      hideLoading();
      dispatch(showSnackbar({ message: t('campaign.createPaymentFailed'), severity: 'error' }));
    }
  };

  const handlePaymentSuccess = async (data) => {
    try {
      const res = await donationAPI.verifyPayment({
        ...data,
        donationId: paymentOrder?.donationId,
        donorName: user.fullName,
        donorEmail: user.email
      });

      dispatch(addDonation(res.data));
      setDonationDialogOpen(false);
      setDonationStep(0);
      setPaymentOrder(null);

      // Refresh campaign data
      fetchCampaign();

      dispatch(showSnackbar({
        message: t('donation.thankYou'),
        severity: 'success'
      }));

      // Send notification to campaign creator (handled by backend)
    } catch (error) {
      dispatch(showSnackbar({
        message: t('payment.verificationFailed'),
        severity: 'error'
      }));
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!campaign) {
    return null;
  }

  const progress = Math.round((campaign.amountRaised / campaign.targetAmount) * 100);
  const daysLeft = Math.max(0, Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Main content */}
        <Grid item xs={12} md={8}>
          {/* Cover image */}
          {campaign.coverImage?.url && (
            <Box
              component="img"
              src={campaign.coverImage.url}
              alt={campaign.title}
              sx={{
                width: '100%',
                height: { xs: 200, md: 400 },
                objectFit: 'cover',
                borderRadius: 2,
                mb: 4
              }}
            />
          )}

          {/* Title and stats */}
          <Box sx={{ mb: 4 }}>
            <Box display="flex" alignItems="flex-start" gap={2} mb={2}>
              <Typography variant="h3" component="h1" sx={{ flexGrow: 1 }}>
                {campaign.title}
              </Typography>
              {campaign.status === 'live' && campaign.verifiedBy && (
                <Chip icon={<CheckCircle />} label={t('common.verified')} color="success" />
              )}
            </Box>

            <Stack direction="row" spacing={2} mb={3}>
              <Chip label={t(`campaign.categories.${campaign.category}`)} />
              {campaign.isUrgent && (
                <Chip label={t('common.urgent')} color="error" />
              )}
            </Stack>

            <Box display="flex" gap={4}>
              <Box>
                <Typography variant="h4" color="primary">
                  ₹<CountUp end={campaign.amountRaised} separator="," duration={1.5} />
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('campaign.raised')} of ₹{campaign.targetAmount.toLocaleString('en-IN')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4">{campaign.donorsCount}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('campaign.donors')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4">{daysLeft}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('campaign.daysLeft')}
                </Typography>
              </Box>
            </Box>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 10,
                borderRadius: 5,
                mt: 2,
                bgcolor: 'grey.200'
              }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {progress}% funded
            </Typography>
          </Box>

          {/* Creator info */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              {t('campaign.fundraiserBy')} {campaign.creatorName}
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar src={campaign.creator?.profilePicture?.url} />
              <Box>
                <Typography>{campaign.creatorName}</Typography>
                {campaign.creator?.isVerified && (
                  <Typography variant="body2" color="success.main">
                    {t('campaign.verifiedUser')}
                  </Typography>
                )}
              </Box>
            </Box>
          </Paper>

          {/* Tabs */}
          <Paper sx={{ mb: 4 }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label={t('campaign.story')} />
              <Tab label={t('campaign.updates')} />
              <Tab label={t('campaign.donorsList')} />
            </Tabs>

            <Divider />

            <Box sx={{ p: 3 }}>
              {activeTab === 0 && (
                <Box>
                  <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ 
                      wordBreak: 'break-word', 
                      overflowWrap: 'anywhere',
                      maxWidth: '100%',
                      overflowX: 'hidden',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {campaign.description}
                  </Typography>

                  {/* Medical details if relevant */}
                  {campaign.category === 'medical' && campaign.medicalDetails && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="h6" gutterBottom>{t('campaign.medicalDetails')}</Typography>
                      {campaign.medicalDetails.hospitalName && (
                        <Typography sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}><strong>{t('campaign.hospitalName')}:</strong> {campaign.medicalDetails.hospitalName}</Typography>
                      )}
                      {campaign.medicalDetails.doctorName && (
                        <Typography sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}><strong>{t('campaign.doctorName')}:</strong> {campaign.medicalDetails.doctorName}</Typography>
                      )}
                      {campaign.medicalDetails.diagnosis && (
                        <Typography sx={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}><strong>{t('campaign.diagnosis')}:</strong> {campaign.medicalDetails.diagnosis}</Typography>
                      )}
                    </Box>
                  )}
                </Box>
              )}

              {activeTab === 1 && (
                <Box>
                  {campaign.updates?.length > 0 ? (
                    campaign.updates.map((update, idx) => (
                      <Paper key={idx} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="subtitle1">{update.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {new Date(update.postedAt).toLocaleDateString()}
                        </Typography>
                        <Typography>{update.content}</Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography color="text.secondary">{t('campaign.noUpdates')}</Typography>
                  )}
                </Box>
              )}

              {activeTab === 2 && (
                <Box>
                  <Typography color="text.secondary">
                    {t('campaign.donorListPlaceholder')}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Donation Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              position: 'sticky',
              top: 100
            }}
          >
            <Typography variant="h5" color="primary" gutterBottom>
              ₹{campaign.amountRaised.toLocaleString('en-IN')}
              <Typography component="span" variant="body2" color="text.secondary">
                {' '}{t('campaign.raised')} of ₹{campaign.targetAmount.toLocaleString('en-IN')}
              </Typography>
            </Typography>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4, mb: 2 }}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleDonateClick}
              disabled={campaign.status !== 'approved'}
              sx={{ mb: 2 }}
            >
              {campaign.status === 'approved' ? t('campaign.donateNow') : t('campaign.campaignClosed')}
            </Button>

            <Box display="flex" justifyContent="center" gap={1}>
              <IconButton>
                <Share />
              </IconButton>
              <IconButton>
                <Favorite />
              </IconButton>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Campaign details */}
            {campaign.location && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  📍 {campaign.location.city}, {campaign.location.state}
                </Typography>
              </Box>
            )}

            {daysLeft > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTime color={daysLeft < 7 ? 'error' : 'action'} />
                <Typography color={daysLeft < 7 ? 'error' : 'text.secondary'}>
                  {daysLeft} {t('campaign.daysRemaining')}
                </Typography>
              </Box>
            )}

            {campaign.status === 'live' && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {t('campaign.taxExempt')}
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Donation Dialog */}
      <Dialog
        open={donationDialogOpen}
        onClose={() => {
          setDonationDialogOpen(false);
          setDonationStep(0);
        }}
        maxWidth="sm"
        fullWidth
      >
        {donationStep === 0 && (
          <>
            <DialogTitle>{t('campaign.makeDonation')}</DialogTitle>
            <DialogContent>
              <form onSubmit={donationForm.handleSubmit(handleProceedToPayment)}>
                {/* Amount selection */}
                <Typography gutterBottom>{t('donation.selectAmount')}</Typography>
                <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                  {presetAmounts.map((amt) => (
                    <Button
                      key={amt}
                      variant={selectedAmount === amt ? 'contained' : 'outlined'}
                      onClick={() => handleAmountSelect(amt)}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </Button>
                  ))}
                  <TextField
                    label={t('donation.custom')}
                    type="number"
                    size="small"
                    value={customAmount}
                    onChange={handleCustomAmount}
                    sx={{ width: 120 }}
                    inputProps={{ min: 1 }}
                  />
                </Box>

                {/* Message */}
                <Controller
                  name="message"
                  control={donationForm.control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('donation.addMessage')}
                      multiline
                      rows={2}
                      sx={{ mb: 2 }}
                    />
                  )}
                />

                {/* Options */}
                <FormControlLabel
                  control={
                    <Controller
                      name="isAnonymous"
                      control={donationForm.control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      )}
                    />
                  }
                  label={t('donation.anonymous')}
                />
              </form>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDonationDialogOpen(false)}>{t('common.close')}</Button>
              <Button
                variant="contained"
                onClick={donationForm.handleSubmit(handleProceedToPayment)}
              >
                {t('donation.proceed')}
              </Button>
            </DialogActions>
          </>
        )}

        {donationStep === 1 && paymentOrder && (
          <>
            <DialogTitle>{t('payment.completeDonation')}</DialogTitle>
            <DialogContent>
              <Alert severity="info" sx={{ mb: 3 }}>
                {t('payment.redirectToRazorpay', { amount: paymentOrder.amountInRupees })}
              </Alert>
              {/* In a production app, include Razorpay checkout JS here */}
              <Typography>
                {t('payment.proceedPrompt', { amount: paymentOrder.amountInRupees, title: campaign.title })}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDonationStep(0)}>{t('common.back')}</Button>
              <Button
                variant="contained"
                onClick={() => {
                  // For demo, simulate success
                  handlePaymentSuccess({
                    donationId: paymentOrder.donationId,
                    amount: paymentOrder.amountInRupees
                  });
                }}
              >
                {t('payment.continueRazorpay')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default CampaignDetail;