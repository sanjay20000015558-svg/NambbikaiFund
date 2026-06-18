import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  Divider,
  Button,
  Stack,
  Avatar
} from '@mui/material';
import {
  Favorite,
  Security,
  VerifiedUser,
  Email,
  Phone,
  LocationOn,
  FavoriteBorder
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerSections = {
    platform: [
      { label: t('navigation.home'), path: '/' },
      { label: t('navigation.campaigns'), path: '/campaigns' },
      { label: t('home.howItWorks'), path: '/#how-it-works' },
      { label: t('footer.successStories'), path: '/#featured-campaigns' },
      { label: t('footer.startCampaign'), path: '/start-campaign' },
    ],
    support: [
      { label: t('footer.contactUs'), path: '/#contact' },
      { label: t('footer.terms'), path: '/terms' },
      { label: t('footer.privacy'), path: '/privacy' },
    ],
  };

  return (
    <Box
      component="footer"
       sx={{
         bgcolor: '#24343A',
         color: 'rgba(255, 255, 255, 0.7)',
         pt: { xs: 8, md: 12 },
         pb: 4,
         mt: 'auto',
         position: 'relative',
         '&::before': {
           content: '""',
           position: 'absolute',
           top: 0,
           left: 0,
           right: 0,
           height: '4px',
           background: 'linear-gradient(90deg, #2F7C7B 0%, #7FC6CC 50%, #A6DCE3 100%)',
         },
       }}
    >
      <Container maxWidth="lg">
        {/* Main footer grid */}
        <Grid container spacing={{ xs: 4, md: 6 }}>
         {/* Brand column */}
          <Grid item xs={12} md={4}>
            <Box sx={{ mb: { xs: 4, md: 0 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                 <Box
                   sx={{
                     width: 50,
                     height: 50,
                     borderRadius: '50%',
                     background: '#2F7C7B',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     boxShadow: '0 4px 12px rgba(47, 124, 123, 0.3)',
                   }}
                 >
                   <Favorite sx={{ color: 'white', fontSize: 24 }} />
                 </Box>
                 <Box>
                   <Typography
                     variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: '#2F7C7B',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.1,
                    }}
                   >
                     {t('navbar.brand')}
                   </Typography>
                   <Typography
                     variant="caption"
                     sx={{
                       color: 'rgba(255,255,255,0.5)',
                       fontSize: '0.75rem',
                       fontWeight: 600,
                       letterSpacing: '0.1em',
                       textTransform: 'uppercase',
                       mt: 0.5,
                       display: 'block',
                     }}
                   >
                     {t('navbar.tagline')}
                   </Typography>
                 </Box>
               </Box>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.7, mb: 3 }}>
                  {t('footer.brandDescription')}
                </Typography>
              <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    size="small"
                    component={RouterLink}
                    to="/start-campaign"
                    sx={{
                      background: 'linear-gradient(135deg, #7FC6CC 0%, #5BA8B3 100%)',
                      fontWeight: 700,
                      px: 3,
                      color: '#24343A',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #A6DCE3 0%, #7FC6CC 100%)',
                        boxShadow: '0 8px 20px rgba(47, 124, 123, 0.3)',
                      },
                    }}
                  >
                    {t('home.startCampaign')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    component={RouterLink}
                    to="/campaigns"
                    sx={{
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: '#ffffff',
                      '&:hover': {
                        borderColor: '#7FC6CC',
                        bgcolor: 'rgba(127, 198, 204, 0.1)',
                      },
                    }}
                  >
                    {t('donate')}
                  </Button>
                </Stack>
              </Box>
            </Grid>

          {/* Platform links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                mb: 2.5,
                color: 'white',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.8rem',
              }}
            >
              {t('footer.platform')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {footerSections.platform.map((item) => (
                <Typography
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.light' },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Support links */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                mb: 2.5,
                color: 'white',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.8rem',
              }}
            >
              {t('footer.support')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {footerSections.support.map((item) => (
                <Typography
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                    '&:hover': { color: 'primary.light' },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Contact & Trust */}
          <Grid item xs={12} sm={4} md={4}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 700,
                mb: 2.5,
                color: 'white',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                fontSize: '0.8rem',
              }}
            >
              {t('footer.contactTrust')}
            </Typography>

            {/* Trust badges */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                <Security sx={{ fontSize: 18, color: '#7FC6CC' }} />
                <Typography variant="caption">{t('footer.sslSecured')}</Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: 'rgba(255,255,255,0.7)' }}>
                <VerifiedUser sx={{ fontSize: 18, color: '#7FC6CC' }} />
                <Typography variant="caption">{t('footer.razorpay')}</Typography>
              </Stack>
            </Stack>

            {/* Contact info */}
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Email sx={{ fontSize: 16, color: '#7FC6CC' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  support@nambikkai.fund
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Phone sx={{ fontSize: 16, color: '#7FC6CC' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  +91 98765 43210
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <LocationOn sx={{ fontSize: 16, color: '#7FC6CC' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  Chennai, Tamil Nadu, India
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider
          sx={{
            my: 5,
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        />

        {/* Bottom bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', sm: 'center' },
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>
            © {currentYear} {t('navbar.brand')}. {t('footer.madeWith')} <FavoriteBorder sx={{ fontSize: 12, color: '#f43f5e', verticalAlign: 'middle' }} /> {t('footer.forHumanity')}
          </Typography>
          <Stack direction="row" spacing={3}>
            <Link component={RouterLink} to="/terms" sx={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s', '&:hover': { color: '#7FC6CC' } }}>
              <Typography variant="body2">{t('footer.terms')}</Typography>
            </Link>
            <Link component={RouterLink} to="/privacy" sx={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none', transition: 'color 0.2s', '&:hover': { color: '#7FC6CC' } }}>
              <Typography variant="body2">{t('footer.privacy')}</Typography>
            </Link>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;