import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Medication as MedicationIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as ActiveIcon,
  Info as InfoIcon,
  LocalPharmacy as PharmacyIcon,
} from '@mui/icons-material';
import { format, parseISO, differenceInDays } from 'date-fns';

interface PrescriptionsListProps {
  refreshTrigger?: number;
}

interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  route: string;
  prescribedBy: string;
  prescribedDate: string;
  startDate: string;
  endDate: string;
  refillsRemaining: number;
  totalRefills: number;
  instructions: string;
  sideEffects?: string[];
  status: 'active' | 'expired' | 'discontinued';
}

const PrescriptionsList: React.FC<PrescriptionsListProps> = ({ refreshTrigger }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'expired'>('active');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, [refreshTrigger]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      // Mock data - In real implementation, fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockPrescriptions: Prescription[] = [
        {
          id: '1',
          medicationName: 'Metformin',
          dosage: '500mg',
          frequency: 'Twice daily',
          route: 'Oral',
          prescribedBy: 'Dr. Sarah Johnson',
          prescribedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          refillsRemaining: 3,
          totalRefills: 5,
          instructions: 'Take with meals. Monitor blood sugar levels regularly.',
          sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset'],
          status: 'active',
        },
        {
          id: '2',
          medicationName: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          route: 'Oral',
          prescribedBy: 'Dr. Sarah Johnson',
          prescribedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString(),
          refillsRemaining: 4,
          totalRefills: 6,
          instructions: 'Take in the morning. Monitor blood pressure daily.',
          sideEffects: ['Dizziness', 'Dry cough', 'Headache'],
          status: 'active',
        },
        {
          id: '3',
          medicationName: 'Cetirizine',
          dosage: '10mg',
          frequency: 'Once daily',
          route: 'Oral',
          prescribedBy: 'Dr. Emily Rodriguez',
          prescribedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          refillsRemaining: 2,
          totalRefills: 3,
          instructions: 'Take before bedtime for seasonal allergies.',
          sideEffects: ['Drowsiness', 'Dry mouth'],
          status: 'active',
        },
        {
          id: '4',
          medicationName: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Three times daily',
          route: 'Oral',
          prescribedBy: 'Dr. Michael Chen',
          prescribedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          refillsRemaining: 0,
          totalRefills: 0,
          instructions: 'Complete the full course. Take with food.',
          status: 'expired',
        },
        {
          id: '5',
          medicationName: 'Vitamin D3',
          dosage: '1000 IU',
          frequency: 'Once daily',
          route: 'Oral',
          prescribedBy: 'Dr. Michael Chen',
          prescribedDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          refillsRemaining: 5,
          totalRefills: 12,
          instructions: 'Take with a meal containing fat for better absorption.',
          status: 'active',
        },
      ];

      setPrescriptions(mockPrescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getDaysRemaining = (endDateString: string) => {
    try {
      const endDate = parseISO(endDateString);
      const days = differenceInDays(endDate, new Date());
      return days > 0 ? days : 0;
    } catch {
      return 0;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'default';
      case 'discontinued':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredPrescriptions = prescriptions.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  if (loading) {
    return (
      <Box sx={{ width: '100%' }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Filter Chips */}
      <Box display="flex" gap={1} mb={3}>
        <Chip
          label={`Active (${prescriptions.filter(p => p.status === 'active').length})`}
          onClick={() => setFilter('active')}
          color={filter === 'active' ? 'primary' : 'default'}
          variant={filter === 'active' ? 'filled' : 'outlined'}
        />
        <Chip
          label={`Expired (${prescriptions.filter(p => p.status === 'expired').length})`}
          onClick={() => setFilter('expired')}
          color={filter === 'expired' ? 'primary' : 'default'}
          variant={filter === 'expired' ? 'filled' : 'outlined'}
        />
        <Chip
          label={`All (${prescriptions.length})`}
          onClick={() => setFilter('all')}
          color={filter === 'all' ? 'primary' : 'default'}
          variant={filter === 'all' ? 'filled' : 'outlined'}
        />
      </Box>

      {filteredPrescriptions.length === 0 ? (
        <Alert severity="info">
          No prescriptions found.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredPrescriptions.map((prescription) => {
            const daysRemaining = getDaysRemaining(prescription.endDate);
            const refillProgress = ((prescription.totalRefills - prescription.refillsRemaining) / prescription.totalRefills) * 100;

            return (
              <Grid item xs={12} key={prescription.id}>
                <Card 
                  variant="outlined"
                  sx={{
                    borderLeft: `4px solid`,
                    borderLeftColor: prescription.status === 'active' ? 'success.main' : 'grey.400',
                    '&:hover': { boxShadow: 2 },
                  }}
                >
                  <CardContent>
                    <Grid container spacing={2}>
                      {/* Left Section - Medication Info */}
                      <Grid item xs={12} md={6}>
                        <Box display="flex" gap={2}>
                          <Box
                            sx={{
                              width: 56,
                              height: 56,
                              borderRadius: '12px',
                              bgcolor: prescription.status === 'active' ? 'success.light' : 'grey.300',
                              color: prescription.status === 'active' ? 'success.dark' : 'grey.700',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <MedicationIcon fontSize="large" />
                          </Box>
                          <Box flex={1}>
                            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                              <Typography variant="h6">
                                {prescription.medicationName}
                              </Typography>
                              <Chip 
                                label={prescription.status}
                                size="small"
                                color={getStatusColor(prescription.status) as any}
                                icon={prescription.status === 'active' ? <ActiveIcon /> : undefined}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {prescription.dosage} - {prescription.frequency} ({prescription.route})
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Prescribed by: {prescription.prescribedBy}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Date: {formatDate(prescription.prescribedDate)}
                            </Typography>
                          </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        {/* Instructions */}
                        <Box mb={2}>
                          <Box display="flex" alignItems="center" gap={1} mb={1}>
                            <ScheduleIcon fontSize="small" color="action" />
                            <Typography variant="subtitle2" fontWeight="bold">
                              Instructions
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {prescription.instructions}
                          </Typography>
                        </Box>

                        {/* Side Effects */}
                        {prescription.sideEffects && prescription.sideEffects.length > 0 && (
                          <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                              <WarningIcon fontSize="small" color="warning" />
                              <Typography variant="subtitle2" fontWeight="bold">
                                Possible Side Effects
                              </Typography>
                            </Box>
                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                              {prescription.sideEffects.map((effect, idx) => (
                                <Chip 
                                  key={idx}
                                  label={effect}
                                  size="small"
                                  variant="outlined"
                                  color="warning"
                                />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </Grid>

                      {/* Right Section - Status & Refills */}
                      <Grid item xs={12} md={6}>
                        <Box>
                          {/* Duration */}
                          <Box 
                            sx={{ 
                              p: 2,
                              borderRadius: 2,
                              bgcolor: prescription.status === 'active' ? 'success.light' : 'grey.100',
                              mb: 2,
                            }}
                          >
                            <Typography variant="subtitle2" gutterBottom>
                              Duration
                            </Typography>
                            <Typography variant="body2">
                              {formatDate(prescription.startDate)} → {formatDate(prescription.endDate)}
                            </Typography>
                            {prescription.status === 'active' && (
                              <Typography variant="caption" color="success.dark" display="block" mt={1}>
                                {daysRemaining} days remaining
                              </Typography>
                            )}
                          </Box>

                          {/* Refills */}
                          <Box 
                            sx={{ 
                              p: 2,
                              borderRadius: 2,
                              bgcolor: 'primary.light',
                              mb: 2,
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <PharmacyIcon fontSize="small" />
                                <Typography variant="subtitle2">
                                  Refills
                                </Typography>
                              </Box>
                              <Typography variant="subtitle2" color="primary.dark">
                                {prescription.refillsRemaining} / {prescription.totalRefills} remaining
                              </Typography>
                            </Box>
                            {prescription.totalRefills > 0 && (
                              <>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={refillProgress}
                                  sx={{ 
                                    height: 8, 
                                    borderRadius: 1,
                                    bgcolor: 'primary.lighter',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: 'primary.dark',
                                    },
                                  }}
                                />
                                {prescription.refillsRemaining <= 1 && prescription.status === 'active' && (
                                  <Alert severity="warning" sx={{ mt: 1 }}>
                                    <Typography variant="caption">
                                      Low on refills. Contact your doctor.
                                    </Typography>
                                  </Alert>
                                )}
                              </>
                            )}
                          </Box>

                          {/* Quick Info */}
                          {prescription.status === 'active' && daysRemaining <= 7 && (
                            <Alert severity="info" icon={<InfoIcon />}>
                              <Typography variant="caption">
                                Prescription expires in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}. Request renewal soon.
                              </Typography>
                            </Alert>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default PrescriptionsList;