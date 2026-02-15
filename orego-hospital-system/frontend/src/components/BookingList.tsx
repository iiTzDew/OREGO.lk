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
  MenuItem,
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
import { Visibility, CheckCircle, Cancel } from '@mui/icons-material';
import { bookingService } from '../services/bookingService';
import { Booking } from '../types';
import { format, parseISO } from 'date-fns';

interface BookingListProps {
  refreshTrigger: number;
}

const BOOKING_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'appointment', label: 'Appointment' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'test', label: 'Medical Test' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const BookingList: React.FC<BookingListProps> = ({ refreshTrigger }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    booking_type: '',
    status: '',
    search: '',
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookingService.getAllBookings();
      const bookingsData = data.bookings || data;
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [refreshTrigger]);

  useEffect(() => {
    // Apply filters
    let filtered = [...bookings];

    if (filters.booking_type) {
      filtered = filtered.filter(b => b.booking_type === filters.booking_type);
    }

    if (filters.status) {
      filtered = filtered.filter(b => b.status === filters.status);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        b =>
          b.patient_name?.toLowerCase().includes(searchLower) ||
          b.doctor_name?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredBookings(filtered);
  }, [filters, bookings]);

  const handleComplete = async (bookingId: string) => {
    if (!window.confirm('Mark this booking as completed?')) {
      return;
    }

    try {
      await bookingService.completeBooking(bookingId);
      fetchBookings();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete booking');
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await bookingService.cancelBooking(bookingId);
      fetchBookings();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel booking');
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy hh:mm a');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'surgery':
        return 'error';
      case 'appointment':
        return 'primary';
      case 'test':
        return 'secondary';
      default:
        return 'default';
    }
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

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Booking Type"
              value={filters.booking_type}
              onChange={(e) => setFilters({ ...filters, booking_type: e.target.value })}
              fullWidth
              size="small"
            >
              {BOOKING_TYPES.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              fullWidth
              size="small"
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={12} md={6}>
            <TextField
              label="Search by Patient or Doctor"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              fullWidth
              size="small"
              placeholder="Enter patient or doctor name"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Bookings Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Patient</TableCell>
              <TableCell>Doctor</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Scheduled Date</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="textSecondary">No bookings found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredBookings.map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell>{booking.patient_name}</TableCell>
                  <TableCell>{booking.doctor_name}</TableCell>
                  <TableCell>
                    <Chip
                      label={booking.booking_type.charAt(0).toUpperCase() + booking.booking_type.slice(1)}
                      color={getTypeColor(booking.booking_type) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDateTime(booking.scheduled_date)}</TableCell>
                  <TableCell>{booking.duration_hours}h</TableCell>
                  <TableCell>
                    <Chip
                      label={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      color={getStatusColor(booking.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setDetailsOpen(true);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {booking.status === 'scheduled' && (
                      <>
                        <Tooltip title="Complete">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleComplete(booking.id)}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCancel(booking.id)}
                          >
                            <Cancel />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Patient
                  </Typography>
                  <Typography variant="body1">{selectedBooking.patient_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Doctor
                  </Typography>
                  <Typography variant="body1">{selectedBooking.doctor_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Type
                  </Typography>
                  <Chip
                    label={selectedBooking.booking_type.charAt(0).toUpperCase() + selectedBooking.booking_type.slice(1)}
                    color={getTypeColor(selectedBooking.booking_type) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    color={getStatusColor(selectedBooking.status) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Scheduled Date & Time
                  </Typography>
                  <Typography variant="body1">{formatDateTime(selectedBooking.scheduled_date)}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Duration
                  </Typography>
                  <Typography variant="body1">{selectedBooking.duration_hours} hour(s)</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    End Time
                  </Typography>
                  <Typography variant="body1">{formatDateTime(selectedBooking.scheduled_end_date)}</Typography>
                </Grid>
                {selectedBooking.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">{selectedBooking.notes}</Typography>
                  </Grid>
                )}
                {selectedBooking.allocated_resources && selectedBooking.allocated_resources.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                      Allocated Resources
                    </Typography>
                    {selectedBooking.allocated_resources.map((resource, index) => (
                      <Chip
                        key={index}
                        label={`${resource.resource_type}: ${resource.resource_name || resource.staff_name || 'N/A'}`}
                        sx={{ mr: 1, mb: 1 }}
                        size="small"
                      />
                    ))}
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingList;
