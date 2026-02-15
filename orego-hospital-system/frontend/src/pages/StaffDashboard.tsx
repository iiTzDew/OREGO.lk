import React, { useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { Dashboard as DashboardIcon } from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';

const StaffDashboard: React.FC = () => {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, onClick: () => {} },
  ];

  return (
    <DashboardLayout title="Staff Dashboard" menuItems={menuItems}>
      <Typography variant="h4" gutterBottom>
        Welcome, Staff Member
      </Typography>
      
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6">My Tasks</Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Your assigned tasks and duties will appear here. (To be implemented)
          </Typography>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default StaffDashboard;
