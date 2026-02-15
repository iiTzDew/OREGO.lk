import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import {
  LocalHospital as PatientIcon,
  Medication as MedicationIcon,
  Favorite as VitalsIcon,
  Assignment as TaskIcon,
  BedroomBaby as BedIcon,
  TrendingUp as TrendIcon,
  Refresh as RefreshIcon,
  Warning as AlertIcon,
} from '@mui/icons-material';
import { format, isToday } from 'date-fns';
import { userService } from '../services/userService';
import { resourceService } from '../services/resourceService';
import { bookingService } from '../services/bookingService';

interface NurseStatsProps {
  nurseName?: string;
  refreshTrigger?: number;
  onViewPatients?: () => void;
  onViewTasks?: () => void;
  onViewMedications?: () => void;
}

interface StatCard {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  priority?: 'high' | 'medium' | 'low';
  actionLabel?: string;
  onAction?: () => void;
}

const NurseStats: React.FC<NurseStatsProps> = ({
  nurseName,
  refreshTrigger = 0,
  onViewPatients,
  onViewTasks,
  onViewMedications,
}) => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workloadPercentage, setWorkloadPercentage] = useState(0);

  const fetchNurseStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [patientsData, resourcesData, bookingsData] = await Promise.allSettled([
        userService.getAllUsers(),
        resourceService.getAllResources(),
        bookingService.getAllBookings(),
      ]);

      let assignedPatients = 0;
      let criticalPatients = 0;
      let medicationsDue = 0;
      let vitalSignsPending = 0;
      let availableBeds = 0;
      let totalBeds = 0;
      let tasksCompleted = 0;

      // Process patients
      if (patientsData.status === 'fulfilled') {
        const users = patientsData.value.users || [];
        const patients = users.filter((u: any) => u.role === 'patient' && u.is_active);
        
        // Simulate assigned patients (in real scenario, filtered by ward/nurse assignment)
        assignedPatients = Math.min(patients.length, 12);
        
        // Simulate critical patients (would come from patient status field)
        criticalPatients = Math.floor(assignedPatients * 0.15); // ~15% critical
      }

      // Process beds and resources
      if (resourcesData.status === 'fulfilled') {
        const resources = resourcesData.value.resources || [];
        const beds = resources.filter((r: any) => r.type === 'bed');
        
        totalBeds = beds.length;
        availableBeds = beds.filter((b: any) => b.status === 'available').length;
      }

      // Process bookings for today's activities
      if (bookingsData.status === 'fulfilled') {
        const bookings = bookingsData.value.bookings || [];
        const today = format(new Date(), 'yyyy-MM-dd');
        
        const todayBookings = bookings.filter((b: any) => 
          b.scheduled_date && b.scheduled_date.startsWith(today)
        );

        // Simulate medications due (3 medications per patient, 8-hour shifts)
        medicationsDue = assignedPatients * 3;
        
        // Simulate vital signs pending
        vitalSignsPending = assignedPatients; // Each patient needs vitals checked
        
        // Simulate tasks completed
        tasksCompleted = Math.floor(assignedPatients * 2.5); // 2.5 tasks per patient
      }

      // Calculate workload based on patient-to-nurse ratio
      // Ideal ratio: 1 nurse per 4-6 patients
      const idealPatientLoad = 5;
      const workload = Math.min((assignedPatients / idealPatientLoad) * 100, 100);
      setWorkloadPercentage(workload);

      // Build stats cards
      const newStats: StatCard[] = [
        {
          title: 'Assigned Patients',
          value: assignedPatients,
          subtitle: criticalPatients > 0 ? `${criticalPatients} critical` : 'all stable',
          icon: <PatientIcon />,
          color: assignedPatients > 8 ? 'warning' : 'primary',
          priority: criticalPatients > 0 ? 'high' : 'medium',
          actionLabel: 'View Patients',
          onAction: onViewPatients
        },
        {
          title: 'Medications Due',
          value: medicationsDue,
          subtitle: medicationsDue > 15 ? 'high priority' : 'on schedule',
          icon: <MedicationIcon />,
          color: medicationsDue > 20 ? 'error' : medicationsDue > 10 ? 'warning' : 'info',
          priority: medicationsDue > 15 ? 'high' : 'medium',
          actionLabel: 'View Schedule',
          onAction: onViewMedications
        },
        {
          title: 'Vital Signs Pending',
          value: vitalSignsPending,
          subtitle: 'routine checks needed',
          icon: <VitalsIcon />,
          color: vitalSignsPending > 10 ? 'warning' : 'secondary',
          actionLabel: 'Record Vitals',
          onAction: () => console.log('Record vitals')
        },
        {
          title: 'Available Beds',
          value: availableBeds,
          subtitle: `${totalBeds - availableBeds} occupied`,
          icon: <BedIcon />,
          color: availableBeds < 3 ? 'error' : availableBeds < 5 ? 'warning' : 'success',
          actionLabel: 'View Beds'
        },
        {
          title: 'Tasks Completed',
          value: tasksCompleted,
          subtitle: `${Math.round((tasksCompleted / (assignedPatients * 3)) * 100)}% of daily tasks`,
          icon: <TaskIcon />,
          color: 'success',
          actionLabel: 'View Tasks',
          onAction: onViewTasks
        }
      ];

      // Add critical alert if there are critical patients
      if (criticalPatients > 2) {
        newStats.unshift({
          title: 'Critical Patients',
          value: criticalPatients,
          subtitle: 'require immediate attention',
          icon: <AlertIcon />,
          color: 'error',
          priority: 'high',
          actionLabel: 'View Details',
          onAction: onViewPatients
        });
      }

      setStats(newStats);
    } catch (error: any) {
      console.error('Failed to fetch nurse stats:', error);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNurseStats();
  }, [refreshTrigger, nurseName]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button size="small" onClick={fetchNurseStats} startIcon={<RefreshIcon />}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Workload Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center">
              <TrendIcon sx={{ mr: 1 }} />
              Current Shift Workload
              {nurseName && (
                <Chip 
                  label={`Nurse ${nurseName}`} 
                  size="small" 
                  sx={{ ml: 2 }} 
                  color="primary" 
                />
              )}
            </Typography>
            <Chip 
              label={`${Math.round(workloadPercentage)}%`}
              color={
                workloadPercentage > 90 ? 'error' : 
                workloadPercentage > 70 ? 'warning' : 
                workloadPercentage > 50 ? 'info' : 'success'
              }
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={workloadPercentage}
            color={
              workloadPercentage > 90 ? 'error' : 
              workloadPercentage > 70 ? 'warning' : 'primary'
            }
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            {workloadPercentage >= 90 ? 'Critical workload - request assistance' : 
             workloadPercentage >= 70 ? 'High workload - prioritize critical tasks' : 
             workloadPercentage >= 50 ? 'Moderate workload - manageable' : 
             'Light workload - optimal conditions'}
          </Typography>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={3}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ 
              height: '100%',
              '&:hover': { boxShadow: 3 },
              border: stat.priority === 'high' ? '2px solid #f44336' : 'none',
              animation: stat.priority === 'high' ? 'pulse 2s infinite' : 'none',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.9 },
              }
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box sx={{ color: `${stat.color}.main` }}>
                    {stat.icon}
                  </Box>
                  {stat.priority === 'high' && (
                    <Chip
                      label="URGENT"
                      size="small"
                      color="error"
                      icon={<AlertIcon />}
                    />
                  )}
                </Box>
                
                <Typography variant="h3" fontWeight="bold" color={`${stat.color}.main`} gutterBottom>
                  {stat.value}
                </Typography>
                
                <Typography variant="h6" gutterBottom>
                  {stat.title}
                </Typography>
                
                {stat.subtitle && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {stat.subtitle}
                  </Typography>
                )}

                {stat.onAction && (
                  <Button
                    size="small"
                    variant="outlined"
                    color={stat.color}
                    onClick={stat.onAction}
                    sx={{ mt: 1 }}
                  >
                    {stat.actionLabel}
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default NurseStats;