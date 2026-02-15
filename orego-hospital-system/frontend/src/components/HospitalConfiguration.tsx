import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Divider,
  InputAdornment,
  FormHelperText,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Description as DescriptionIcon,
  Hotel as BedIcon,
  LocalHospital as OTIcon,
  Badge as RegistrationIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { hospitalService } from '../services/hospitalService';
import { Hospital } from '../types';

interface HospitalConfigurationProps {
  onSuccess?: () => void;
}

const HospitalConfiguration: React.FC<HospitalConfigurationProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone_number: '',
    email: '',
    registration_number: '',
    total_beds: 0,
    total_operation_theatres: 0,
    description: '',
    logo_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hospitalExists, setHospitalExists] = useState(false);

  const fetchHospitalData = async () => {
    try {
      setFetchLoading(true);
      setError(null);
      const hospitalData = await hospitalService.getHospital();
      setFormData({
        name: hospitalData.name || '',
        address: hospitalData.address || '',
        phone_number: hospitalData.phone_number || '',
        email: hospitalData.email || '',
        registration_number: hospitalData.registration_number || '',
        total_beds: hospitalData.total_beds || 0,
        total_operation_theatres: hospitalData.total_operation_theatres || 0,
        description: hospitalData.description || '',
        logo_url: hospitalData.logo_url || '',
      });
      setHospitalExists(true);
    } catch (error: any) {
      console.log('No hospital data found, starting fresh');
      setHospitalExists(false);
      // Error is expected if no hospital exists yet
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalData();
  }, []);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validateForm = () => {
    const requiredFields = ['name', 'address', 'phone_number', 'email', 'registration_number'];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setError(`${field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`);
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone number validation
    if (formData.phone_number.length < 10) {
      setError('Phone number must be at least 10 digits');
      return false;
    }

    // Capacity validation
    if (formData.total_beds < 0) {
      setError('Number of beds cannot be negative');
      return false;
    }

    if (formData.total_operation_theatres < 0) {
      setError('Number of operation theatres cannot be negative');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const response = await hospitalService.createOrUpdateHospital(formData);
      
      setSuccess(hospitalExists ? 'Hospital details updated successfully!' : 'Hospital details saved successfully!');
      setHospitalExists(true);
      
      onSuccess?.();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);

    } catch (error: any) {
      console.error('Failed to save hospital details:', error);
      setError(error.response?.data?.error || 'Failed to save hospital details');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (hospitalExists) {
      fetchHospitalData();
    } else {
      setFormData({
        name: '',
        address: '',
        phone_number: '',
        email: '',
        registration_number: '',
        total_beds: 0,
        total_operation_theatres: 0,
        description: '',
        logo_url: '',
      });
    }
    setError(null);
    setSuccess(null);
  };

  if (fetchLoading) {
    return (
      <Card>
        <CardContent sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom display="flex" alignItems="center">
            <BusinessIcon sx={{ mr: 1 }} />
            Hospital Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {hospitalExists ? 'Update your hospital information and settings' : 'Set up your hospital information and operational settings'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Hospital Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BusinessIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              placeholder="e.g., Colombo General Hospital"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Registration Number"
              value={formData.registration_number}
              onChange={(e) => handleInputChange('registration_number', e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <RegistrationIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              placeholder="e.g., REG/2024/001"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              fullWidth
              required
              multiline
              rows={3}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LocationIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              placeholder="Full hospital address including city and postal code"
            />
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Contact Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Phone Number"
              value={formData.phone_number}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              fullWidth
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              placeholder="e.g., +94112345678"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Email Address"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              fullWidth
              required
              type="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              placeholder="e.g., info@hospital.lk"
            />
          </Grid>

          {/* Capacity Settings */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Hospital Capacity
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Total Number of Beds"
              value={formData.total_beds}
              onChange={(e) => handleInputChange('total_beds', parseInt(e.target.value) || 0)}
              fullWidth
              type="number"
              inputProps={{ min: 0 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BedIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              helperText="Total bed capacity of the hospital"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Number of Operation Theatres"
              value={formData.total_operation_theatres}
              onChange={(e) => handleInputChange('total_operation_theatres', parseInt(e.target.value) || 0)}
              fullWidth
              type="number"
              inputProps={{ min: 0 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <OTIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              helperText="Number of operation theatres available"
            />
          </Grid>

          {/* Additional Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Additional Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Hospital Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              fullWidth
              multiline
              rows={4}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <DescriptionIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              placeholder="Brief description of the hospital, services offered, specialties, etc."
              helperText="Optional: Provide details about the hospital's services and specialties"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              label="Logo URL"
              value={formData.logo_url}
              onChange={(e) => handleInputChange('logo_url', e.target.value)}
              fullWidth
              placeholder="https://example.com/logo.png"
              helperText="Optional: URL to the hospital logo image"
            />
          </Grid>

          {/* Actions */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
              <Button
                onClick={handleReset}
                disabled={loading}
                startIcon={<RefreshIcon />}
                variant="outlined"
              >
                Reset
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                variant="contained"
                size="large"
              >
                {loading ? 'Saving...' : hospitalExists ? 'Update Hospital' : 'Save Hospital Details'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default HospitalConfiguration;