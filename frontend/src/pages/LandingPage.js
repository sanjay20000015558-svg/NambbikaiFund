import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Avatar,
  Skeleton,
  Stack,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import CampaignCard from '../components/Campaign/CampaignCard';
import { campaignAPI } from '../services/campaignService';
import { formatCurrency } from '../utils/formatCurrency';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { t } = useTranslation();

  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await campaignAPI.getCampaigns({ limit: 4 });
      setFeaturedCampaigns(res.data.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 3, color: 'primary.main' }} />
          <Typography variant="body1" color="text.secondary">
            {t('loading')}
          </Typography>
        </Box>
      </Box>
    );
  }

return (
    <>
      {/* HERO SECTION - Emotional storytelling */}
      <Box
        sx={{
          minHeight: { xs: '90vh', md: '100vh' },
          display: 'flex',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #EAF7F8 0%, #ffffff 50%, #EAF7F8 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Organic blobs */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37, 99, 235, 0.08) 0%, transparent 70%)',
            filter: 'blur(60px)',
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '10%',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13, 148, 136, 0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
            zIndex: 0,
          }}
        />

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Grid container spacing={6} alignItems="center">
            {/* Hero text */}
            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <Chip
                  label={t('home.heroBadge')}
                  sx={{
                    bgcolor: 'rgba(47, 124, 123, 0.1)',
                    color: '#2F7C7B',
                    fontWeight: 700,
                    border: '1px solid rgba(47, 124, 123, 0.2)',
                  }}
                />

                <Typography
                  variant="h1"
                  component="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.25rem', md: '4rem' },
                    fontWeight: 800,
                    lineHeight: 1.15,
                    mb: 3,
                    color: '#24343A',
                  }}
                >
                  {t('home.heroLine1')}
                  <Box component="span" sx={{ display: 'block', color: '#2F7C7B' }}>
                    {t('home.heroLine2')}
                  </Box>
                </Typography>

                <Typography
                  variant="h5"
                  sx={{
                    mb: 5,
                    color: '#7A8A91',
                    fontWeight: 500,
                    lineHeight: 1.7,
                    maxWidth: 580,
                    fontSize: { xs: '1.1rem', sm: '1.35rem' },
                  }}
                >
                  {t('home.heroSubtitle')}
                </Typography>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 2, sm: 3 }}
                  sx={{ mb: 5 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/campaigns')}
                    sx={{
                      px: { xs: 4, md: 6 },
                      py: 2,
                      fontSize: { xs: '1.1rem', md: '1.2rem' },
                      fontWeight: 800,
                       background: '#2F7C7B',
                       boxShadow: '0 8px 28px rgba(47, 124, 123, 0.35)',
                       '&:hover': {
                         background: '#245555',
                         boxShadow: '0 12px 36px rgba(47, 124, 123, 0.45)',
                         transform: 'translateY(-3px)',
                       },
                    }}
                  >
                    {t('donate')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/start-campaign')}
                    sx={{
                      px: { xs: 4, md: 6 },
                      py: 2,
                      fontSize: { xs: '1.1rem', md: '1.2rem' },
                      fontWeight: 700,
                       borderColor: '#7FC6CC',
                       borderWidth: 2,
                       color: '#2F7C7B',
                       '&:hover': {
                         borderColor: '#2F7C7B',
                         bgcolor: 'rgba(47, 124, 123, 0.04)',
                         transform: 'translateY(-3px)',
                       },
                    }}
                  >
                    {t('home.startCampaign')}
                  </Button>
                </Stack>
              </motion.div>
            </Grid>

            {/* Hero illustration */}
            <Grid item xs={12} lg={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
              >
                <Box
                  component="img"
                  src="/images/hero-illustration.svg"
                  alt="Hope and compassion illustration"
                  sx={{
                    width: '100%',
                    maxWidth: 600,
                    display: 'block',
                    mx: 'auto',
                    filter: 'drop-shadow(0 24px 40px rgba(15, 23, 42, 0.15))',
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FEATURED LEUKEMIA CAMPAIGNS */}
      <Box id="featured-campaigns" sx={{ py: { xs: 10, md: 14 }, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'flex-end' },
                mb: { xs: 4, md: 6 },
                gap: 2,
              }}
            >
              <Box>
                <Chip
                  label={t('home.featuredBadge')}
                  sx={{
                    mb: 2,
                    bgcolor: 'rgba(47, 124, 123, 0.1)',
                    color: '#2F7C7B',
                    fontWeight: 700,
                    border: '1px solid rgba(47, 124, 123, 0.2)',
                  }}
                />
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                    fontWeight: 800,
                    lineHeight: 1.2,
                    mb: 2,
                  }}
                >
                  {t('home.featuredTitle')}
                </Typography>
                <Typography variant="body1" sx={{ color: '#7A8A91', maxWidth: 500 }}>
                  {t('home.featuredSubtitle')}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                component={Link}
                to="/campaigns?category=leukemia"
                sx={{
                   alignSelf: { xs: 'stretch', sm: 'flex-end' },
                   borderColor: '#7FC6CC',
                   borderWidth: 2,
                   color: '#2F7C7B',
                   fontWeight: 700,
                   px: 4,
                   py: 1.5,
                   '&:hover': {
                     bgcolor: 'rgba(47, 124, 123, 0.04)',
                     borderWidth: 2,
                     transform: 'translateY(-2px)',
                   },
                }}
              >
                {t('home.viewAllCampaigns')}
              </Button>
            </Box>

            <Grid container spacing={4}>
              {featuredCampaigns.length > 0 ? (
                featuredCampaigns.map((campaign, index) => (
                  <Grid item xs={12} sm={6} md={3} key={campaign._id}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <CampaignCard campaign={campaign} />
                    </motion.div>
                  </Grid>
                ))
              ) : (
                <Grid item xs={12}>
                  <Box
                    sx={{
                      py: 8,
                      textAlign: 'center',
                      bgcolor: 'background.default',
                      borderRadius: 4,
                      border: '2px dashed',
                       borderColor: '#7FC6CC',
                    }}
                  >
                    <Typography variant="h4" sx={{ mb: 2, color: '#7A8A91' }}>
                      {t('home.noCampaigns')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#7A8A91', mb: 4 }}>
                      {t('home.beFirst')}
                    </Typography>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => navigate('/start-campaign')}
                      sx={{
                       background: 'linear-gradient(135deg, #2F7C7B 0%, #5BA8B3 100%)',
                       '&:hover': {
                         background: 'linear-gradient(135deg, #4a9a98 0%, #7FC6CC 100%)',
                        },
                      }}
                    >
                      {t('home.startCampaign')}
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* HOW IT WORKS - Trust & Clarity */}
      <Box
        id="how-it-works"
        sx={{
          py: { xs: 12, md: 16 },
          background: '#EAF7F8',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              align="center"
              sx={{
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
                fontWeight: 800,
                mb: { xs: 3, md: 5 },
                 background: 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)',
                 backgroundClip: 'text',
                 WebkitBackgroundClip: 'text',
                 WebkitTextFillColor: 'transparent',
              }}
            >
              {t('home.howItWorks')}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              align="center"
              sx={{
                mb: { xs: 8, md: 12 },
                maxWidth: 600,
                mx: 'auto',
                fontWeight: 500,
              }}
            >
              {t('home.howItWorksSubtitle')}
            </Typography>

<Grid container spacing={{ xs: 4, md: 6 }}>
              {[
                {
                  step: '01',
                  icon: '📝',
                  title: t('home.step1Title'),
                  desc: t('home.step1Desc'),
                  color: '#2F7C7B',
                },
                {
                  step: '02',
                  icon: '📢',
                  title: t('home.step2Title'),
                  desc: t('home.step2Desc'),
                  color: '#5BA8B3',
                },
                {
                  step: '03',
                  icon: '💰',
                  title: t('home.step3Title'),
                  desc: t('home.step3Desc'),
                  color: '#4a9a98',
                },
              ].map((step, idx) => (
               <Grid item xs={12} md={4} key={idx}>
                 <motion.div
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5, delay: idx * 0.15 }}
                   viewport={{ once: true }}
                 >
<Box
                      sx={{
                        position: 'relative',
                        p: { xs: 3, md: 4 },
                        height: '100%',
                        minHeight: 240,
                        borderRadius: 4,
                        bgcolor: '#ffffff',
                        border: '1px solid rgba(36, 52, 58, 0.08)',
                        boxShadow: '0 4px 16px rgba(36, 52, 58, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'all 0.35s ease',
                       '&:hover': {
                         transform: 'translateY(-8px)',
                          boxShadow: '0 10px 30px rgba(36, 52, 58, 0.1)',
                          borderColor: step.color,
                       },
                      }}
                    >
                    {/* Step number */}
                    <Typography
                      variant="h1"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: 20,
                        fontSize: '4.5rem',
                        fontWeight: 800,
                         color: 'rgba(36, 52, 58, 0.04)',
                        lineHeight: 1,
                        pointerEvents: 'none',
                      }}
                    >
                      {step.step}
                    </Typography>

                    {/* Icon */}
                    <Box
                      sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: `${step.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.5rem',
                        mb: 3,
                        border: `2px solid ${step.color}30`,
                      }}
                    >
                      {step.icon}
                    </Box>

                    <Typography
                      variant="h4"
                      sx={{
                        mb: 2,
                        fontWeight: 700,
                        color: step.color,
                        minHeight: '4.5rem',
                      }}
                    >
                      {step.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, minHeight: '3.4rem' }}>
                      {step.desc}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>
    </Box>

      {/* DONATION IMPACT */}
      <Box
        id="impact"
        sx={{
          py: { xs: 10, md: 14 },
          bgcolor: '#ffffff',
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Box
              sx={{
                textAlign: 'center',
                mb: 6,
              }}
            >
              <Chip
                label={t('home.impactBadge')}
                sx={{
                  mb: 3,
                  bgcolor: 'rgba(47, 124, 123, 0.1)',
                  color: '#2F7C7B',
                  fontWeight: 700,
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
                  fontWeight: 800,
                  mb: 3,
                }}
              >
                {t('home.impactTitle')}
              </Typography>
              <Typography variant="h6" sx={{ color: '#7A8A91', maxWidth: 600, mx: 'auto' }}>
                {t('home.impactSubtitle')}
              </Typography>
            </Box>

            <Grid container spacing={3}>
              {[
                {
                  amount: '₹500',
                  impact: t('home.impact500'),
                  icon: '💊',
                },
                {
                  amount: '₹1,000',
                  impact: t('home.impact1000'),
                  icon: '🩸',
                },
                {
                  amount: '₹5,000',
                  impact: t('home.impact5000'),
                  icon: '🏥',
                },
                {
                  amount: '₹10,000',
                  impact: t('home.impact10000'),
                  icon: '❤️‍🩹',
                },
              ].map((item, idx) => (
                <Grid item xs={6} sm={3} key={idx}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      sx={{
                        textAlign: 'center',
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid rgba(36, 52, 58, 0.08)',
                        bgcolor: '#ffffff',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 24px rgba(36, 52, 58, 0.1)',
                          borderColor: '#2F7C7B',
                        },
                      }}
                    >
                      <Box sx={{ fontSize: 40, mb: 2 }}>{item.icon}</Box>
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 800,
                          color: '#2F7C7B',
                          mb: 1,
                        }}
                      >
                        {item.amount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.impact}
                      </Typography>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 6 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/campaigns')}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                   background: 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)',
                   '&:hover': {
                     background: 'linear-gradient(135deg, #4a9a98 0%, #5BA8B3 100%)',
                     transform: 'translateY(-2px)',
                     boxShadow: '0 8px 24px rgba(37, 99, 235, 0.35)',
                   },
                }}
              >
                {t('home.startDonating')}
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* FINAL CTA */}
      <Box
        sx={{
          py: { xs: 12, md: 16 },
          background: 'linear-gradient(135deg, #2F7C7B 0%, #5BA8B3 100%)',
          color: '#ffffff',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 60%)',
            animation: 'rotate 30s linear infinite',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 800,
                mb: 3,
                textShadow: '0 2px 10px rgba(0,0,0,0.15)',
              }}
            >
              {t('home.finalCtaTitle')}
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 6,
                opacity: 0.95,
                fontSize: { xs: '1.1rem', sm: '1.25rem' },
                maxWidth: 600,
                mx: 'auto',
                lineHeight: 1.6,
              }}
            >
              {t('home.finalCtaSubtitle')}
            </Typography>
<Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 3 }}
              justifyContent="center"
            >
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/campaigns')}
                sx={{
                  px: { xs: 5, md: 8 },
                  py: 2.5,
                  fontSize: { xs: '1.1rem', md: '1.2rem' },
                  fontWeight: 800,
                   background: 'linear-gradient(135deg, #7FC6CC 0%, #A6DCE3 100%)',
                   color: '#24343A',
                   boxShadow: '0 12px 36px rgba(47, 124, 123, 0.4)',
                   '&:hover': {
                     background: 'linear-gradient(135deg, #A6DCE3 0%, #7FC6CC 100%)',
                     boxShadow: '0 16px 48px rgba(47, 124, 123, 0.5)',
                    transform: 'translateY(-3px)',
                   },
                }}
              >
                {t('home.donateToPatient')}
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate('/start-campaign')}
                sx={{
                  px: { xs: 5, md: 8 },
                  py: 2.5,
                  fontSize: { xs: '1.1rem', md: '1.2rem' },
                  fontWeight: 700,
                  color: '#ffffff',
                  borderColor: '#ffffff',
                  borderWidth: 2,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderWidth: 2,
                    transform: 'translateY(-3px)',
                  },
                }}
              >
                {t('home.startCampaign')}
              </Button>
            </Stack>
          </motion.div>
        </Container>
      </Box>

{/* TRUST BAR - Transparency & Safety */}
      <Box
        sx={{
          bgcolor: 'white',
          py: 2,
          borderTop: '1px solid rgba(15, 23, 42, 0.06)',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 3, sm: 6 }}
            justifyContent="center"
            alignItems="center"
          >
            {[
              { icon: '🔒', text: t('home.secureEncrypted') },
              { icon: '💯', text: t('home.verifiedCampaigns') },
              { icon: '📊', text: t('home.fullTransparency') },
              { icon: '⚡', text: t('home.instantTransfer') },
            ].map((item, idx) => (
              <Stack key={idx} direction="row" alignItems="center" spacing={1}>
                <Box component="span" sx={{ fontSize: 20 }}>{item.icon}</Box>
                 <Typography variant="body2" sx={{ fontWeight: 600, color: '#7A8A91' }}>
                  {item.text}
                </Typography>
              </Stack>
            ))}
</Stack>
        </Container>
      </Box>
    </>
  );
};

export default LandingPage;