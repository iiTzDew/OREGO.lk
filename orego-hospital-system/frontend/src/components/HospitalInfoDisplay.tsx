import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import {
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Hotel as BedIcon,
  LocalHospital as OTIcon,
  Badge as RegistrationIcon,
} from '@mui/icons-material';
import { hospitalService } from '../services/hospitalService';
import { Hospital } from '../types';

interface HospitalInfoDisplayProps {
  variant?: 'card' | 'compact' | 'minimal';
  showCapacity?: boolean;
  showDescription?: boolean;
}

const HospitalInfoDisplay: React.FC<HospitalInfoDisplayProps> = ({
  variant = 'card',
  showCapacity = true,
  showDescription = true,
}) => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHospital = async () => {
      try {
        setLoading(true);
        const data = await hospitalService.getHospital();
        setHospital(data);
      } catch (error: any) {
        console.error('Failed to fetch hospital info:', error);
        setError('Hospital information not available');
      } finally {
        setLoading(false);
      }
    };

    fetchHospital();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !hospital) {
    return (
      <Alert severity="info" sx={{ mx: 2 }}>
        {error || 'Hospital information not configured yet'}
      </Alert>
    );
  }

  const renderMinimal = () => (
    <Box display="flex" alignItems="center" gap={1}>
      {hospital.logo_url && (
        <Avatar src={hospital.logo_url} sx={{ width: 24, height: 24 }}>
          <BusinessIcon />
        </Avatar>
      )}
      <Typography variant="subtitle2" noWrap>
        {hospital.name}
      </Typography>
    </Box>
  );

  const renderCompact = () => (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        {hospital.logo_url && (
          <Avatar src={hospital.logo_url} sx={{ width: 40, height: 40 }}>
            <BusinessIcon />
          </Avatar>
        )}
        <Box>
          <Typography variant="h6">{hospital.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            Reg: {hospital.registration_number}
          </Typography>
        </Box>
      </Box>
      
      <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
        <Chip
          icon={<LocationIcon />}
          label={hospital.address.split(',')[0]} // Show first part of address
          variant="outlined"
          size="small"
        />
        <Chip
          icon={<PhoneIcon />}
          label={hospital.phone_number}
          variant="outlined"
          size="small"
        />
        {showCapacity && (
          <>
            <Chip
              icon={<BedIcon />}
              label={`${hospital.total_beds} Beds`}
              variant="outlined"
              size="small"
              color="primary"
            />
            <Chip
              icon={<OTIcon />}
              label={`${hospital.total_operation_theatres} OTs`}
              variant="outlined"
              size="small"
              color="secondary"
            />
          </>
        )}
      </Box>
    </Box>
  );

  const renderCard = () => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          {hospital.logo_url ? (
            <Avatar src={hospital.logo_url} sx={{ width: 60, height: 60 }}>
              <BusinessIcon />
            </Avatar>
          ) : (
            <Avatar sx={{ width: 60, height: 60 }}>
              <BusinessIcon />
            </Avatar>
          )}
          <Box>
            <Typography variant="h5">{hospital.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              Registration: {hospital.registration_number}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <LocationIcon color="primary" />
              <Typography variant="body2">
                <strong>Address:</strong>
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
              {hospital.address}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <PhoneIcon color="primary" />
              <Typography variant="body2">
                <strong>Contact:</strong>
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
              {hospital.phone_number}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 3 }}>
              {hospital.email}
            </Typography>
          </Grid>

          {showCapacity && (
            <>
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Hospital Capacity
                </Typography>
              </Grid>

              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <BedIcon color="primary" />
                  <Box>
                    <Typography variant="h6">{hospital.total_beds}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total Beds
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={6}>
                <Box display="flex" alignItems="center" gap={1}>
                  <OTIcon color="secondary" />
                  <Box>
                    <Typography variant="h6">{hospital.total_operation_theatres}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Operation Theatres
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </>
          )}

          {showDescription && hospital.description && (
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle1" gutterBottom>
                About Hospital
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hospital.description}
              </Typography>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );

  switch (variant) {
    case 'minimal':
      return renderMinimal();
    case 'compact':
      return renderCompact();
    case 'card':
    default:
      return renderCard();
  }
};

export default HospitalInfoDisplay;