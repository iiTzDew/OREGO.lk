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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  MeetingRoom as RoomIcon,
  CheckCircle as AvailableIcon,
  Block as OccupiedIcon,
  CleaningServices as CleaningIcon,
  LocalHospital as HospitalIcon,
} from '@mui/icons-material';

interface FacilityManagementProps {
  refreshTrigger?: number;
}

interface Room {
  id: string;
  roomNumber: string;
  type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'cleaning';
  floor: number;
  capacity: number;
  currentOccupancy: number;
  lastCleaned: string;
  assignedPatient?: string;
}

interface CleaningSchedule {
  id: string;
  area: string;
  scheduledTime: string;
  frequency: string;
  assignedStaff: string;
  status: 'pending' | 'in-progress' | 'completed';
}

const FacilityManagement: React.FC<FacilityManagementProps> = ({ refreshTrigger }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cleaningSchedule, setCleaningSchedule] = useState<CleaningSchedule[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [newStatus, setNewStatus] = useState<'available' | 'occupied' | 'maintenance' | 'cleaning'>('available');

  useEffect(() => {
    fetchFacilityData();
  }, [refreshTrigger]);

  const fetchFacilityData = async () => {
    setLoading(true);
    try {
      // Mock data - In real implementation, fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockRooms: Room[] = [
        {
          id: '1',
          roomNumber: 'ICU-101',
          type: 'ICU',
          status: 'occupied',
          floor: 1,
          capacity: 1,
          currentOccupancy: 1,
          lastCleaned: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          assignedPatient: 'John Doe',
        },
        {
          id: '2',
          roomNumber: 'ICU-102',
          type: 'ICU',
          status: 'available',
          floor: 1,
          capacity: 1,
          currentOccupancy: 0,
          lastCleaned: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          roomNumber: 'W-201',
          type: 'General Ward',
          status: 'occupied',
          floor: 2,
          capacity: 4,
          currentOccupancy: 3,
          lastCleaned: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          roomNumber: 'W-202',
          type: 'General Ward',
          status: 'available',
          floor: 2,
          capacity: 4,
          currentOccupancy: 0,
          lastCleaned: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '5',
          roomNumber: 'OR-301',
          type: 'Operating Room',
          status: 'cleaning',
          floor: 3,
          capacity: 1,
          currentOccupancy: 0,
          lastCleaned: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '6',
          roomNumber: 'OR-302',
          type: 'Operating Room',
          status: 'available',
          floor: 3,
          capacity: 1,
          currentOccupancy: 0,
          lastCleaned: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '7',
          roomNumber: 'ER-001',
          type: 'Emergency',
          status: 'occupied',
          floor: 0,
          capacity: 1,
          currentOccupancy: 1,
          lastCleaned: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          assignedPatient: 'Emergency Patient',
        },
        {
          id: '8',
          roomNumber: 'PW-401',
          type: 'Private Ward',
          status: 'maintenance',
          floor: 4,
          capacity: 1,
          currentOccupancy: 0,
          lastCleaned: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const mockCleaningSchedule: CleaningSchedule[] = [
        {
          id: '1',
          area: 'ICU Wing',
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          frequency: 'Every 6 hours',
          assignedStaff: 'Cleaning Team A',
          status: 'pending',
        },
        {
          id: '2',
          area: 'Operating Rooms',
          scheduledTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
          frequency: 'After each surgery',
          assignedStaff: 'Cleaning Team B',
          status: 'in-progress',
        },
        {
          id: '3',
          area: 'Emergency Department',
          scheduledTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          frequency: 'Every 4 hours',
          assignedStaff: 'Cleaning Team C',
          status: 'completed',
        },
        {
          id: '4',
          area: 'General Wards - Floor 2',
          scheduledTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          frequency: 'Daily',
          assignedStaff: 'Cleaning Team A',
          status: 'pending',
        },
        {
          id: '5',
          area: 'Cafeteria',
          scheduledTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          frequency: 'Every 2 hours',
          assignedStaff: 'Cleaning Team D',
          status: 'pending',
        },
      ];

      setRooms(mockRooms);
      setCleaningSchedule(mockCleaningSchedule);
    } catch (error) {
      console.error('Error fetching facility data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'occupied':
        return 'error';
      case 'maintenance':
        return 'warning';
      case 'cleaning':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <AvailableIcon />;
      case 'occupied':
        return <OccupiedIcon />;
      case 'cleaning':
        return <CleaningIcon />;
      default:
        return <HospitalIcon />;
    }
  };

  const handleUpdateRoomStatus = () => {
    if (selectedRoom) {
      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.id === selectedRoom.id
            ? { ...room, status: newStatus }
            : room
        )
      );
      setRoomDialogOpen(false);
      setSelectedRoom(null);
    }
  };

  const handleOpenRoomDialog = (room: Room) => {
    setSelectedRoom(room);
    setNewStatus(room.status);
    setRoomDialogOpen(true);
  };

  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
  const cleaningRooms = rooms.filter(r => r.status === 'cleaning').length;

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Typography variant="caption" color="success.dark">
                Available Rooms
              </Typography>
              <Typography variant="h4" color="success.dark" fontWeight="bold">
                {availableRooms}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'error.light' }}>
            <CardContent>
              <Typography variant="caption" color="error.dark">
                Occupied Rooms
              </Typography>
              <Typography variant="h4" color="error.dark" fontWeight="bold">
                {occupiedRooms}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'info.light' }}>
            <CardContent>
              <Typography variant="caption" color="info.dark">
                Being Cleaned
              </Typography>
              <Typography variant="h4" color="info.dark" fontWeight="bold">
                {cleaningRooms}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent>
              <Typography variant="caption" color="warning.dark">
                Maintenance
              </Typography>
              <Typography variant="h4" color="warning.dark" fontWeight="bold">
                {maintenanceRooms}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="Room Status" />
          <Tab label="Cleaning Schedule" />
        </Tabs>
      </Box>

      {/* Room Status Tab */}
      {tabValue === 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Room Number</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Floor</strong></TableCell>
                <TableCell><strong>Capacity</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Last Cleaned</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <RoomIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="bold">
                        {room.roomNumber}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={room.type} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>Floor {room.floor}</TableCell>
                  <TableCell>
                    {room.status === 'occupied' ? (
                      <Typography variant="body2">
                        {room.currentOccupancy}/{room.capacity}
                      </Typography>
                    ) : (
                      <Typography variant="body2">0/{room.capacity}</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={room.status.toUpperCase()}
                      size="small"
                      color={getStatusColor(room.status)}
                      icon={getStatusIcon(room.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(room.lastCleaned).toLocaleDateString()} {new Date(room.lastCleaned).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleOpenRoomDialog(room)}
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Cleaning Schedule Tab */}
      {tabValue === 1 && (
        <Grid container spacing={2}>
          {cleaningSchedule.map((schedule) => (
            <Grid item xs={12} key={schedule.id}>
              <Card
                variant="outlined"
                sx={{
                  borderLeft: 4,
                  borderLeftColor: schedule.status === 'completed' ? 'success.main' : schedule.status === 'in-progress' ? 'info.main' : 'warning.main',
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box flex={1}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <CleaningIcon color="action" />
                        <Typography variant="h6" fontWeight="bold">
                          {schedule.area}
                        </Typography>
                        <Chip
                          label={schedule.status.replace('-', ' ').toUpperCase()}
                          size="small"
                          color={schedule.status === 'completed' ? 'success' : schedule.status === 'in-progress' ? 'info' : 'warning'}
                        />
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary">
                            Scheduled Time
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {new Date(schedule.scheduledTime).toLocaleDateString()} {new Date(schedule.scheduledTime).toLocaleTimeString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary">
                            Frequency
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {schedule.frequency}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="text.secondary">
                            Assigned Staff
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {schedule.assignedStaff}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Room Status Update Dialog */}
      <Dialog open={roomDialogOpen} onClose={() => setRoomDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Update Room Status - {selectedRoom?.roomNumber}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Room Type: {selectedRoom?.type}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Status: <Chip label={selectedRoom?.status.toUpperCase()} size="small" color={getStatusColor(selectedRoom?.status || '')} />
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>New Status</InputLabel>
                  <Select
                    value={newStatus}
                    label="New Status"
                    onChange={(e) => setNewStatus(e.target.value as any)}
                  >
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="occupied">Occupied</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="cleaning">Cleaning</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoomDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateRoomStatus}>
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FacilityManagement;