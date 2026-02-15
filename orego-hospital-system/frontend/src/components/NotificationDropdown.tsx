import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Notifications as NotificationIcon,
  Circle as CircleIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  MarkEmailRead as MarkReadIcon,
} from '@mui/icons-material';
import { notificationService } from '../services/notificationService';
import { Notification } from '../types';
import { format } from 'date-fns';

interface NotificationDropdownProps {
  onNotificationUpdate?: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onNotificationUpdate }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    if (!open) {
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching notifications...');
      const data = await notificationService.getNotifications();
      console.log('Notifications response:', data);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setError(`Failed to load notifications: ${error.response?.data?.error || error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      onNotificationUpdate?.();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      setUnreadCount(0);
      onNotificationUpdate?.();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      const wasUnread = notifications.find(n => n.id === notificationId)?.is_read === false;
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
      if (wasUnread) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      onNotificationUpdate?.();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'discharge':
        return '🏥';
      case 'alert':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleClick}
        aria-label={`${unreadCount} unread notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="h6">
              Notifications ({unreadCount} unread)
            </Typography>
            {unreadCount > 0 && (
              <Button 
                size="small" 
                startIcon={<MarkReadIcon />}
                onClick={handleMarkAllAsRead}
              >
                Mark all read
              </Button>
            )}
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto', py: 0 }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification.id}>
                <ListItem
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <Box sx={{ display: 'flex', justify: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                      <Box sx={{ mr: 1, mt: 0.5 }}>
                        <Typography variant="body2">
                          {getNotificationIcon(notification.type)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: notification.is_read ? 400 : 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {notification.title}
                        </Typography>
                        
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {notification.message}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(notification.created_at)}
                          </Typography>
                          
                          <Chip 
                            label={notification.type} 
                            size="small" 
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                      {!notification.is_read && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleMarkAsRead(notification.id, e)}
                          title="Mark as read"
                          sx={{ mb: 0.5 }}
                        >
                          <CheckCircleIcon fontSize="small" color="primary" />
                        </IconButton>
                      )}
                      
                      <IconButton
                        size="small"
                        onClick={(e) => handleDeleteNotification(notification.id, e)}
                        title="Delete"
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
};

export default NotificationDropdown;