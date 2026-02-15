import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import PatientDashboard from './pages/PatientDashboard';
import StaffDashboard from './pages/StaffDashboard';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
      />
      
      <Route
        path="/dashboard"
        element={
          user ? (
            user.role === 'admin' ? <AdminDashboard /> :
            user.role === 'doctor' ? <DoctorDashboard /> :
            user.role === 'nurse' ? <NurseDashboard /> :
            user.role === 'patient' ? <PatientDashboard /> :
            user.role === 'staff' ? <StaffDashboard /> :
            <Navigate to="/login" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;
