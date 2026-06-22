import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Share,
  AccessTime,
  Groups,
  CheckCircle,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Link as ShareLink } from 'react-share';
import { formatCurrency, calculatePercentage } from '../../utils/formatCurrency';

const CampaignCard = ({ campaign, loading = false }) => {
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
   const navigate = useNavigate();

  if (loading || !campaign) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 0 }} />
        <CardContent sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="60%" sx={{ mb: 2 }} />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="80%" />
        </CardContent>
        <CardActions>
          <Skeleton variant="rectangular" width={150} height={44} sx={{ borderRadius: 2, mx: 2, mb: 2 }} />
        </CardActions>
      </Card>
    );
  }

  const progress = calculatePercentage(campaign.amountRaised, campaign.targetAmount);
  const deadline = new Date(campaign.deadline);
  const daysLeft = Math.max(0, Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)));
  const isUrgent = daysLeft < 7;
  const isCritical = daysLeft < 3;

  const getProgressColor = () => {
    if (isCritical) return 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)';
    if (isUrgent) return 'linear-gradient(135deg, #f59e0b 0%, #5BA8B3 100%)';
    return 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)';
  };

  const getBorderGradient = () => {
    if (isCritical) return 'linear-gradient(90deg, #ef4444, #f59e0b)';
    if (isUrgent) return 'linear-gradient(90deg, #f59e0b, #5BA8B3)';
    return 'linear-gradient(90deg, #2F7C7B, #7FC6CC)';
  };

  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{
        y: -10,
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: getBorderGradient(),
        },
      }}
      onClick={() => navigate(`/campaign/${campaign._id}`)}
    >
      {/* Image with overlay badge */}
<Box sx={{ position: 'relative', height: { xs: 180, sm: 220 }, overflow: 'hidden' }}>
         {campaign.coverImage?.url ? (
           <CardMedia
             component="img"
             image={campaign.coverImage.url}
             alt={campaign.title}
             sx={{
               height: '100%',
               transition: 'transform 0.5s ease',
               objectFit: 'cover',
               '&:hover': {
                 transform: { xs: 'none', sm: 'scale(1.05)' },
               },
             }}
             onError={(e) => {
               e.target.style.display = 'none';
               e.target.parentElement.style.background = 'linear-gradient(135deg, #e0f2fe 0%, #ccfbf1 100%)';
             }}
           />
         ) : (
           <Box
             sx={{
               height: '100%',
               background: 'linear-gradient(135deg, #e0f2fe 0%, #ccfbf1 100%)',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
             }}
           >
             <Favorite sx={{ fontSize: { xs: 48, sm: 64 }, color: 'rgba(37, 99, 235, 0.1)' }} />
           </Box>
         )}

         {/* Category chip */}
         <Chip
           label={campaign.category || 'Medical'}
           size="small"
           sx={{
             position: 'absolute',
             top: { xs: 8, sm: 12 },
             left: { xs: 8, sm: 12 },
             bgcolor: 'rgba(255,255,255,0.95)',
             fontWeight: 700,
             fontSize: { xs: '0.7rem', sm: '0.75rem' },
             letterSpacing: '0.03em',
             textTransform: 'capitalize',
             boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
             '&:hover': {
               bgcolor: 'white',
             },
           }}
         />

         {/* Verified badge */}
         {campaign.status === 'approved' && campaign.verifiedBy && (
           <Tooltip title="Verified Campaign • Trusted Platform" placement="top" arrow>
             <Box
               sx={{
                 position: 'absolute',
                 top: { xs: 8, sm: 12 },
                 right: { xs: 8, sm: 12 },
                 width: { xs: 28, sm: 32 },
                 height: { xs: 28, sm: 32 },
                 borderRadius: '50%',
                 bgcolor: 'success.main',
                 color: 'white',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                 border: '2px solid white',
               }}
             >
               <CheckCircle sx={{ fontSize: { xs: 16, sm: 18 } }} />
             </Box>
           </Tooltip>
         )}

         {/* Urgency badge (subtle) */}
         {isUrgent && (
           <Chip
             label={isCritical ? 'Urgent Support Needed' : 'Time-Sensitive'}
             size="small"
             sx={{
               position: 'absolute',
               bottom: { xs: 8, sm: 12 },
               left: { xs: 8, sm: 12 },
               bgcolor: isCritical ? 'rgba(239, 68, 68, 0.95)' : 'rgba(47, 124, 123, 0.95)',
               color: 'white',
               fontWeight: 700,
               fontSize: { xs: '0.65rem', sm: '0.7rem' },
               boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
             }}
           />
         )}
       </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
        {/* Title */}
        <Typography
          variant="h5"
          component="h3"
          sx={{
            fontWeight: 700,
            lineHeight: 1.35,
            mb: 2,
            minHeight: { xs: 56, sm: 72 },
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
             '&:hover': {
               color: '#2F7C7B',
             },
          }}
        >
          {campaign.title}
        </Typography>

        {/* Creator */}
        {campaign.creator && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
            <Avatar
              src={campaign.creator.profilePicture?.url}
              sx={{
                width: 36,
                height: 36,
                mr: 1.5,
                 border: '2px solid',
                 borderColor: '#7FC6CC',
              }}
            />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {campaign.creator.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Created this campaign
              </Typography>
            </Box>
          </Box>
        )}

        {/* Progress section */}
        <Box sx={{ mb: 2.5 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              mb: 1,
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#24343A',
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
              }}
            >
              {formatCurrency(campaign.amountRaised)}
            </Typography>
             <Typography variant="body2" sx={{ color: '#7A8A91', fontWeight: 500 }}>
              raised of {formatCurrency(campaign.targetAmount)}
            </Typography>
          </Box>

          {/* Progress bar */}
          <Box
            sx={{
               height: 12,
               borderRadius: 6,
               bgcolor: 'rgba(47, 124, 123, 0.12)',
               overflow: 'hidden',
               position: 'relative',
            }}
          >
            <Box
              sx={{
                height: '100%',
                width: `${Math.min(progress, 100)}%`,
                borderRadius: 6,
                background: getProgressColor(),
                transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  animation: 'shimmer 2s infinite',
                },
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 1.5,
            }}
          >
            <Typography
              variant="body2"
                sx={{
                  fontWeight: 700,
                  color: isCritical ? '#ef4444' : isUrgent ? '#f59e0b' : '#7A8A91',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
            >
              <AccessTime sx={{ fontSize: 16 }} />
              {daysLeft > 0 ? `${daysLeft} days left` : 'Campaign ended'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#7A8A91', fontWeight: 600 }}>
              {progress}% complete
            </Typography>
          </Box>
        </Box>

        {/* Stats row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'rgba(47, 124, 123, 0.12)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <Groups sx={{ fontSize: 18, color: '#7A8A91' }} />
             <Typography variant="body2" sx={{ color: '#7A8A91', fontWeight: 600 }}>
               {campaign.donorsCount || 0} donors
             </Typography>
          </Box>

          {/* Share button (hidden functionality for now) */}
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              // Share functionality can be implemented
            }}
            sx={{
              color: '#7A8A91',
              '&:hover': { color: '#2F7C7B', bgcolor: 'rgba(47, 124, 123, 0.08)' },
            }}
          >
            <Share sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2.5, pt: 1.5 }}>
        <Button
          variant="contained"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/campaign/${campaign._id}`);
          }}
          sx={{
            py: 1.75,
            fontSize: '0.95rem',
            fontWeight: 700,
            background: isCritical
              ? 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)'
              : isUrgent
              ? 'linear-gradient(135deg, #f59e0b 0%, #7FC6CC 100%)'
              : 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)',
            boxShadow: isCritical
              ? '0 6px 20px rgba(239, 68, 68, 0.3)'
              : '0 6px 20px rgba(47, 124, 123, 0.25)',
            '&:hover': {
              boxShadow: isCritical
                ? '0 10px 32px rgba(239, 68, 68, 0.4)'
                : '0 10px 32px rgba(47, 124, 123, 0.35)',
              transform: 'translateY(-2px)',
            },
          }}
        >
          {isCritical ? 'Urgent Help Needed' : isUrgent ? 'Support Now' : 'Donate Now'}
        </Button>
      </CardActions>
    </Card>
  );
};

export default CampaignCard;
