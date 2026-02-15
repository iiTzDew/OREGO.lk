import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Alert,
  Box,
} from '@mui/material';
import { notificationService } from '../services/notificationService';
import { userService } from '../services/userService';

interface NotificationFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const NotificationForm: React.FC<NotificationFormProps> = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general',
    mode: 'broadcast', // broadcast or specific
    role: '', // for role-based broadcast
    recipient_id: '', // for specific user
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.message) {
      setError('Title and message are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (formData.mode === 'broadcast') {
        // Broadcast to all users or specific role
        await notificationService.broadcastNotification(
          formData.title,
          formData.message,
          formData.role || undefined,
          formData.type
        );
        setSuccess(`Notification broadcasted successfully!`);
      } else {
        // Send to specific user (not implemented in this component yet)
        setError('Specific user notifications not implemented yet');
        return;
      }

      // Reset form after success
      setFormData({
        title: '',
        message: '',
        type: 'general',
        mode: 'broadcast',
        role: '',
        recipient_id: '',
      });

      // Call success callback and close after 2 seconds
      onSuccess?.();
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);

    } catch (error: any) {
      console.error('Failed to send notification:', error);
      setError(error.response?.data?.error || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      message: '',
      type: 'general',
      mode: 'broadcast',
      role: '',
      recipient_id: '',
    });
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Typography variant="h5">Send Notification</Typography>
        <Typography variant="body2" color="text.secondary">
          Create and broadcast notifications to users
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          <TextField
            label="Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            required
            fullWidth
            placeholder="e.g., System Maintenance Notice"
          />

          <TextField
            label="Message"
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            required
            fullWidth
            multiline
            rows={4}
            placeholder="Enter the notification message..."
          />

          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              label="Type"
            >
              <MenuItem value="general">General</MenuItem>
              <MenuItem value="alert">Alert</MenuItem>
              <MenuItem value="booking">Booking</MenuItem>
              <MenuItem value="discharge">Discharge</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Send To</InputLabel>
            <Select
              value={formData.mode}
              onChange={(e) => handleInputChange('mode', e.target.value)}
              label="Send To"
            >
              <MenuItem value="broadcast">All Users (Broadcast)</MenuItem>
              <MenuItem value="role">Specific Role</MenuItem>
            </Select>
          </FormControl>

          {formData.mode === 'role' && (
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                label="Role"
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="admin">Administrators</MenuItem>
                <MenuItem value="doctor">Doctors</MenuItem>
                <MenuItem value="nurse">Nurses</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="patient">Patients</MenuItem>
              </Select>
            </FormControl>
          )}

          <Typography variant="caption" color="text.secondary">
            Notifications will be delivered immediately to the selected recipients.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !formData.title || !formData.message}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NotificationForm;