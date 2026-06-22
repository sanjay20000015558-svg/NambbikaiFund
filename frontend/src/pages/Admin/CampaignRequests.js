import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Skeleton,
  MenuItem,
  Avatar,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { adminAPI } from '../../services/adminService';
import { adminCampaignAPI } from '../../services/campaignService';
import { showSnackbar } from '../../redux/slices/uiSlice';

const CampaignRequests = () => {
   const { t } = useTranslation();
   const dispatch = useDispatch();
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

   const [campaigns, setCampaigns] = useState([]);
   const [loading, setLoading] = useState(true);
   const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
   const [selectedCampaign, setSelectedCampaign] = useState(null);
   const [reviewNotes, setReviewNotes] = useState('');
   const [reviewStatus, setReviewStatus] = useState('approved');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await adminCampaignAPI.getAll({ status: 'pending', limit: 100 });
      setCampaigns(res.data.data);
    } catch (error) {
      console.error('Failed to fetch campaign requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedCampaign) return;

    try {
      await adminCampaignAPI.approve(selectedCampaign._id, {
        status: reviewStatus,
        notes: reviewNotes
      });
      setReviewDialogOpen(false);
      setReviewNotes('');
      dispatch(showSnackbar({ message: 'Campaign reviewed successfully', severity: 'success' }));
      fetchCampaigns();
    } catch (error) {
      dispatch(showSnackbar({ message: 'Failed to review campaign', severity: 'error' }));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Creator</TableCell>
                <TableCell>Goal</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="text" /></TableCell>
                  <TableCell><Skeleton variant="rectangular" width={100} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    );
  }

return (
     <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
       <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
         Campaign Requests
       </Typography>
       <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.9rem', md: '1rem' } }}>
         Review and approve/reject campaign requests
       </Typography>

       <TableContainer component={Box} sx={{ overflowX: { xs: 'auto', md: 'visible' } }}>
         <Table size={ isMobile ? 'small' : 'medium' }>
           <TableHead>
             <TableRow>
               <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Campaign</TableCell>
               <TableCell>Creator</TableCell>
               <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Goal Amount</TableCell>
               <TableCell>Status</TableCell>
               <TableCell>Actions</TableCell>
             </TableRow>
           </TableHead>
           <TableBody>
             {campaigns.map((campaign) => (
               <TableRow key={campaign._id}>
                 <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                   <Box display="flex" alignItems="center" gap={2}>
                     {campaign.coverImage?.url ? (
                       <Avatar src={campaign.coverImage.url} variant="rounded" sx={{ width: 40, height: 40 }} />
                     ) : (
                       <Avatar variant="rounded" sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
                         <Typography color="white" variant="caption">
                           {campaign.category?.[0]?.toUpperCase()}
                         </Typography>
                       </Avatar>
                     )}
                     <Box>
                       <Typography fontWeight={600} variant="body2">{campaign.title}</Typography>
                       <Typography variant="caption" color="text.secondary">
                         {campaign.category}
                       </Typography>
                     </Box>
                   </Box>
                 </TableCell>
                 <TableCell>{campaign.creatorName}</TableCell>
                 <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>₹{campaign.targetAmount?.toLocaleString('en-IN')}</TableCell>
                 <TableCell>
                   <Chip
                     label="Pending"
                     size="small"
                     color="warning"
                   />
                 </TableCell>
                 <TableCell>
                   <IconButton
                     size="small"
                     onClick={() => handleReviewCampaign(campaign)}
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
                   <Typography color="text.secondary">No pending campaign requests</Typography>
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
       </TableContainer>

       <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth fullScreen={ isMobile }>
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
           <TextField
             select
             fullWidth
             label="Decision"
             value={reviewStatus}
             onChange={(e) => setReviewStatus(e.target.value)}
             sx={{ mt: 2 }}
           >
             <MenuItem value="approved">Approve (Make Live)</MenuItem>
             <MenuItem value="rejected">Reject</MenuItem>
           </TextField>
         </DialogContent>
         <DialogActions>
           <Button onClick={() => setReviewDialogOpen(false)}>Cancel</Button>
           <Button onClick={handleSubmitReview} variant="contained">
             Submit
           </Button>
         </DialogActions>
       </Dialog>
     </Container>
   );
 };

export default CampaignRequests;