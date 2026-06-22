import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Skeleton,
  MenuItem,
  LinearProgress,
  Select,
  FormControl,
  InputLabel,
  Divider
} from '@mui/material';
import {
  People,
  Campaign,
  AttachMoney,
  TrendingUp,
  CheckCircle,
  Cancel,
  Warning,
  Visibility,
  Block as BlockIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import CountUp from 'react-countup';

import { adminAPI } from '../../services/adminService';
import { adminCampaignAPI } from '../../services/campaignService';
import { adminWithdrawalAPI } from '../../services/withdrawalService';
import { showSnackbar } from '../../redux/slices/uiSlice';

const tabItems = [
  { label: 'Overview', icon: <TrendingUp /> },
  { label: 'Campaign Requests', icon: <Campaign /> },
  { label: 'Users', icon: <People /> },
  { label: 'Withdrawals', icon: <AttachMoney /> }
];

const AdminDashboard = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [users, setUsers] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState('approved');

const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, campaignsRes] = await Promise.all([
        adminAPI.getStats(),
        adminCampaignAPI.getAll({ limit: 50, status: 'pending' })
      ]);

      setStats(statsRes.data.data);
      setCampaigns(campaignsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await adminWithdrawalAPI.getAll({ status: 'pending', limit: 50 });
      setWithdrawals(res.data.data);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers({ limit: 50 });
      setUsers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    switch (activeTab) {
      case 0:
        fetchDashboardData();
        break;
      case 1:
        fetchDashboardData();
        break;
      case 2:
        fetchUsers();
        break;
      case 3:
        fetchWithdrawals();
        break;
      default:
        break;
    }
  }, [activeTab]);

  const handleReviewCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setReviewDialogOpen(true);
  };

  const submitReview = async () => {
    if (!selectedCampaign) return;
    
    try {
      await adminCampaignAPI.approve(selectedCampaign._id, {
        status: reviewStatus,
        notes: reviewNotes
      });
      setReviewDialogOpen(false);
      setReviewNotes('');
      dispatch(showSnackbar({ message: 'Campaign reviewed successfully', severity: 'success' }));
      fetchDashboardData();
    } catch (error) {
      dispatch(showSnackbar({ message: 'Failed to review campaign', severity: 'error' }));
    }
  };

  const handleProcessWithdrawal = async (id, status) => {
    try {
      await adminWithdrawalAPI.process(id, { status });
      dispatch(showSnackbar({ message: `Withdrawal ${status}`, severity: 'success' }));
      fetchWithdrawals();
    } catch (error) {
      dispatch(showSnackbar({ message: 'Failed to process withdrawal', severity: 'error' }));
    }
  };

  if (loading && activeTab === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(4)].map((_, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

return (
     <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
       <Typography variant="h3" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' } }}>
         Admin Dashboard
       </Typography>

      {/* Stats Overview - only for Overview tab */}
      {activeTab === 0 && stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Users
                    </Typography>
                    <Typography variant="h5">
                      <CountUp end={stats.overview?.totalUsers || 0} duration={1.5} />
                    </Typography>
                  </Box>
                  <People color="primary" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Campaigns
                    </Typography>
                    <Typography variant="h5">
                      <CountUp end={stats.overview?.totalCampaigns || 0} duration={1.5} />
                    </Typography>
                  </Box>
                  <Campaign color="success" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Total Raised
                    </Typography>
                    <Typography variant="h5">
                      ₹{(stats.overview?.totalAmountRaised / 100000).toFixed(1)}L+
                    </Typography>
                  </Box>
                  <AttachMoney color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Pending Campaigns
                    </Typography>
                    <Typography variant="h5">
                      {stats.overview?.pendingCampaigns || 0}
                    </Typography>
                  </Box>
                  <Warning color="warning" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          indicatorColor="primary"
          textColor="primary"
        >
          {tabItems.map((tab, idx) => (
            <Tab key={idx} icon={tab.icon} label={tab.label} />
          ))}
        </Tabs>
      </Paper>

      {/* Campaign Management */}
      {activeTab === 1 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Creator</TableCell>
                <TableCell>Goal</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign._id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {campaign.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {campaign.category}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{campaign.creatorName}</TableCell>
                  <TableCell>
                    ₹{campaign.targetAmount?.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={campaign.status}
                      size="small"
                      color={
                        campaign.status === 'approved' ? 'success' :
                        campaign.status === 'pending' ? 'warning' :
                        campaign.status === 'rejected' ? 'error' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleReviewCampaign(campaign)}
                      disabled={campaign.status === 'approved' || campaign.status === 'rejected'}
                      color="success"
                    >
                      <CheckCircle />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setReviewStatus('rejected');
                        setReviewDialogOpen(true);
                      }}
                      disabled={campaign.status === 'approved' || campaign.status === 'rejected'}
                      color="error"
                    >
                      <Cancel />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => window.open(`/campaign/${campaign._id}`, '_blank')}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {campaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No pending campaigns
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* User Management */}
      {activeTab === 2 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography>{user.fullName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip label={user.role} size="small" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isBanned ? 'Banned' : user.isVerified ? 'Verified' : 'Unverified'}
                      size="small"
                      color={user.isBanned ? 'error' : user.isVerified ? 'success' : 'default'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Withdrawals */}
      {activeTab === 3 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Campaign</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Requested</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {withdrawals.map((w) => (
                <TableRow key={w._id}>
                  <TableCell>{w.campaignTitle}</TableCell>
                  <TableCell>₹{w.amount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{w.bankDetails?.accountHolderName}</Typography>
                    <Typography variant="caption">{w.bankDetails?.ifsc}</Typography>
                  </TableCell>
                  <TableCell>{new Date(w.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={w.status}
                      size="small"
                      color={
                        w.status === 'paid' ? 'success' :
                        w.status === 'approved' ? 'primary' :
                        w.status === 'rejected' ? 'error' : 'warning'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {w.status === 'pending' && (
                      <>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handleProcessWithdrawal(w._id, 'approved')}
                        >
                          <CheckCircle />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleProcessWithdrawal(w._id, 'rejected')}
                        >
                          <Cancel />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {withdrawals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No withdrawal requests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Review Campaign: {selectedCampaign?.title}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Review Notes"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Add notes about your decision..."
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Decision</InputLabel>
            <Select
              value={reviewStatus}
              label="Decision"
              onChange={(e) => setReviewStatus(e.target.value)}
            >
              <MenuItem value="approved">Approve (Make Live)</MenuItem>
              <MenuItem value="rejected">Reject</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
          <Button onClick={submitReview} variant="contained">
            Submit Decision
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;