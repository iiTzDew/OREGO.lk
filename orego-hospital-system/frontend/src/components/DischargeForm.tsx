import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Box,
  Typography,
} from '@mui/material';
import { dischargeService } from '../services/dischargeService';
import { userService } from '../services/userService';
import { resourceService } from '../services/resourceService';
import { User, Resource } from '../types';

interface DischargeFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DischargeForm: React.FC<DischargeFormProps> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [beds, setBeds] = useState<Resource[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    admission_date: '',
    discharge_date: '',
    diagnosed_disease: '',
    treatment_summary: '',
    prescribed_medicines: '',
    follow_up_instructions: '',
    bed_id: '',
    doctor_approval: false,
  });

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [patientsData, doctorsData, resourcesData] = await Promise.all([
        userService.getPatients(),
        userService.getDoctors(),
        resourceService.getAllResources('bed'),
      ]);
      
      setPatients(patientsData.patients || []);
      setDoctors(doctorsData.doctors || []);
      setBeds(resourcesData.resources || []);
    } catch (err) {
      setError('Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.patient_id || !formData.doctor_id || !formData.admission_date || !formData.discharge_date) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate discharge date is after admission date
      if (new Date(formData.discharge_date) <= new Date(formData.admission_date)) {
        setError('Discharge date must be after admission date');
        setLoading(false);
        return;
      }

      // Prepare data - exclude bed_id if empty
      const dischargeData: any = {
        patient_id: formData.patient_id,
        doctor_id: formData.doctor_id,
        admission_date: formData.admission_date,
        discharge_date: formData.discharge_date,
        diagnosed_disease: formData.diagnosed_disease,
        treatment_summary: formData.treatment_summary,
        prescribed_medicines: formData.prescribed_medicines,
        follow_up_instructions: formData.follow_up_instructions,
        doctor_approval: formData.doctor_approval,
      };

      // Only include bed_id if it's not empty
      if (formData.bed_id) {
        dischargeData.bed_id = formData.bed_id;
      }

      await dischargeService.createDischarge(dischargeData);
      
      // Reset form
      setFormData({
        patient_id: '',
        doctor_id: '',
        admission_date: '',
        discharge_date: '',
        diagnosed_disease: '',
        treatment_summary: '',
        prescribed_medicines: '',
        follow_up_instructions: '',
        bed_id: '',
        doctor_approval: false,
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create discharge record');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create Discharge Record</DialogTitle>
      <DialogContent>
        {loadingData ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Patient *"
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    <MenuItem value="">Select Patient</MenuItem>
                    {patients.map((patient) => (
                      <MenuItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.id_card_number})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="Doctor *"
                    name="doctor_id"
                    value={formData.doctor_id}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    <MenuItem value="">Select Doctor</MenuItem>
                    {doctors.map((doctor) => (
                      <MenuItem key={doctor.id} value={doctor.id}>
                        {doctor.name} {doctor.speciality && `(${doctor.speciality})`}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Admission Date *"
                    name="admission_date"
                    type="date"
                    value={formData.admission_date}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Discharge Date *"
                    name="discharge_date"
                    type="date"
                    value={formData.discharge_date}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    label="Bed (Optional)"
                    name="bed_id"
                    value={formData.bed_id}
                    onChange={handleChange}
                    fullWidth
                  >
                    <MenuItem value="">No Bed</MenuItem>
                    {beds.map((bed) => (
                      <MenuItem key={bed.id} value={bed.id}>
                        {bed.name} - {bed.location}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Diagnosed Disease"
                    name="diagnosed_disease"
                    value={formData.diagnosed_disease}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Treatment Summary"
                    name="treatment_summary"
                    value={formData.treatment_summary}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Describe the treatment provided during hospital stay..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Prescribed Medicines"
                    name="prescribed_medicines"
                    value={formData.prescribed_medicines}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="List all medications with dosage and duration..."
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Follow-up Instructions"
                    name="follow_up_instructions"
                    value={formData.follow_up_instructions}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Post-discharge care instructions and follow-up schedule..."
                  />
                </Grid>
              </Grid>
            </form>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || loadingData}
        >
          {loading ? 'Creating...' : 'Create Discharge'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DischargeForm;
