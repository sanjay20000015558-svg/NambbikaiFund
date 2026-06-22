import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  alpha
} from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

const AuthLayout = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();
  const { t } = useTranslation();

  // Redirect authenticated users (except verify/reset pages)
  if (isAuthenticated) {
    const allowedPaths = ['/verify-email', '/reset-password'];
    const isAllowed = allowedPaths.some(p => location.pathname.includes(p));
    if (!isAllowed) return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: 'linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 40%, #f0fdf4 100%)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%230d9488' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.6,
        },
      }}
    >
      {/* Warm gradient decorative blobs */}
<Box
         sx={{
           position: 'absolute',
           top: { xs: '2%', sm: '5%' },
           left: { xs: '4%', sm: '8%' },
           width: { xs: 150, sm: 200, md: 400 },
           height: { xs: 150, sm: 200, md: 400 },
           borderRadius: '50%',
           background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)',
           filter: 'blur(30px)',
           zIndex: 0,
         }}
       />
       <Box
         sx={{
           position: 'absolute',
           bottom: { xs: '5%', sm: '15%' },
           right: { xs: '4%', sm: '12%' },
           width: { xs: 200, sm: 300, md: 500 },
           height: { xs: 200, sm: 300, md: 500 },
           borderRadius: '50%',
           background: 'radial-gradient(circle, rgba(13, 148, 136, 0.1) 0%, transparent 70%)',
           filter: 'blur(50px)',
           zIndex: 0,
         }}
       />

      {/* Top-right language selector */}
      <Box sx={{ position: 'absolute', top: { xs: 20, md: 32 }, right: { xs: 20, md: 32 }, zIndex: 100 }}>
        <LanguageSelector />
      </Box>

      {/* Main centered content */}
      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 4, md: 6 },
          position: 'relative',
          zIndex: 10,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Paper
            elevation={0}
            sx={{
              width: '100%',
              padding: { xs: 4, sm: 5, md: 6 },
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08), 0 8px 24px rgba(15, 23, 42, 0.04)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'linear-gradient(90deg, #2F7C7B 0%, #7FC6CC 50%, #A6DCE3 100%)',
              },
            }}
          >
            {/* Trust badge */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 2,
                  py: 0.75,
                  borderRadius: 50,
                  bgcolor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  color: '#059669',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                <Box component="span">🔒</Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  100% Secure & Verified
                </Typography>
              </Box>
            </Box>

            {/* Brand logo & tagline */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 5 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2.5,
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.25)',
                }}
              >
                <Typography variant="h3" sx={{ color: 'white', fontWeight: 800 }}>
                  ❤
                </Typography>
              </Box>
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 800,
                    background: 'linear-gradient(135deg, #4a9a98 0%, #7FC6CC 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  fontSize: { xs: '1.75rem', sm: '2.25rem' },
                  letterSpacing: '-0.02em',
                  mb: 0.5,
                }}
              >
                Nambikkai Fund
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  fontSize: '0.85rem',
                }}
              >
                Hope for Every Patient
              </Typography>
            </Box>

            {/* Form content */}
            <Box>{children || <Outlet />}</Box>
          </Paper>
        </motion.div>
      </Container>

      {/* Bottom trust message */}
      <Box
        sx={{
          position: 'absolute',
          bottom: { xs: 16, md: 32 },
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: 'text.secondary',
          fontSize: '0.85rem',
          fontWeight: 500,
        }}
      >
        <Box component="span">🔒</Box>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          Protected by bank-grade security
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthLayout;
