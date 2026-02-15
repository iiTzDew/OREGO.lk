import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  CalendarMonth as AppointmentIcon,
  Assignment as DischargeIcon,
  Medication as PrescriptionIcon,
  Science as TestIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';

interface PatientStatsProps {
  refreshTrigger?: number;
}

const PatientStats: React.FC<PatientStatsProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState({
    upcomingAppointments: 0,
    activePrescriptions: 0,
    dischargeReports: 0,
    pendingTests: 0,
    completedVisits: 0,
    healthScore: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Mock data - In real implementation, fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStats({
        upcomingAppointments: 3,
        activePrescriptions: 5,
        dischargeReports: 2,
        pendingTests: 1,
        completedVisits: 12,
        healthScore: 85,
      });
    } catch (error) {
      console.error('Error fetching patient stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const statCards = [
    {
      title: 'Upcoming Appointments',
      value: stats.upcomingAppointments,
      icon: <AppointmentIcon fontSize="large" />,
      color: '#2196f3',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Active Prescriptions',
      value: stats.activePrescriptions,
      icon: <PrescriptionIcon fontSize="large" />,
      color: '#4caf50',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Discharge Reports',
      value: stats.dischargeReports,
      icon: <DischargeIcon fontSize="large" />,
      color: '#ff9800',
      bgColor: '#fff3e0',
    },
    {
      title: 'Pending Tests',
      value: stats.pendingTests,
      icon: <TestIcon fontSize="large" />,
      color: '#9c27b0',
      bgColor: '#f3e5f5',
    },
  ];

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Grid container spacing={3}>
        {/* Main Stats Cards */}
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                background: `linear-gradient(135deg, ${stat.bgColor} 0%, ${stat.bgColor} 100%)`,
                border: `1px solid ${stat.color}20`,
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: stat.color, my: 1 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: stat.color,
                      color: 'white',
                      borderRadius: '12px',
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Health Overview Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TrendingUpIcon color="primary" />
                <Typography variant="h6">Health Overview</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Health Score
                  </Typography>
                  <Chip 
                    label={`${stats.healthScore}%`}
                    color={getHealthScoreColor(stats.healthScore)}
                    size="small"
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.healthScore}
                  color={getHealthScoreColor(stats.healthScore)}
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Based on recent checkups and vital signs
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box 
                    sx={{ 
                      bgcolor: 'success.light',
                      color: 'success.dark',
                      p: 2,
                      borderRadius: 2,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.completedVisits}
                    </Typography>
                    <Typography variant="caption">
                      Total Visits
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box 
                    sx={{ 
                      bgcolor: 'primary.light',
                      color: 'primary.dark',
                      p: 2,
                      borderRadius: 2,
                      textAlign: 'center',
                    }}
                  >
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {stats.activePrescriptions}
                    </Typography>
                    <Typography variant="caption">
                      Active Meds
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <CheckIcon color="primary" />
                <Typography variant="h6">Action Items</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box>
                {stats.upcomingAppointments > 0 && (
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      mb: 2,
                      bgcolor: 'info.light',
                      borderRadius: 2,
                    }}
                  >
                    <AppointmentIcon color="info" />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {stats.upcomingAppointments} upcoming appointment{stats.upcomingAppointments > 1 ? 's' : ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Check your schedule
                      </Typography>
                    </Box>
                  </Box>
                )}

                {stats.pendingTests > 0 && (
                  <Box 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      mb: 2,
                      bgcolor: 'secondary.light',
                      borderRadius: 2,
                    }}
                  >
                    <TestIcon color="secondary" />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {stats.pendingTests} test result{stats.pendingTests > 1 ? 's' : ''} available
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Review your lab results
                      </Typography>
                    </Box>
                  </Box>
                )}

                {stats.upcomingAppointments === 0 && stats.pendingTests === 0 && (
                  <Box textAlign="center" py={4}>
                    <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      All caught up! No pending actions.
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PatientStats;