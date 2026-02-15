import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Tabs, 
  Tab, 
  Grid,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  LocalHospital as PatientIcon,
  Medication as MedicationIcon,
  FavoriteBorder as VitalsIcon,
  Refresh as RefreshIcon,
  Warning as AlertIcon,
} from '@mui/icons-material';
import DashboardLayout from '../components/DashboardLayout';
import NurseStats from '../components/NurseStats';
import WardPatientList from '../components/WardPatientList';
import MedicationSchedule from '../components/MedicationSchedule';
import VitalSignsTracker from '../components/VitalSignsTracker';
import VitalSignsHistory from '../components/VitalSignsHistory';
import { userService } from '../services/userService';
import { resourceService } from '../services/resourceService';

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
      id={`nurse-tabpanel-${index}`}
      aria-labelledby={`nurse-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const NurseDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [patients, setPatients] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [vitalSignsOpen, setVitalSignsOpen] = useState(false);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, onClick: () => setCurrentTab(0) },
    { text: 'My Patients', icon: <PatientIcon />, onClick: () => setCurrentTab(1) },
    { text: 'Medications', icon: <MedicationIcon />, onClick: () => setCurrentTab(2) },
    { text: 'Vital Signs', icon: <VitalsIcon />, onClick: () => setCurrentTab(3) },
  ];

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [patientsRes, resourcesRes] = await Promise.all([
        userService.getUsers(),
        resourceService.getResources(),
      ]);
      
      // Filter patients only
      const patientsList = patientsRes.users?.filter((u: any) => u.role === 'patient') || [];
      setPatients(patientsList);
      setResources(resourcesRes?.resources || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRecordVitals = (patient: any) => {
    setSelectedPatient(patient);
    setVitalSignsOpen(true);
  };

  const handleSaveVitals = (vitals: any) => {
    console.log('Vital signs saved:', vitals);
    // In real implementation, save to backend
    handleRefresh();
  };

  // Get critical alerts count
  const getCriticalAlertsCount = () => {
    // In real implementation, fetch from backend
    return patients.filter(p => p.condition === 'critical').length;
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <DashboardLayout title="Nurse Dashboard" menuItems={menuItems}>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Nurse Workstation
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage patient care and ward operations
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          {getCriticalAlertsCount() > 0 && (
            <Chip 
              icon={<AlertIcon />}
              label={`${getCriticalAlertsCount()} Critical Patients`}
              color="error"
              variant="outlined"
            />
          )}
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
          aria-label="nurse dashboard tabs"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Overview" icon={<DashboardIcon />} iconPosition="start" />
          <Tab label="My Patients" icon={<PatientIcon />} iconPosition="start" />
          <Tab label="Medications" icon={<MedicationIcon />} iconPosition="start" />
          <Tab label="Vital Signs" icon={<VitalsIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Tab 0: Overview */}
      <TabPanel value={currentTab} index={0}>
        <Grid container spacing={3}>
          {/* Stats Section */}
          <Grid item xs={12}>
            <NurseStats 
              refreshTrigger={refreshTrigger}
              patients={patients}
              resources={resources}
            />
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      fullWidth 
                      variant="outlined"
                      onClick={() => setCurrentTab(1)}
                    >
                      View Ward Patients
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      fullWidth 
                      variant="outlined"
                      onClick={() => setCurrentTab(2)}
                    >
                      Medication Schedule
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      fullWidth 
                      variant="outlined"
                      onClick={() => setCurrentTab(3)}
                    >
                      Record Vital Signs
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button 
                      fullWidth 
                      variant="outlined"
                      onClick={handleRefresh}
                    >
                      Refresh All Data
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Patients Preview */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Ward Patients
                  </Typography>
                  <Button 
                    size="small"
                    onClick={() => setCurrentTab(1)}
                  >
                    View All
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <WardPatientList 
                  refreshTrigger={refreshTrigger}
                  patients={patients.slice(0, 4)}
                  onRecordVitals={handleRecordVitals}
                  compact
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Medication Alerts Preview */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Medications Due Soon
                  </Typography>
                  <Button 
                    size="small"
                    onClick={() => setCurrentTab(2)}
                  >
                    View Schedule
                  </Button>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <MedicationSchedule 
                  refreshTrigger={refreshTrigger}
                  compact
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 1: My Patients */}
      <TabPanel value={currentTab} index={1}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Ward Patients ({patients.length})
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
            <WardPatientList 
              refreshTrigger={refreshTrigger}
              patients={patients}
              onRecordVitals={handleRecordVitals}
            />
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 2: Medications */}
      <TabPanel value={currentTab} index={2}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Medication Schedule
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
            <MedicationSchedule 
              refreshTrigger={refreshTrigger}
            />
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 3: Vital Signs */}
      <TabPanel value={currentTab} index={3}>
        <Grid container spacing={3}>
          {/* Vital Signs History */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    Vital Signs History
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
                <VitalSignsHistory refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </Grid>

          {/* Record New Vital Signs */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Record New Vital Signs
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Typography color="text.secondary" gutterBottom>
                  Select a patient from the list below to record their vital signs
                </Typography>
                <Box mt={3}>
                  <Grid container spacing={2}>
                    {patients.map((patient) => (
                      <Grid item xs={12} sm={6} md={4} key={patient.id}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': { 
                              boxShadow: 3,
                              borderColor: 'primary.main',
                            }
                          }}
                          onClick={() => handleRecordVitals(patient)}
                        >
                          <CardContent>
                            <Typography variant="subtitle1" gutterBottom>
                              {patient.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {patient.id}
                            </Typography>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              fullWidth
                              sx={{ mt: 2 }}
                              startIcon={<VitalsIcon />}
                            >
                              Record Vitals
                            </Button>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Vital Signs Dialog */}
      <VitalSignsTracker
        open={vitalSignsOpen}
        onClose={() => {
          setVitalSignsOpen(false);
          setSelectedPatient(null);
        }}
        patientName={selectedPatient?.name}
        patientId={selectedPatient?.id}
        bedNumber={selectedPatient?.bedNumber}
        onSave={handleSaveVitals}
      />
    </DashboardLayout>
  );
};

export default NurseDashboard;
