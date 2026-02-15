import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  Alert,
  IconButton,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  Favorite as HeartIcon,
  Thermostat as TempIcon,
  Air as RespirationIcon,
  BloodtypeTwoTone as BPIcon,
  Speed as PulseIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

interface VitalSignsTrackerProps {
  open: boolean;
  onClose: () => void;
  patientName?: string;
  patientId?: string;
  bedNumber?: string;
  onSave?: (vitals: VitalSigns) => void;
}

interface VitalSigns {
  temperature: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  painLevel: string;
  notes: string;
  recordedAt: string;
}

const VitalSignsTracker: React.FC<VitalSignsTrackerProps> = ({
  open,
  onClose,
  patientName = 'Unknown Patient',
  patientId,
  bedNumber,
  onSave,
}) => {
  const [vitals, setVitals] = useState<VitalSigns>({
    temperature: '',
    bloodPressureSystolic: '',
    bloodPressureDiastolic: '',
    heartRate: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    painLevel: '',
    notes: '',
    recordedAt: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateVitals = () => {
    const newErrors: Record<string, string> = {};

    // Temperature (35-42°C)
    if (vitals.temperature) {
      const temp = parseFloat(vitals.temperature);
      if (isNaN(temp) || temp < 35 || temp > 42) {
        newErrors.temperature = 'Temperature should be between 35-42°C';
      }
    }

    // Blood Pressure (Systolic: 70-200, Diastolic: 40-130 mmHg)
    if (vitals.bloodPressureSystolic) {
      const systolic = parseInt(vitals.bloodPressureSystolic);
      if (isNaN(systolic) || systolic < 70 || systolic > 200) {
        newErrors.bloodPressureSystolic = 'Systolic should be between 70-200 mmHg';
      }
    }
    if (vitals.bloodPressureDiastolic) {
      const diastolic = parseInt(vitals.bloodPressureDiastolic);
      if (isNaN(diastolic) || diastolic < 40 || diastolic > 130) {
        newErrors.bloodPressureDiastolic = 'Diastolic should be between 40-130 mmHg';
      }
    }

    // Heart Rate (40-180 bpm)
    if (vitals.heartRate) {
      const hr = parseInt(vitals.heartRate);
      if (isNaN(hr) || hr < 40 || hr > 180) {
        newErrors.heartRate = 'Heart rate should be between 40-180 bpm';
      }
    }

    // Respiratory Rate (8-40 breaths/min)
    if (vitals.respiratoryRate) {
      const rr = parseInt(vitals.respiratoryRate);
      if (isNaN(rr) || rr < 8 || rr > 40) {
        newErrors.respiratoryRate = 'Respiratory rate should be between 8-40 breaths/min';
      }
    }

    // Oxygen Saturation (70-100%)
    if (vitals.oxygenSaturation) {
      const spo2 = parseInt(vitals.oxygenSaturation);
      if (isNaN(spo2) || spo2 < 70 || spo2 > 100) {
        newErrors.oxygenSaturation = 'Oxygen saturation should be between 70-100%';
      }
    }

    // Pain Level (0-10)
    if (vitals.painLevel) {
      const pain = parseInt(vitals.painLevel);
      if (isNaN(pain) || pain < 0 || pain > 10) {
        newErrors.painLevel = 'Pain level should be between 0-10';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateVitals()) {
      const vitalsWithTimestamp = {
        ...vitals,
        recordedAt: new Date().toISOString(),
      };
      onSave?.(vitalsWithTimestamp);
      handleClose();
    }
  };

  const handleClose = () => {
    // Reset form
    setVitals({
      temperature: '',
      bloodPressureSystolic: '',
      bloodPressureDiastolic: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      painLevel: '',
      notes: '',
      recordedAt: new Date().toISOString(),
    });
    setErrors({});
    onClose();
  };

  const handleChange = (field: keyof VitalSigns, value: string) => {
    setVitals(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const getCriticalAlerts = () => {
    const alerts: string[] = [];

    if (vitals.temperature) {
      const temp = parseFloat(vitals.temperature);
      if (temp < 36 || temp > 38.5) alerts.push(`Temperature ${temp}°C is abnormal`);
    }

    if (vitals.oxygenSaturation) {
      const spo2 = parseInt(vitals.oxygenSaturation);
      if (spo2 < 90) alerts.push(`Low oxygen saturation: ${spo2}%`);
    }

    if (vitals.bloodPressureSystolic && vitals.bloodPressureDiastolic) {
      const systolic = parseInt(vitals.bloodPressureSystolic);
      const diastolic = parseInt(vitals.bloodPressureDiastolic);
      if (systolic > 140 || diastolic > 90) alerts.push('Blood pressure is elevated');
      if (systolic < 90 || diastolic < 60) alerts.push('Blood pressure is low');
    }

    return alerts;
  };

  const criticalAlerts = getCriticalAlerts();

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h6">Record Vital Signs</Typography>
          <Typography variant="caption" color="text.secondary">
            {patientName} {bedNumber && `• Bed ${bedNumber}`}
          </Typography>
        </Box>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {criticalAlerts.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Critical Values Detected:</Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {criticalAlerts.map((alert, index) => (
                <li key={index}><Typography variant="body2">{alert}</Typography></li>
              ))}
            </ul>
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Temperature */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Temperature"
              type="number"
              value={vitals.temperature}
              onChange={(e) => handleChange('temperature', e.target.value)}
              error={!!errors.temperature}
              helperText={errors.temperature || 'Normal: 36.5-37.5°C'}
              InputProps={{
                endAdornment: <InputAdornment position="end">°C</InputAdornment>,
                startAdornment: <TempIcon color="action" sx={{ mr: 1 }} />,
              }}
              inputProps={{ step: '0.1', min: '35', max: '42' }}
            />
          </Grid>

          {/* Blood Pressure */}
          <Grid item xs={12} sm={6}>
            <Box display="flex" gap={1} alignItems="flex-start">
              <Box sx={{ mt: 1 }}>
                <BPIcon color="action" />
              </Box>
              <TextField
                fullWidth
                label="BP Systolic"
                type="number"
                value={vitals.bloodPressureSystolic}
                onChange={(e) => handleChange('bloodPressureSystolic', e.target.value)}
                error={!!errors.bloodPressureSystolic}
                helperText={errors.bloodPressureSystolic}
                InputProps={{
                  endAdornment: <InputAdornment position="end">mmHg</InputAdornment>,
                }}
              />
              <Typography sx={{ mt: 2 }}>/</Typography>
              <TextField
                fullWidth
                label="BP Diastolic"
                type="number"
                value={vitals.bloodPressureDiastolic}
                onChange={(e) => handleChange('bloodPressureDiastolic', e.target.value)}
                error={!!errors.bloodPressureDiastolic}
                helperText={errors.bloodPressureDiastolic || 'Normal: 120/80'}
                InputProps={{
                  endAdornment: <InputAdornment position="end">mmHg</InputAdornment>,
                }}
              />
            </Box>
          </Grid>

          {/* Heart Rate */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Heart Rate"
              type="number"
              value={vitals.heartRate}
              onChange={(e) => handleChange('heartRate', e.target.value)}
              error={!!errors.heartRate}
              helperText={errors.heartRate || 'Normal: 60-100 bpm'}
              InputProps={{
                endAdornment: <InputAdornment position="end">bpm</InputAdornment>,
                startAdornment: <HeartIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>

          {/* Respiratory Rate */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Respiratory Rate"
              type="number"
              value={vitals.respiratoryRate}
              onChange={(e) => handleChange('respiratoryRate', e.target.value)}
              error={!!errors.respiratoryRate}
              helperText={errors.respiratoryRate || 'Normal: 12-20 breaths/min'}
              InputProps={{
                endAdornment: <InputAdornment position="end">/min</InputAdornment>,
                startAdornment: <RespirationIcon color="action" sx={{ mr: 1 }} />,
              }}
            />
          </Grid>

          {/* Oxygen Saturation */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Oxygen Saturation (SpO2)"
              type="number"
              value={vitals.oxygenSaturation}
              onChange={(e) => handleChange('oxygenSaturation', e.target.value)}
              error={!!errors.oxygenSaturation}
              helperText={errors.oxygenSaturation || 'Normal: 95-100%'}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                startAdornment: <PulseIcon color="action" sx={{ mr: 1 }} />,
              }}
              inputProps={{ min: '70', max: '100' }}
            />
          </Grid>

          {/* Pain Level */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Pain Level"
              type="number"
              value={vitals.painLevel}
              onChange={(e) => handleChange('painLevel', e.target.value)}
              error={!!errors.painLevel}
              helperText={errors.painLevel || '0 (No pain) to 10 (Worst pain)'}
              inputProps={{ min: '0', max: '10' }}
            />
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Clinical Notes"
              value={vitals.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any observations, patient condition, or additional notes..."
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          startIcon={<SaveIcon />}
          disabled={Object.keys(errors).length > 0}
        >
          Save Vital Signs
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VitalSignsTracker;