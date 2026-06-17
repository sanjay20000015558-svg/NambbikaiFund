import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Toolbar,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Badge,
  Snackbar,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  Dashboard as DashboardIcon,
  Campaign as CampaignIcon,
  Favorite,
  Edit,
  Receipt,
  Notifications,
  Logout,
  CheckCircle
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import { setTheme, showSnackbar, hideSnackbar } from '../../redux/slices/uiSlice';
import { logout } from '../../redux/slices/authSlice';
import Navbar from './Navbar';
import Footer from './Footer';
import NotificationPanel from './NotificationPanel';
import LoadingSpinner from '../Common/LoadingSpinner';
import ChatBot from '../ChatBot/ChatBot';

const Layout = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const pathToSectionMap = {
    '/about': 'how-it-works',
    '/contact': 'contact',
    '/terms': null,
    '/privacy': null,
  };

  useEffect(() => {
    const hash = location.hash.slice(1);
    if (hash && document.getElementById(hash)) {
      document.getElementById(hash).scrollIntoView({ behavior: 'smooth' });
    } else {
      const sectionId = pathToSectionMap[location.pathname];
      if (sectionId && document.getElementById(sectionId)) {
        document.getElementById(sectionId).scrollIntoView({ behavior: 'smooth' });
      } else if (!hash && !sectionId) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, [location.pathname, location.hash]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { t } = useTranslation();
  const { loading, loadingText } = useLoading();
  const { unreadCount } = useNotification();

  const { isAuthenticated } = useSelector((state) => state.auth);
  const { snackbar } = useSelector((state) => state.ui);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const handleThemeToggle = () => dispatch(setTheme());
  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/';
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', py: 2 }}>
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'primary.main' }}>
          Nambikkai Fund
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Hope for Life
        </Typography>
      </Box>
      <Divider sx={{ my: 1.5 }} />
      <List sx={{ px: 2 }}>
        <ListItemButton onClick={() => navigate("/")}>
          <ListItemIcon><Favorite sx={{ color: 'primary.main' }} /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/campaigns")}>
          <ListItemIcon><CampaignIcon sx={{ color: 'primary.main' }} /></ListItemIcon>
          <ListItemText primary="Campaigns" />
        </ListItemButton>
        <ListItemButton onClick={() => navigate("/#how-it-works")}>
          <ListItemIcon><CheckCircle sx={{ color: 'secondary.main' }} /></ListItemIcon>
          <ListItemText primary="How It Works" />
        </ListItemButton>
        {isAuthenticated && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', px: 2, mb: 1, display: 'block', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em' }}>
              YOUR ACCOUNT
            </Typography>
            <ListItemButton onClick={() => navigate("/dashboard")}>
              <ListItemIcon><DashboardIcon sx={{ color: 'secondary.main' }} /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
            <ListItemButton onClick={() => navigate("/start-campaign")}>
              <ListItemIcon><Edit sx={{ color: 'secondary.main' }} /></ListItemIcon>
              <ListItemText primary="Start Campaign" />
            </ListItemButton>
            <ListItemButton onClick={() => navigate("/dashboard?tab=donations")}>
              <ListItemIcon><Receipt sx={{ color: 'success.main' }} /></ListItemIcon>
              <ListItemText primary="Donations" />
            </ListItemButton>
          </>
        )}
      </List>
      <Divider sx={{ my: 1.5 }} />
      <List sx={{ px: 2 }}>
        <ListItemButton onClick={handleThemeToggle}>
          <ListItemIcon>
            {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </ListItemIcon>
          <ListItemText primary={theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />

      {/* Mobile drawer */}
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: 280,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: 'calc(100vh - 80px)',
          bgcolor: 'background.default',
        }}
      >
        <Outlet />
      </Box>

      {/* Footer */}
      <Footer />

      {/* Loading spinner */}
      {loading && <LoadingSpinner text={loadingText} />}

      {/* Notifications panel */}
      <NotificationPanel
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

{/* Global Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => dispatch(hideSnackbar())}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => dispatch(hideSnackbar())}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', fontWeight: 600 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* AI Chatbot */}
      <ChatBot />
    </Box>
  );
};

export default Layout;
