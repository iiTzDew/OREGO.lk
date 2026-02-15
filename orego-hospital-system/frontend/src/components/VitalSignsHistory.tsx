import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  Avatar,
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
  ExpandMore as ExpandIcon,
  Thermostat as TempIcon,
  Favorite as HeartIcon,
  Air as RespirationIcon,
  Speed as PulseIcon,
  PersonOutline as PersonIcon,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

interface VitalSignsHistoryProps {
  refreshTrigger?: number;
}

interface VitalRecord {
  id: string;
  patientId: string;
  patientName: string;
  temperature: string;
  bloodPressureSystolic: string;
  bloodPressureDiastolic: string;
  heartRate: string;
  respiratoryRate: string;
  oxygenSaturation: string;
  painLevel: string;
  notes: string;
  recordedAt: string;
  recordedBy: string;
}

const VitalSignsHistory: React.FC<VitalSignsHistoryProps> = ({ refreshTrigger }) => {
  const [vitalRecords, setVitalRecords] = useState<VitalRecord[]>([]);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);

  useEffect(() => {
    fetchVitalRecords();
  }, [refreshTrigger]);

  const fetchVitalRecords = () => {
    // Mock data for demonstration - In real implementation, fetch from backend
    const mockRecords: VitalRecord[] = [
      {
        id: '1',
        patientId: '101',
        patientName: 'John Doe',
        temperature: '37.2',
        bloodPressureSystolic: '120',
        bloodPressureDiastolic: '80',
        heartRate: '72',
        respiratoryRate: '16',
        oxygenSaturation: '98',
        painLevel: '2',
        notes: 'Patient stable, no concerns',
        recordedAt: new Date().toISOString(),
        recordedBy: 'Nurse Smith',
      },
      {
        id: '2',
        patientId: '102',
        patientName: 'Jane Smith',
        temperature: '38.5',
        bloodPressureSystolic: '145',
        bloodPressureDiastolic: '92',
        heartRate: '88',
        respiratoryRate: '20',
        oxygenSaturation: '96',
        painLevel: '4',
        notes: 'Elevated temperature, monitoring closely',
        recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        recordedBy: 'Nurse Johnson',
      },
      {
        id: '3',
        patientId: '103',
        patientName: 'Robert Williams',
        temperature: '36.8',
        bloodPressureSystolic: '118',
        bloodPressureDiastolic: '78',
        heartRate: '68',
        respiratoryRate: '14',
        oxygenSaturation: '99',
        painLevel: '1',
        notes: 'All vitals within normal range',
        recordedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        recordedBy: 'Nurse Smith',
      },
    ];

    setVitalRecords(mockRecords);
  };

  const getVitalStatus = (record: VitalRecord) => {
    const alerts: string[] = [];
    
    const temp = parseFloat(record.temperature);
    if (temp > 38.5) alerts.push('High fever');
    else if (temp > 37.5) alerts.push('Elevated temp');
    else if (temp < 36) alerts.push('Low temp');

    const spo2 = parseInt(record.oxygenSaturation);
    if (spo2 < 90) alerts.push('Low O2');
    else if (spo2 < 95) alerts.push('Monitor O2');

    const systolic = parseInt(record.bloodPressureSystolic);
    const diastolic = parseInt(record.bloodPressureDiastolic);
    if (systolic > 140 || diastolic > 90) alerts.push('High BP');
    else if (systolic < 90 || diastolic < 60) alerts.push('Low BP');

    const hr = parseInt(record.heartRate);
    if (hr > 100) alerts.push('Tachycardia');
    else if (hr < 60) alerts.push('Bradycardia');

    return alerts;
  };

  const formatTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM dd, yyyy hh:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  const groupByPatient = () => {
    const grouped: { [key: string]: VitalRecord[] } = {};
    vitalRecords.forEach(record => {
      if (!grouped[record.patientId]) {
        grouped[record.patientId] = [];
      }
      grouped[record.patientId].push(record);
    });
    return grouped;
  };

  const patientGroups = groupByPatient();

  return (
    <Box>
      {vitalRecords.length === 0 ? (
        <Alert severity="info">
          No vital signs recorded yet. Go to the "My Patients" tab to record vital signs for patients.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {Object.entries(patientGroups).map(([patientId, records]) => {
            const latestRecord = records[0];
            const alerts = getVitalStatus(latestRecord);
            const isExpanded = expandedPatient === patientId;

            return (
              <Grid item xs={12} key={patientId}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {latestRecord.patientName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last recorded: {formatTime(latestRecord.recordedAt)}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        {alerts.length > 0 ? (
                          <Chip 
                            label={`${alerts.length} Alert${alerts.length > 1 ? 's' : ''}`}
                            color="warning"
                            size="small"
                          />
                        ) : (
                          <Chip 
                            label="Normal"
                            color="success"
                            size="small"
                          />
                        )}
                        <IconButton 
                          onClick={() => setExpandedPatient(isExpanded ? null : patientId)}
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

                    {/* Latest Vital Signs Summary */}
                    <Grid container spacing={2}>
                      <Grid item xs={6} sm={4} md={2}>
                        <Box textAlign="center">
                          <TempIcon color="action" />
                          <Typography variant="caption" display="block" color="text.secondary">
                            Temperature
                          </Typography>
                          <Typography variant="h6">
                            {latestRecord.temperature}°C
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Box textAlign="center">
                          <HeartIcon color="action" />
                          <Typography variant="caption" display="block" color="text.secondary">
                            Blood Pressure
                          </Typography>
                          <Typography variant="h6">
                            {latestRecord.bloodPressureSystolic}/{latestRecord.bloodPressureDiastolic}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Box textAlign="center">
                          <HeartIcon color="action" />
                          <Typography variant="caption" display="block" color="text.secondary">
                            Heart Rate
                          </Typography>
                          <Typography variant="h6">
                            {latestRecord.heartRate} bpm
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Box textAlign="center">
                          <RespirationIcon color="action" />
                          <Typography variant="caption" display="block" color="text.secondary">
                            Resp. Rate
                          </Typography>
                          <Typography variant="h6">
                            {latestRecord.respiratoryRate}/min
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Box textAlign="center">
                          <PulseIcon color="action" />
                          <Typography variant="caption" display="block" color="text.secondary">
                            SpO2
                          </Typography>
                          <Typography variant="h6">
                            {latestRecord.oxygenSaturation}%
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={4} md={2}>
                        <Box textAlign="center">
                          <Typography variant="caption" display="block" color="text.secondary">
                            Pain Level
                          </Typography>
                          <Typography variant="h6">
                            {latestRecord.painLevel}/10
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Alert Messages */}
                    {alerts.length > 0 && (
                      <Box mt={2}>
                        <Alert severity="warning">
                          <Typography variant="subtitle2" gutterBottom>
                            Clinical Alerts:
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            {alerts.map((alert, idx) => (
                              <Chip key={idx} label={alert} size="small" color="warning" />
                            ))}
                          </Box>
                        </Alert>
                      </Box>
                    )}

                    {/* Notes */}
                    {latestRecord.notes && (
                      <Box mt={2}>
                        <Typography variant="caption" color="text.secondary">
                          Latest Notes:
                        </Typography>
                        <Typography variant="body2">
                          {latestRecord.notes}
                        </Typography>
                      </Box>
                    )}

                    {/* Expanded History Table */}
                    <Collapse in={isExpanded} timeout="auto">
                      <Box mt={3}>
                        <Typography variant="subtitle2" gutterBottom>
                          Historical Records ({records.length})
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Time</TableCell>
                                <TableCell>Temp</TableCell>
                                <TableCell>BP</TableCell>
                                <TableCell>HR</TableCell>
                                <TableCell>RR</TableCell>
                                <TableCell>SpO2</TableCell>
                                <TableCell>Pain</TableCell>
                                <TableCell>Recorded By</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {records.map((record) => (
                                <TableRow key={record.id}>
                                  <TableCell>
                                    <Typography variant="caption">
                                      {formatTime(record.recordedAt)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>{record.temperature}°C</TableCell>
                                  <TableCell>
                                    {record.bloodPressureSystolic}/{record.bloodPressureDiastolic}
                                  </TableCell>
                                  <TableCell>{record.heartRate}</TableCell>
                                  <TableCell>{record.respiratoryRate}</TableCell>
                                  <TableCell>{record.oxygenSaturation}%</TableCell>
                                  <TableCell>{record.painLevel}/10</TableCell>
                                  <TableCell>
                                    <Typography variant="caption">
                                      {record.recordedBy}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default VitalSignsHistory;