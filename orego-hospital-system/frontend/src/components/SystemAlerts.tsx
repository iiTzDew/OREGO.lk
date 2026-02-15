import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
  Chip,
  IconButton,
  Collapse,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import {
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  MedicalServices as MedicalIcon,
  Storage as StorageIcon,
  Group as StaffIcon,
} from '@mui/icons-material';
import { hospitalService } from '../services/hospitalService';
import { resourceService } from '../services/resourceService';
import { userService } from '../services/userService';
import { bookingService } from '../services/bookingService';

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  category: 'capacity' | 'resources' | 'staff' | 'system' | 'security';
  title: string;
  message: string;
  count?: number;
  action?: string;
  details?: string[];
  priority: 'high' | 'medium' | 'low';
}

interface SystemAlertsProps {
  refreshTrigger?: number;
  maxAlerts?: number;
}

const SystemAlerts: React.FC<SystemAlertsProps> = ({ refreshTrigger = 0, maxAlerts = 10 }) => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const analyzeSystemHealth = async () => {
    try {
      setLoading(true);
      const alerts: SystemAlert[] = [];

      // Fetch all necessary data
      const [hospitalData, resourcesData, usersData, bookingsData] = await Promise.allSettled([
        hospitalService.getHospital(),
        resourceService.getAllResources(),
        userService.getAllUsers(),
        bookingService.getAllBookings(),
      ]);

      // Analyze hospital capacity
      if (hospitalData.status === 'fulfilled' && resourcesData.status === 'fulfilled') {
        const hospital = hospitalData.value;
        const resources = resourcesData.value.resources || [];
        
        const beds = resources.filter((r: any) => r.type === 'bed');
        const availableBeds = beds.filter((b: any) => b.status === 'available').length;
        const totalBeds = beds.length;
        const occupancyRate = totalBeds > 0 ? ((totalBeds - availableBeds) / totalBeds) * 100 : 0;

        if (occupancyRate >= 95) {
          alerts.push({
            id: 'bed-critical',
            type: 'error',
            category: 'capacity',
            title: 'Critical Bed Shortage',
            message: `Only ${availableBeds} of ${totalBeds} beds available (${occupancyRate.toFixed(1)}% occupied)`,
            count: availableBeds,
            action: 'immediate-action-required',
            details: [
              'Consider activating overflow protocols',
              'Review discharge readiness of current patients',
              'Contact nearby hospitals for transfer options'
            ],
            priority: 'high'
          });
        } else if (occupancyRate >= 85) {
          alerts.push({
            id: 'bed-warning',
            type: 'warning',
            category: 'capacity',
            title: 'High Bed Occupancy',
            message: `${availableBeds} beds available, occupancy at ${occupancyRate.toFixed(1)}%`,
            count: availableBeds,
            action: 'monitor-closely',
            priority: 'medium'
          });
        }

        // Check operation theatres
        const ots = resources.filter((r: any) => r.type === 'operation_theatre');
        const availableOTs = ots.filter((ot: any) => ot.status === 'available').length;
        const totalOTs = ots.length;
        
        if (totalOTs > 0 && availableOTs === 0) {
          alerts.push({
            id: 'ot-unavailable',
            type: 'error',
            category: 'resources',
            title: 'No Operation Theatres Available',
            message: 'All operation theatres are currently occupied or under maintenance',
            priority: 'high'
          });
        }

        // Check maintenance resources
        const maintenanceResources = resources.filter((r: any) => r.status === 'maintenance');
        if (maintenanceResources.length > 0) {
          alerts.push({
            id: 'maintenance-resources',
            type: 'warning',
            category: 'resources',
            title: 'Resources Under Maintenance',
            message: `${maintenanceResources.length} resource(s) currently under maintenance`,
            count: maintenanceResources.length,
            details: maintenanceResources.map((r: any) => `${r.name} (${r.type})`),
            priority: 'medium'
          });
        }
      }

      // Analyze staffing
      if (usersData.status === 'fulfilled') {
        const users = usersData.value.users || [];
        const doctors = users.filter((u: any) => u.role === 'doctor' && u.is_active);
        const nurses = users.filter((u: any) => u.role === 'nurse' && u.is_active);

        if (doctors.length === 0) {
          alerts.push({
            id: 'no-doctors',
            type: 'error',
            category: 'staff',
            title: 'No Active Doctors',
            message: 'No active doctors are registered in the system',
            action: 'register-doctors',
            priority: 'high'
          });
        } else if (doctors.length < 3) {
          alerts.push({
            id: 'low-doctors',
            type: 'warning',
            category: 'staff',
            title: 'Limited Doctor Availability',
            message: `Only ${doctors.length} active doctor(s) in the system`,
            count: doctors.length,
            priority: 'medium'
          });
        }

        if (nurses.length === 0) {
          alerts.push({
            id: 'no-nurses',
            type: 'error',
            category: 'staff',
            title: 'No Active Nurses',
            message: 'No active nurses are registered in the system',
            action: 'register-nurses',
            priority: 'high'
          });
        } else if (nurses.length < 5) {
          alerts.push({
            id: 'low-nurses',
            type: 'warning',
            category: 'staff',
            title: 'Limited Nursing Staff',
            message: `Only ${nurses.length} active nurse(s) in the system`,
            count: nurses.length,
            priority: 'medium'
          });
        }
      }

      // Analyze bookings
      if (bookingsData.status === 'fulfilled') {
        const bookings = bookingsData.value.bookings || [];
        const todayBookings = bookings.filter((b: any) => {
          const today = new Date().toISOString().split('T')[0];
          return b.scheduled_date.startsWith(today) && b.status === 'scheduled';
        });

        if (todayBookings.length > 20) {
          alerts.push({
            id: 'high-booking-volume',
            type: 'info',
            category: 'system',
            title: 'High Booking Volume Today',
            message: `${todayBookings.length} appointments scheduled for today`,
            count: todayBookings.length,
            priority: 'low'
          });
        }

        const overdueBookings = bookings.filter((b: any) => {
          const bookingTime = new Date(b.scheduled_date);
          const now = new Date();
          return bookingTime < now && b.status === 'scheduled';
        });

        if (overdueBookings.length > 0) {
          alerts.push({
            id: 'overdue-bookings',
            type: 'warning',
            category: 'system',
            title: 'Overdue Appointments',
            message: `${overdueBookings.length} appointment(s) are overdue`,
            count: overdueBookings.length,
            action: 'review-required',
            priority: 'medium'
          });
        }
      }

      // System health checks
      if (hospitalData.status === 'rejected') {
        alerts.push({
          id: 'hospital-config',
          type: 'warning',
          category: 'system',
          title: 'Hospital Not Configured',
          message: 'Hospital details have not been set up yet',
          action: 'configure-hospital',
          priority: 'medium'
        });
      }

      // Success messages when everything is good
      if (alerts.length === 0) {
        alerts.push({
          id: 'all-good',
          type: 'success',
          category: 'system',
          title: 'All Systems Operating Normally',
          message: 'No critical issues detected. Hospital operations are running smoothly.',
          priority: 'low'
        });
      }

      // Sort alerts by priority
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      alerts.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

      setAlerts(alerts.slice(0, maxAlerts));

    } catch (error: any) {
      console.error('Failed to analyze system health:', error);
      setAlerts([{
        id: 'analysis-error',
        type: 'error',
        category: 'system',
        title: 'System Analysis Failed',
        message: 'Unable to perform health check. Please try again.',
        priority: 'high'
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyzeSystemHealth();
  }, [refreshTrigger, maxAlerts]);

  const handleExpandAlert = (alertId: string) => {
    setExpandedAlert(expandedAlert === alertId ? null : alertId);
  };

  const getAlertIcon = (type: string, category: string) => {
    if (category === 'security') return <SecurityIcon />;
    if (category === 'staff') return <StaffIcon />;
    if (category === 'resources') return <StorageIcon />;
    if (category === 'capacity') return <MedicalIcon />;
    
    switch (type) {
      case 'error': return <ErrorIcon />;
      case 'warning': return <WarningIcon />;
      case 'info': return <InfoIcon />;
      case 'success': return <SuccessIcon />;
      default: return <InfoIcon />;
    }
  };

  const displayedAlerts = showAll ? alerts : alerts.slice(0, 3);

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" display="flex" alignItems="center">
            <SecurityIcon sx={{ mr: 1 }} />
            System Health & Alerts
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={analyzeSystemHealth}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {displayedAlerts.map((alert, index) => (
              <React.Fragment key={alert.id}>
                <Alert
                  severity={alert.type}
                  icon={getAlertIcon(alert.type, alert.category)}
                  action={
                    alert.details && (
                      <IconButton
                        size="small"
                        onClick={() => handleExpandAlert(alert.id)}
                      >
                        {expandedAlert === alert.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    )
                  }
                  sx={{ mb: 1 }}
                >
                  <AlertTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                      {alert.title}
                      <Chip 
                        label={alert.category} 
                        size="small" 
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                      {alert.priority === 'high' && (
                        <Chip 
                          label="HIGH PRIORITY" 
                          size="small" 
                          color="error"
                        />
                      )}
                    </Box>
                  </AlertTitle>
                  {alert.message}
                  
                  {alert.details && (
                    <Collapse in={expandedAlert === alert.id}>
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Recommended Actions:
                        </Typography>
                        <List dense>
                          {alert.details.map((detail, idx) => (
                            <ListItem key={idx} sx={{ py: 0 }}>
                              <ListItemText primary={`• ${detail}`} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    </Collapse>
                  )}
                </Alert>
                {index < displayedAlerts.length - 1 && <Box sx={{ mb: 1 }} />}
              </React.Fragment>
            ))}

            {alerts.length > 3 && (
              <Box textAlign="center" mt={2}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? 'Show Less' : `Show All ${alerts.length} Alerts`}
                </Button>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemAlerts;