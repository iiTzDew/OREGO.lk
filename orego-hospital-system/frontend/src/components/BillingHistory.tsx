import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  Receipt as InvoiceIcon,
  Payment as PaymentIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandIcon,
  CheckCircle as PaidIcon,
  HourglassEmpty as PendingIcon,
  Cancel as CancelledIcon,
  Warning as OverdueIcon,
} from '@mui/icons-material';
import { format, parseISO, isPast } from 'date-fns';

interface BillingHistoryProps {
  refreshTrigger?: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  description: string;
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  paidDate?: string;
}

const BillingHistory: React.FC<BillingHistoryProps> = ({ refreshTrigger }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, [refreshTrigger]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      // Mock data - In real implementation, fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          invoiceNumber: 'INV-2026-001',
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Consultation and Lab Tests',
          items: [
            { description: 'Doctor Consultation - Dr. Sarah Johnson', quantity: 1, unitPrice: 150, total: 150 },
            { description: 'HbA1c Test', quantity: 1, unitPrice: 75, total: 75 },
            { description: 'Lipid Panel', quantity: 1, unitPrice: 65, total: 65 },
          ],
          subtotal: 290,
          tax: 29,
          total: 319,
          amountPaid: 0,
          amountDue: 319,
          status: 'pending',
        },
        {
          id: '2',
          invoiceNumber: 'INV-2026-002',
          date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Emergency Care',
          items: [
            { description: 'Emergency Room Visit', quantity: 1, unitPrice: 500, total: 500 },
            { description: 'X-Ray Examination', quantity: 2, unitPrice: 120, total: 240 },
            { description: 'Medications', quantity: 1, unitPrice: 85, total: 85 },
          ],
          subtotal: 825,
          tax: 82.5,
          total: 907.5,
          amountPaid: 0,
          amountDue: 907.5,
          status: 'overdue',
        },
        {
          id: '3',
          invoiceNumber: 'INV-2025-045',
          date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Annual Physical Examination',
          items: [
            { description: 'Physical Examination - Dr. Michael Chen', quantity: 1, unitPrice: 200, total: 200 },
            { description: 'Complete Blood Count', quantity: 1, unitPrice: 45, total: 45 },
            { description: 'Comprehensive Metabolic Panel', quantity: 1, unitPrice: 55, total: 55 },
            { description: 'Lipid Profile', quantity: 1, unitPrice: 65, total: 65 },
          ],
          subtotal: 365,
          tax: 36.5,
          total: 401.5,
          amountPaid: 401.5,
          amountDue: 0,
          status: 'paid',
          paymentMethod: 'Credit Card',
          paidDate: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          invoiceNumber: 'INV-2025-032',
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Specialist Consultation',
          items: [
            { description: 'Dermatology Consultation - Dr. Emily Rodriguez', quantity: 1, unitPrice: 175, total: 175 },
            { description: 'Allergy Testing', quantity: 1, unitPrice: 95, total: 95 },
          ],
          subtotal: 270,
          tax: 27,
          total: 297,
          amountPaid: 297,
          amountDue: 0,
          status: 'paid',
          paymentMethod: 'Insurance',
          paidDate: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <PaidIcon fontSize="small" />;
      case 'pending':
        return <PendingIcon fontSize="small" />;
      case 'overdue':
        return <OverdueIcon fontSize="small" />;
      case 'cancelled':
        return <CancelledIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      case 'overdue':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    if (filter === 'all') return true;
    return inv.status === filter;
  });

  const totalOwed = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amountDue, 0);

  if (loading) {
    return <Typography>Loading billing history...</Typography>;
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.light' }}>
            <CardContent>
              <Typography variant="caption" color="error.dark">
                Total Outstanding
              </Typography>
              <Typography variant="h4" color="error.dark" fontWeight="bold">
                ${totalOwed.toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.light' }}>
            <CardContent>
              <Typography variant="caption" color="warning.dark">
                Pending Bills
              </Typography>
              <Typography variant="h4" color="warning.dark" fontWeight="bold">
                {invoices.filter(i => i.status === 'pending').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'error.lighter' }}>
            <CardContent>
              <Typography variant="caption" color="error.dark">
                Overdue Bills
              </Typography>
              <Typography variant="h4" color="error.dark" fontWeight="bold">
                {invoices.filter(i => i.status === 'overdue').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Typography variant="caption" color="success.dark">
                Paid Bills
              </Typography>
              <Typography variant="h4" color="success.dark" fontWeight="bold">
                {invoices.filter(i => i.status === 'paid').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Chips */}
      <Box display="flex" gap={1} mb={3}>
        <Chip
          label="All"
          onClick={() => setFilter('all')}
          color={filter === 'all' ? 'primary' : 'default'}
          variant={filter === 'all' ? 'filled' : 'outlined'}
        />
        <Chip
          label="Pending"
          onClick={() => setFilter('pending')}
          color={filter === 'pending' ? 'primary' : 'default'}
          variant={filter === 'pending' ? 'filled' : 'outlined'}
        />
        <Chip
          label="Overdue"
          onClick={() => setFilter('overdue')}
          color={filter === 'overdue' ? 'primary' : 'default'}
          variant={filter === 'overdue' ? 'filled' : 'outlined'}
        />
        <Chip
          label="Paid"
          onClick={() => setFilter('paid')}
          color={filter === 'paid' ? 'primary' : 'default'}
          variant={filter === 'paid' ? 'filled' : 'outlined'}
        />
      </Box>

      {/* Invoices List */}
      {filteredInvoices.length === 0 ? (
        <Alert severity="info">
          No invoices found.
        </Alert>
      ) : (
        <Box>
          {filteredInvoices.map((invoice) => {
            const isExpanded = expandedInvoice === invoice.id;

            return (
              <Card key={invoice.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '12px',
                          bgcolor: `${getStatusColor(invoice.status)}.light`,
                          color: `${getStatusColor(invoice.status)}.dark`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <InvoiceIcon />
                      </Box>
                      <Box>
                        <Typography variant="h6">
                          {invoice.invoiceNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.description}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Box textAlign="right">
                        <Typography variant="h6" color={invoice.status === 'paid' ? 'success.main' : 'text.primary'}>
                          ${invoice.total.toFixed(2)}
                        </Typography>
                        <Chip 
                          label={invoice.status}
                          size="small"
                          color={getStatusColor(invoice.status) as any}
                          icon={getStatusIcon(invoice.status) as any}
                        />
                      </Box>
                      <IconButton
                        onClick={() => setExpandedInvoice(isExpanded ? null : invoice.id)}
                        sx={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.3s',
                        }}
                      >
                        <ExpandIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Invoice Date
                      </Typography>
                      <Typography variant="body2">
                        {formatDate(invoice.date)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Due Date
                      </Typography>
                      <Typography 
                        variant="body2"
                        color={invoice.status === 'overdue' ? 'error.main' : 'text.primary'}
                      >
                        {formatDate(invoice.dueDate)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="caption" color="text.secondary">
                        Amount Due
                      </Typography>
                      <Typography 
                        variant="body2"
                        fontWeight="bold"
                        color={invoice.amountDue > 0 ? 'error.main' : 'success.main'}
                      >
                        ${invoice.amountDue.toFixed(2)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      {invoice.status === 'paid' && invoice.paidDate && (
                        <>
                          <Typography variant="caption" color="text.secondary">
                            Paid On
                          </Typography>
                          <Typography variant="body2">
                            {formatDate(invoice.paidDate)}
                          </Typography>
                        </>
                      )}
                    </Grid>
                  </Grid>

                  {/* Expanded Details */}
                  <Collapse in={isExpanded} timeout="auto">
                    <Box mt={3}>
                      <Typography variant="subtitle2" gutterBottom>
                        Invoice Items
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Description</TableCell>
                              <TableCell align="right">Quantity</TableCell>
                              <TableCell align="right">Unit Price</TableCell>
                              <TableCell align="right">Total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {invoice.items.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item.description}</TableCell>
                                <TableCell align="right">{item.quantity}</TableCell>
                                <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                                <TableCell align="right">${item.total.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow>
                              <TableCell colSpan={3} align="right">
                                <strong>Subtotal:</strong>
                              </TableCell>
                              <TableCell align="right">
                                <strong>${invoice.subtotal.toFixed(2)}</strong>
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={3} align="right">
                                Tax (10%):
                              </TableCell>
                              <TableCell align="right">${invoice.tax.toFixed(2)}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell colSpan={3} align="right">
                                <strong>Total:</strong>
                              </TableCell>
                              <TableCell align="right">
                                <strong>${invoice.total.toFixed(2)}</strong>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <Box mt={2} display="flex" gap={1}>
                        {invoice.status !== 'paid' && (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<PaymentIcon />}
                          >
                            Pay Now
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                        >
                          Download PDF
                        </Button>
                      </Box>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default BillingHistory;