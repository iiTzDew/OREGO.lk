import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Tabs, 
  Tab,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  CalendarMonth as AppointmentsIcon,
  Medication as PrescriptionsIcon,
  LocalHospital as RecordsIcon,
  Assignment as DischargeIcon,
  Refresh as RefreshIcon,
  Warning as AlertIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import PatientStats from '../components/PatientStats';
import PatientAppointmentsList from '../components/PatientAppointmentsList';
import PatientPrescriptionsList from '../components/PatientPrescriptionsList';
import MedicalRecordsCard from '../components/MedicalRecordsCard';
import DischargeReports from '../components/DischargeReports';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const PatientDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, onClick: () => setCurrentTab(0) },
    { text: 'Appointments', icon: <AppointmentsIcon />, onClick: () => setCurrentTab(1) },
    { text: 'Prescriptions', icon: <PrescriptionsIcon />, onClick: () => setCurrentTab(2) },
    { text: 'Medical Records', icon: <RecordsIcon />, onClick: () => setCurrentTab(3) },
    { text: 'Discharge Reports', icon: <DischargeIcon />, onClick: () => setCurrentTab(4) },
  ];

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <DashboardLayout title="Patient Portal" menuItems={menuItems}>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Welcome to Your Health Portal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your appointments, prescriptions, and medical records
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          aria-label="patient dashboard tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" icon={<DashboardIcon />} iconPosition="start" />
          <Tab label="Appointments" icon={<AppointmentsIcon />} iconPosition="start" />
          <Tab label="Prescriptions" icon={<PrescriptionsIcon />} iconPosition="start" />
          <Tab label="Medical Records" icon={<RecordsIcon />} iconPosition="start" />
          <Tab label="Discharge Reports" icon={<DischargeIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab 0: Overview */}
      <TabPanel value={currentTab} index={0}>
        <Box>
          {/* Stats Section */}
          <PatientStats refreshTrigger={refreshTrigger} />

          {/* Recent Activity Sections */}
          <Box mt={4}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Upcoming Appointments
                  </Typography>
                  <Button 
                    size="small"
                    onClick={() => setCurrentTab(1)}
                  >
                    View All
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <PatientAppointmentsList refreshTrigger={refreshTrigger} compact />
              </CardContent>
            </Card>
          </Box>

          <Box mt={3}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Active Prescriptions
                  </Typography>
                  <Button 
                    size="small"
                    onClick={() => setCurrentTab(2)}
                  >
                    View All
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <PatientPrescriptionsList refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>

      {/* Tab 1: Appointments */}
      <TabPanel value={currentTab} index={1}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                My Appointments
              </Typography>
              <Button 
                variant="contained"
                onClick={() => console.log('Book appointment')}
              >
                Book New Appointment
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <PatientAppointmentsList refreshTrigger={refreshTrigger} />
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 2: Prescriptions */}
      <TabPanel value={currentTab} index={2}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                My Prescriptions
              </Typography>
              <Button 
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                size="small"
              >
                Refresh
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <PatientPrescriptionsList refreshTrigger={refreshTrigger} />
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 3: Medical Records */}
      <TabPanel value={currentTab} index={3}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Medical History
              </Typography>
              <Button 
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                size="small"
              >
                Refresh
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <MedicalRecordsCard refreshTrigger={refreshTrigger} />
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 4: Discharge Reports */}
      <TabPanel value={currentTab} index={4}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Discharge Reports
              </Typography>
              <Button 
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                size="small"
              >
                Refresh
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <DischargeReports refreshTrigger={refreshTrigger} />
          </CardContent>
        </Card>
      </TabPanel>
    </DashboardLayout>
  );
};

export default PatientDashboard;
