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
  LocalHospital as HospitalIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandIcon,
  CalendarMonth as DateIcon,
  PersonOutline as DoctorIcon,
  CheckCircle as DischargedIcon,
  Print as PrintIcon,
  MedicalServices as MedicalIcon,
  Medication as MedicationIcon,
  Assignment as InstructionsIcon,
} from '@mui/icons-material';
import { format, parseISO, differenceInDays } from 'date-fns';

interface DischargeReportProps {
  refreshTrigger?: number;
}

interface DischargeReport {
  id: string;
  dischargeNumber: string;
  admissionDate: string;
  dischargeDate: string;
  patientName: string;
  patientId: string;
  age: number;
  gender: string;
  admittingDiagnosis: string;
  finalDiagnosis: string[];
  treatingSurgeon: string;
  treatingPhysician: string;
  ward: string;
  bedNumber: string;
  lengthOfStay: number;
  procedures: {
    name: string;
    date: string;
    surgeon: string;
  }[];
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  dischargeInstructions: {
    diet: string;
    activity: string;
    followUp: string;
    precautions: string[];
  };
  dischargeSummary: string;
  complications?: string;
  condition: string;
}

const DischargeReports: React.FC<DischargeReportProps> = ({ refreshTrigger }) => {
  const [reports, setReports] = useState<DischargeReport[]>([]);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [refreshTrigger]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Mock data - In real implementation, fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockReports: DischargeReport[] = [
        {
          id: '1',
          dischargeNumber: 'DC-2026-001',
          admissionDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          dischargeDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          patientName: 'John Doe',
          patientId: 'P-2026-101',
          age: 45,
          gender: 'Male',
          admittingDiagnosis: 'Acute Appendicitis',
          finalDiagnosis: ['Acute Appendicitis', 'Post-operative recovery'],
          treatingSurgeon: 'Dr. James Wilson',
          treatingPhysician: 'Dr. Sarah Johnson',
          ward: 'Surgical Ward A',
          bedNumber: 'A-205',
          lengthOfStay: 7,
          procedures: [
            {
              name: 'Laparoscopic Appendectomy',
              date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
              surgeon: 'Dr. James Wilson',
            },
          ],
          medications: [
            {
              name: 'Amoxicillin',
              dosage: '500mg',
              frequency: 'Three times daily',
              duration: '7 days',
            },
            {
              name: 'Ibuprofen',
              dosage: '400mg',
              frequency: 'As needed for pain',
              duration: '5 days',
            },
          ],
          dischargeInstructions: {
            diet: 'Light diet for 3 days, then resume normal diet. Avoid spicy foods for 2 weeks.',
            activity: 'Light activities only. No heavy lifting for 4 weeks. Gradual return to normal activities.',
            followUp: 'Follow-up appointment with Dr. Wilson in 2 weeks for wound check and stitch removal.',
            precautions: [
              'Keep surgical wound clean and dry',
              'Watch for signs of infection (redness, swelling, fever)',
              'Report severe pain or unusual discharge',
              'Avoid strenuous exercise for 4 weeks',
            ],
          },
          dischargeSummary: 'Patient was admitted with acute appendicitis and underwent successful laparoscopic appendectomy. Post-operative recovery was uneventful. Wound healing well. Patient stable and ready for discharge with home care instructions.',
          condition: 'Stable',
        },
        {
          id: '2',
          dischargeNumber: 'DC-2025-089',
          admissionDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          dischargeDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          patientName: 'John Doe',
          patientId: 'P-2026-101',
          age: 45,
          gender: 'Male',
          admittingDiagnosis: 'Type 2 Diabetes - Uncontrolled',
          finalDiagnosis: ['Type 2 Diabetes Mellitus', 'Hypertension'],
          treatingSurgeon: 'N/A',
          treatingPhysician: 'Dr. Sarah Johnson',
          ward: 'Medical Ward B',
          bedNumber: 'B-112',
          lengthOfStay: 30,
          procedures: [],
          medications: [
            {
              name: 'Metformin',
              dosage: '500mg',
              frequency: 'Twice daily',
              duration: 'Ongoing',
            },
            {
              name: 'Lisinopril',
              dosage: '10mg',
              frequency: 'Once daily',
              duration: 'Ongoing',
            },
          ],
          dischargeInstructions: {
            diet: 'Diabetic diet - low sugar, low fat. Monitor carbohydrate intake. Increase fiber consumption.',
            activity: 'Regular exercise - walking 30 minutes daily. Monitor blood sugar before and after exercise.',
            followUp: 'Monthly follow-up with Dr. Johnson. Regular HbA1c testing every 3 months.',
            precautions: [
              'Monitor blood sugar levels twice daily',
              'Maintain medication schedule strictly',
              'Watch for hypoglycemia symptoms',
              'Proper foot care and inspection',
              'Report any unusual symptoms immediately',
            ],
          },
          dischargeSummary: 'Patient admitted for diabetic ketoacidosis. Blood sugar levels stabilized with insulin therapy. Patient educated on diabetes management, diet, and medication compliance. Patient demonstrates understanding of self-care and monitoring.',
          complications: 'Initial diabetic ketoacidosis resolved',
          condition: 'Improved and Stable',
        },
      ];

      setReports(mockReports);
    } catch (error) {
      console.error('Error fetching discharge reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMMM dd, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const handleDownloadPDF = (report: DischargeReport) => {
    console.log('Downloading discharge report:', report.dischargeNumber);
    // In real implementation, generate and download PDF
    alert(`Download functionality will generate PDF for ${report.dischargeNumber}`);
  };

  const handlePrint = (report: DischargeReport) => {
    console.log('Printing discharge report:', report.dischargeNumber);
    // In real implementation, open print dialog
    window.print();
  };

  if (loading) {
    return <Typography>Loading discharge reports...</Typography>;
  }

  if (reports.length === 0) {
    return (
      <Alert severity="info">
        No discharge reports available.
      </Alert>
    );
  }

  return (
    <Box>
      {reports.map((report) => {
        const isExpanded = expandedReport === report.id;

        return (
          <Card key={report.id} sx={{ mb: 3 }}>
            <CardContent>
              {/* Header */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '12px',
                      bgcolor: 'success.light',
                      color: 'success.dark',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <HospitalIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Typography variant="h6">
                      Discharge Report - {report.dischargeNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Discharged: {formatDate(report.dischargeDate)}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PrintIcon />}
                    onClick={() => handlePrint(report)}
                  >
                    Print
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownloadPDF(report)}
                  >
                    Download PDF
                  </Button>
                  <IconButton
                    onClick={() => setExpandedReport(isExpanded ? null : report.id)}
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

              {/* Summary Information */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Admission Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(report.admissionDate)}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Discharge Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(report.dischargeDate)}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Length of Stay
                    </Typography>
                    <Typography variant="body1">
                      {report.lengthOfStay} days
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Ward / Bed
                    </Typography>
                    <Typography variant="body1">
                      {report.ward} - Bed {report.bedNumber}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Treating Physician
                    </Typography>
                    <Typography variant="body1">
                      {report.treatingPhysician}
                    </Typography>
                  </Box>
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Discharge Condition
                    </Typography>
                    <Chip 
                      label={report.condition}
                      size="small"
                      color="success"
                    />
                  </Box>
                </Grid>
              </Grid>

              {/* Diagnosis Summary */}
              <Box mt={3}>
                <Typography variant="subtitle2" gutterBottom>
                  Final Diagnosis
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {report.finalDiagnosis.map((diagnosis, idx) => (
                    <Chip 
                      key={idx}
                      label={diagnosis}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>

              {/* Expanded Details */}
              <Collapse in={isExpanded} timeout="auto">
                <Box mt={3}>
                  {/* Procedures */}
                  {report.procedures.length > 0 && (
                    <Box mb={3}>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <MedicalIcon color="primary" />
                        <Typography variant="subtitle2" fontWeight="bold">
                          Procedures Performed
                        </Typography>
                      </Box>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Procedure</TableCell>
                              <TableCell>Date</TableCell>
                              <TableCell>Surgeon</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {report.procedures.map((procedure, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{procedure.name}</TableCell>
                                <TableCell>{formatDate(procedure.date)}</TableCell>
                                <TableCell>{procedure.surgeon}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}

                  {/* Medications */}
                  <Box mb={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <MedicationIcon color="success" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Discharge Medications
                      </Typography>
                    </Box>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Medication</TableCell>
                            <TableCell>Dosage</TableCell>
                            <TableCell>Frequency</TableCell>
                            <TableCell>Duration</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {report.medications.map((med, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{med.name}</TableCell>
                              <TableCell>{med.dosage}</TableCell>
                              <TableCell>{med.frequency}</TableCell>
                              <TableCell>{med.duration}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>

                  {/* Discharge Instructions */}
                  <Box mb={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <InstructionsIcon color="warning" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Discharge Instructions
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom color="primary">
                            Diet
                          </Typography>
                          <Typography variant="body2">
                            {report.dischargeInstructions.diet}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom color="primary">
                            Activity
                          </Typography>
                          <Typography variant="body2">
                            {report.dischargeInstructions.activity}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                          <Typography variant="subtitle2" gutterBottom color="primary">
                            Follow-up
                          </Typography>
                          <Typography variant="body2">
                            {report.dischargeInstructions.followUp}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'warning.lighter' }}>
                          <Typography variant="subtitle2" gutterBottom color="warning.dark">
                            Precautions
                          </Typography>
                          <Box component="ul" sx={{ m: 0, pl: 2 }}>
                            {report.dischargeInstructions.precautions.map((precaution, idx) => (
                              <Typography key={idx} component="li" variant="body2">
                                {precaution}
                              </Typography>
                            ))}
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Discharge Summary */}
                  <Box mb={3}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Clinical Summary
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body2">
                        {report.dischargeSummary}
                      </Typography>
                    </Paper>
                  </Box>

                  {/* Complications */}
                  {report.complications && (
                    <Box mb={3}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Complications
                      </Typography>
                      <Alert severity="warning">
                        {report.complications}
                      </Alert>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

export default DischargeReports;