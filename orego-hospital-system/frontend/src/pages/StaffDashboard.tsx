import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Tabs, Tab, Button } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as TaskIcon,
  Inventory as InventoryIcon,
  Build as MaintenanceIcon,
  HomeWork as FacilityIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import StaffStats from '../components/StaffStats';
import TaskManagement from '../components/TaskManagement';
import InventoryTracker from '../components/InventoryTracker';
import MaintenanceRequests from '../components/MaintenanceRequests';
import FacilityManagement from '../components/FacilityManagement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const StaffDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, onClick: () => {} },
  ];

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <DashboardLayout title="Staff Dashboard" menuItems={menuItems}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Welcome, Staff Member
        </Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
        >
          Refresh
        </Button>
      </Box>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="staff dashboard tabs"
          >
            <Tab
              icon={<DashboardIcon />}
              label="Overview"
              iconPosition="start"
            />
            <Tab
              icon={<TaskIcon />}
              label="My Tasks"
              iconPosition="start"
            />
            <Tab
              icon={<InventoryIcon />}
              label="Inventory"
              iconPosition="start"
            />
            <Tab
              icon={<MaintenanceIcon />}
              label="Maintenance"
              iconPosition="start"
            />
            <Tab
              icon={<FacilityIcon />}
              label="Facilities"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <CardContent>
          <TabPanel value={tabValue} index={0}>
            <StaffStats refreshTrigger={refreshTrigger} />
            
            {/* Quick Previews */}
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                Quick Access
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Card 
                  variant="outlined" 
                  sx={{ flex: 1, minWidth: 200, cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                  onClick={() => setTabValue(1)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <TaskIcon color="primary" />
                      <Typography variant="h6">Tasks</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Manage your daily tasks
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card 
                  variant="outlined" 
                  sx={{ flex: 1, minWidth: 200, cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                  onClick={() => setTabValue(2)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <InventoryIcon color="primary" />
                      <Typography variant="h6">Inventory</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Monitor stock levels
                    </Typography>
                  </CardContent>
                </Card>
                
                <Card 
                  variant="outlined" 
                  sx={{ flex: 1, minWidth: 200, cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                  onClick={() => setTabValue(3)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <MaintenanceIcon color="primary" />
                      <Typography variant="h6">Maintenance</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Track equipment maintenance
                    </Typography>
                  </CardContent>
                </Card>

                <Card 
                  variant="outlined" 
                  sx={{ flex: 1, minWidth: 200, cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                  onClick={() => setTabValue(4)}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                      <FacilityIcon color="primary" />
                      <Typography variant="h6">Facilities</Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Room and facility management
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <TaskManagement refreshTrigger={refreshTrigger} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <InventoryTracker refreshTrigger={refreshTrigger} />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <MaintenanceRequests refreshTrigger={refreshTrigger} />
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <FacilityManagement refreshTrigger={refreshTrigger} />
          </TabPanel>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default StaffDashboard;
