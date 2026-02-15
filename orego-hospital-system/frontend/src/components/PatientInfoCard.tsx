import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Avatar,
  Divider,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Cake as AgeIcon,
  LocationOn as AddressIcon,
  Bloodtype as BloodIcon,
  MedicalServices as MedicalIcon,
  Warning as EmergencyIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  LocalHospital as AdmitIcon,
} from '@mui/icons-material';
import { format, differenceInYears } from 'date-fns';

interface PatientInfoCardProps {
  patient: {
    id: string;
    name: string;
    username?: string;
    email: string;
    phone_number: string;
    date_of_birth?: string;
    gender?: string;
    address?: string;
    blood_group?: string;
    emergency_contact?: string;
    medical_history?: string;
    is_active: boolean;
    registered_date: string;
  };
  showActions?: boolean;
  showMedicalInfo?: boolean;
  compact?: boolean;
  status?: 'admitted' | 'outpatient' | 'discharged' | 'emergency';
  onViewDetails?: (patientId: string) => void;
  onEditPatient?: (patientId: string) => void;
  onAdmitPatient?: (patientId: string) => void;
  onCreateAppointment?: (patientId: string) => void;
}

const PatientInfoCard: React.FC<PatientInfoCardProps> = ({
  patient,
  showActions = true,
  showMedicalInfo = true,
  compact = false,
  status,
  onViewDetails,
  onEditPatient,
  onAdmitPatient,
  onCreateAppointment,
}) => {
  const getAge = () => {
    if (!patient.date_of_birth) return null;
    try {
      const birthDate = new Date(patient.date_of_birth);
      if (isNaN(birthDate.getTime())) return null;
      return differenceInYears(new Date(), birthDate);
    } catch (error) {
      return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'admitted': return 'error';
      case 'emergency': return 'warning';
      case 'outpatient': return 'info';
      case 'discharged': return 'success';
      default: return 'default';
    }
  };

  const getGenderIcon = () => {
    if (patient.gender === 'male') return '👨';
    if (patient.gender === 'female') return '👩';
    return '👤';
  };

  const age = getAge();

  return (
    <Card 
      sx={{ 
        mb: compact ? 1 : 2, 
        border: status === 'emergency' ? '2px solid #ff9800' : '1px solid #e0e0e0',
        '&:hover': { boxShadow: 3 },
        opacity: !patient.is_active ? 0.6 : 1
      }}
    >
      <CardContent sx={{ p: compact ? 2 : 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar 
              sx={{ 
                width: compact ? 40 : 56, 
                height: compact ? 40 : 56, 
                bgcolor: patient.is_active ? 'primary.main' : 'grey.400',
                fontSize: compact ? '1.2rem' : '1.5rem'
              }}
            >
              {getGenderIcon()}
            </Avatar>
            <Box>
              <Typography variant={compact ? "h6" : "h5"} fontWeight={600}>
                {patient.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ID: {patient.username || patient.id}
              </Typography>
              {age && (
                <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                  <AgeIcon fontSize="small" />
                  {age} years old {patient.gender && `• ${patient.gender}`}
                </Typography>
              )}
            </Box>
          </Box>
          
          <Box display="flex" alignItems="center" gap={1}>
            {status && (
              <Chip
                label={status.toUpperCase()}
                size="small"
                color={getStatusColor(status) as any}
                icon={status === 'emergency' ? <EmergencyIcon /> : undefined}
              />
            )}
            <Chip
              label={patient.is_active ? 'Active' : 'Inactive'}
              size="small"
              color={patient.is_active ? 'success' : 'default'}
            />
          </Box>
        </Box>

        {!compact && (
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5} mb={1}>
                <PhoneIcon fontSize="small" />
                {patient.phone_number}
              </Typography>
              <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5} mb={1}>
                <EmailIcon fontSize="small" />
                {patient.email}
              </Typography>
            </Grid>
            
            {showMedicalInfo && (
              <Grid item xs={12} md={6}>
                {patient.blood_group && (
                  <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5} mb={1}>
                    <BloodIcon fontSize="small" />
                    Blood Group: {patient.blood_group}
                  </Typography>
                )}
                {patient.emergency_contact && (
                  <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5} mb={1}>
                    <EmergencyIcon fontSize="small" />
                    Emergency: {patient.emergency_contact}
                  </Typography>
                )}
              </Grid>
            )}
          </Grid>
        )}

        {patient.address && !compact && (
          <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={0.5} mb={2}>
            <AddressIcon fontSize="small" />
            {patient.address}
          </Typography>
        )}

        {patient.medical_history && showMedicalInfo && !compact && (
          <Box mb={2}>
            <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <MedicalIcon fontSize="small" />
              Medical History:
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                fontStyle: 'italic',
                pl: 2,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {patient.medical_history}
            </Typography>
          </Box>
        )}

        {showActions && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Box display="flex" gap={1} flexWrap="wrap">
                {onCreateAppointment && (
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => onCreateAppointment(patient.id)}
                  >
                    New Appointment
                  </Button>
                )}
                
                {onAdmitPatient && status !== 'admitted' && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="secondary"
                    startIcon={<AdmitIcon />}
                    onClick={() => onAdmitPatient(patient.id)}
                  >
                    Admit
                  </Button>
                )}
              </Box>
              
              <Box display="flex" gap={0.5}>
                {onViewDetails && (
                  <Tooltip title="View Details">
                    <IconButton 
                      size="small" 
                      onClick={() => onViewDetails(patient.id)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                )}
                
                {onEditPatient && (
                  <Tooltip title="Edit Patient">
                    <IconButton 
                      size="small" 
                      onClick={() => onEditPatient(patient.id)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>
          </>
        )}

        {compact && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Registered: {patient.registered_date ? (() => {
              try {
                const regDate = new Date(patient.registered_date);
                return isNaN(regDate.getTime()) ? 'Invalid date' : format(regDate, 'MMM dd, yyyy');
              } catch (error) {
                return 'Invalid date';
              }
            })() : 'No date available'}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientInfoCard;