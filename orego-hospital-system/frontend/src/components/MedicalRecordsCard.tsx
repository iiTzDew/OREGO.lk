import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Divider,
  Alert,
  IconButton,
} from '@mui/material';
import {
  ExpandMore as ExpandIcon,
  Download as DownloadIcon,
  LocalHospital as DiagnosisIcon,
  LocalHospital,
  Healing as TreatmentIcon,
  Science as LabIcon,
  CalendarMonth as DateIcon,
  PersonOutline as DoctorIcon,
  Medication,
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

interface MedicalRecordsCardProps {
  refreshTrigger?: number;
}

interface MedicalRecord {
  id: string;
  date: string;
  doctorName: string;
  visitType: string;
  diagnosis: string[];
  treatments: string[];
  prescriptions: string[];
  labTests?: string[];
  notes: string;
  documents?: { name: string; url: string }[];
}

const MedicalRecordsCard: React.FC<MedicalRecordsCardProps> = ({ refreshTrigger }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, [refreshTrigger]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      // Mock data - In real implementation, fetch from backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockRecords: MedicalRecord[] = [
        {
          id: '1',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          doctorName: 'Dr. Sarah Johnson',
          visitType: 'Follow-up Consultation',
          diagnosis: ['Hypertension - controlled', 'Type 2 Diabetes'],
          treatments: ['Lifestyle modifications', 'Regular exercise', 'Diet management'],
          prescriptions: ['Metformin 500mg', 'Lisinopril 10mg'],
          labTests: ['HbA1c Test', 'Lipid Panel'],
          notes: 'Patient showing good progress. Blood sugar levels improving. Continue current medication regimen.',
          documents: [
            { name: 'Lab Results - HbA1c', url: '#' },
            { name: 'Prescription Details', url: '#' },
          ],
        },
        {
          id: '2',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          doctorName: 'Dr. Michael Chen',
          visitType: 'Annual Physical Examination',
          diagnosis: ['General health - good condition'],
          treatments: ['Preventive care counseling', 'Vaccination updates'],
          prescriptions: ['Multivitamin supplements'],
          labTests: ['Complete Blood Count', 'Comprehensive Metabolic Panel', 'Lipid Profile'],
          notes: 'Overall health excellent. Recommended annual follow-up. Patient advised on maintaining healthy lifestyle.',
          documents: [
            { name: 'Physical Exam Report', url: '#' },
            { name: 'Lab Test Results', url: '#' },
          ],
        },
        {
          id: '3',
          date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          doctorName: 'Dr. Emily Rodriguez',
          visitType: 'Specialist Consultation',
          diagnosis: ['Allergic Rhinitis', 'Seasonal Allergies'],
          treatments: ['Antihistamine therapy', 'Nasal corticosteroid spray', 'Allergen avoidance'],
          prescriptions: ['Cetirizine 10mg', 'Fluticasone nasal spray'],
          notes: 'Patient responding well to allergy treatment. Symptoms significantly reduced.',
        },
      ];

      setRecords(mockRecords);
    } catch (error) {
      console.error('Error fetching medical records:', error);
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

  if (loading) {
    return <Typography>Loading medical records...</Typography>;
  }

  if (records.length === 0) {
    return (
      <Alert severity="info">
        No medical records available yet.
      </Alert>
    );
  }

  return (
    <Box>
      {records.map((record, index) => (
        <Accordion 
          key={record.id}
          defaultExpanded={index === 0}
          sx={{ 
            mb: 2,
            '&:before': { display: 'none' },
            boxShadow: 1,
          }}
        >
          <AccordionSummary 
            expandIcon={<ExpandIcon />}
            sx={{ 
              bgcolor: 'grey.50',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LocalHospital />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {record.visitType}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                      <DateIcon fontSize="small" />
                      {formatDate(record.date)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                      <DoctorIcon fontSize="small" />
                      {record.doctorName}
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Chip 
                label={`${record.diagnosis.length} Diagnosis`}
                size="small"
                color="primary"
                sx={{ mr: 2 }}
              />
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Diagnosis Section */}
              <Grid item xs={12} md={6}>
                <Box mb={3}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <DiagnosisIcon color="error" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Diagnosis
                    </Typography>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {record.diagnosis.map((diagnosis, idx) => (
                      <Chip 
                        key={idx}
                        label={diagnosis}
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                {/* Treatments Section */}
                <Box mb={3}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <TreatmentIcon color="success" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Treatments
                    </Typography>
                  </Box>
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {record.treatments.map((treatment, idx) => (
                      <Typography key={idx} component="li" variant="body2" sx={{ mb: 0.5 }}>
                        {treatment}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Grid>

              {/* Prescriptions & Lab Tests */}
              <Grid item xs={12} md={6}>
                <Box mb={3}>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <Medication color="primary" />
                    <Typography variant="subtitle2" fontWeight="bold">
                      Prescriptions
                    </Typography>
                  </Box>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {record.prescriptions.map((prescription, idx) => (
                      <Chip 
                        key={idx}
                        label={prescription}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>

                {record.labTests && record.labTests.length > 0 && (
                  <Box mb={3}>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      <LabIcon color="secondary" />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Lab Tests
                      </Typography>
                    </Box>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {record.labTests.map((test, idx) => (
                        <Chip 
                          key={idx}
                          label={test}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Grid>

              {/* Clinical Notes */}
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Clinical Notes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {record.notes}
                </Typography>
              </Grid>

              {/* Documents */}
              {record.documents && record.documents.length > 0 && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Documents
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {record.documents.map((doc, idx) => (
                      <Chip
                        key={idx}
                        label={doc.name}
                        size="small"
                        onClick={() => console.log('Download:', doc.url)}
                        onDelete={() => console.log('Download:', doc.url)}
                        deleteIcon={<DownloadIcon />}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default MedicalRecordsCard;