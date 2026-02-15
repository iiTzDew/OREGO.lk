import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  BedroomBaby as BedIcon,
  Favorite as VitalsIcon,
  Medication as MedicationIcon,
  Warning as AlertIcon,
  MoreVert as MoreIcon,
  LocalHospital as HospitalIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { userService } from '../services/userService';
import { resourceService } from '../services/resourceService';

interface WardPatientListProps {
  refreshTrigger?: number;
  onPatientSelect?: (patient: any) => void;
  onRecordVitals?: (patientId: string) => void;
  onAdministerMedication?: (patientId: string) => void;
}

interface WardPatient {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  bedNumber: string;
  ward: string;
  admissionDate: string;
  condition: 'stable' | 'critical' | 'moderate' | 'recovering';
  lastVitalsCheck?: string;
  medicationsDue: number;
  alerts: string[];
}

const WardPatientList:React.FC<WardPatientListProps> = ({
  refreshTrigger = 0,
  onPatientSelect,
  onRecordVitals,
  onAdministerMedication,
}) => {
  const [patients, setPatients] = useState<WardPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWardPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersResponse, resourcesResponse] = await Promise.all([
        userService.getAllUsers(),
        resourceService.getAllResources(),
      ]);

      const allUsers = usersResponse.users || [];
      const allResources = resourcesResponse.resources || [];

      // Get patients
      const patientList = allUsers.filter((u: any) => u.role === 'patient' && u.is_active);
      
      // Get beds
      const beds = allResources.filter((r: any) => r.type === 'bed');
      const bookedBeds = beds.filter((b: any) => b.status === 'booked');

      // Simulate ward patients (in real scenario, would filter by nurse assignment/ward)
      const wardPatients: WardPatient[] = patientList.slice(0, bookedBeds.length || 8).map((patient: any, index: number) => {
        const bed = bookedBeds[index] || { bed_number: `B${index + 1}`, ward_id: 'General Ward' };
        const conditions: Array<'stable' | 'critical' | 'moderate' | 'recovering'> = ['stable', 'critical', 'moderate', 'recovering'];
        const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
        
        // Calculate age if date_of_birth exists
        let age;
        if (patient.date_of_birth) {
          try {
            const birthDate = new Date(patient.date_of_birth);
            if (!isNaN(birthDate.getTime())) {
              age = new Date().getFullYear() - birthDate.getFullYear();
            }
          } catch (e) {
            // Ignore age calculation error
          }
        }

        // Generate alerts based on condition
        const alerts: string[] = [];
        if (randomCondition === 'critical') {
          alerts.push('Frequent monitoring required');
          alerts.push('Notify doctor of any changes');
        }
        if (Math.random() > 0.7) {
          alerts.push('Medication due in 30 minutes');
        }

        return {
          id: patient.id,
          name: patient.name,
          age,
          gender: patient.gender,
          bedNumber: bed.bed_number || `B${index + 1}`,
          ward: bed.ward_id || 'General Ward',
          admissionDate: patient.registered_date || new Date().toISOString(),
          condition: randomCondition,
          lastVitalsCheck: new Date(Date.now() - Math.random() * 4 * 60 * 60 * 1000).toISOString(), // Random within last 4 hours
          medicationsDue: Math.floor(Math.random() * 4), // 0-3 medications due
          alerts,
        };
      });

      setPatients(wardPatients);
    } catch (error: any) {
      console.error('Failed to fetch ward patients:', error);
      setError('Failed to load patient list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWardPatients();
  }, [refreshTrigger]);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'critical': return 'error';
      case 'moderate': return 'warning';
      case 'recovering': return 'info';
      case 'stable': return 'success';
      default: return 'default';
    }
  };

  const getGenderIcon = (gender?: string) => {
    if (gender === 'male') return '👨';
    if (gender === 'female') return '👩';
    return '👤';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" display="flex" alignItems="center">
            <HospitalIcon sx={{ mr: 1 }} />
            Ward Patients
            <Chip label={`${patients.length} patients`} size="small" sx={{ ml: 2 }} />
          </Typography>
        </Box>

        {patients.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Typography color="text.secondary">
              No patients assigned to your ward
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {patients.map((patient) => (
              <Grid item xs={12} md={6} lg={4} key={patient.id}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    border: patient.condition === 'critical' ? '2px solid #f44336' : '1px solid #e0e0e0',
                    '&:hover': { boxShadow: 2, cursor: 'pointer' },
                    backgroundColor: patient.condition === 'critical' ? '#fff5f5' : 'white'
                  }}
                  onClick={() => onPatientSelect?.(patient)}
                >
                  <CardContent>
                    {/* Patient Header */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ bgcolor: getConditionColor(patient.condition) + '.main' }}>
                          {getGenderIcon(patient.gender)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {patient.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {patient.age && `${patient.age}y`} {patient.gender && `• ${patient.gender}`}
                          </Typography>
                        </Box>
                      </Box>
                      <IconButton size="small">
                        <MoreIcon />
                      </IconButton>
                    </Box>

                    {/* Bed Info */}
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <BedIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Bed {patient.bedNumber} • {patient.ward}
                      </Typography>
                    </Box>

                    {/* Condition Status */}
                    <Box mb={2}>
                      <Chip
                        label={patient.condition.toUpperCase()}
                        size="small"
                        color={getConditionColor(patient.condition) as any}
                        sx={{ fontWeight: 600 }}
                      />
                      {patient.medicationsDue > 0 && (
                        <Chip
                          label={`${patient.medicationsDue} meds due`}
                          size="small"
                          color="warning"
                          sx={{ ml: 1 }}
                          icon={<MedicationIcon />}
                        />
                      )}
                    </Box>

                    {/* Last Vitals */}
                    {patient.lastVitalsCheck && (
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5} mb={1}>
                        <TimeIcon fontSize="inherit" />
                        Last vitals: {formatDistanceToNow(new Date(patient.lastVitalsCheck), { addSuffix: true })}
                      </Typography>
                    )}

                    {/* Alerts */}
                    {patient.alerts.length > 0 && (
                      <Alert severity={patient.condition === 'critical' ? 'error' : 'warning'} icon={<AlertIcon />} sx={{ mb: 2, py: 0 }}>
                        <Typography variant="caption">
                          {patient.alerts[0]}
                        </Typography>
                      </Alert>
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    {/* Action Buttons */}
                    <Box display="flex" gap={1} justifyContent="space-between">
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        startIcon={<VitalsIcon />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRecordVitals?.(patient.id);
                        }}
                        fullWidth
                      >
                        Vitals
                      </Button>
                      {patient.medicationsDue > 0 && (
                        <Button
                          size="small"
                          variant="contained"
                          color="warning"
                          startIcon={<MedicationIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAdministerMedication?.(patient.id);
                          }}
                          fullWidth
                        >
                          Meds
                        </Button>
                      )}
                    </Box>

                    {/* Admission Info */}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Admitted: {(() => {
                        try {
                          const admitDate = new Date(patient.admissionDate);
                          return isNaN(admitDate.getTime()) ? 'Unknown' : format(admitDate, 'MMM dd, yyyy');
                        } catch {
                          return 'Unknown';
                        }
                      })()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </CardContent>
    </Card>
  );
};

export default WardPatientList;