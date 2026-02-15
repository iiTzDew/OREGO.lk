import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  IconButton,
  Checkbox,
  Alert,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  Medication as MedicationIcon,
  CheckCircle as CheckIcon,
  Schedule as ClockIcon,
  Warning as AlertIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { format, addMinutes, isPast, isFuture } from 'date-fns';
import { userService } from '../services/userService';

interface MedicationScheduleProps {
  refreshTrigger?: number;
}

interface Medication {
  id: string;
  patientId: string;
  patientName: string;
  bedNumber: string;
  medicationName: string;
  dosage: string;
  route: 'oral' | 'IV' | 'IM' | 'topical' | 'inhaled';
  scheduledTime: Date;
  administered: boolean;
  priority: 'stat' | 'high' | 'normal';
  notes?: string;
}

const MedicationSchedule: React.FC<MedicationScheduleProps> = ({ refreshTrigger = 0 }) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [administerNotes, setAdministerNotes] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const generateMedicationSchedule = async () => {
    try {
      setLoading(true);

      const response = await userService.getAllUsers();
      const users = response.users || [];
      const patients = users.filter((u: any) => u.role === 'patient' && u.is_active);

      const medicationNames = [
        { name: 'Paracetamol', dosage: '500mg' },
        { name: 'Amoxicillin', dosage: '250mg' },
        { name: 'Ibuprofen', dosage: '400mg' },
        { name: 'Metformin', dosage: '850mg' },
        { name: 'Aspirin', dosage: '75mg' },
        { name: 'Lisinopril', dosage: '10mg' },
        { name: 'Omeprazole', dosage: '20mg' },
        { name: 'Atorvastatin', dosage: '40mg' },
      ];

      const routes: Array<'oral' | 'IV' | 'IM' | 'topical' | 'inhaled'> = ['oral', 'IV', 'IM', 'topical', 'inhaled'];
      const priorities: Array<'stat' | 'high' | 'normal'> = ['stat', 'high', 'normal'];

      // Generate medication schedule for next 8 hours (typical shift)
      const schedule: Medication[] = [];
      const now = new Date();

      patients.slice(0, 12).forEach((patient: any, pIndex: number) => {
        // Each patient gets 2-4 medications
        const medCount = 2 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < medCount; i++) {
          const med = medicationNames[Math.floor(Math.random() * medicationNames.length)];
          const timeOffset = Math.floor(Math.random() * 480); // 0-8 hours in minutes
          const scheduledTime = addMinutes(now, timeOffset - 60); // Some in past, some in future
          
          schedule.push({
            id: `med-${pIndex}-${i}`,
            patientId: patient.id,
            patientName: patient.name,
            bedNumber: `B${pIndex + 1}`,
            medicationName: med.name,
            dosage: med.dosage,
            route: routes[Math.floor(Math.random() * routes.length)],
            scheduledTime,
            administered: isPast(scheduledTime) && Math.random() > 0.3, // 70% of past meds administered
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            notes: Math.random() > 0.7 ? 'Take with food' : undefined,
          });
        }
      });

      // Sort by scheduled time
      schedule.sort((a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime());

      setMedications(schedule);
    } catch (error) {
      console.error('Failed to generate medication schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateMedicationSchedule();
  }, [refreshTrigger]);

  const handleAdministerClick = (med: Medication) => {
    setSelectedMedication(med);
    setDialogOpen(true);
    setAdministerNotes('');
  };

  const handleConfirmAdminister = () => {
    if (selectedMedication) {
      setMedications(prev => prev.map(med => 
        med.id === selectedMedication.id 
          ? { ...med, administered: true, notes: administerNotes || med.notes }
          : med
      ));
      setDialogOpen(false);
      setSelectedMedication(null);
      setAdministerNotes('');
    }
  };

  const getTimeStatus = (scheduledTime: Date, administered: boolean) => {
    if (administered) return { status: 'completed', color: 'success', label: 'Administered' };
    
    const now = new Date();
    const diffMinutes = (scheduledTime.getTime() - now.getTime()) / (1000 * 60);
    
    if (diffMinutes < -30) return { status: 'overdue', color: 'error', label: 'Overdue' };
    if (diffMinutes < 0) return { status: 'due', color: 'warning', label: 'Due Now' };
    if (diffMinutes < 30) return { status: 'upcoming', color: 'info', label: 'Due Soon' };
    return { status: 'scheduled', color: 'default', label: 'Scheduled' };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'stat': return 'error';
      case 'high': return 'warning';
      default: return 'default';
    }
  };

  const pendingMedications = medications.filter(m => !m.administered);
  const completedMedications = medications.filter(m => m.administered);

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

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" display="flex" alignItems="center">
              <MedicationIcon sx={{ mr: 1 }} />
              Medication Schedule
            </Typography>
            <Box>
              <Chip 
                label={`${pendingMedications.length} pending`} 
                color="warning" 
                size="small" 
                sx={{ mr: 1 }}
              />
              <Chip 
                label={`${completedMedications.length} done`} 
                color="success" 
                size="small"
              />
            </Box>
          </Box>

          {pendingMedications.length === 0 && completedMedications.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">
                No medications scheduled for this shift
              </Typography>
            </Box>
          ) : (
            <>
              {/* Pending Medications */}
              {pendingMedications.length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                    Pending Medications ({pendingMedications.length})
                  </Typography>
                  <List>
                    {pendingMedications.map((med, index) => {
                      const timeStatus = getTimeStatus(med.scheduledTime, med.administered);
                      const isOverdue = timeStatus.status === 'overdue' || timeStatus.status === 'due';
                      
                      return (
                        <React.Fragment key={med.id}>
                          <ListItem
                            sx={{
                              bgcolor: isOverdue ? '#fff3e0' : 'transparent',
                              borderLeft: isOverdue ? '4px solid #ff9800' : 'none',
                              mb: 1,
                              borderRadius: 1,
                            }}
                          >
                            <ListItemAvatar>
                              <Avatar sx={{ bgcolor: timeStatus.color + '.main' }}>
                                <MedicationIcon />
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {med.medicationName} {med.dosage}
                                  </Typography>
                                  <Chip
                                    label={med.route.toUpperCase()}
                                    size="small"
                                    variant="outlined"
                                  />
                                  {med.priority !== 'normal' && (
                                    <Chip
                                      label={med.priority.toUpperCase()}
                                      size="small"
                                      color={getPriorityColor(med.priority) as any}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <>
                                  <Typography variant="body2" color="text.secondary">
                                    {med.patientName} • Bed {med.bedNumber}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                                    <TimeIcon fontSize="inherit" />
                                    Scheduled: {format(med.scheduledTime, 'HH:mm')} • 
                                    <Chip label={timeStatus.label} size="small" color={timeStatus.color as any} sx={{ ml: 0.5 }} />
                                  </Typography>
                                  {med.notes && (
                                    <Typography variant="caption" color="warning.main" display="flex" alignItems="center" gap={0.5}>
                                      <AlertIcon fontSize="inherit" />
                                      {med.notes}
                                    </Typography>
                                  )}
                                </>
                              }
                            />
                            <Button
                              variant="contained"
                              color={isOverdue ? 'warning' : 'primary'}
                              size="small"
                              onClick={() => handleAdministerClick(med)}
                              startIcon={<CheckIcon />}
                            >
                              Administer
                            </Button>
                          </ListItem>
                          {index < pendingMedications.length - 1 && <Divider />}
                        </React.Fragment>
                      );
                    })}
                  </List>
                </>
              )}

              {/* Completed Medications */}
              {completedMedications.length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, mt: 3 }}>
                    Completed ({completedMedications.length})
                  </Typography>
                  <List sx={{ opacity: 0.7 }}>
                    {completedMedications.slice(0, 5).map((med, index) => (
                      <React.Fragment key={med.id}>
                        <ListItem>
                          <Checkbox checked disabled />
                          <ListItemText
                            primary={`${med.medicationName} ${med.dosage}`}
                            secondary={`${med.patientName} • Bed ${med.bedNumber} • ${format(med.scheduledTime, 'HH:mm')}`}
                          />
                          <Chip label="Administered" size="small" color="success" icon={<CheckIcon />} />
                        </ListItem>
                        {index < Math.min(completedMedications.length, 5) - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Administer Medication Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Administer Medication
          <IconButton onClick={() => setDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedMedication && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  {selectedMedication.patientName} • Bed {selectedMedication.bedNumber}
                </Typography>
              </Alert>
              
              <Typography variant="body1" fontWeight={600} gutterBottom>
                {selectedMedication.medicationName} {selectedMedication.dosage}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Route: {selectedMedication.route.toUpperCase()}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Scheduled Time: {format(selectedMedication.scheduledTime, 'HH:mm')}
              </Typography>

              {selectedMedication.notes && (
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                  {selectedMedication.notes}
                </Alert>
              )}

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Administration Notes (Optional)"
                value={administerNotes}
                onChange={(e) => setAdministerNotes(e.target.value)}
                placeholder="Any observations, patient reactions, or notes..."
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleConfirmAdminister}
            startIcon={<CheckIcon />}
          >
            Confirm Administration
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MedicationSchedule;