import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  TextField,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { Visibility, Download, CheckCircle } from '@mui/icons-material';
import { dischargeService } from '../services/dischargeService';
import { Discharge } from '../types';
import { format, parseISO } from 'date-fns';

interface DischargeListProps {
  refreshTrigger: number;
}

const DischargeList: React.FC<DischargeListProps> = ({ refreshTrigger }) => {
  const [discharges, setDischarges] = useState<Discharge[]>([]);
  const [filteredDischarges, setFilteredDischarges] = useState<Discharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDischarge, setSelectedDischarge] = useState<Discharge | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDischarges = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await dischargeService.getAllDischarges();
      const dischargesData = data.discharges || data;
      setDischarges(dischargesData);
      setFilteredDischarges(dischargesData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load discharge records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDischarges();
  }, [refreshTrigger]);

  useEffect(() => {
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const filtered = discharges.filter(
        d =>
          d.patient_name?.toLowerCase().includes(searchLower) ||
          d.doctor_name?.toLowerCase().includes(searchLower) ||
          d.diagnosed_disease?.toLowerCase().includes(searchLower)
      );
      setFilteredDischarges(filtered);
    } else {
      setFilteredDischarges(discharges);
    }
  }, [searchTerm, discharges]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const downloadSummary = (discharge: Discharge) => {
    if (!discharge.discharge_summary) {
      alert('No discharge summary available');
      return;
    }

    const blob = new Blob([discharge.discharge_summary], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discharge_${discharge.patient_name}_${discharge.discharge_date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Search Filter */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Search by Patient, Doctor, or Disease"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              size="small"
              placeholder="Enter patient name, doctor name, or disease"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Discharges Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Admission Date</TableCell>
              <TableCell>Discharge Date</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Disease</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDischarges.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="textSecondary">No discharge records found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredDischarges.map((discharge) => (
                <TableRow key={discharge.id} hover>
                  <TableCell>{discharge.patient_name}</TableCell>
                  <TableCell>{discharge.doctor_name}</TableCell>
                  <TableCell>{formatDate(discharge.admission_date)}</TableCell>
                  <TableCell>{formatDate(discharge.discharge_date)}</TableCell>
                  <TableCell>{discharge.duration_days} days</TableCell>
                  <TableCell>
                    {discharge.diagnosed_disease 
                      ? (discharge.diagnosed_disease.length > 30 
                        ? discharge.diagnosed_disease.substring(0, 30) + '...' 
                        : discharge.diagnosed_disease)
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={discharge.doctor_approval ? <CheckCircle /> : undefined}
                      label={discharge.doctor_approval ? 'Approved' : 'Pending'}
                      color={discharge.doctor_approval ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setSelectedDischarge(discharge);
                          setDetailsOpen(true);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Summary">
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() => downloadSummary(discharge)}
                        disabled={!discharge.discharge_summary}
                      >
                        <Download />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Discharge Details</DialogTitle>
        <DialogContent>
          {selectedDischarge && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Patient
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedDischarge.patient_name}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Doctor
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedDischarge.doctor_name}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Admission Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedDischarge.admission_date)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Discharge Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(selectedDischarge.discharge_date)}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Duration of Stay
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedDischarge.duration_days} days
                  </Typography>
                </Grid>
                {selectedDischarge.bed_info && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Bed Information
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {selectedDischarge.bed_info.name} - {selectedDischarge.bed_info.location}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Diagnosed Disease
                  </Typography>
                  <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedDischarge.diagnosed_disease || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Treatment Summary
                  </Typography>
                  <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedDischarge.treatment_summary || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Prescribed Medicines
                  </Typography>
                  <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedDischarge.prescribed_medicines || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Follow-up Instructions
                  </Typography>
                  <Typography variant="body1" gutterBottom sx={{ whiteSpace: 'pre-wrap' }}>
                    {selectedDischarge.follow_up_instructions || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    icon={selectedDischarge.doctor_approval ? <CheckCircle /> : undefined}
                    label={selectedDischarge.doctor_approval ? 'Approved by Doctor' : 'Pending Approval'}
                    color={selectedDischarge.doctor_approval ? 'success' : 'warning'}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          {selectedDischarge && (
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => {
                if (selectedDischarge) {
                  downloadSummary(selectedDischarge);
                }
              }}
              disabled={!selectedDischarge.discharge_summary}
            >
              Download Summary
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DischargeList;
