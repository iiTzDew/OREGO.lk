import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Medication as PrescriptionIcon,
  Science as TestIcon,
  Description as CertificateIcon,
  Send as ReferralIcon,
  Warning as EmergencyIcon,
  Note as NoteIcon,
  Speed as QuickIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface QuickMedicalActionsProps {
  patientId?: string;
  patientName?: string;
  onPrescriptionCreate?: (prescription: any) => void;
  onTestOrder?: (testOrder: any) => void;
  onCertificateCreate?: (certificate: any) => void;
  onReferralCreate?: (referral: any) => void;
  onEmergencyAlert?: () => void;
  onNoteAdd?: (note: string) => void;
}

const QuickMedicalActions: React.FC<QuickMedicalActionsProps> = ({
  patientId,
  patientName,
  onPrescriptionCreate,
  onTestOrder,
  onCertificateCreate,
  onReferralCreate,
  onEmergencyAlert,
  onNoteAdd,
}) => {
  const [openDialog, setOpenDialog] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [successMessage, setSuccessMessage] = useState('');

  const quickActions = [
    {
      id: 'prescription',
      title: 'Prescription',
      description: 'Prescribe medications',
      icon: <PrescriptionIcon />,
      color: 'primary' as const,
      enabled: !!patientId,
    },
    {
      id: 'test',
      title: 'Order Tests',
      description: 'Lab & imaging orders',
      icon: <TestIcon />,
      color: 'secondary' as const,
      enabled: !!patientId,
    },
    {
      id: 'certificate',
      title: 'Medical Certificate',
      description: 'Sick leave, fitness cert',
      icon: <CertificateIcon />,
      color: 'success' as const,
      enabled: !!patientId,
    },
    {
      id: 'referral',
      title: 'Referral',
      description: 'Refer to specialist',
      icon: <ReferralIcon />,
      color: 'info' as const,
      enabled: !!patientId,
    },
    {
      id: 'emergency',
      title: 'Emergency Alert',
      description: 'Signal emergency',
      icon: <EmergencyIcon />,
      color: 'error' as const,
      enabled: true,
    },
    {
      id: 'note',
      title: 'Quick Note',
      description: 'Add medical note',
      icon: <NoteIcon />,
      color: 'warning' as const,
      enabled: !!patientId,
    },
  ];

  const handleActionClick = (actionId: string) => {
    if (actionId === 'emergency') {
      onEmergencyAlert?.();
      return;
    }
    setOpenDialog(actionId);
    setFormData({});
  };

  const handleDialogClose = () => {
    setOpenDialog(null);
    setFormData({});
  };

  const handleSave = () => {
    switch (openDialog) {
      case 'prescription':
        onPrescriptionCreate?.(formData);
        break;
      case 'test':
        onTestOrder?.(formData);
        break;
      case 'certificate':
        onCertificateCreate?.(formData);
        break;
      case 'referral':
        onReferralCreate?.(formData);
        break;
      case 'note':
        onNoteAdd?.(formData.note);
        break;
    }
    setSuccessMessage(`${openDialog} created successfully!`);
    handleDialogClose();
  };

  const renderDialogContent = () => {
    switch (openDialog) {
      case 'prescription':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medication Name"
                value={formData.medication || ''}
                onChange={(e) => setFormData({ ...formData, medication: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Dosage"
                value={formData.dosage || ''}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Frequency"
                select
                value={formData.frequency || ''}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              >
                <MenuItem value="once_daily">Once Daily</MenuItem>
                <MenuItem value="twice_daily">Twice Daily</MenuItem>
                <MenuItem value="thrice_daily">Thrice Daily</MenuItem>
                <MenuItem value="four_times_daily">Four Times Daily</MenuItem>
                <MenuItem value="as_needed">As Needed</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Duration (days)"
                type="number"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Tablets Count"
                type="number"
                value={formData.quantity || ''}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Instructions"
                value={formData.instructions || ''}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              />
            </Grid>
          </Grid>
        );
      
      case 'test':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Test Type"
                select
                value={formData.testType || ''}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
              >
                <MenuItem value="blood_test">Blood Test</MenuItem>
                <MenuItem value="urine_test">Urine Test</MenuItem>
                <MenuItem value="xray">X-Ray</MenuItem>
                <MenuItem value="ct_scan">CT Scan</MenuItem>
                <MenuItem value="mri">MRI</MenuItem>
                <MenuItem value="ultrasound">Ultrasound</MenuItem>
                <MenuItem value="ecg">ECG</MenuItem>
                <MenuItem value="echo">Echocardiogram</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Specific Tests/Area"
                value={formData.specificTests || ''}
                onChange={(e) => setFormData({ ...formData, specificTests: e.target.value })}
                placeholder="e.g., CBC, Liver function, Chest X-ray"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Priority"
                select
                value={formData.priority || 'normal'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="routine">Routine</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Fasting Required"
                select
                value={formData.fasting || 'no'}
                onChange={(e) => setFormData({ ...formData, fasting: e.target.value })}
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Clinical Notes"
                value={formData.clinicalNotes || ''}
                onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
              />
            </Grid>
          </Grid>
        );
      
      case 'certificate':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Certificate Type"
                select
                value={formData.certificateType || ''}
                onChange={(e) => setFormData({ ...formData, certificateType: e.target.value })}
              >
                <MenuItem value="sick_leave">Sick Leave Certificate</MenuItem>
                <MenuItem value="fitness">Fitness Certificate</MenuItem>
                <MenuItem value="medical_report">Medical Report</MenuItem>
                <MenuItem value="disability">Disability Certificate</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Valid From"
                type="date"
                value={formData.validFrom || ''}
                onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Valid To"
                type="date"
                value={formData.validTo || ''}
                onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Medical Condition/Notes"
                value={formData.condition || ''}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              />
            </Grid>
          </Grid>
        );
      
      case 'referral':
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Refer To Department"
                select
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              >
                <MenuItem value="cardiology">Cardiology</MenuItem>
                <MenuItem value="neurology">Neurology</MenuItem>
                <MenuItem value="orthopedics">Orthopedics</MenuItem>
                <MenuItem value="dermatology">Dermatology</MenuItem>
                <MenuItem value="psychiatry">Psychiatry</MenuItem>
                <MenuItem value="surgery">Surgery</MenuItem>
                <MenuItem value="pediatrics">Pediatrics</MenuItem>
                <MenuItem value="emergency">Emergency Department</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Specialist Doctor (Optional)"
                value={formData.specialistDoctor || ''}
                onChange={(e) => setFormData({ ...formData, specialistDoctor: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Priority"
                select
                value={formData.priority || 'normal'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="routine">Routine</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expected Date"
                type="date"
                value={formData.expectedDate || ''}
                onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Reason for Referral"
                value={formData.reason || ''}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </Grid>
          </Grid>
        );
      
      case 'note':
        return (
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Medical Note"
            value={formData.note || ''}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Enter medical observation, diagnosis, or treatment notes..."
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom display="flex" alignItems="center">
            <QuickIcon sx={{ mr: 1 }} />
            Quick Medical Actions
            {patientName && (
              <Chip 
                label={`Patient: ${patientName}`} 
                size="small" 
                sx={{ ml: 2 }} 
                color="primary" 
              />
            )}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Quick access to common medical actions and documentation
          </Typography>

          <Grid container spacing={2}>
            {quickActions.map((action) => (
              <Grid item xs={12} sm={6} md={4} key={action.id}>
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={!action.enabled}
                  startIcon={action.icon}
                  onClick={() => handleActionClick(action.id)}
                  color={action.color}
                  sx={{
                    height: 80,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    textAlign: 'left',
                    p: 2,
                    '&:hover': action.enabled ? {
                      transform: 'translateY(-2px)',
                      boxShadow: 2,
                    } : {},
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                      {action.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>
                </Button>
              </Grid>
            ))}
          </Grid>

          {!patientId && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Select a patient to enable medical actions
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Action Dialogs */}
      <Dialog 
        open={!!openDialog} 
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {openDialog && (
            <>
              {quickActions.find(a => a.id === openDialog)?.title}
              {patientName && <Chip label={patientName} size="small" />}
            </>
          )}
          <IconButton onClick={handleDialogClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {renderDialogContent()}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            startIcon={<SaveIcon />}
            disabled={!formData || Object.keys(formData).length === 0}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999 }}
          onClose={() => setSuccessMessage('')}
        >
          {successMessage}
        </Alert>
      )}
    </>
  );
};

export default QuickMedicalActions;