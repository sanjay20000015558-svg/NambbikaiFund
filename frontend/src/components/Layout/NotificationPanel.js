import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Badge,
  Button
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNotification } from '../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../Common/EmptyState';

const NotificationPanel = ({ open, onClose }) => {
  const { notifications, unreadCount, markOneAsRead, markAllAsRead, removeNotification } = useNotification();
  const navigate = useNavigate();

  const handleNotificationClick = (notification) => {
    markOneAsRead(notification._id);
    if (notification.link) {
      navigate(notification.link);
      onClose();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Notifications
            {unreadCount > 0 && (
              <Badge badgeContent={unreadCount} color="error" sx={{ ml: 1 }} />
            )}
          </Typography>
          <Box>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
            <IconButton onClick={onClose}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider />

        {notifications.length === 0 ? (
          <EmptyState message="No notifications" />
        ) : (
          <List>
            {notifications.map((notification) => (
              <React.Fragment key={notification._id}>
                <ListItem
                  button
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    bgcolor: notification.isRead ? 'inherit' : 'action.selected',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <span>{notification.icon}</span>
                        <Typography variant="subtitle2" noWrap>
                          {notification.title}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(notification.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                  {!notification.isRead && (
                    <CheckCircleIcon color="primary" fontSize="small" sx={{ ml: 1 }} />
                  )}
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationPanel;
