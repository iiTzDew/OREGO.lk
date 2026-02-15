import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
  LinearProgress,
  Chip,
  Alert,
} from '@mui/material';
import {
  Hotel as BedIcon,
  LocalHospital as OTIcon,
  People as PeopleIcon,
  Assignment as BookingIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { hospitalService } from '../services/hospitalService';
import { resourceService } from '../services/resourceService';
import { bookingService } from '../services/bookingService';
import { userService } from '../services/userService';

interface HospitalStatsProps {
  refreshTrigger?: number;
}

const HospitalStats: React.FC<HospitalStatsProps> = ({ refreshTrigger = 0 }) => {
  const [stats, setStats] = useState({
    hospital: null as any,
    totalBeds: 0,
    availableBeds: 0,
    occupiedBeds: 0,
    maintenanceBeds: 0,
    totalOTs: 0,
    availableOTs: 0,
    bookedOTs: 0,
    maintenanceOTs: 0,
    activeBookings: 0,
    totalStaff: 0,
    loading: true,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchHospitalStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      setError(null);

      // Fetch all data in parallel
      const [
        hospitalData,
        resourcesData,
        bookingsData,
        usersData,
      ] = await Promise.all([
        hospitalService.getHospital().catch(() => null),
        resourceService.getAllResources().catch(() => ({ resources: [] })),
        bookingService.getAllBookings().catch(() => ({ bookings: [] })),
        userService.getAllUsers().catch(() => ({ users: [] })),
      ]);

      const resources = resourcesData.resources || [];
      const bookings = bookingsData.bookings || [];
      const users = usersData.users || [];

      // Calculate bed statistics
      const beds = resources.filter((r: any) => r.type === 'bed');
      const availableBeds = beds.filter((b: any) => b.status === 'available').length;
      const occupiedBeds = beds.filter((b: any) => b.status === 'booked').length;
      const maintenanceBeds = beds.filter((b: any) => b.status === 'maintenance').length;

      // Calculate OT statistics
      const ots = resources.filter((r: any) => r.type === 'operation_theatre');
      const availableOTs = ots.filter((ot: any) => ot.status === 'available').length;
      const bookedOTs = ots.filter((ot: any) => ot.status === 'booked').length;
      const maintenanceOTs = ots.filter((ot: any) => ot.status === 'maintenance').length;

      // Calculate active bookings
      const activeBookings = bookings.filter((b: any) => b.status === 'scheduled').length;

      // Calculate staff count
      const totalStaff = users.filter((u: any) => 
        ['doctor', 'nurse', 'staff'].includes(u.role) && u.is_active
      ).length;

      setStats({
        hospital: hospitalData,
        totalBeds: beds.length,
        availableBeds,
        occupiedBeds,
        maintenanceBeds,
        totalOTs: ots.length,
        availableOTs,
        bookedOTs,
        maintenanceOTs,
        activeBookings,
        totalStaff,
        loading: false,
      });

    } catch (error: any) {
      console.error('Failed to fetch hospital stats:', error);
      setError('Failed to load hospital statistics');
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchHospitalStats();
  }, [refreshTrigger]);

  if (stats.loading) {
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

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  const bedUtilization = stats.totalBeds > 0 ? (stats.occupiedBeds / stats.totalBeds) * 100 : 0;
  const otUtilization = stats.totalOTs > 0 ? (stats.bookedOTs / stats.totalOTs) * 100 : 0;

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'error';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  const getUtilizationStatus = (percentage: number) => {
    if (percentage >= 90) return 'Critical';
    if (percentage >= 75) return 'High';
    if (percentage >= 50) return 'Moderate';
    return 'Low';
  };

  return (
    <Grid container spacing={3}>
      {/* Hospital Overview */}
      {stats.hospital && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {stats.hospital.name} - Operational Overview
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip 
                  icon={<BedIcon />} 
                  label={`${stats.totalBeds} Beds Registered`} 
                  variant="outlined" 
                />
                <Chip 
                  icon={<OTIcon />} 
                  label={`${stats.totalOTs} OTs Available`} 
                  variant="outlined" 
                />
                <Chip 
                  icon={<PeopleIcon />} 
                  label={`${stats.totalStaff} Active Staff`} 
                  variant="outlined" 
                />
                <Chip 
                  icon={<BookingIcon />} 
                  label={`${stats.activeBookings} Active Bookings`} 
                  variant="outlined" 
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Bed Utilization */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <BedIcon sx={{ mr: 1 }} />
              Bed Utilization
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">
                  {stats.occupiedBeds} of {stats.totalBeds} beds occupied
                </Typography>
                <Chip 
                  label={`${bedUtilization.toFixed(1)}% ${getUtilizationStatus(bedUtilization)}`}
                  color={getUtilizationColor(bedUtilization)}
                  size="small"
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={bedUtilization} 
                color={getUtilizationColor(bedUtilization)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {stats.availableBeds}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Available
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary.main">
                    {stats.occupiedBeds}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Occupied
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    {stats.maintenanceBeds}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Maintenance
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* OT Utilization */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <OTIcon sx={{ mr: 1 }} />
              Operation Theatre Utilization
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="body2">
                  {stats.bookedOTs} of {stats.totalOTs} OTs in use
                </Typography>
                <Chip 
                  label={`${otUtilization.toFixed(1)}% ${getUtilizationStatus(otUtilization)}`}
                  color={getUtilizationColor(otUtilization)}
                  size="small"
                />
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={otUtilization} 
                color={getUtilizationColor(otUtilization)}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="success.main">
                    {stats.availableOTs}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Available
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="primary.main">
                    {stats.bookedOTs}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    In Use
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box textAlign="center">
                  <Typography variant="h4" color="warning.main">
                    {stats.maintenanceOTs}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Maintenance
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Alerts */}
      {(bedUtilization >= 90 || otUtilization >= 90 || stats.maintenanceBeds + stats.maintenanceOTs > 0) && (
        <Grid item xs={12}>
          <Alert severity="warning" icon={<WarningIcon />}>
            <Typography variant="subtitle2" gutterBottom>
              Operational Alerts:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {bedUtilization >= 90 && (
                <li>Critical bed occupancy: {bedUtilization.toFixed(1)}% - Consider overflow protocols</li>
              )}
              {otUtilization >= 90 && (
                <li>High OT utilization: {otUtilization.toFixed(1)}% - Schedule management recommended</li>
              )}
              {stats.maintenanceBeds > 0 && (
                <li>{stats.maintenanceBeds} bed(s) under maintenance - Capacity temporarily reduced</li>
              )}
              {stats.maintenanceOTs > 0 && (
                <li>{stats.maintenanceOTs} operation theatre(s) under maintenance - Schedule adjustments required</li>
              )}
            </Box>
          </Alert>
        </Grid>
      )}
    </Grid>
  );
};

export default HospitalStats;