import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Checkbox,
  IconButton,
  Divider,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle as CompleteIcon,
  Circle as PendingIcon,
  Schedule as TimeIcon,
  LocationOn as LocationIcon,
  Assignment as TaskIcon,
  PriorityHigh as UrgentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

interface TaskManagementProps {
  refreshTrigger?: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueTime: string;
  location: string;
  category: string;
  assignedBy: string;
}

const TaskManagement: React.FC<TaskManagementProps> = ({ refreshTrigger }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [refreshTrigger]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Mock data - In real implementation, fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Restock ICU Supplies',
          description: 'Check and restock all essential ICU supplies including gloves, masks, and sanitizers',
          priority: 'urgent',
          status: 'pending',
          dueTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          location: 'ICU - Floor 3',
          category: 'Inventory',
          assignedBy: 'Manager Smith',
        },
        {
          id: '2',
          title: 'Clean Operating Room 2',
          description: 'Deep cleaning and sterilization after surgery. Follow standard protocols.',
          priority: 'high',
          status: 'in-progress',
          dueTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
          location: 'OR-2, Floor 2',
          category: 'Cleaning',
          assignedBy: 'Supervisor Johnson',
        },
        {
          id: '3',
          title: 'Equipment Maintenance Check',
          description: 'Routine inspection of medical equipment in wards A-C',
          priority: 'normal',
          status: 'pending',
          dueTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
          location: 'Wards A, B, C',
          category: 'Maintenance',
          assignedBy: 'Manager Smith',
        },
        {
          id: '4',
          title: 'Update Patient Records',
          description: 'Transfer physical records to digital system for Ward B patients',
          priority: 'normal',
          status: 'pending',
          dueTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
          location: 'Medical Records Office',
          category: 'Administration',
          assignedBy: 'Admin Davis',
        },
        {
          id: '5',
          title: 'Inspect Fire Safety Equipment',
          description: 'Monthly fire extinguisher and alarm system check',
          priority: 'high',
          status: 'pending',
          dueTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          location: 'All Floors',
          category: 'Safety',
          assignedBy: 'Safety Officer',
        },
        {
          id: '6',
          title: 'Deliver Lab Samples',
          description: 'Transport samples from wards to laboratory',
          priority: 'urgent',
          status: 'completed',
          dueTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          location: 'Laboratory',
          category: 'Transport',
          assignedBy: 'Lab Manager',
        },
      ];

      setTasks(mockTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, status: task.status === 'completed' ? 'pending' : 'completed' }
          : task
      )
    );
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

  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'hh:mm a');
    } catch {
      return 'Invalid time';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'completed') return task.status === 'completed';
    return task.status !== 'completed';
  });

  const completionRate = tasks.length > 0
    ? Math.round((tasks.filter(t => t.status === 'completed').length / tasks.length) * 100)
    : 0;

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      {/* Progress Bar */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="text.secondary">
            Overall Progress
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {tasks.filter(t => t.status === 'completed').length} / {tasks.length} tasks completed
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={completionRate}
          color={completionRate >= 80 ? 'success' : completionRate >= 50 ? 'warning' : 'error'}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>

      {/* Filter Buttons */}
      <Box display="flex" gap={1} mb={3}>
        <Button
          variant={filter === 'pending' ? 'contained' : 'outlined'}
          onClick={() => setFilter('pending')}
          size="small"
          startIcon={<PendingIcon />}
        >
          Pending ({tasks.filter(t => t.status !== 'completed').length})
        </Button>
        <Button
          variant={filter === 'completed' ? 'contained' : 'outlined'}
          onClick={() => setFilter('completed')}
          size="small"
          startIcon={<CompleteIcon />}
        >
          Completed ({tasks.filter(t => t.status === 'completed').length})
        </Button>
        <Button
          variant={filter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setFilter('all')}
          size="small"
        >
          All ({tasks.length})
        </Button>
      </Box>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Alert severity="info">
          No tasks found.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredTasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <Card 
                variant="outlined"
                sx={{
                  borderLeft: `4px solid`,
                  borderLeftColor: task.priority === 'urgent' ? 'error.main' : 
                                   task.priority === 'high' ? 'warning.main' : 
                                   'info.main',
                  opacity: task.status === 'completed' ? 0.7 : 1,
                  '&:hover': { boxShadow: 2 },
                }}
              >
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <Checkbox
                          checked={task.status === 'completed'}
                          onChange={() => handleToggleComplete(task.id)}
                          icon={<PendingIcon />}
                          checkedIcon={<CompleteIcon />}
                          sx={{ mt: -0.5 }}
                        />
                        <Box flex={1}>
                          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                            <Typography 
                              variant="h6"
                              sx={{
                                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                              }}
                            >
                              {task.title}
                            </Typography>
                            <Chip 
                              label={task.priority}
                              size="small"
                              color={getPriorityColor(task.priority) as any}
                              icon={task.priority === 'urgent' ? <UrgentIcon /> : undefined}
                            />
                            <Chip 
                              label={task.category}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {task.description}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={2} mt={1}>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <TimeIcon fontSize="small" color="action" />
                              <Typography variant="caption">
                                Due: {formatTime(task.dueTime)}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <LocationIcon fontSize="small" color="action" />
                              <Typography variant="caption">
                                {task.location}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                            Assigned by: {task.assignedBy}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Box display="flex" flexDirection="column" gap={1} height="100%" justifyContent="center">
                        {task.status === 'completed' ? (
                          <Chip 
                            label="Completed" 
                            color="success" 
                            icon={<CompleteIcon />}
                            sx={{ width: '100%' }}
                          />
                        ) : task.status === 'in-progress' ? (
                          <>
                            <Chip 
                              label="In Progress" 
                              color="primary" 
                              sx={{ width: '100%' }}
                            />
                            <Button 
                              variant="outlined" 
                              size="small"
                              startIcon={<CompleteIcon />}
                              onClick={() => handleToggleComplete(task.id)}
                            >
                              Mark Complete
                            </Button>
                          </>
                        ) : (
                          <Button 
                            variant="contained" 
                            size="small"
                            onClick={() => handleToggleComplete(task.id)}
                          >
                            Start Task
                          </Button>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TaskManagement;