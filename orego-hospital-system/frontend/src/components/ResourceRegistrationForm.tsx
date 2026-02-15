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
import { resourceService } from '../services/resourceService';

interface ResourceRegistrationFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const RESOURCE_TYPES = [
  { value: 'bed', label: 'Bed' },
  { value: 'operation_theatre', label: 'Operation Theatre' },
  { value: 'machine', label: 'Medical Machine' },
];

const ResourceRegistrationForm: React.FC<ResourceRegistrationFormProps> = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    type: '',
    name: '',
    resource_number: '',
    location: '',
    description: '',
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
      if (!formData.type || !formData.name || !formData.resource_number || !formData.location) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Prepare data based on resource type
      const resourceData: any = {
        type: formData.type,
        name: formData.name,
        location: formData.location,
        description: formData.description,
      };

      // Set the appropriate identifier field based on type
      if (formData.type === 'bed') {
        resourceData.bed_number = formData.resource_number;
      } else if (formData.type === 'operation_theatre') {
        resourceData.ot_number = formData.resource_number;
      } else if (formData.type === 'machine') {
        resourceData.serial_number = formData.resource_number;
      }

      await resourceService.registerResource(resourceData);
      
      // Reset form
      setFormData({
        type: '',
        name: '',
        resource_number: '',
        location: '',
        description: '',
      });
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to register resource');
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Register New Resource</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                select
                fullWidth
                label="Resource Type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={loading}
              >
                {RESOURCE_TYPES.map((option) => (
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
                label="Resource Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., ICU Bed 01"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Resource Number"
                name="resource_number"
                value={formData.resource_number}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., BED-001"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={loading}
                placeholder="e.g., Building A, Floor 2, Room 201"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                placeholder="Additional details about this resource"
              />
            </Grid>
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
            {loading ? 'Registering...' : 'Register Resource'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ResourceRegistrationForm;
