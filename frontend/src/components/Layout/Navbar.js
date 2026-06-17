import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  useTheme,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Chip
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  Language,
  Notifications,
  Dashboard as DashboardIcon,
  Favorite,
  Edit,
  AccountCircle,
  Logout,
  Campaign,
  Receipt,
  CheckCircle,
  AdminPanelSettings
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { useLoading } from '../../contexts/LoadingContext';
import { useNotification } from '../../contexts/NotificationContext';
import { toggleSidebar, setTheme, setLanguage, showSnackbar, hideSnackbar } from '../../redux/slices/uiSlice';
import { logout } from '../../redux/slices/authSlice';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState(null);

  const { t } = useTranslation();
  const { loading, loadingText } = useLoading();
  const { unreadCount } = useNotification();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { snackbar } = useSelector((state) => state.ui);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);

  const handleThemeToggle = () => dispatch(setTheme());
  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/';
  };

  // Navigation items (only show when authenticated)
  const navItems = [
    { label: t('navigation.campaigns'), path: '/campaigns', icon: <Campaign /> },
    { label: t('home.howItWorks'), path: '/#how-it-works', icon: null },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', py: 2 }}>
 {/* Brand */}
       <Box sx={{ px: 3, py: 2 }}>
<Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: 'primary.main' }}>
          {t('navbar.brand')}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          {t('navbar.tagline')}
        </Typography>
       </Box>
      <Divider sx={{ my: 1.5 }} />

      {/* Navigation */}
      <List sx={{ px: 2 }}>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/">
            <ListItemIcon><Favorite sx={{ color: 'primary.main' }} /></ListItemIcon>
            <ListItemText primary={t('navigation.home')} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/campaigns">
            <ListItemIcon><Campaign sx={{ color: 'primary.main' }} /></ListItemIcon>
            <ListItemText primary={t('navigation.campaigns')} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/#how-it-works">
            <ListItemIcon><CheckCircle sx={{ color: 'secondary.main' }} /></ListItemIcon>
            <ListItemText primary={t('home.howItWorks')} />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider sx={{ my: 1.5 }} />

      {/* Settings */}
      <List sx={{ px: 2 }}>
        <ListItem disablePadding>
          <ListItemButton onClick={handleThemeToggle}>
            <ListItemIcon>
              {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </ListItemIcon>
            <ListItemText primary={theme.palette.mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton onClick={() => {}}>
            <ListItemIcon><Language /></ListItemIcon>
            <ListItemText primary={t('navigation.settings')} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  const buttonSx = {
    background: 'linear-gradient(135deg, #2F7C7B 0%, #7FC6CC 100%)',
    color: 'white',
    fontWeight: 600,
    px: { xs: 2, md: 3 },
    py: 1,
    '&:hover': {
      background: 'linear-gradient(135deg, #286a68 0%, #6ba5a8 100%)',
    },
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
          position: 'sticky',
        }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 72, md: 80 },
            px: { xs: 2, md: 4 },
            gap: { xs: 1, md: 2 },
          }}
        >
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              color="primary"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{
                mr: 1,
                bgcolor: 'primary.50',
                '&:hover': { bgcolor: 'primary.100' },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo */}
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              textDecoration: 'none',
              color: 'inherit',
              mr: { xs: 1, md: 4 },
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: '#2F7C7B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(47, 124, 123, 0.25)',
              }}
            >
              <Favorite sx={{ color: 'white', fontSize: 22 }} />
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography
                variant="h5"
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
                  display: 'block',
                  color: '#7A8A91',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  mt: 0.5,
                }}
              >
                {t('navbar.tagline')}
              </Typography>
            </Box>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 0.5, flexGrow: 1 }}>
              {navItems.map((item) => {
                const isActive = item.path.includes('#')
                  ? (location.pathname === '/' && location.hash === item.path.substring(item.path.indexOf('#')))
                  : location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    component={Link}
                    to={item.path}
                    startIcon={item.icon}
                 sx={{
                   color: isActive ? '#2F7C7B' : '#7A8A91',
                   backgroundColor: isActive ? 'rgba(47, 124, 123, 0.08)' : 'transparent',
                   fontWeight: 600,
                   px: 2,
                   '&:hover': {
                     backgroundColor: 'rgba(47, 124, 123, 0.08)',
                     color: '#2F7C7B',
                   },
                 }}
                    >
                      {item.label}
                    </Button>
                );
              })}
            </Box>
          )}

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1.5 }, ml: 'auto' }}>
            {/* Language selector - accessible for all users */}
            <LanguageSelector />
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <IconButton
                  onClick={() => setNotificationsOpen(true)}
                sx={{
                  color: '#7A8A91',
                  bgcolor: 'rgba(47, 124, 123, 0.08)',
                  '&:hover': { bgcolor: 'rgba(47, 124, 123, 0.15)', color: '#2F7C7B' },
                  width: 40,
                  height: 40,
                }}
                >
                  <Badge badgeContent={unreadCount} color="error">
                    <Notifications sx={{ fontSize: 20 }} />
                  </Badge>
                </IconButton>

                {/* Profile menu */}
                <IconButton
                  onClick={handleProfileOpen}
                sx={{
                  p: 0,
                  border: '2px solid rgba(47, 124, 123, 0.2)',
                  '&:hover': { borderColor: '#2F7C7B' },
                }}
                >
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor: 'primary.main',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                    }}
                    alt={user?.fullName}
                    src={user?.profilePicture}
                  >
                    {user?.fullName?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={profileAnchor}
                  open={Boolean(profileAnchor)}
                  onClose={handleProfileClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 200,
                      borderRadius: 3,
                      boxShadow: '0 8px 32px rgba(15, 23, 42, 0.1)',
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {user?.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem component={Link} to="/dashboard" onClick={handleProfileClose}>
                    <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
                    Dashboard
                  </MenuItem>
                  <MenuItem component={Link} to="/profile" onClick={handleProfileClose}>
                    <ListItemIcon><AccountCircle fontSize="small" /></ListItemIcon>
                    Profile
                  </MenuItem>
                  {user?.role === 'admin' && (
                    <MenuItem component={Link} to="/admin/campaign-requests" onClick={handleProfileClose}>
                      <ListItemIcon><AdminPanelSettings fontSize="small" /></ListItemIcon>
                      Campaign Requests
                    </MenuItem>
                  )}
                  <MenuItem component={Link} to="/start-campaign" onClick={handleProfileClose}>
                    <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
                    Start Campaign
                  </MenuItem>
                  <Divider />
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon><Logout fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
<>
                <Button
                  component={Link}
                  to="/login"
                  variant="contained"
                  sx={buttonSx}
                >
                  {t('login')}
                </Button>
                <Button
                  component={Link}
                  to="/admin/login"
                  variant="contained"
                  sx={buttonSx}
                >
                  {t('navigation.admin', 'Admin')}
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  sx={buttonSx}
                >
                  {t('register')}
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

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
              bgcolor: 'background.paper',
              borderRight: 'none',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </>
  );
};

export default Navbar;