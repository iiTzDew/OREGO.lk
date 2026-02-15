import React, { useState } from 'react';
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
} from '@mui/material';
import { userService } from '../services/userService';

interface UserRegistrationFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLES = [
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'patient', label: 'Patient' },
  { value: 'staff', label: 'Staff' },
];

const SPECIALITIES = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology',
  'General Medicine', 'General Surgery', 'Gynecology', 'Hematology',
  'Nephrology', 'Neurology', 'Oncology', 'Ophthalmology',
  'Orthopedics', 'Pediatrics', 'Psychiatry', 'Radiology',
  'Urology', 'ENT', 'Anesthesiology', 'Emergency Medicine'
];

const UserRegistrationForm: React.FC<UserRegistrationFormProps> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
    name: '',
    birthday: '',
    id_card_number: '',
    address: '',
    phone_number: '',
    email: '',
    speciality: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.username || !formData.password || !formData.role || !formData.name ||
          !formData.birthday || !formData.id_card_number || !formData.address ||
          !formData.phone_number || !formData.email) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Create user data
      const userData: any = {
        username: formData.username,
        password: formData.password,
        role: formData.role,
        name: formData.name,
        birthday: formData.birthday,
        id_card_number: formData.id_card_number,
        address: formData.address,
        phone_number: formData.phone_number,
        email: formData.email,
      };

      // Add speciality if role is doctor or staff
      if ((formData.role === 'doctor' || formData.role === 'staff') && formData.speciality) {
        userData.speciality = formData.speciality;
      }

      await userService.registerUser(userData);
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        role: '',
        name: '',
        birthday: '',
        id_card_number: '',
        address: '',
        phone_number: '',
        email: '',
        speciality: '',
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user. Please try again.');
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
      <DialogTitle>Register New User</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                select
                fullWidth
                label="Role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={loading}
              >
                {ROLES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Birthday"
                name="birthday"
                type="date"
                value={formData.birthday}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="ID Card Number"
                name="id_card_number"
                value={formData.id_card_number}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
                disabled={loading}
              />
            </Grid>

            {(formData.role === 'doctor' || formData.role === 'staff') && (
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Speciality"
                  name="speciality"
                  value={formData.speciality}
                  onChange={handleChange}
                  disabled={loading}
                  helperText="Required for doctors and staff"
                >
                  {SPECIALITIES.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Creating...' : 'Register User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserRegistrationForm;
