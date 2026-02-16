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
  Assignment as TaskIcon,
  Inventory as InventoryIcon,
  Build as MaintenanceIcon,
  CheckCircle as CompletedIcon,
  Warning as AlertIcon,
  TrendingUp as ProductivityIcon,
} from '@mui/icons-material';

interface StaffStatsProps {
  refreshTrigger?: number;
}

const StaffStats: React.FC<StaffStatsProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState({
    pendingTasks: 0,
    completedToday: 0,
    lowStockItems: 0,
    maintenanceRequests: 0,
    urgentIssues: 0,
    productivity: 0,
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
        pendingTasks: 8,
        completedToday: 12,
        lowStockItems: 5,
        maintenanceRequests: 3,
        urgentIssues: 2,
        productivity: 75,
      });
    } catch (error) {
      console.error('Error fetching staff stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductivityColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const statCards = [
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      icon: <TaskIcon fontSize="large" />,
      color: '#2196f3',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Completed Today',
      value: stats.completedToday,
      icon: <CompletedIcon fontSize="large" />,
      color: '#4caf50',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: <InventoryIcon fontSize="large" />,
      color: '#ff9800',
      bgColor: '#fff3e0',
    },
    {
      title: 'Maintenance Requests',
      value: stats.maintenanceRequests,
      icon: <MaintenanceIcon fontSize="large" />,
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

        {/* Productivity Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ProductivityIcon color="primary" />
                <Typography variant="h6">Today's Productivity</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              <Box mb={3}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="text.secondary">
                    Task Completion Rate
                  </Typography>
                  <Chip 
                    label={`${stats.productivity}%`}
                    color={getProductivityColor(stats.productivity)}
                    size="small"
                  />
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={stats.productivity}
                  color={getProductivityColor(stats.productivity)}
                  sx={{ height: 8, borderRadius: 1 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {stats.completedToday} of {stats.completedToday + stats.pendingTasks} tasks completed
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
                      {stats.completedToday}
                    </Typography>
                    <Typography variant="caption">
                      Completed
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
                      {stats.pendingTasks}
                    </Typography>
                    <Typography variant="caption">
                      Pending
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Urgent Issues Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <AlertIcon color="error" />
                <Typography variant="h6">Urgent Alerts</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <Box>
                {stats.urgentIssues > 0 ? (
                  <>
                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        mb: 2,
                        bgcolor: 'error.light',
                        borderRadius: 2,
                      }}
                    >
                      <AlertIcon color="error" />
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {stats.urgentIssues} urgent issue{stats.urgentIssues > 1 ? 's' : ''} require immediate attention
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Review and address ASAP
                        </Typography>
                      </Box>
                    </Box>

                    {stats.lowStockItems > 0 && (
                      <Box 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          mb: 2,
                          bgcolor: 'warning.light',
                          borderRadius: 2,
                        }}
                      >
                        <InventoryIcon color="warning" />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {stats.lowStockItems} item{stats.lowStockItems > 1 ? 's' : ''} low in stock
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Restock needed soon
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {stats.maintenanceRequests > 0 && (
                      <Box 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 2,
                          bgcolor: 'info.light',
                          borderRadius: 2,
                        }}
                      >
                        <MaintenanceIcon color="info" />
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {stats.maintenanceRequests} maintenance request{stats.maintenanceRequests > 1 ? 's' : ''} pending
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Check maintenance queue
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box textAlign="center" py={4}>
                    <CompletedIcon sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      No urgent issues at this time!
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

export default StaffStats;