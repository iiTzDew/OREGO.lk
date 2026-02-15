import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Speed as PerformanceIcon,
  HealthAndSafety as HealthIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as StableIcon,
} from '@mui/icons-material';
import { userService } from '../services/userService';
import { resourceService } from '../services/resourceService';
import { bookingService } from '../services/bookingService';

interface SystemMetric {
  label: string;
  value: number;
  maxValue: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
  unit?: string;
}

interface SystemPerformanceProps {
  refreshTrigger?: number;
}

const SystemPerformance: React.FC<SystemPerformanceProps> = ({ refreshTrigger = 0 }) => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallHealth, setOverallHealth] = useState<'Excellent' | 'Good' | 'Warning' | 'Critical'>('Good');

  const calculateSystemMetrics = async () => {
    try {
      setLoading(true);

      const [usersData, resourcesData, bookingsData] = await Promise.allSettled([
        userService.getAllUsers(),
        resourceService.getAllResources(),
        bookingService.getAllBookings(),
      ]);

      const metrics: SystemMetric[] = [];

      if (usersData.status === 'fulfilled' && resourcesData.status === 'fulfilled') {
        const users = usersData.value.users || [];
        const resources = resourcesData.value.resources || [];
        
        // Staff-to-bed ratio
        const activeStaff = users.filter((u: any) => 
          ['doctor', 'nurse'].includes(u.role) && u.is_active
        ).length;
        const totalBeds = resources.filter((r: any) => r.type === 'bed').length;
        const staffToBedRatio = totalBeds > 0 ? (activeStaff / totalBeds) * 100 : 0;
        
        let staffStatus: SystemMetric['status'] = 'excellent';
        if (staffToBedRatio < 20) staffStatus = 'critical';
        else if (staffToBedRatio < 40) staffStatus = 'warning';
        else if (staffToBedRatio < 60) staffStatus = 'good';

        metrics.push({
          label: 'Staff-to-Bed Ratio',
          value: activeStaff,
          maxValue: totalBeds * 0.6, // Ideal ratio
          status: staffStatus,
          trend: 'stable',
          icon: <PerformanceIcon />,
          unit: 'staff per bed'
        });

        // Resource availability
        const availableResources = resources.filter((r: any) => r.status === 'available').length;
        const totalResources = resources.length;
        const availabilityPercentage = totalResources > 0 ? (availableResources / totalResources) * 100 : 0;
        
        let resourceStatus: SystemMetric['status'] = 'excellent';
        if (availabilityPercentage < 30) resourceStatus = 'critical';
        else if (availabilityPercentage < 50) resourceStatus = 'warning';
        else if (availabilityPercentage < 70) resourceStatus = 'good';

        metrics.push({
          label: 'Resource Availability',
          value: availabilityPercentage,
          maxValue: 100,
          status: resourceStatus,
          trend: 'stable',
          icon: <HealthIcon />,
          unit: '%'
        });
      }

      if (bookingsData.status === 'fulfilled') {
        const bookings = bookingsData.value.bookings || [];
        
        // Today's booking load
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = bookings.filter((b: any) => 
          b.scheduled_date.startsWith(today) && b.status === 'scheduled'
        ).length;
        
        // Assume max capacity of 50 appointments per day for a medium hospital
        const maxDailyCapacity = 50;
        const loadPercentage = (todayBookings / maxDailyCapacity) * 100;
        
        let loadStatus: SystemMetric['status'] = 'good';
        if (loadPercentage > 95) loadStatus = 'critical';
        else if (loadPercentage > 80) loadStatus = 'warning';
        else if (loadPercentage < 20) loadStatus = 'warning'; // Too low might be bad too

        metrics.push({
          label: 'Daily Booking Load',
          value: loadPercentage,
          maxValue: 100,
          status: loadStatus,
          trend: todayBookings > 25 ? 'up' : todayBookings < 10 ? 'down' : 'stable',
          icon: <TrendingUpIcon />,
          unit: '%'
        });

        // Operational efficiency (completed vs scheduled)
        const completedBookings = bookings.filter((b: any) => b.status === 'completed').length;
        const totalScheduled = bookings.filter((b: any) => b.status !== 'cancelled').length;
        const efficiencyPercentage = totalScheduled > 0 ? (completedBookings / totalScheduled) * 100 : 0;
        
        let efficiencyStatus: SystemMetric['status'] = 'excellent';
        if (efficiencyPercentage < 60) efficiencyStatus = 'critical';
        else if (efficiencyPercentage < 75) efficiencyStatus = 'warning';
        else if (efficiencyPercentage < 85) efficiencyStatus = 'good';

        metrics.push({
          label: 'Operational Efficiency',
          value: efficiencyPercentage,
          maxValue: 100,
          status: efficiencyStatus,
          trend: 'up',
          icon: <PerformanceIcon />,
          unit: '%'
        });
      }

      // Calculate overall health
      const statusScores = { excellent: 4, good: 3, warning: 2, critical: 1 };
      const avgScore = metrics.reduce((sum, metric) => sum + statusScores[metric.status], 0) / metrics.length;
      
      let health: typeof overallHealth = 'Good';
      if (avgScore >= 3.5) health = 'Excellent';
      else if (avgScore >= 2.5) health = 'Good';
      else if (avgScore >= 1.5) health = 'Warning';
      else health = 'Critical';

      setMetrics(metrics);
      setOverallHealth(health);

    } catch (error) {
      console.error('Failed to calculate system metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateSystemMetrics();
  }, [refreshTrigger]);

  const getStatusColor = (status: SystemMetric['status']) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: SystemMetric['trend']) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon color="success" />;
      case 'down': return <TrendingDownIcon color="error" />;
      case 'stable': return <StableIcon color="disabled" />;
      default: return <StableIcon />;
    }
  };

  const getHealthColor = (health: typeof overallHealth) => {
    switch (health) {
      case 'Excellent': return 'success';
      case 'Good': return 'info';
      case 'Warning': return 'warning';
      case 'Critical': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" display="flex" alignItems="center">
            <PerformanceIcon sx={{ mr: 1 }} />
            System Performance
          </Typography>
          <Chip
            label={`Overall Health: ${overallHealth}`}
            color={getHealthColor(overallHealth) as any}
            icon={<HealthIcon />}
          />
        </Box>

        <Grid container spacing={3}>
          {metrics.map((metric, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Box sx={{ p: 2, border: '1px solid', borderColor: 'grey.200', borderRadius: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="subtitle2" display="flex" alignItems="center" gap={1}>
                    {metric.icon}
                    {metric.label}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    {getTrendIcon(metric.trend)}
                    <Chip
                      label={metric.status.toUpperCase()}
                      size="small"
                      color={getStatusColor(metric.status) as any}
                      variant="outlined"
                    />
                  </Box>
                </Box>
                
                <Box mb={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2">
                      {metric.value.toFixed(1)}{metric.unit} 
                      {metric.unit !== '%' && ` / ${metric.maxValue}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {((metric.value / metric.maxValue) * 100).toFixed(0)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((metric.value / metric.maxValue) * 100, 100)}
                    color={getStatusColor(metric.status) as any}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {metrics.length === 0 && (
          <Typography color="text.secondary" textAlign="center">
            No performance data available
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SystemPerformance;