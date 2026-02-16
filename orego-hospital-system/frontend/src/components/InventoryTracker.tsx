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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as LowStockIcon,
  CheckCircle as AvailableIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as OrderIcon,
} from '@mui/icons-material';

interface InventoryTrackerProps {
  refreshTrigger?: number;
}

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  location: string;
  lastRestocked: string;
}

const InventoryTracker: React.FC<InventoryTrackerProps> = ({ refreshTrigger }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'low' | 'available'>('all');
  const [loading, setLoading] = useState(true);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');

  useEffect(() => {
    fetchInventory();
  }, [refreshTrigger]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      // Mock data - In real implementation, fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockInventory: InventoryItem[] = [
        {
          id: '1',
          name: 'Surgical Gloves (Medium)',
          category: 'Medical Supplies',
          currentStock: 150,
          minStock: 200,
          maxStock: 1000,
          unit: 'boxes',
          location: 'Storeroom A',
          lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          name: 'Face Masks (N95)',
          category: 'PPE',
          currentStock: 50,
          minStock: 500,
          maxStock: 2000,
          unit: 'pieces',
          location: 'Storeroom A',
          lastRestocked: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          name: 'Syringes (10ml)',
          category: 'Medical Supplies',
          currentStock: 800,
          minStock: 500,
          maxStock: 2000,
          unit: 'pieces',
          location: 'Storeroom B',
          lastRestocked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          name: 'Hand Sanitizer (500ml)',
          category: 'Hygiene',
          currentStock: 25,
          minStock: 100,
          maxStock: 300,
          unit: 'bottles',
          location: 'Storeroom A',
          lastRestocked: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '5',
          name: 'Bandages (Sterile)',
          category: 'Medical Supplies',
          currentStock: 300,
          minStock: 200,
          maxStock: 1000,
          unit: 'rolls',
          location: 'Storeroom B',
          lastRestocked: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '6',
          name: 'Disinfectant Wipes',
          category: 'Cleaning',
          currentStock: 40,
          minStock: 100,
          maxStock: 500,
          unit: 'packs',
          location: 'Storeroom C',
          lastRestocked: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '7',
          name: 'IV Bags (1000ml)',
          category: 'Medical Supplies',
          currentStock: 250,
          minStock: 150,
          maxStock: 600,
          unit: 'pieces',
          location: 'Storeroom B',
          lastRestocked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setInventory(mockInventory);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLowStock = (item: InventoryItem) => item.currentStock < item.minStock;

  const getStockPercentage = (item: InventoryItem) => {
    return (item.currentStock / item.maxStock) * 100;
  };

  const getStockStatus = (item: InventoryItem) => {
    if (isLowStock(item)) return 'Low Stock';
    if (item.currentStock >= item.maxStock * 0.8) return 'Well Stocked';
    return 'Adequate';
  };

  const getStockColor = (item: InventoryItem) => {
    if (isLowStock(item)) return 'error';
    if (item.currentStock >= item.maxStock * 0.8) return 'success';
    return 'warning';
  };

  const handleAdjustStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setAdjustDialogOpen(true);
    setAdjustmentAmount('');
  };

  const handleSaveAdjustment = () => {
    if (selectedItem && adjustmentAmount) {
      const adjustment = parseInt(adjustmentAmount);
      setInventory(prevInventory =>
        prevInventory.map(item =>
          item.id === selectedItem.id
            ? { ...item, currentStock: Math.max(0, item.currentStock + adjustment) }
            : item
        )
      );
      setAdjustDialogOpen(false);
      setSelectedItem(null);
      setAdjustmentAmount('');
    }
  };

  const filteredInventory = inventory.filter(item => {
    if (filter === 'low') return isLowStock(item);
    if (filter === 'available') return !isLowStock(item);
    return true;
  });

  const lowStockCount = inventory.filter(isLowStock).length;

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'error.light' }}>
            <CardContent>
              <Typography variant="caption" color="error.dark">
                Low Stock Items
              </Typography>
              <Typography variant="h4" color="error.dark" fontWeight="bold">
                {lowStockCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Typography variant="caption" color="success.dark">
                Well Stocked
              </Typography>
              <Typography variant="h4" color="success.dark" fontWeight="bold">
                {inventory.filter(item => !isLowStock(item)).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ bgcolor: 'primary.light' }}>
            <CardContent>
              <Typography variant="caption" color="primary.dark">
                Total Items
              </Typography>
              <Typography variant="h4" color="primary.dark" fontWeight="bold">
                {inventory.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alert for Low Stock */}
      {lowStockCount > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<LowStockIcon />}>
          <Typography variant="body2" fontWeight="bold">
            {lowStockCount} item{lowStockCount > 1 ? 's' : ''} below minimum stock level. Restock recommended.
          </Typography>
        </Alert>
      )}

      {/* Filter Buttons */}
      <Box display="flex" gap={1} mb={3}>
        <Button
          variant={filter === 'all' ? 'contained' : 'outlined'}
          onClick={() => setFilter('all')}
          size="small"
        >
          All Items ({inventory.length})
        </Button>
        <Button
          variant={filter === 'low' ? 'contained' : 'outlined'}
          onClick={() => setFilter('low')}
          size="small"
          startIcon={<LowStockIcon />}
          color="error"
        >
          Low Stock ({lowStockCount})
        </Button>
        <Button
          variant={filter === 'available' ? 'contained' : 'outlined'}
          onClick={() => setFilter('available')}
          size="small"
          startIcon={<AvailableIcon />}
          color="success"
        >
          Available ({inventory.length - lowStockCount})
        </Button>
      </Box>

      {/* Inventory Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Item Name</strong></TableCell>
              <TableCell><strong>Category</strong></TableCell>
              <TableCell align="right"><strong>Current Stock</strong></TableCell>
              <TableCell><strong>Stock Level</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Location</strong></TableCell>
              <TableCell align="center"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInventory.map((item) => {
              const stockPercentage = getStockPercentage(item);
              const stockColor = getStockColor(item);

              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <InventoryIcon fontSize="small" color="action" />
                      <Typography variant="body2">{item.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={item.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      {item.currentStock} {item.unit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Min: {item.minStock}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(stockPercentage, 100)}
                        color={stockColor}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(stockPercentage)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStockStatus(item)}
                      size="small"
                      color={stockColor}
                      icon={isLowStock(item) ? <LowStockIcon /> : <AvailableIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{item.location}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleAdjustStock(item)}
                    >
                      Adjust
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Adjust Stock Dialog */}
      <Dialog open={adjustDialogOpen} onClose={() => setAdjustDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Adjust Stock - {selectedItem?.name}</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Stock: {selectedItem?.currentStock} {selectedItem?.unit}
            </Typography>
            <TextField
              fullWidth
              label="Adjustment Amount"
              type="number"
              value={adjustmentAmount}
              onChange={(e) => setAdjustmentAmount(e.target.value)}
              helperText="Enter positive number to add stock, negative to remove"
              sx={{ mt: 2 }}
            />
            {adjustmentAmount && selectedItem && (
              <Alert severity="info" sx={{ mt: 2 }}>
                New stock level will be: {Math.max(0, selectedItem.currentStock + parseInt(adjustmentAmount))} {selectedItem.unit}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSaveAdjustment}
            disabled={!adjustmentAmount}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventoryTracker;