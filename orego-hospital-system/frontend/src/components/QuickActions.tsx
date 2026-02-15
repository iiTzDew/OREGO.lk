import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Business as ResourceIcon,
  Assignment as BookingIcon,
  LocalHospital as DischargeIcon,
  Notifications as NotificationIcon,
  Assessment as ReportIcon,
  Speed as QuickIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface QuickActionsProps {
  onUserRegister: () => void;
  onResourceRegister: () => void;
  onBookingCreate: () => void;
  onDischargeCreate: () => void;
  onNotificationSend: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onUserRegister,
  onResourceRegister,
  onBookingCreate,
  onDischargeCreate,
  onNotificationSend,
}) => {
  const quickActions = [
    {
      title: 'Register User',
      description: 'Add new doctor, nurse, or patient',
      icon: <PersonAddIcon />,
      color: 'primary' as const,
      onClick: onUserRegister,
      shortcut: 'Ctrl + U',
    },
    {
      title: 'Add Resource',
      description: 'Register bed, OT, or equipment',
      icon: <ResourceIcon />,
      color: 'secondary' as const,
      onClick: onResourceRegister,
      shortcut: 'Ctrl + R',
    },
    {
      title: 'Create Booking',
      description: 'Schedule appointment or surgery',
      icon: <BookingIcon />,
      color: 'success' as const,
      onClick: onBookingCreate,
      shortcut: 'Ctrl + B',
    },
    {
      title: 'New Discharge',
      description: 'Create discharge record',
      icon: <DischargeIcon />,
      color: 'info' as const,
      onClick: onDischargeCreate,
      shortcut: 'Ctrl + D',
    },
    {
      title: 'Send Notification',
      description: 'Broadcast to all users',
      icon: <NotificationIcon />,
      color: 'warning' as const,
      onClick: onNotificationSend,
      shortcut: 'Ctrl + M',
    },
  ];

  const commonActions = [
    {
      title: 'View Reports',
      description: 'Statistical reports and analytics',
      icon: <ReportIcon />,
      disabled: true,
    },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center">
          <QuickIcon sx={{ mr: 1 }} />
          Quick Actions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Common tasks and shortcuts for efficient workflow
        </Typography>

        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={action.icon}
                onClick={action.onClick}
                color={action.color}
                sx={{
                  height: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  textAlign: 'left',
                  p: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {action.title}
                    </Typography>
                    <Chip
                      label={action.shortcut}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                    {action.description}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          ))}
        </Grid>

        {/* Common Actions Section */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Additional Actions
          </Typography>
          <Grid container spacing={1}>
            {commonActions.map((action, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Button
                  variant="text"
                  fullWidth
                  startIcon={action.icon}
                  disabled={action.disabled}
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'text.secondary',
                    py: 1,
                  }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2">
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
        </Box>

        {/* Tips */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: 'grey.50',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.200',
          }}
        >
          <Typography variant="caption" color="text.secondary">
            💡 <strong>Tip:</strong> Use keyboard shortcuts for faster access. Press Ctrl + ? to see all available shortcuts.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default QuickActions;