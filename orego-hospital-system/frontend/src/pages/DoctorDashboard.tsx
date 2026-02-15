import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Tab,
  Tabs,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
  InputAdornment,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  EventNote,
  Assignment,
  People as PatientsIcon,
  MedicalServices as MedicalIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Today as TodayIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { format, isToday } from 'date-fns';
import DashboardLayout from '../components/DashboardLayout';
import DoctorStats from '../components/DoctorStats';
import AppointmentCard from '../components/AppointmentCard';
import PatientInfoCard from '../components/PatientInfoCard';
import QuickMedicalActions from '../components/QuickMedicalActions';
import BookingForm from '../components/BookingForm';
import DischargeForm from '../components/DischargeForm';
import DischargeList from '../components/DischargeList';
import { bookingService } from '../services/bookingService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const DoctorDashboard: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Form states
  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [dischargeFormOpen, setDischargeFormOpen] = useState(false);
  
  const { user } = useAuth();
  const doctorName = user?.name || 'Doctor';

  // Fetch data
  const fetchAppointments = async () => {
    try {
      const response = await bookingService.getAllBookings();
      const allBookings = response.bookings || [];
      // Filter appointments for this doctor (in real scenario, filter by doctor ID)
      const doctorAppointments = allBookings.filter((appointment: any) => 
        appointment.doctor_name?.toLowerCase().includes(doctorName.toLowerCase())
      );
      setAppointments(doctorAppointments);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await userService.getAllUsers();
      const allUsers = response.users || [];
      const patientList = allUsers.filter((user: any) => user.role === 'patient' && user.is_active);
      setPatients(patientList);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchAppointments(), fetchPatients()]);
    } catch (error: any) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  // Filter functions
  const getTodayAppointments = () => {
    return appointments.filter(appointment => {
      if (!appointment.scheduled_date) return false;
      try {
        const appointmentDate = new Date(appointment.scheduled_date);
        if (isNaN(appointmentDate.getTime())) return false;
        return isToday(appointmentDate) && appointment.status === 'scheduled';
      } catch (error) {
        return false;
      }
    });
  };

  const getUpcomingAppointments = () => {
    return appointments.filter(appointment => {
      if (!appointment.scheduled_date) return false;
      try {
        const appointmentDate = new Date(appointment.scheduled_date);
        if (isNaN(appointmentDate.getTime())) return false;
        return appointmentDate > new Date() && appointment.status === 'scheduled';
      } catch (error) {
        return false;
      }
    }).slice(0, 10);
  };

  const getFilteredPatients = () => {
    if (!searchQuery) return patients.slice(0, 12);
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone_number.includes(searchQuery)
    );
  };

  // Action handlers
  const handleAppointmentStart = async (appointmentId: string) => {
    try {
      // In real scenario, update appointment status to 'in_progress'
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'in_progress' } : apt
      ));
      alert('Appointment started!');
    } catch (error) {
      console.error('Failed to start appointment:', error);
    }
  };

  const handleAppointmentComplete = async (appointmentId: string) => {
    try {
      // In real scenario, update appointment status to 'completed'
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'completed' } : apt
      ));
      setRefreshTrigger(prev => prev + 1);
      alert('Appointment completed!');
    } catch (error) {
      console.error('Failed to complete appointment:', error);
    }
  };

  const handleAppointmentCancel = async (appointmentId: string) => {
    try {
      // In real scenario, update appointment status to 'cancelled'
      setAppointments(prev => prev.map(apt => 
        apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
      ));
      alert('Appointment cancelled!');
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setCurrentTab(3); // Switch to medical actions tab
  };

  const handleMedicalAction = (actionType: string, data: any) => {
    console.log(`${actionType} created:`, data);
    alert(`${actionType} created successfully!`);
    // In real scenario, save to backend
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, onClick: () => setCurrentTab(0) },
    { text: 'Today\'s Schedule', icon: <TodayIcon />, onClick: () => setCurrentTab(1) },
    { text: 'My Patients', icon: <PatientsIcon />, onClick: () => setCurrentTab(2) },
    { text: 'Medical Actions', icon: <MedicalIcon />, onClick: () => setCurrentTab(3) },
    { text: 'Discharges', icon: <Assignment />, onClick: () => setCurrentTab(4) },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Doctor Dashboard" menuItems={menuItems}>
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <CircularProgress size={60} />
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Doctor Dashboard" menuItems={menuItems}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, Dr. {doctorName}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {format(new Date(), 'EEEE, MMMM do, yyyy')}
        </Typography>
      </Box>
      
      <Tabs 
        value={currentTab} 
        onChange={(e, v) => setCurrentTab(v)} 
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Overview" icon={<DashboardIcon />} />
        <Tab label="Today's Schedule" icon={<TodayIcon />} />
        <Tab label="My Patients" icon={<PatientsIcon />} />
        <Tab label="Medical Actions" icon={<MedicalIcon />} />
        <Tab label="Discharges" icon={<Assignment />} />
      </Tabs>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* TAB 0: Overview Dashboard */}
      {currentTab === 0 && (
        <Box>
          {/* Doctor Statistics */}
          <DoctorStats 
            doctorName={doctorName}
            refreshTrigger={refreshTrigger}
            onViewAppointments={() => setCurrentTab(1)}
            onViewPatients={() => setCurrentTab(2)}
            onViewDischarges={() => setCurrentTab(4)}
          />

          {/* Quick Actions */}
          <Box sx={{ mt: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center">
                      <ScheduleIcon sx={{ mr: 1 }} />
                      Quick Schedule Actions
                    </Typography>
                    <Box display="flex" gap={2} flexWrap="wrap">
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setBookingFormOpen(true)}
                      >
                        New Appointment
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => setCurrentTab(1)}
                      >
                        View Today's Schedule
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Today's Summary
                    </Typography>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        Today's Appointments: <Chip label={getTodayAppointments().length} size="small" color="primary" />
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        Total Patients: <Chip label={patients.length} size="small" color="secondary" />
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        Upcoming Appointments: <Chip label={getUpcomingAppointments().length} size="small" color="info" />
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      {/* TAB 1: Today's Schedule */}
      {currentTab === 1 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" display="flex" alignItems="center">
              <TodayIcon sx={{ mr: 1 }} />
              Today's Schedule ({format(new Date(), 'MMMM do, yyyy')})
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setBookingFormOpen(true)}
            >
              Schedule Appointment
            </Button>
          </Box>

          {getTodayAppointments().length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <TodayIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No appointments scheduled for today
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Your schedule is clear today!
                </Typography>
                <Button 
                  variant="outlined" 
                  onClick={() => setBookingFormOpen(true)}
                >
                  Schedule New Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {getTodayAppointments().map((appointment) => (
                <Grid item xs={12} md={6} lg={4} key={appointment.id}>
                  <AppointmentCard
                    appointment={appointment}
                    onStart={handleAppointmentStart}
                    onComplete={handleAppointmentComplete}
                    onCancel={handleAppointmentCancel}
                    onViewDetails={(id) => console.log('View details:', id)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* TAB 2: My Patients */}
      {currentTab === 2 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" display="flex" alignItems="center">
              <PatientsIcon sx={{ mr: 1 }} />
              My Patients
            </Typography>
            <TextField
              size="small"
              placeholder="Search patients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
          </Box>

          <Grid container spacing={3}>
            {getFilteredPatients().map((patient) => (
              <Grid item xs={12} md={6} lg={4} key={patient.id}>
                <PatientInfoCard
                  patient={patient}
                  onViewDetails={(id) => console.log('View patient details:', id)}
                  onCreateAppointment={() => setBookingFormOpen(true)}
                  onEditPatient={(id) => console.log('Edit patient:', id)}
                  compact={true}
                />
                <Button
                  variant="outlined"
                  fullWidth
                  sx={{ mt: 1 }}
                  onClick={() => handlePatientSelect(patient)}
                >
                  Select for Medical Actions
                </Button>
              </Grid>
            ))}
          </Grid>

          {getFilteredPatients().length === 0 && (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                  No patients found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search criteria
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* TAB 3: Medical Actions */}
      {currentTab === 3 && (
        <Box>
          <Typography variant="h5" gutterBottom display="flex" alignItems="center">
            <MedicalIcon sx={{ mr: 1 }} />
            Medical Actions
          </Typography>
          
          {selectedPatient && (
            <Box sx={{ mb: 3 }}>
              <Alert severity="info">
                Selected patient: <strong>{selectedPatient.name}</strong>
              </Alert>
            </Box>
          )}

          <QuickMedicalActions
            patientId={selectedPatient?.id}
            patientName={selectedPatient?.name}
            onPrescriptionCreate={(data) => handleMedicalAction('Prescription', data)}
            onTestOrder={(data) => handleMedicalAction('Test Order', data)}
            onCertificateCreate={(data) => handleMedicalAction('Medical Certificate', data)}
            onReferralCreate={(data) => handleMedicalAction('Referral', data)}
            onEmergencyAlert={() => alert('Emergency alert sent!')}
            onNoteAdd={(note) => handleMedicalAction('Medical Note', { note })}
          />
        </Box>
      )}

      {/* TAB 4: Discharges */}
      {currentTab === 4 && (
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" display="flex" alignItems="center">
              <Assignment sx={{ mr: 1 }} />
              Patient Discharges
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setDischargeFormOpen(true)}
            >
              New Discharge
            </Button>
          </Box>
          
          <DischargeList refreshTrigger={refreshTrigger} />
        </Box>
      )}

      {/* Forms */}
      <BookingForm
        open={bookingFormOpen}
        onClose={() => setBookingFormOpen(false)}
        onSuccess={() => {
          setBookingFormOpen(false);
          setRefreshTrigger(prev => prev + 1);
        }}
      />

      <DischargeForm
        open={dischargeFormOpen}
        onClose={() => setDischargeFormOpen(false)}
        onSuccess={() => {
          setDischargeFormOpen(false);
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </DashboardLayout>
  );
};

export default DoctorDashboard;
