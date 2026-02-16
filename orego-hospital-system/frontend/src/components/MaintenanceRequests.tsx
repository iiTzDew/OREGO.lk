import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import {
  Build as MaintenanceIcon,
  Warning as UrgentIcon,
  CheckCircle as CompletedIcon,
  Schedule as PendingIcon,
  PlayArrow as InProgressIcon,
  Add as AddIcon,
} from '@mui/icons-material';

interface MaintenanceRequestsProps {
  refreshTrigger?: number;
}

interface MaintenanceRequest {
  id: string;
  equipmentName: string;
  location: string;
  issue: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  requestedBy: string;
  requestedDate: string;
  assignedTo?: string;
  completedDate?: string;
  notes?: string;
}

const MaintenanceRequests: React.FC<MaintenanceRequestsProps> = ({ refreshTrigger }) => {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [newRequestDialog, setNewRequestDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    equipmentName: '',
    location: '',
    issue: '',
    priority: 'normal' as 'urgent' | 'high' | 'normal' | 'low',
  });

  useEffect(() => {
    fetchRequests();
  }, [refreshTrigger]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Mock data - In real implementation, fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockRequests: MaintenanceRequest[] = [
        {
          id: '1',
          equipmentName: 'X-Ray Machine #3',
          location: 'Radiology - Room 201',
          issue: 'Image quality degradation, needs calibration',
          priority: 'urgent',
          status: 'in-progress',
          requestedBy: 'Dr. Sarah Johnson',
          requestedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'Tech Team A',
        },
        {
          id: '2',
          equipmentName: 'Ventilator #12',
          location: 'ICU - Bed 5',
          issue: 'Pressure sensor malfunction',
          priority: 'urgent',
          status: 'pending',
          requestedBy: 'Nurse Maria Garcia',
          requestedDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          equipmentName: 'Ultrasound Machine',
          location: 'OB/GYN - Room 105',
          issue: 'Display screen flickering',
          priority: 'high',
          status: 'pending',
          requestedBy: 'Dr. Emily Chen',
          requestedDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          equipmentName: 'Sterilizer #2',
          location: 'Sterilization Unit',
          issue: 'Temperature inconsistency during cycle',
          priority: 'high',
          status: 'in-progress',
          requestedBy: 'Staff John Smith',
          requestedDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'Tech Team B',
        },
        {
          id: '5',
          equipmentName: 'Patient Monitor',
          location: 'Emergency Room - Bed 3',
          issue: 'Routine maintenance check',
          priority: 'normal',
          status: 'completed',
          requestedBy: 'Staff Admin',
          requestedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          assignedTo: 'Tech Team C',
          completedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          notes: 'All systems functioning properly',
        },
        {
          id: '6',
          equipmentName: 'Blood Pressure Cuff',
          location: 'Ward B - Nurses Station',
          issue: 'Needs replacement',
          priority: 'normal',
          status: 'pending',
          requestedBy: 'Nurse Thomas Brown',
          requestedDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'error';
      case 'high':
        return 'warning';
      case 'normal':
        return 'info';
      case 'low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <PendingIcon />;
      case 'in-progress':
        return <InProgressIcon />;
      case 'completed':
        return <CompletedIcon />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in-progress':
        return 'info';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const handleViewRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleUpdateStatus = (newStatus: 'pending' | 'in-progress' | 'completed') => {
    if (selectedRequest) {
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req.id === selectedRequest.id
            ? { ...req, status: newStatus, completedDate: newStatus === 'completed' ? new Date().toISOString() : req.completedDate }
            : req
        )
      );
      setSelectedRequest({ ...selectedRequest, status: newStatus });
    }
  };

  const handleSubmitNewRequest = () => {
    const request: MaintenanceRequest = {
      id: (requests.length + 1).toString(),
      equipmentName: newRequest.equipmentName,
      location: newRequest.location,
      issue: newRequest.issue,
      priority: newRequest.priority,
      status: 'pending',
      requestedBy: 'Current User',
      requestedDate: new Date().toISOString(),
    };

    setRequests(prev => [request, ...prev]);
    setNewRequestDialog(false);
    setNewRequest({
      equipmentName: '',
      location: '',
      issue: '',
      priority: 'normal',
    });
  };

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const pendingCount = requests.filter(req => req.status === 'pending').length;
  const inProgressCount = requests.filter(req => req.status === 'in-progress').length;
  const completedCount = requests.filter(req => req.status === 'completed').length;
  const urgentCount = requests.filter(req => req.priority === 'urgent' && req.status !== 'completed').length;

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent>
              <Typography variant="caption" color="warning.dark">
                Pending
              </Typography>
              <Typography variant="h4" color="warning.dark" fontWeight="bold">
                {pendingCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'info.light' }}>
            <CardContent>
              <Typography variant="caption" color="info.dark">
                In Progress
              </Typography>
              <Typography variant="h4" color="info.dark" fontWeight="bold">
                {inProgressCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Typography variant="caption" color="success.dark">
                Completed
              </Typography>
              <Typography variant="h4" color="success.dark" fontWeight="bold">
                {completedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'error.light' }}>
            <CardContent>
              <Typography variant="caption" color="error.dark">
                Urgent
              </Typography>
              <Typography variant="h4" color="error.dark" fontWeight="bold">
                {urgentCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert for Urgent Requests */}
      {urgentCount > 0 && (
        <Alert severity="error" sx={{ mb: 3 }} icon={<UrgentIcon />}>
          <Typography variant="body2" fontWeight="bold">
            {urgentCount} urgent maintenance request{urgentCount > 1 ? 's' : ''} require immediate attention!
          </Typography>
        </Alert>
      )}

      {/* Filter and Add Request */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" gap={1}>
          <Button
            variant={filter === 'all' ? 'contained' : 'outlined'}
            onClick={() => setFilter('all')}
            size="small"
          >
            All ({requests.length})
          </Button>
          <Button
            variant={filter === 'pending' ? 'contained' : 'outlined'}
            onClick={() => setFilter('pending')}
            size="small"
            startIcon={<PendingIcon />}
          >
            Pending ({pendingCount})
          </Button>
          <Button
            variant={filter === 'in-progress' ? 'contained' : 'outlined'}
            onClick={() => setFilter('in-progress')}
            size="small"
            startIcon={<InProgressIcon />}
          >
            In Progress ({inProgressCount})
          </Button>
          <Button
            variant={filter === 'completed' ? 'contained' : 'outlined'}
            onClick={() => setFilter('completed')}
            size="small"
            startIcon={<CompletedIcon />}
          >
            Completed ({completedCount})
          </Button>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setNewRequestDialog(true)}
        >
          New Request
        </Button>
      </Box>

      {/* Maintenance Requests List */}
      <Grid container spacing={2}>
        {filteredRequests.map((request) => (
          <Grid item xs={12} key={request.id}>
            <Card
              variant="outlined"
              sx={{
                borderLeft: 4,
                borderLeftColor: `${getPriorityColor(request.priority)}.main`,
                '&:hover': { boxShadow: 3 },
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <MaintenanceIcon color="action" />
                      <Typography variant="h6" fontWeight="bold">
                        {request.equipmentName}
                      </Typography>
                      <Chip
                        label={request.priority.toUpperCase()}
                        size="small"
                        color={getPriorityColor(request.priority)}
                      />
                      <Chip
                        label={request.status.replace('-', ' ').toUpperCase()}
                        size="small"
                        color={getStatusColor(request.status)}
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Location:</strong> {request.location}
                    </Typography>

                    <Typography variant="body2" gutterBottom>
                      <strong>Issue:</strong> {request.issue}
                    </Typography>

                    <Box display="flex" gap={2} mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        Requested by: {request.requestedBy}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(request.requestedDate).toLocaleDateString()} {new Date(request.requestedDate).toLocaleTimeString()}
                      </Typography>
                      {request.assignedTo && (
                        <Typography variant="caption" color="text.secondary">
                          Assigned to: {request.assignedTo}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleViewRequest(request)}
                  >
                    View Details
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Request Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <MaintenanceIcon />
            Maintenance Request Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box mt={2}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    {selectedRequest.equipmentName}
                  </Typography>
                  <Box display="flex" gap={1} mb={2}>
                    <Chip
                      label={selectedRequest.priority.toUpperCase()}
                      size="small"
                      color={getPriorityColor(selectedRequest.priority)}
                    />
                    <Chip
                      label={selectedRequest.status.replace('-', ' ').toUpperCase()}
                      size="small"
                      color={getStatusColor(selectedRequest.status)}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">{selectedRequest.location}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Requested By
                  </Typography>
                  <Typography variant="body1">{selectedRequest.requestedBy}</Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Requested Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedRequest.requestedDate).toLocaleDateString()} {new Date(selectedRequest.requestedDate).toLocaleTimeString()}
                  </Typography>
                </Grid>

                {selectedRequest.assignedTo && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Assigned To
                    </Typography>
                    <Typography variant="body1">{selectedRequest.assignedTo}</Typography>
                  </Grid>
                )}

                {selectedRequest.completedDate && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Completed Date
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedRequest.completedDate).toLocaleDateString()} {new Date(selectedRequest.completedDate).toLocaleTimeString()}
                    </Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Issue Description
                  </Typography>
                  <Typography variant="body1">{selectedRequest.issue}</Typography>
                </Grid>

                {selectedRequest.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body1">{selectedRequest.notes}</Typography>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Divider />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Update Status
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button
                      size="small"
                      variant={selectedRequest.status === 'pending' ? 'contained' : 'outlined'}
                      onClick={() => handleUpdateStatus('pending')}
                      color="warning"
                    >
                      Pending
                    </Button>
                    <Button
                      size="small"
                      variant={selectedRequest.status === 'in-progress' ? 'contained' : 'outlined'}
                      onClick={() => handleUpdateStatus('in-progress')}
                      color="info"
                    >
                      In Progress
                    </Button>
                    <Button
                      size="small"
                      variant={selectedRequest.status === 'completed' ? 'contained' : 'outlined'}
                      onClick={() => handleUpdateStatus('completed')}
                      color="success"
                    >
                      Completed
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* New Request Dialog */}
      <Dialog open={newRequestDialog} onClose={() => setNewRequestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Submit New Maintenance Request</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Equipment Name"
                  value={newRequest.equipmentName}
                  onChange={(e) => setNewRequest({ ...newRequest, equipmentName: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={newRequest.location}
                  onChange={(e) => setNewRequest({ ...newRequest, location: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Issue Description"
                  value={newRequest.issue}
                  onChange={(e) => setNewRequest({ ...newRequest, issue: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newRequest.priority}
                    label="Priority"
                    onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value as any })}
                  >
                    <MenuItem value="urgent">Urgent</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="normal">Normal</MenuItem>
                    <MenuItem value="low">Low</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewRequestDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmitNewRequest}
            disabled={!newRequest.equipmentName || !newRequest.location || !newRequest.issue}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaintenanceRequests;