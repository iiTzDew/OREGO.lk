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
  EventAvailable as AppointmentIcon,
  Person as PatientIcon,
  LocalHospital as DischargeIcon,
  Warning as EmergencyIcon,
  AccessTime as ClockIcon,
  TrendingUp as TrendIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { format, isToday, parseISO } from 'date-fns';
import { bookingService } from '../services/bookingService';
import { userService } from '../services/userService';
import { dischargeService } from '../services/dischargeService';

interface DoctorStatsProps {
  doctorId?: string;
  doctorName?: string;
  refreshTrigger?: number;
  onViewAppointments?: () => void;
  onViewPatients?: () => void;
  onViewDischarges?: () => void;
}

interface StatCard {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
    label: string;
  };
  actionLabel?: string;
  onAction?: () => void;
}

const DoctorStats: React.FC<DoctorStatsProps> = ({
  doctorId,
  doctorName,
  refreshTrigger = 0,
  onViewAppointments,
  onViewPatients,
  onViewDischarges,
}) => {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workloadPercentage, setWorkloadPercentage] = useState(0);

  const fetchDoctorStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const [bookingsData, patientsData, dischargesData] = await Promise.allSettled([
        bookingService.getAllBookings(),
        userService.getAllUsers(),
        dischargeService.getAllDischarges(),
      ]);

      let todayAppointments = 0;
      let totalPatients = 0;
      let pendingDischarges = 0;
      let emergencyPatients = 0;
      let completedToday = 0;
      let upcomingToday = 0;

      // Process bookings
      if (bookingsData.status === 'fulfilled') {
        const bookings = bookingsData.value.bookings || [];
        const doctorBookings = doctorId ? 
          bookings.filter((b: any) => b.doctor_name?.toLowerCase().includes(doctorName?.toLowerCase() || '')) :
          bookings;

        const today = format(new Date(), 'yyyy-MM-dd');
        
        todayAppointments = doctorBookings.filter((b: any) => {
          return b.scheduled_date.startsWith(today) && b.status === 'scheduled';
        }).length;

        completedToday = doctorBookings.filter((b: any) => {
          return b.scheduled_date.startsWith(today) && b.status === 'completed';
        }).length;

        upcomingToday = doctorBookings.filter((b: any) => {
          if (!b.scheduled_date || !b.scheduled_time) return false;
          try {
            const appointmentDate = new Date(`${b.scheduled_date}T${b.scheduled_time}`);
            if (isNaN(appointmentDate.getTime())) return false;
            return isToday(appointmentDate) && b.status === 'scheduled' && appointmentDate > new Date();
          } catch (error) {
            return false;
          }
        }).length;
      }

      // Process patients
      if (patientsData.status === 'fulfilled') {
        const users = patientsData.value.users || [];
        const patients = users.filter((u: any) => u.role === 'patient' && u.is_active);
        totalPatients = patients.length;

        // Simulate emergency patients (in real scenario, this would come from a specific API)
        emergencyPatients = Math.floor(Math.random() * 3); // 0-2 emergency patients
      }

      // Process discharges
      if (dischargesData.status === 'fulfilled') {
        const discharges = dischargesData.value.discharges || [];
        const doctorDischarges = doctorId ? 
          discharges.filter((d: any) => d.doctor_name?.toLowerCase().includes(doctorName?.toLowerCase() || '')) :
          discharges;

        pendingDischarges = doctorDischarges.filter((d: any) => 
          d.status === 'pending' || !d.status
        ).length;
      }

      // Calculate workload (max 100%)
      const maxDailyCapacity = 12; // Assume max 12 appointments per day
      const workload = Math.min((todayAppointments + completedToday) / maxDailyCapacity * 100, 100);
      setWorkloadPercentage(workload);

      // Build stats cards
      const newStats: StatCard[] = [
        {
          title: "Today's Appointments",
          value: todayAppointments,
          subtitle: `${completedToday} completed`,
          icon: <AppointmentIcon />,
          color: 'primary',
          trend: {
            direction: todayAppointments > 6 ? 'up' : 'stable',
            value: Math.round(workload),
            label: 'workload'
          },
          actionLabel: 'View All',
          onAction: onViewAppointments
        },
        {
          title: 'Upcoming Today',
          value: upcomingToday,
          subtitle: upcomingToday > 0 ? 'appointments pending' : 'schedule clear',
          icon: <ClockIcon />,
          color: upcomingToday > 5 ? 'warning' : 'info',
          actionLabel: 'Schedule',
          onAction: onViewAppointments
        },
        {
          title: 'Total Active Patients',
          value: totalPatients,
          subtitle: 'in your care',
          icon: <PatientIcon />,
          color: 'secondary',
          trend: {
            direction: 'up',
            value: 8,
            label: 'this month'
          },
          actionLabel: 'View Patients',
          onAction: onViewPatients
        },
        {
          title: 'Pending Discharges',
          value: pendingDischarges,
          subtitle: pendingDischarges > 0 ? 'require review' : 'all cleared',
          icon: <DischargeIcon />,
          color: pendingDischarges > 3 ? 'error' : 'success',
          actionLabel: 'Review',
          onAction: onViewDischarges
        }
      ];

      // Add emergency alert if there are emergency patients
      if (emergencyPatients > 0) {
        newStats.push({
          title: 'Emergency Patients',
          value: emergencyPatients,
          subtitle: 'require immediate attention',
          icon: <EmergencyIcon />,
          color: 'error',
          actionLabel: 'Respond',
          onAction: () => console.log('Emergency response')
        });
      }

      setStats(newStats);
    } catch (error: any) {
      console.error('Failed to fetch doctor stats:', error);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorStats();
  }, [refreshTrigger, doctorId, doctorName]);

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'stable': return '➡️';
      default: return '';
    }
  };

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
          <Button size="small" onClick={fetchDoctorStats} startIcon={<RefreshIcon />}>
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
          <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center">
              <TrendIcon sx={{ mr: 1 }} />
              Today's Workload
              {doctorName && (
                <Chip 
                  label={`Dr. ${doctorName}`} 
                  size="small" 
                  sx={{ ml: 2 }} 
                  color="primary" 
                />
              )}
            </Typography>
            <Chip 
              label={`${Math.round(workloadPercentage)}%`}
              color={workloadPercentage > 80 ? 'error' : workloadPercentage > 60 ? 'warning' : 'success'}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={workloadPercentage}
            color={workloadPercentage > 80 ? 'error' : workloadPercentage > 60 ? 'warning' : 'primary'}
            sx={{ height: 8, borderRadius: 4, mb: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            {workloadPercentage >= 90 ? 'Very High' : 
             workloadPercentage >= 70 ? 'High' : 
             workloadPercentage >= 40 ? 'Moderate' : 'Light'} workload today
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
              border: stat.color === 'error' ? '1px solid #f44336' : 'none'
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box sx={{ color: `${stat.color}.main` }}>
                    {stat.icon}
                  </Box>
                  {stat.trend && (
                    <Chip
                      label={`${getTrendIcon(stat.trend.direction)} ${stat.trend.value}% ${stat.trend.label}`}
                      size="small"
                      variant="outlined"
                      color={stat.trend.direction === 'up' ? 'success' : stat.trend.direction === 'down' ? 'error' : 'default'}
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

export default DoctorStats;