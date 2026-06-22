import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  LinearProgress,
  Chip,
  Avatar,
  IconButton,
  Divider,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Edit,
  Add,
  TrendingUp,
  Groups,
  AttachMoney,
  Receipt,
  AccountBalanceWallet,
  History
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';
import CountUp from 'react-countup';

import { campaignAPI } from '../../services/campaignService';
import { withdrawalAPI } from '../../services/withdrawalService';
import { setCampaigns } from '../../redux/slices/campaignSlice';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import CampaignCard from '../../components/Campaign/CampaignCard';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { user } = useSelector((state) => state.auth);
  const { campaigns } = useSelector((state) => state.campaigns);

  // Get translated tab labels
  const tabItems = [
    { label: t('dashboard.myCampaignsTab'), icon: <Edit /> },
    { label: t('dashboard.donationsReceived'), icon: <Receipt /> },
    { label: t('dashboard.withdrawalsTab'), icon: <AccountBalanceWallet /> }
  ];

  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalDonations: 0,
    pendingCampaigns: 0,
    approvedCampaigns: 0,
    rejectedCampaigns: 0,
    pendingWithdrawals: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await campaignAPI.getMyCampaigns({ status: 'all' });
      dispatch(setCampaigns(res.data.data));

      const pending = res.data.data.filter(c => c.status === 'pending').length;
      const approved = res.data.data.filter(c => c.status === 'approved').length;
      const rejected = res.data.data.filter(c => c.status === 'rejected').length;

      setStats({
        totalRaised: res.data.data.reduce((sum, c) => sum + c.amountRaised, 0),
        totalDonations: res.data.data.reduce((sum, c) => sum + c.donorsCount, 0),
        pendingCampaigns: pending,
        approvedCampaigns: approved,
        rejectedCampaigns: rejected,
        pendingWithdrawals: res.data.data.reduce((sum, c) => sum + (c.withdrawalRequests?.filter(w => w.status === 'pending')?.length || 0), 0)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const myCampaigns = campaigns || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

return (
     <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
       <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} mb={4} gap={2}>
 <Typography variant="h3" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
               {t('dashboard.welcome')}, {user?.fullName?.split(' ')[0]}
             </Typography>
 <Box>
 <Typography variant="body1" color="text.secondary">
               {t('dashboard.manageCampaigns')}
             </Typography>
           </Box>
 <Box mt={{ xs: 2, sm: 0 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => navigate('/start-campaign')}
              fullWidth={ isMobile }
            >
              {t('dashboard.newCampaign')}
            </Button>
          </Box>
        </Box>

      {/* Stats cards */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={itemVariants} initial="hidden" animate="show">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
<Typography color="textSecondary" gutterBottom variant="body2">
                       {t('dashboard.totalRaised')}
                     </Typography>
                    <Typography variant="h5">
                      ₹<CountUp end={stats.totalRaised} separator="," duration={1.5} />
                    </Typography>
                  </Box>
                  <AttachMoney color="success" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={itemVariants} initial="hidden" animate="show">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
<Typography color="textSecondary" gutterBottom variant="body2">
                       {t('dashboard.totalDonations')}
                     </Typography>
                    <Typography variant="h5">
                      <CountUp end={stats.totalDonations} duration={1.5} />
                    </Typography>
                  </Box>
                  <Groups color="primary" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={itemVariants} initial="hidden" animate="show">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
<Typography color="textSecondary" gutterBottom variant="body2">
                       {t('dashboard.pendingCampaigns')}
                     </Typography>
                    <Typography variant="h5">
                      {stats.pendingCampaigns}
                    </Typography>
                  </Box>
                  <TrendingUp color="warning" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={itemVariants} initial="hidden" animate="show">
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
<Typography color="textSecondary" gutterBottom variant="body2">
                       {t('dashboard.pendingWithdrawals')}
                     </Typography>
                    <Typography variant="h5">
                      {stats.pendingWithdrawals}
                    </Typography>
                  </Box>
                  <History color="error" />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          {tabItems.map((tab, idx) => (
            <Tab key={idx} icon={tab.icon} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Tab content */}
      {activeTab === 0 && (
        <Box>
          {myCampaigns.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
<Typography variant="h6" gutterBottom>
                 {t('dashboard.noCampaignsYet')}
               </Typography>
               <Button
                 variant="contained"
                 size="large"
                 startIcon={<Add />}
                 onClick={() => navigate('/start-campaign')}
                 sx={{ mt: 2 }}
               >
                 {t('dashboard.createFirstCampaign')}
               </Button>
            </Paper>
          ) : (
            <Grid container spacing={4}>
              {myCampaigns.map((campaign, idx) => (
                <Grid item xs={12} sm={6} md={4} key={idx}>
                  <CampaignCard campaign={campaign} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Receipt sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6">{t('dashboard.noDonations')}</Typography>
          <Typography color="text.secondary">
            {t('dashboard.donationHistory')}
          </Typography>
        </Paper>
      )}

      {activeTab === 2 && (
        <Box>
          {myCampaigns.map((campaign) => (
            <Paper key={campaign._id} sx={{ mb: 3, p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">{campaign.title}</Typography>
                <Chip
                  label={`₹${campaign.availableBalance.toLocaleString('en-IN')} ${t('dashboard.availableBalance')}`}
                  color="success"
                />
              </Box>
              {campaign.withdrawalRequests?.length > 0 ? (
                <List>
                  {campaign.withdrawalRequests.map((req) => (
                    <React.Fragment key={req._id}>
                      <ListItem>
                        <ListItemText
                          primary={`₹${req.amount.toLocaleString('en-IN')}`}
                          secondary={`Requested on ${new Date(req.createdAt).toLocaleDateString()}`}
                        />
                        <ListItemSecondaryAction>
                          <Chip
                            label={req.status}
                            size="small"
                            color={
                              req.status === 'paid' ? 'success' :
                              req.status === 'approved' ? 'primary' :
                              req.status === 'rejected' ? 'error' : 'default'
                            }
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">{t('dashboard.noWithdrawalRequests')}</Typography>
              )}

              <Button
                variant="outlined"
                sx={{ mt: 2 }}
                onClick={() => navigate(`/campaign/${campaign._id}/withdraw`)}
              >
                {t('dashboard.requestWithdrawal')}
              </Button>
            </Paper>
          ))}
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;