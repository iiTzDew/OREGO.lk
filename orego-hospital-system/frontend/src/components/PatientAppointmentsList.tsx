import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
  Divider,
  Grid,
  Alert,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  AccessTime as TimeIcon,
  VideoCall as VideoIcon,
  LocationOn as LocationIcon,
  PersonOutline as DoctorIcon,
  Cancel as CancelIcon,
  CheckCircle as ConfirmedIcon,
  CheckCircle,
  HourglassEmpty as PendingIcon,
} from '@mui/icons-material';
import { format, parseISO, isPast, isFuture, isToday } from 'date-fns';

interface AppointmentsListProps {
  refreshTrigger?: number;
  compact?: boolean;
}

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  type: 'in-person' | 'video';
  location?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  reason: string;
  notes?: string;
}

const AppointmentsList: React.FC<AppointmentsListProps> = ({ refreshTrigger, compact = false }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, [refreshTrigger]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Mock data - In real implementation, fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          doctorName: 'Dr. Sarah Johnson',
          specialty: 'Cardiologist',
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          time: '10:00 AM',
          type: 'in-person',
          location: 'Building A, Room 205',
          status: 'confirmed',
          reason: 'Regular checkup',
          notes: 'Please bring previous test results',
        },
        {
          id: '2',
          doctorName: 'Dr. Michael Chen',
          specialty: 'General Physician',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          time: '2:30 PM',
          type: 'video',
          status: 'confirmed',
          reason: 'Follow-up consultation',
        },
        {
          id: '3',
          doctorName: 'Dr. Emily Rodriguez',
          specialty: 'Dermatologist',
          date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          time: '11:00 AM',
          type: 'in-person',
          location: 'Building B, Room 310',
          status: 'pending',
          reason: 'Skin examination',
        },
        {
          id: '4',
          doctorName: 'Dr. James Wilson',
          specialty: 'Orthopedic',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          time: '9:00 AM',
          type: 'in-person',
          location: 'Building A, Room 105',
          status: 'completed',
          reason: 'Knee pain consultation',
        },
        {
          id: '5',
          doctorName: 'Dr. Sarah Johnson',
          specialty: 'Cardiologist',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          time: '3:00 PM',
          type: 'in-person',
          location: 'Building A, Room 205',
          status: 'completed',
          reason: 'Annual physical',
        },
      ];

      setAppointments(mockAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <ConfirmedIcon fontSize="small" color="success" />;
      case 'pending':
        return <PendingIcon fontSize="small" color="warning" />;
      case 'cancelled':
        return <CancelIcon fontSize="small" color="error" />;
      case 'completed':
        return <CheckCircle fontSize="small" color="action" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (isToday(date)) return 'Today';
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    try {
      const aptDate = parseISO(apt.date);
      if (filter === 'upcoming') {
        return isFuture(aptDate) || isToday(aptDate);
      } else {
        return isPast(aptDate) && !isToday(aptDate);
      }
    } catch {
      return false;
    }
  });

  const displayAppointments = compact ? filteredAppointments.slice(0, 3) : filteredAppointments;

  if (loading) {
    return <Typography>Loading appointments...</Typography>;
  }

  return (
    <Box>
      {!compact && (
        <Box display="flex" gap={1} mb={3}>
          <Button
            variant={filter === 'upcoming' ? 'contained' : 'outlined'}
            onClick={() => setFilter('upcoming')}
            size="small"
          >
            Upcoming ({appointments.filter(a => {
              try {
                const d = parseISO(a.date);
                return isFuture(d) || isToday(d);
              } catch {
                return false;
              }
            }).length})
          </Button>
          <Button
            variant={filter === 'past' ? 'contained' : 'outlined'}
            onClick={() => setFilter('past')}
            size="small"
          >
            Past ({appointments.filter(a => {
              try {
                const d = parseISO(a.date);
                return isPast(d) && !isToday(d);
              } catch {
                return false;
              }
            }).length})
          </Button>
        </Box>
      )}

      {displayAppointments.length === 0 ? (
        <Alert severity="info">
          No {filter} appointments found.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {displayAppointments.map((appointment) => (
            <Grid item xs={12} key={appointment.id}>
              <Card 
                variant="outlined"
                sx={{
                  '&:hover': { boxShadow: 2 },
                  borderLeft: `4px solid`,
                  borderLeftColor: appointment.status === 'confirmed' ? 'success.main' : 
                                   appointment.status === 'pending' ? 'warning.main' : 
                                   appointment.status === 'cancelled' ? 'error.main' : 'grey.400',
                }}
              >
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                          <DoctorIcon />
                        </Avatar>
                        <Box flex={1}>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Typography variant="h6">
                              {appointment.doctorName}
                            </Typography>
                            <Chip 
                              label={appointment.status}
                              size="small"
                              color={getStatusColor(appointment.status) as any}
                              icon={getStatusIcon(appointment.status) as any}
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {appointment.specialty}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            <strong>Reason:</strong> {appointment.reason}
                          </Typography>
                          {appointment.notes && (
                            <Typography variant="caption" color="primary" display="block" sx={{ mt: 1 }}>
                              Note: {appointment.notes}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {formatDate(appointment.date)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <TimeIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {appointment.time}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          {appointment.type === 'video' ? (
                            <>
                              <VideoIcon fontSize="small" color="action" />
                              <Typography variant="body2">Video Call</Typography>
                            </>
                          ) : (
                            <>
                              <LocationIcon fontSize="small" color="action" />
                              <Typography variant="body2">{appointment.location}</Typography>
                            </>
                          )}
                        </Box>
                      </Box>

                      {filter === 'upcoming' && appointment.status !== 'cancelled' && (
                        <Box mt={2} display="flex" gap={1}>
                          {appointment.type === 'video' && (
                            <Button size="small" variant="contained" fullWidth startIcon={<VideoIcon />}>
                              Join Call
                            </Button>
                          )}
                          <Button size="small" variant="outlined" color="error" fullWidth startIcon={<CancelIcon />}>
                            Cancel
                          </Button>
                        </Box>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AppointmentsList;