import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

import { donationAPI } from '../../services/donationService';
import { addDonation } from '../../redux/slices/donationSlice';
import { showSnackbar } from '../../redux/slices/uiSlice';

const PaymentResponse = () => {
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const dispatch = useDispatch();
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

   const [status, setStatus] = useState('processing'); // processing, success, failed
   const [message, setMessage] = useState('');

  const orderId = searchParams.get('order_id');
  const paymentId = searchParams.get('payment_id');
  const signature = searchParams.get('signature');

  useEffect(() => {
    processPayment();
  }, [orderId, paymentId, signature]);

  const processPayment = async () => {
    try {
      // Verify payment with Razorpay signature
      const res = await donationAPI.verifyPayment({
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature
      });

      dispatch(addDonation(res.data));
      setStatus('success');
      setMessage('Thank you for your generous donation!');

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      setStatus('failed');
      setMessage('Payment verification failed. Please contact support.');
    }
  };

return (
     <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
       <Paper sx={{ p: { xs: 3, md: 6 }, textAlign: 'center' }}>
         {status === 'processing' && (
           <>
             <CircularProgress size={60} sx={{ mb: 3, width: { xs: 48, md: 60 } }} />
             <Typography variant="h5" gutterBottom sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}>
               Processing Your Payment...
             </Typography>
             <Typography color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
               Please wait while we confirm your donation.
             </Typography>
           </>
         )}

         {status === 'success' && (
           <>
             <CheckCircleIcon sx={{ fontSize: { xs: 60, md: 80 }, color: 'success.main', mb: 2 }} />
             <Typography variant="h4" color="success.main" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
               Payment Successful!
             </Typography>
             <Typography variant="body1" paragraph sx={{ fontSize: { xs: '0.95rem', md: '1rem' } }}>
               {message}
             </Typography>
             <Button
               variant="contained"
               onClick={() => navigate('/dashboard')}
               sx={{ mt: 2 }}
               fullWidth={ isMobile }
             >
               Go to Dashboard
             </Button>
           </>
         )}

         {status === 'failed' && (
           <>
             <ErrorIcon sx={{ fontSize: { xs: 60, md: 80 }, color: 'error.main', mb: 2 }} />
             <Typography variant="h4" color="error.main" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
               Payment Failed
             </Typography>
             <Typography variant="body1" paragraph sx={{ fontSize: { xs: '0.95rem', md: '1rem' } }}>
               {message}
             </Typography>
             <Button
               variant="outlined"
               onClick={() => navigate(-1)}
               sx={{ mt: 2 }}
               fullWidth={ isMobile }
             >
               Try Again
             </Button>
           </>
         )}
       </Paper>
     </Container>
   );
};

export default PaymentResponse;
