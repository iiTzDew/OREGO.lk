import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Phone as PhoneIcon,
  LocalHospital as MedicalIcon,
  PlayArrow as StartIcon,
  CheckCircle as CompleteIcon,
  Cancel as CancelIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { format, isAfter, isBefore, isToday } from 'date-fns';

interface AppointmentCardProps {
  appointment: {
    id: string;
    patient_name: string;
    patient_phone?: string;
    doctor_name: string;
    scheduled_date: string;
    scheduled_time: string;
    status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress';
    type?: string;
    notes?: string;
    urgency?: 'low' | 'medium' | 'high';
  };
  showActions?: boolean;
  compact?: boolean;
  onStart?: (appointmentId: string) => void;
  onComplete?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
  onViewDetails?: (appointmentId: string) => void;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  showActions = true,
  compact = false,
  onStart,
  onComplete,
  onCancel,
  onViewDetails,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getUrgencyColor = (urgency: string = 'medium') => {
    switch (urgency) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getTimeStatus = () => {
    if (!appointment.scheduled_date || !appointment.scheduled_time) return null;
    
    try {
      const appointmentDateTime = new Date(`${appointment.scheduled_date}T${appointment.scheduled_time}`);
      if (isNaN(appointmentDateTime.getTime())) return null;
      
      const now = new Date();
      
      if (isToday(appointmentDateTime)) {
        if (isBefore(appointmentDateTime, now)) {
          return { status: 'overdue', color: 'error', label: 'Overdue' };
        } else if (isBefore(appointmentDateTime, new Date(now.getTime() + 30 * 60000))) {
          return { status: 'soon', color: 'warning', label: 'Soon' };
        } else {
          return { status: 'upcoming', color: 'info', label: 'Today' };
        }
      }
    } catch (error) {
      return null;
    }
    
    return null;
  };

  const timeStatus = getTimeStatus();
  
  const appointmentTime = (() => {
    if (!appointment.scheduled_time) return '';
    try {
      const timeDate = new Date(`2000-01-01T${appointment.scheduled_time}`);
      if (isNaN(timeDate.getTime())) return appointment.scheduled_time;
      return format(timeDate, 'h:mm a');
    } catch (error) {
      return appointment.scheduled_time;
    }
  })();

  return (
    <Card 
      sx={{ 
        mb: 1, 
        border: appointment.urgency === 'high' ? '2px solid #f44336' : '1px solid #e0e0e0',
        '&:hover': { boxShadow: 2 },
        opacity: appointment.status === 'cancelled' ? 0.6 : 1
      }}
    >
      <CardContent sx={{ p: compact ? 2 : 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Avatar sx={{ width: compact ? 32 : 40, height: compact ? 32 : 40, bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant={compact ? "subtitle2" : "subtitle1"} fontWeight={600}>
                {appointment.patient_name}
              </Typography>
              {appointment.patient_phone && (
                <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                  <PhoneIcon fontSize="inherit" />
                  {appointment.patient_phone}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            {appointment.urgency && appointment.urgency !== 'medium' && (
              <Chip
                label={appointment.urgency.toUpperCase()}
                size="small"
                color={getUrgencyColor(appointment.urgency) as any}
                sx={{ fontSize: '0.6rem' }}
              />
            )}
            <Chip
              label={appointment.status.replace('_', ' ').toUpperCase()}
              size="small"
              color={getStatusColor(appointment.status) as any}
            />
            {timeStatus && (
              <Chip
                label={timeStatus.label}
                size="small"
                color={timeStatus.color as any}
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={2} mb={compact ? 1 : 2}>
          <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
            <TimeIcon fontSize="small" />
            {(() => {
              if (!appointment.scheduled_date) return 'No date';
              try {
                const date = new Date(appointment.scheduled_date);
                if (isNaN(date.getTime())) return 'Invalid date';
                return format(date, 'MMM dd, yyyy');
              } catch (error) {
                return 'Invalid date';
              }
            })()} at {appointmentTime}
          </Typography>
          {appointment.type && (
            <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
              <MedicalIcon fontSize="small" />
              {appointment.type}
            </Typography>
          )}
        </Box>

        {appointment.notes && !compact && (
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary" sx={{ 
              fontStyle: 'italic',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              "{appointment.notes}"
            </Typography>
          </Box>
        )}

        {showActions && (
          <>
            <Divider sx={{ my: 1.5 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" gap={1}>
                {appointment.status === 'scheduled' && onStart && (
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<StartIcon />}
                    onClick={() => onStart(appointment.id)}
                    sx={{ minWidth: '90px' }}
                  >
                    Start
                  </Button>
                )}
                
                {(appointment.status === 'in_progress' || appointment.status === 'scheduled') && onComplete && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    startIcon={<CompleteIcon />}
                    onClick={() => onComplete(appointment.id)}
                    sx={{ minWidth: '100px' }}
                  >
                    Complete
                  </Button>
                )}
                
                {appointment.status !== 'completed' && appointment.status !== 'cancelled' && onCancel && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => onCancel(appointment.id)}
                    sx={{ minWidth: '80px' }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
              
              {onViewDetails && (
                <IconButton 
                  size="small" 
                  onClick={() => onViewDetails(appointment.id)}
                  sx={{ ml: 1 }}
                >
                  <MoreIcon />
                </IconButton>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;