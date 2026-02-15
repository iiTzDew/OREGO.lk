import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Badge,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Schedule as ScheduleIcon,
  Person as PatientIcon,
  LocalHospital as DoctorIcon,
  Assignment as BookingIcon,
  AccessTime as TimeIcon,
  Refresh as RefreshIcon,
  Today as TodayIcon,
} from '@mui/icons-material';
import { format, isToday, parseISO } from 'date-fns';
import { bookingService } from '../services/bookingService';

interface TodayBooking {
  id: string;
  booking_type: string;
  patient_name: string;
  doctor_name: string;
  scheduled_date: string;
  scheduled_time?: string;
  status: string;
  description?: string;
}

interface TodaysAppointmentsProps {
  refreshTrigger?: number;
}

const TodaysAppointments: React.FC<TodaysAppointmentsProps> = ({ refreshTrigger = 0 }) => {
  const [appointments, setAppointments] = useState<TodayBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodaysAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await bookingService.getAllBookings();
      const allBookings = data.bookings || [];

      // Filter bookings for today
      const todaysBookings = allBookings
        .filter((booking: any) => {
          try {
            const bookingDate = parseISO(booking.scheduled_date);
            return isToday(bookingDate) && booking.status === 'scheduled';
          } catch {
            return false;
          }
        })
        .sort((a: any, b: any) => {
          // Sort by time if available, otherwise by date
          try {
            const timeA = a.scheduled_time || a.scheduled_date;
            const timeB = b.scheduled_time || b.scheduled_date;
            const dateA = new Date(timeA);
            const dateB = new Date(timeB);
            
            // If either date is invalid, put it at the end
            if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
            if (isNaN(dateA.getTime())) return 1;
            if (isNaN(dateB.getTime())) return -1;
            
            return dateA.getTime() - dateB.getTime();
          } catch (error) {
            return 0;
          }
        });

      setAppointments(todaysBookings);

    } catch (error: any) {
      console.error('Failed to fetch today\'s appointments:', error);
      setError('Failed to load today\'s appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodaysAppointments();
  }, [refreshTrigger]);

  const getBookingTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'surgery':
        return 'error';
      case 'consultation':
        return 'primary';
      case 'checkup':
        return 'success';
      case 'emergency':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getBookingIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'surgery':
        return '🏥';
      case 'consultation':
        return '👨‍⚕️';
      case 'checkup':
        return '🩺';
      case 'emergency':
        return '🚨';
      default:
        return '📋';
    }
  };

  const formatTime = (dateString: string, timeString?: string) => {
    try {
      if (timeString) {
        return format(parseISO(timeString), 'HH:mm');
      }
      return format(parseISO(dateString), 'HH:mm');
    } catch {
      return 'Time TBD';
    }
  };

  const getTimeStatus = (dateString: string, timeString?: string) => {
    try {
      const appointmentTime = timeString ? parseISO(timeString) : parseISO(dateString);
      const now = new Date();
      const diffHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < -1) return { status: 'overdue', color: 'error' };
      if (diffHours < 0) return { status: 'ongoing', color: 'warning' };
      if (diffHours < 1) return { status: 'upcoming', color: 'info' };
      return { status: 'scheduled', color: 'primary' };
    } catch {
      return { status: 'scheduled', color: 'default' };
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" display="flex" alignItems="center">
            <TodayIcon sx={{ mr: 1 }} />
            Today's Appointments
            <Badge
              badgeContent={appointments.length}
              color="primary"
              sx={{ ml: 1 }}
            >
              <CalendarIcon sx={{ ml: 1 }} />
            </Badge>
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={fetchTodaysAppointments}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : appointments.length === 0 ? (
          <Box textAlign="center" py={4}>
            <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No appointments scheduled for today
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All clear! Take some time to catch up on other tasks.
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {appointments.map((appointment, index) => {
              const timeStatus = getTimeStatus(appointment.scheduled_date, appointment.scheduled_time);
              
              return (
                <React.Fragment key={appointment.id}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          bgcolor: `${getBookingTypeColor(appointment.booking_type)}.light`,
                          width: 40,
                          height: 40,
                        }}
                      >
                        {getBookingIcon(appointment.booking_type)}
                      </Avatar>
                    </ListItemIcon>
                    
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {appointment.booking_type.charAt(0).toUpperCase() + appointment.booking_type.slice(1)}
                          </Typography>
                          <Chip
                            label={timeStatus.status}
                            size="small"
                            color={timeStatus.color as any}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                            <PatientIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {appointment.patient_name}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                            <DoctorIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              Dr. {appointment.doctor_name}
                            </Typography>
                          </Box>
                          
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <TimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {formatTime(appointment.scheduled_date, appointment.scheduled_time)}
                            </Typography>
                          </Box>
                          
                          {appointment.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                              {appointment.description}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < appointments.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        )}

        {appointments.length > 0 && (
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
            <Typography variant="caption" color="text.secondary">
              <strong>{appointments.length}</strong> appointment{appointments.length !== 1 ? 's' : ''} scheduled for today
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TodaysAppointments;