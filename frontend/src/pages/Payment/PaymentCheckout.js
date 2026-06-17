import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

const PaymentCheckout = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);

  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const donorName = searchParams.get('donorName') || 'Anonymous Donor';
  const donorEmail = searchParams.get('donorEmail') || '';

  useEffect(() => {
    if (!orderId) {
      navigate('/campaigns');
      return;
    }

    setPaymentData({
      orderId,
      amount: parseFloat(amount) || 1000,
      currency: 'INR',
      donorName,
      donorEmail
    });
    setLoading(false);
  }, [orderId, navigate, amount, donorName, donorEmail]);

  const handlePayment = () => {
    const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_placeholder';

    const options = {
      key: razorpayKey,
      amount: paymentData.amount * 100, // in paise
      currency: 'INR',
      name: t('navbar.brand'),
      description: t('donation.proceed'),
      order_id: paymentData.orderId,
      handler: function(response) {
        navigate(`/payment/response?razorpay_order_id=${response.razorpay_order_id}&razorpay_payment_id=${response.razorpay_payment_id}&razorpay_signature=${response.razorpay_signature}`);
      },
      prefill: {
        name: paymentData.donorName,
        email: paymentData.donorEmail
      },
      theme: {
        color: '#2F7C7B'
      }
    };

    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
      document.body.appendChild(script);
    } else {
      const rzp = new window.Razorpay(options);
      rzp.open();
    }
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography mt={2}>{t('payment.completeDonation')}</Typography>
      </Container>
    );
  }

  if (!paymentData) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert severity="error">{t('payment.invalidPaymentRequest')}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          {t('payment.completeDonation')}
        </Typography>
        <Typography variant="h3" color="primary" my={3}>
          ₹{paymentData.amount}
        </Typography>
        <Typography color="text.secondary" mb={4}>
          {t('payment.redirectToRazorpay', { amount: paymentData.amount })}
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          {t('payment.testCardNote')}
        </Alert>

        <Button variant="contained" size="large" onClick={handlePayment} fullWidth>
          {t('payment.payWithRazorpay')}
        </Button>
      </Paper>
    </Container>
  );
};

export default PaymentCheckout;