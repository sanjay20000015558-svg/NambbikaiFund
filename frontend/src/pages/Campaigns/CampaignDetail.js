import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
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
  Stack,
  TextField
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
import { useTranslation } from 'react-i18next';

import { campaignAPI } from '../../services/campaignService';
import { donationAPI } from '../../services/donationService';
import { updateCampaign } from '../../redux/slices/campaignSlice';
import { addDonation } from '../../redux/slices/donationSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { useLoading } from '../../contexts/LoadingContext';

const CampaignDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const { isAuthenticated, user } = useSelector((state) => state.auth);

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => dispatch(showSnackbar({ message: 'Failed to load Razorpay. Please refresh and try again.', severity: 'error' }));
      document.body.appendChild(script);
    });
  };

  const handleDonateClick = async () => {
    if (!campaign) return;

    if (campaign.status !== 'approved' && campaign.status !== 'live') {
      dispatch(showSnackbar({ message: t('campaign.notAcceptingDonations'), severity: 'warning' }));
      return;
    }

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/campaign/${id}` } } });
      return;
    }

    setProcessing(true);
    try {
      if (!donationAmount || parseFloat(donationAmount) < 1) {
        dispatch(showSnackbar({ message: t('donation.enterAmount'), severity: 'warning' }));
        return;
      }
      
      const res = await donationAPI.createOrder({
        campaignId: campaign._id,
        amount: parseFloat(donationAmount),
        isAnonymous: false
      });

      const orderData = res.data.data || res.data;
      
      if (!orderData || !orderData.orderId) {
        throw new Error('Invalid order response from server');
      }

      const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID || '';
      
      if (!razorpayKey) {
        throw new Error('Razorpay key not configured');
      }

      await loadRazorpayScript();

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: 'INR',
        name: t('navbar.brand'),
        description: `Donation to ${campaign.title}`,
        order_id: orderData.orderId,
        handler: function(response) {
          handlePaymentSuccess({
            donationId: orderData.donationId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
        },
        prefill: {
          name: user?.fullName || 'Anonymous Donor',
          email: user?.email || ''
        },
        theme: { color: '#2F7C7B' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unable to create payment. Please try again.';
      dispatch(showSnackbar({ message: errorMessage, severity: 'error' }));
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentSuccess = async (data) => {
    try {
      await donationAPI.verifyPayment({
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature
      });

      fetchCampaign();
      dispatch(showSnackbar({
        message: t('donation.thankYou'),
        severity: 'success'
      }));
    } catch (error) {
      dispatch(showSnackbar({
        message: error.response?.data?.message || t('payment.verificationFailed'),
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
                  {t('campaign raised')} of ₹{campaign.targetAmount.toLocaleString('en-IN')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4">{campaign.donorsCount}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('campaign donors')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4">{daysLeft}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('campaign daysLeft')}
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
              {t('fundraiser By')} {campaign.creatorName}
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
              <Tab label={t('Story')} />
              <Tab label={t('Updates')} />
              <Tab label={t('Donors list')} />
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
                {' '}{t('campaign raised')} of ₹{campaign.targetAmount.toLocaleString('en-IN')}
              </Typography>
            </Typography>

            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 8, borderRadius: 4, mb: 2 }}
            />

            <TextField
              label={t('donation.amount')}
              type="number"
              fullWidth
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              sx={{ mb: 2 }}
              inputProps={{ min: 1, max: campaign.targetAmount - campaign.amountRaised || 10000000 }}
              helperText={t('donation.minAmount', { min: 1 })}
            />

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleDonateClick}
              disabled={campaign.status !== 'approved' && campaign.status !== 'live' || !donationAmount || parseFloat(donationAmount) < 1}
              sx={{ mb: 2 }}
            >
              {(campaign.status === 'approved' || campaign.status === 'live') ? t('Donate Now') : t('campaign.campaignClosed')}
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
                  {daysLeft} {t('daysRemaining')}
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
    </Container>
  );
};

export default CampaignDetail;