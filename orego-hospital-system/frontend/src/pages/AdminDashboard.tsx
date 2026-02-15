import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tab,
  Tabs,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People,
  BusinessCenter,
  Assignment,
  LocalHospital,
  Description,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import UserRegistrationForm from '../components/UserRegistrationForm';
import UserList from '../components/UserList';
import EditUserDialog from '../components/EditUserDialog';
import ResourceRegistrationForm from '../components/ResourceRegistrationForm';
import ResourceList from '../components/ResourceList';
import BookingForm from '../components/BookingForm';
import BookingList from '../components/BookingList';
import DischargeForm from '../components/DischargeForm';
import DischargeList from '../components/DischargeList';
import NotificationForm from '../components/NotificationForm';
import HospitalConfiguration from '../components/HospitalConfiguration';
import RecentActivitiesFeed from '../components/RecentActivitiesFeed';
import QuickActions from '../components/QuickActions';
import TodaysAppointments from '../components/TodaysAppointments';
import SystemAlerts from '../components/SystemAlerts';
import HospitalStats from '../components/HospitalStats';
import SystemPerformance from '../components/SystemPerformance';
import { userService } from '../services/userService';
import { resourceService } from '../services/resourceService';
import { bookingService } from '../services/bookingService';
import { dischargeService } from '../services/dischargeService';
import { User } from '../types';

const AdminDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [resourceFormOpen, setResourceFormOpen] = useState(false);
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [dischargeFormOpen, setDischargeFormOpen] = useState(false);
  const [notificationFormOpen, setNotificationFormOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [userListRefresh, setUserListRefresh] = useState(0);
  const [resourceListRefresh, setResourceListRefresh] = useState(0);
  const [bookingListRefresh, setBookingListRefresh] = useState(0);
  const [dischargeListRefresh, setDischargeListRefresh] = useState(0);
  
  // Dashboard statistics
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalResources: 0,
    activeBookings: 0,
    totalDischarges: 0,
    loading: true,
  });

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      onClick: () => setCurrentTab(0),
    },
    {
      text: 'Hospital Setup',
      icon: <LocalHospital />,
      onClick: () => setCurrentTab(1),
    },
    {
      text: 'User Management',
      icon: <People />,
      onClick: () => setCurrentTab(2),
    },
    {
      text: 'Resource Management',
      icon: <BusinessCenter />,
      onClick: () => setCurrentTab(3),
    },
    {
      text: 'Bookings',
      icon: <Assignment />,
      onClick: () => setCurrentTab(4),
    },
    {
      text: 'Discharges',
      icon: <Description />,
      onClick: () => setCurrentTab(5),
    },
  ];

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      
      const [usersData, resourcesData, bookingsData, dischargesData] = await Promise.all([
        userService.getAllUsers(),
        resourceService.getAllResources(),
        bookingService.getAllBookings(),
        dischargeService.getAllDischarges(),
      ]);

      const activeBookingsCount = (bookingsData.bookings || []).filter(
        (booking: any) => booking.status === 'scheduled'
      ).length;

      setStats({
        totalUsers: usersData.count || (usersData.users || []).length,
        totalResources: resourcesData.count || (resourcesData.resources || []).length,
        activeBookings: activeBookingsCount,
        totalDischarges: dischargesData.count || (dischargesData.discharges || []).length,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Fetch stats on component mount and when tab changes to dashboard
  React.useEffect(() => {
    if (currentTab === 0) {
      fetchStats();
    }
  }, [currentTab, userListRefresh, resourceListRefresh, bookingListRefresh, dischargeListRefresh]);

  // Keyboard shortcuts for quick actions
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle Ctrl+Key combinations (not Ctrl+Shift+Key to avoid conflicts)
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
        switch (event.key.toLowerCase()) {
          case 'u':
            event.preventDefault();
            event.stopPropagation();
            setUserFormOpen(true);
            break;
          case 'r':
            event.preventDefault();
            event.stopPropagation();
            setResourceFormOpen(true);
            break;
          case 'b':
            event.preventDefault();
            event.stopPropagation();
            setBookingFormOpen(true);
            break;
          case 'd':
            event.preventDefault();
            event.stopPropagation();
            setDischargeFormOpen(true);
            break;
          case 'm':
            event.preventDefault();
            event.stopPropagation();
            setNotificationFormOpen(true);
            break;
        }
      }
    };

    // Capture the event during the capture phase to prevent browser shortcuts
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  return (
    <DashboardLayout title="Admin Dashboard" menuItems={menuItems}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome, Administrator
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your hospital system from here
        </Typography>
      </Box>

      <Tabs value={currentTab} onChange={(e, v) => setCurrentTab(v)} sx={{ mb: 3 }}>
        <Tab label="Dashboard" />
        <Tab label="Hospital Setup" />
        <Tab label="Users" />
        <Tab label="Resources" />
        <Tab label="Bookings" />
        <Tab label="Discharges" />
      </Tabs>

      {currentTab === 0 && (
        <Box>
          {/* Enhanced Dashboard */}
          
          {/* Top Statistics Row */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Users
                  </Typography>
                  <Typography variant="h4">
                    {stats.loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      stats.totalUsers
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Resources
                  </Typography>
                  <Typography variant="h4">
                    {stats.loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      stats.totalResources
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Active Bookings
                  </Typography>
                  <Typography variant="h4">
                    {stats.loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      stats.activeBookings
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" gutterBottom>
                    Total Discharges
                  </Typography>
                  <Typography variant="h4">
                    {stats.loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      stats.totalDischarges
                    )}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* System Alerts */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <SystemAlerts 
                refreshTrigger={userListRefresh + resourceListRefresh + bookingListRefresh + dischargeListRefresh}
              />
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12}>
              <QuickActions
                onUserRegister={() => setUserFormOpen(true)}
                onResourceRegister={() => setResourceFormOpen(true)}
                onBookingCreate={() => setBookingFormOpen(true)}
                onDischargeCreate={() => setDischargeFormOpen(true)}
                onNotificationSend={() => setNotificationFormOpen(true)}
              />
            </Grid>
          </Grid>

          {/* Today's Appointments & Recent Activities */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} lg={8}>
              <TodaysAppointments 
                refreshTrigger={bookingListRefresh}
              />
            </Grid>
            <Grid item xs={12} lg={4}>
              <RecentActivitiesFeed 
                refreshTrigger={userListRefresh + resourceListRefresh + bookingListRefresh + dischargeListRefresh}
                maxItems={8}
              />
            </Grid>
          </Grid>

          {/* Hospital Resource Utilization */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <HospitalStats 
                refreshTrigger={resourceListRefresh + bookingListRefresh}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <SystemPerformance 
                refreshTrigger={userListRefresh + resourceListRefresh + bookingListRefresh}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {currentTab === 1 && (
        <Box>
          {/* Hospital Configuration */}
          <Box sx={{ mb: 3 }}>
            <HospitalConfiguration
              onSuccess={() => {
                setSuccessMessage('Hospital configuration saved successfully!');
              }}
            />
          </Box>

          {/* Notification Management */}
          <Card>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Notification Management
                  </Typography>
                  <Typography color="text.secondary">
                    Send notifications and alerts to users
                  </Typography>
                </Box>
                <Button 
                  variant="contained"
                  onClick={() => setNotificationFormOpen(true)}
                  sx={{ ml: 2 }}
                >
                  Send Notification
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {currentTab === 2 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  User Management
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => setUserFormOpen(true)}
                >
                  Register New User
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <UserList 
            onEdit={(user) => {
              setSelectedUser(user);
              setEditUserDialogOpen(true);
            }}
            refreshTrigger={userListRefresh}
          />
        </Box>
      )}

      {currentTab === 3 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Resource Management
                </Typography>
                <Button 
                  variant="contained"
                  onClick={() => setResourceFormOpen(true)}
                >
                  Register New Resource
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <ResourceList refreshTrigger={resourceListRefresh} />
        </Box>
      )}

      {currentTab === 4 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Booking Management
                </Typography>
                <Button 
                  variant="contained"
                  onClick={() => setBookingFormOpen(true)}
                >
                  Create New Booking
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <BookingList refreshTrigger={bookingListRefresh} />
        </Box>
      )}

      {currentTab === 5 && (
        <Box>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Discharge Management
                </Typography>
                <Button 
                  variant="contained"
                  onClick={() => setDischargeFormOpen(true)}
                >
                  Create Discharge Record
                </Button>
              </Box>
            </CardContent>
          </Card>
          
          <DischargeList refreshTrigger={dischargeListRefresh} />
        </Box>
      )}

      {/* User Registration Form Dialog */}
      <UserRegistrationForm
        open={userFormOpen}
        onClose={() => setUserFormOpen(false)}
        onSuccess={() => {
          setSuccessMessage('User registered successfully!');
          setUserListRefresh(prev => prev + 1);
        }}
      />

      {/* Edit User Dialog */}
      <EditUserDialog
        open={editUserDialogOpen}
        user={selectedUser}
        onClose={() => {
          setEditUserDialogOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setSuccessMessage('User updated successfully!');
          setUserListRefresh(prev => prev + 1);
        }}
      />

      {/* Resource Registration Form Dialog */}
      <ResourceRegistrationForm
        open={resourceFormOpen}
        onClose={() => setResourceFormOpen(false)}
        onSuccess={() => {
          setSuccessMessage('Resource registered successfully!');
          setResourceListRefresh(prev => prev + 1);
        }}
      />

      {/* Booking Form Dialog */}
      <BookingForm
        open={bookingFormOpen}
        onClose={() => setBookingFormOpen(false)}
        onSuccess={() => {
          setSuccessMessage('Booking created successfully!');
          setBookingListRefresh(prev => prev + 1);
        }}
      />

      {/* Discharge Form Dialog */}
      <DischargeForm
        open={dischargeFormOpen}
        onClose={() => setDischargeFormOpen(false)}
        onSuccess={() => {
          setSuccessMessage('Discharge record created successfully!');
          setDischargeListRefresh(prev => prev + 1);
        }}
      />

      {/* Notification Form Dialog */}
      <NotificationForm
        open={notificationFormOpen}
        onClose={() => setNotificationFormOpen(false)}
        onSuccess={() => {
          setSuccessMessage('Notification sent successfully!');
        }}
      />

      {/* Success Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccessMessage('')} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default AdminDashboard;
