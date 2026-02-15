import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Business as BusinessIcon,
  Assignment as BookingIcon,
  LocalHospital as DischargeIcon,
  Refresh as RefreshIcon,
  Timeline as ActivityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { userService } from '../services/userService';
import { resourceService } from '../services/resourceService';
import { bookingService } from '../services/bookingService';
import { dischargeService } from '../services/dischargeService';

interface Activity {
  id: string;
  type: 'user' | 'resource' | 'booking' | 'discharge';
  action: 'created' | 'updated' | 'completed' | 'cancelled' | 'approved';
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface RecentActivitiesFeedProps {
  refreshTrigger?: number;
  maxItems?: number;
}

const RecentActivitiesFeed: React.FC<RecentActivitiesFeedProps> = ({
  refreshTrigger = 0,
  maxItems = 10
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch recent data from all services
      const [users, resources, bookings, discharges] = await Promise.allSettled([
        userService.getAllUsers(),
        resourceService.getAllResources(),
        bookingService.getAllBookings(),
        dischargeService.getAllDischarges(),
      ]);

      const activities: Activity[] = [];

      // Process users
      if (users.status === 'fulfilled') {
        const recentUsers = (users.value.users || [])
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        
        recentUsers.forEach((user: any) => {
          activities.push({
            id: `user-${user.id}`,
            type: 'user',
            action: 'created',
            title: `New ${user.role} registered`,
            description: `${user.name} joined as ${user.role}`,
            timestamp: user.created_at,
            user: user.name,
          });
        });
      }

      // Process resources
      if (resources.status === 'fulfilled') {
        const recentResources = (resources.value.resources || [])
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        
        recentResources.forEach((resource: any) => {
          activities.push({
            id: `resource-${resource.id}`,
            type: 'resource',
            action: 'created',
            title: `New ${resource.type} added`,
            description: `${resource.name} registered as ${resource.type}`,
            timestamp: resource.created_at,
          });
        });
      }

      // Process bookings
      if (bookings.status === 'fulfilled') {
        const recentBookings = (bookings.value.bookings || [])
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        
        recentBookings.forEach((booking: any) => {
          let action: Activity['action'] = 'created';
          let title = '';
          
          switch (booking.status) {
            case 'completed':
              action = 'completed';
              title = `${booking.booking_type} completed`;
              break;
            case 'cancelled':
              action = 'cancelled';
              title = `${booking.booking_type} cancelled`;
              break;
            default:
              title = `New ${booking.booking_type} scheduled`;
          }
          
          activities.push({
            id: `booking-${booking.id}`,
            type: 'booking',
            action,
            title,
            description: `${booking.patient_name} with Dr. ${booking.doctor_name}`,
            timestamp: booking.created_at,
          });
        });
      }

      // Process discharges
      if (discharges.status === 'fulfilled') {
        const recentDischarges = (discharges.value.discharges || [])
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        
        recentDischarges.forEach((discharge: any) => {
          activities.push({
            id: `discharge-${discharge.id}`,
            type: 'discharge',
            action: discharge.approved ? 'approved' : 'created',
            title: discharge.approved ? 'Discharge approved' : 'Discharge record created',
            description: `Patient: ${discharge.patient_name}`,
            timestamp: discharge.created_at,
          });
        });
      }

      // Sort all activities by timestamp and take the most recent
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, maxItems);

      setActivities(sortedActivities);

    } catch (error: any) {
      console.error('Failed to fetch recent activities:', error);
      setError('Failed to load recent activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentActivities();
  }, [refreshTrigger, maxItems]);

  const getActivityIcon = (type: string, action: string) => {
    switch (type) {
      case 'user':
        return <PersonIcon />;
      case 'resource':
        return <BusinessIcon />;
      case 'booking':
        return action === 'completed' ? <CompleteIcon /> : 
               action === 'cancelled' ? <CancelIcon /> : <BookingIcon />;
      case 'discharge':
        return <DischargeIcon />;
      default:
        return <ActivityIcon />;
    }
  };

  const getActivityColor = (type: string, action: string) => {
    switch (action) {
      case 'completed':
      case 'approved':
        return 'success';
      case 'cancelled':
        return 'error';
      case 'created':
        return type === 'user' ? 'primary' : 'info';
      case 'updated':
        return 'warning';
      default:
        return 'default';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now.getTime() - time.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return format(time, 'MMM d');
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" display="flex" alignItems="center">
            <ActivityIcon sx={{ mr: 1 }} />
            Recent Activities
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchRecentActivities}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : activities.length === 0 ? (
          <Typography color="text.secondary" textAlign="center" py={3}>
            No recent activities
          </Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {activities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar 
                      sx={{ 
                        bgcolor: `${getActivityColor(activity.type, activity.action)}.light`,
                        color: `${getActivityColor(activity.type, activity.action)}.dark`
                      }}
                    >
                      {getActivityIcon(activity.type, activity.action)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="subtitle2">
                          {activity.title}
                        </Typography>
                        <Chip
                          label={activity.action}
                          size="small"
                          color={getActivityColor(activity.type, activity.action) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {activity.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(activity.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < activities.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivitiesFeed;