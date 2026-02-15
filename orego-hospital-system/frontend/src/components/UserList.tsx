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
} from '@mui/material';
import { Edit, Block, CheckCircle } from '@mui/icons-material';
import { userService } from '../services/userService';
import { User } from '../types';

interface UserListProps {
  onEdit: (user: User) => void;
  refreshTrigger: number;
}

const ROLES = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'doctor', label: 'Doctor' },
  { value: 'nurse', label: 'Nurse' },
  { value: 'patient', label: 'Patient' },
  { value: 'staff', label: 'Staff' },
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const UserList: React.FC<UserListProps> = ({ onEdit, refreshTrigger }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await userService.getAllUsers(
        filters.role || undefined,
        undefined,
        filters.status || undefined
      );
      setUsers(data.users || data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters, refreshTrigger]);

  const handleToggleStatus = async (user: User) => {
    try {
      if (user.is_active) {
        await userService.deactivateUser(user.id);
      } else {
        await userService.activateUser(user.id);
      }
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update user status');
    }
  };

  const getRoleColor = (role: string) => {
    const colors: any = {
      admin: 'error',
      doctor: 'primary',
      nurse: 'secondary',
      patient: 'info',
      staff: 'warning',
    };
    return colors[role] || 'default';
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
              label="Filter by Role"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              size="small"
            >
              {ROLES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="Filter by Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              size="small"
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* User Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Username</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Phone</strong></TableCell>
              <TableCell><strong>Speciality</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No users found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.role.toUpperCase()}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone_number}</TableCell>
                  <TableCell>{user.speciality || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={user.is_active ? 'Active' : 'Inactive'}
                      color={user.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit User">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onEdit(user)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={user.is_active ? 'Deactivate' : 'Activate'}>
                      <IconButton
                        size="small"
                        color={user.is_active ? 'error' : 'success'}
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.is_active ? (
                          <Block fontSize="small" />
                        ) : (
                          <CheckCircle fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UserList;
