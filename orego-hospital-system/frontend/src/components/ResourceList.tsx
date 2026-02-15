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
import { Delete, Visibility } from '@mui/icons-material';
import { resourceService } from '../services/resourceService';
import { Resource } from '../types';

interface ResourceListProps {
  refreshTrigger: number;
}

const RESOURCE_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'bed', label: 'Bed' },
  { value: 'operation_theatre', label: 'Operation Theatre' },
  { value: 'machine', label: 'Medical Machine' },
];

const ResourceList: React.FC<ResourceListProps> = ({ refreshTrigger }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await resourceService.getAllResources(
        filterType || undefined
      );
      setResources(data.resources || data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [filterType, refreshTrigger]);

  const handleDelete = async (resourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      await resourceService.deleteResource(resourceId);
      fetchResources();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete resource');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bed':
        return 'Bed';
      case 'operation_theatre':
        return 'Operation Theatre';
      case 'machine':
        return 'Medical Machine';
      default:
        return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bed':
        return 'primary';
      case 'operation_theatre':
        return 'error';
      case 'machine':
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
              fullWidth
              label="Filter by Type"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              size="small"
            >
              {RESOURCE_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Resource Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Resource Name</strong></TableCell>
              <TableCell><strong>Resource Number</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {resources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No resources found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              resources.map((resource) => (
                <TableRow key={resource.id} hover>
                  <TableCell>{resource.name}</TableCell>
                  <TableCell>{resource.bed_number || resource.ot_number || resource.serial_number || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(resource.type)}
                      color={getTypeColor(resource.type) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{resource.location}</TableCell>
                  <TableCell>
                    <Chip
                      label={resource.status === 'available' ? 'Available' : resource.status === 'booked' ? 'Booked' : 'Maintenance'}
                      color={resource.status === 'available' ? 'success' : resource.status === 'booked' ? 'warning' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => {
                          setSelectedResource(resource);
                          setDetailsOpen(true);
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Resource">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(resource.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Resource Details Dialog */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Resource Details</DialogTitle>
        <DialogContent>
          {selectedResource && (
            <Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Resource Name
                  </Typography>
                  <Typography variant="body1">{selectedResource.name}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Resource Number
                  </Typography>
                  <Typography variant="body1">{selectedResource.bed_number || selectedResource.ot_number || selectedResource.serial_number || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Type
                  </Typography>
                  <Chip
                    label={getTypeLabel(selectedResource.type)}
                    color={getTypeColor(selectedResource.type) as any}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Location
                  </Typography>
                  <Typography variant="body1">{selectedResource.location}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip
                    label={selectedResource.status === 'available' ? 'Available' : selectedResource.status === 'booked' ? 'Booked' : 'Maintenance'}
                    color={selectedResource.status === 'available' ? 'success' : selectedResource.status === 'booked' ? 'warning' : 'error'}
                    size="small"
                  />
                </Grid>
                {selectedResource.description && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body1">{selectedResource.description}</Typography>
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

export default ResourceList;
