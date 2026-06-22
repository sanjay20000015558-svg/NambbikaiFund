import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Stack,
  Chip,
  ToggleButton,
  LinearProgress,
  Pagination,
  Skeleton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {debounce} from 'lodash';

import { campaignAPI } from '../../services/campaignService';
import { fetchCampaignsSuccess, setFilters, setLoading } from '../../redux/slices/campaignSlice';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import CampaignCard from '../../components/Campaign/CampaignCard';

const categories = [
  { value: '', label: 'common.allCategories' },
  { value: 'leukemia', label: 'campaign.categories.leukemia' },
  { value: 'medical', label: 'campaign.categories.medical' },
  { value: 'education', label: 'campaign.categories.education' },
  { value: 'startup', label: 'campaign.categories.startup' },
  { value: 'agriculture', label: 'campaign.categories.agriculture' },
  { value: 'emergency', label: 'campaign.categories.emergency' },
  { value: 'social-cause', label: 'campaign.categories.socialCause' }
];

const sortOptions = [
  { value: 'createdAt-desc', label: 'campaignList.sortNewest' },
  { value: 'createdAt-asc', label: 'campaignList.sortOldest' },
  { value: 'amountRaised-desc', label: 'campaignList.sortMostFunded' },
  { value: 'deadline-asc', label: 'campaignList.sortUrgent' }
];

const CampaignList = () => {
   const { t } = useTranslation();
   const navigate = useNavigate();
   const [searchParams, setSearchParams] = useSearchParams();
   const dispatch = useDispatch();
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { campaigns = [], loading, filters = {}, total, pages } = useSelector((state) => state.campaigns);

  const [searchQuery, setSearchQuery] = useState('');
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    // Initialize filters from URL params
    const params = Object.fromEntries(searchParams.entries());
    dispatch(setFilters({
      category: params.category || '',
      sortBy: params.sortBy || 'createdAt',
      order: params.sortOrder || 'desc',
      page: parseInt(params.page) || 1
    }));

    fetchCampaigns();
  }, [searchParams]);

 const fetchCampaigns = async () => {
     setLocalLoading(true);
     try {
       const params = {
         ...filters,
         page: filters?.page
       };

       const res = await campaignAPI.getCampaigns(params);
       dispatch(fetchCampaignsSuccess(res.data));
     } catch (error) {
       console.error('Failed to fetch campaigns:', error);
     } finally {
       setLocalLoading(false);
     }
   };

  // Debounced search
  const debouncedSearch = React.useCallback(
    debounce((value) => {
      const newParams = new URLSearchParams(searchParams);
      if (value) {
        newParams.set('search', value);
      } else {
        newParams.delete('search');
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    }, 500),
    [searchParams]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (field, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(field, value);
    } else {
      newParams.delete(field);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
    dispatch(setFilters({ [field]: value, page: 1 }));
  };

  const handleSortChange = (e) => {
    const [sortBy, order] = e.target.value.split('-');
    handleFilterChange('sortBy', sortBy);
    handleFilterChange('order', order);
  };

  const handlePageChange = (event, page) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page);
    setSearchParams(newParams);
    dispatch(setFilters({ page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleLeukemiaOnly = () => {
    const current = searchParams.get('leukemia');
    const newParams = new URLSearchParams(searchParams);
    if (current === 'true') {
      newParams.delete('leukemia');
    } else {
      newParams.set('leukemia', 'true');
      newParams.set('category', 'leukemia');
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const isLeukemiaOnly = searchParams.get('leukemia') === 'true';

return (
     <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
       {/* Header */}
       <Box sx={{ mb: { xs: 3, md: 4 } }}>
         <Typography variant="h3" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
           {isLeukemiaOnly ? t('campaignList.leukemiaCampaigns') : t('campaignList.allCampaigns')}
         </Typography>
         <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
           {isLeukemiaOnly
             ? t('campaignList.leukemiaSubtitle')
             : t('campaignList.browseCampaigns')
           }
         </Typography>
       </Box>

       {/* Filters */}
       <Paper sx={{ p: { xs: 2, md: 3 }, mb: { xs: 3, md: 4 } }}>
         <Stack spacing={3}>
           {/* Search */}
           <TextField
             label={t('common.search')}
             value={searchQuery}
             onChange={handleSearchChange}
             variant="outlined"
             size="small"
             fullWidth
             placeholder={t('campaignList.searchPlaceholder')}
           />

           <Stack
             direction={{ xs: 'column', sm: 'row' }}
             spacing={2}
             useFlexGap
             flexWrap="wrap"
             alignItems="center"
           >
             {/* Category filter */}
             <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
               <InputLabel>{t('campaignList.categoryLabel')}</InputLabel>
               <Select
                 value={filters.category || ''}
                 label={t('campaignList.categoryLabel')}
                 onChange={(e) => handleFilterChange('category', e.target.value)}
               >
                 {categories.map((cat) => (
                   <MenuItem key={cat.value} value={cat.value}>
                     {t(cat.label)}
                   </MenuItem>
                 ))}
               </Select>
             </FormControl>

             {/* Sort */}
             <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
               <InputLabel>{t('campaignList.sortByLabel')}</InputLabel>
               <Select
                 value={`${filters.sortBy || 'createdAt'}-${filters.order || 'desc'}`}
                 label={t('campaignList.sortByLabel')}
                 onChange={handleSortChange}
               >
                 {sortOptions.map((opt) => (
                   <MenuItem key={opt.value} value={opt.value}>
                     {t(opt.label)}
                   </MenuItem>
                 ))}
               </Select>
             </FormControl>

             {/* Leukemia toggle */}
             <ToggleButton
               value="check"
               selected={isLeukemiaOnly}
               onChange={toggleLeukemiaOnly}
               size="small"
               sx={{
                 borderColor: 'primary.main',
                 bgcolor: isLeukemiaOnly ? 'primary.main' : 'transparent',
                 color: isLeukemiaOnly ? 'white' : 'primary.main',
                 '&.Mui-selected': {
                   bgcolor: 'primary.main',
                   color: 'white'
                 }
               }}
             >
               {t('campaignList.leukemiaFocus')}
             </ToggleButton>
           </Stack>
         </Stack>
       </Paper>

       {/* Campaign Grid */}
       {localLoading ? (
         <Grid container spacing={{ xs: 2, md: 4 }}>
           {[...Array(8)].map((_, i) => (
             <Grid item xs={12} sm={6} md={3} key={i}>
               <Paper sx={{ p: { xs: 1.5, md: 2 } }}>
                 <Skeleton variant="rectangular" height={{ xs: 150, md: 200 }} />
                 <Skeleton variant="text" sx={{ mt: 1 }} />
                 <Skeleton variant="text" width="80%" />
                 <Skeleton variant="rectangular" height={8} sx={{ mt: 1 }} />
               </Paper>
             </Grid>
           ))}
         </Grid>
       ) : (!campaigns || campaigns.length === 0) ? (
         <Box textAlign="center" py={{ xs: 6, md: 8 }}>
           <Typography variant="h5" color="text.secondary" sx={{ fontSize: { xs: '1.1rem', md: '1.25rem' } }}>
             {t('common.noCampaignsFound')}
           </Typography>
           <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', md: '1rem' } }}>
             {t('common.beFirstCampaign')}
           </Typography>
           <Button
             variant="contained"
             sx={{ mt: 3 }}
             onClick={() => navigate('/start-campaign')}
             fullWidth={ isMobile }
           >
             {t('common.startCampaignBtn')}
           </Button>
         </Box>
       ) : (
         <>
           <Grid container spacing={{ xs: 2, md: 4 }}>
             {campaigns.map((campaign, index) => (
               <Grid item xs={12} sm={6} md={3} key={campaign._id}>
                 <CampaignCard campaign={campaign} />
               </Grid>
             ))}
           </Grid>

           {/* Pagination */}
           {(pages || 0) > 1 && (
             <Box display="flex" justifyContent="center" mt={{ xs: 4, md: 6 }}>
               <Pagination
                 count={pages}
                 page={filters.page}
                 onChange={handlePageChange}
                 color="primary"
                 size={ isMobile ? 'small' : 'large' }
               />
             </Box>
           )}
         </>
       )}
     </Container>
   );
 };

export default CampaignList;