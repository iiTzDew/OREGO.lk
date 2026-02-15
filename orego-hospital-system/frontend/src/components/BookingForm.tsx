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
  IconButton,
  Chip,
  Autocomplete,
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { bookingService } from '../services/bookingService';
import { userService } from '../services/userService';
import { resourceService } from '../services/resourceService';
import { User, Resource } from '../types';

interface BookingFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BOOKING_TYPES = [
  { value: 'appointment', label: 'Appointment' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'test', label: 'Medical Test' },
];

interface ResourceAllocation {
  resource_type: string;
  resource_id?: string;
  staff_id?: string;
}

const BookingForm: React.FC<BookingFormProps> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState<User[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [nurses, setNurses] = useState<User[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    booking_type: '',
    scheduled_date: '',
    duration_hours: '1',
    notes: '',
  });

  const [allocatedResources, setAllocatedResources] = useState<ResourceAllocation[]>([]);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [patientsData, doctorsData, nursesData, staffData, resourcesData] = await Promise.all([
        userService.getPatients(),
        userService.getDoctors(),
        userService.getNurses(),
        userService.getStaff(),
        resourceService.getAllResources(),
      ]);
      
      setPatients(patientsData.patients || []);
      setDoctors(doctorsData.doctors || []);
      setNurses(nursesData.nurses || []);
      setStaff(staffData.staff || []);
      setResources(resourcesData.resources || []);
    } catch (err) {
      setError('Failed to load form data');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addResourceAllocation = (type: string) => {
    setAllocatedResources([
      ...allocatedResources,
      { resource_type: type },
    ]);
  };

  const removeResourceAllocation = (index: number) => {
    setAllocatedResources(allocatedResources.filter((_, i) => i !== index));
  };

  const updateResourceAllocation = (index: number, field: string, value: string) => {
    const updated = [...allocatedResources];
    updated[index] = { ...updated[index], [field]: value };
    setAllocatedResources(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.patient_id || !formData.doctor_id || !formData.booking_type || !formData.scheduled_date) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      const bookingData = {
        ...formData,
        duration_hours: parseInt(formData.duration_hours),
        allocated_resources: allocatedResources,
      };

      await bookingService.createBooking(bookingData);
      
      // Reset form
      setFormData({
        patient_id: '',
        doctor_id: '',
        booking_type: '',
        scheduled_date: '',
        duration_hours: '1',
        notes: '',
      });
      setAllocatedResources([]);
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create booking');
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

  const getAvailableResources = (type: string) => {
    return resources.filter(r => r.type === type && r.status === 'available');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Booking</DialogTitle>
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
                    select
                    label="Booking Type *"
                    name="booking_type"
                    value={formData.booking_type}
                    onChange={handleChange}
                    fullWidth
                    required
                  >
                    <MenuItem value="">Select Type</MenuItem>
                    {BOOKING_TYPES.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Duration (hours) *"
                    name="duration_hours"
                    type="number"
                    value={formData.duration_hours}
                    onChange={handleChange}
                    fullWidth
                    required
                    inputProps={{ min: 1, max: 24 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Scheduled Date & Time *"
                    name="scheduled_date"
                    type="datetime-local"
                    value={formData.scheduled_date}
                    onChange={handleChange}
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={2}
                  />
                </Grid>

                {/* Resource Allocation Section */}
                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Allocate Resources (Optional)
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => addResourceAllocation('nurse')}
                      >
                        Add Nurse
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => addResourceAllocation('staff')}
                      >
                        Add Staff
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => addResourceAllocation('bed')}
                      >
                        Add Bed
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => addResourceAllocation('operation_theatre')}
                      >
                        Add OT
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() => addResourceAllocation('machine')}
                      >
                        Add Machine
                      </Button>
                    </Box>

                    {allocatedResources.map((allocation, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          gap: 2,
                          mb: 2,
                          p: 2,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          alignItems: 'center',
                        }}
                      >
                        <Chip label={allocation.resource_type} color="primary" size="small" />
                        
                        {allocation.resource_type === 'nurse' && (
                          <TextField
                            select
                            label="Select Nurse"
                            value={allocation.staff_id || ''}
                            onChange={(e) => updateResourceAllocation(index, 'staff_id', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                          >
                            <MenuItem value="">Select Nurse</MenuItem>
                            {nurses.map((nurse) => (
                              <MenuItem key={nurse.id} value={nurse.id}>
                                {nurse.name}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}

                        {allocation.resource_type === 'staff' && (
                          <TextField
                            select
                            label="Select Staff"
                            value={allocation.staff_id || ''}
                            onChange={(e) => updateResourceAllocation(index, 'staff_id', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                          >
                            <MenuItem value="">Select Staff</MenuItem>
                            {staff.map((s) => (
                              <MenuItem key={s.id} value={s.id}>
                                {s.name} {s.speciality && `(${s.speciality})`}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}

                        {['bed', 'operation_theatre', 'machine'].includes(allocation.resource_type) && (
                          <TextField
                            select
                            label={`Select ${allocation.resource_type === 'bed' ? 'Bed' : allocation.resource_type === 'operation_theatre' ? 'OT' : 'Machine'}`}
                            value={allocation.resource_id || ''}
                            onChange={(e) => updateResourceAllocation(index, 'resource_id', e.target.value)}
                            size="small"
                            sx={{ flex: 1 }}
                          >
                            <MenuItem value="">Select Resource</MenuItem>
                            {getAvailableResources(allocation.resource_type).map((resource) => (
                              <MenuItem key={resource.id} value={resource.id}>
                                {resource.name} ({resource.location})
                              </MenuItem>
                            ))}
                          </TextField>
                        )}

                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => removeResourceAllocation(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
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
          {loading ? 'Creating...' : 'Create Booking'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingForm;
