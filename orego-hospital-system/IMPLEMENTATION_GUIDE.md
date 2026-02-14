# OREGO.lk Hospital Management System
# Complete Implementation Guide - 2 Week Timeline

## 📋 Current Status:
- ✅ Backend Complete (Flask + PostgreSQL)
- ✅ Frontend Foundation (React + Material-UI + TypeScript)
- ✅ Authentication System
- ✅ Dashboard Layouts for all 5 roles
- ⚠️  UI Components need implementation (Below)

---

## 🚀 IMMEDIATE STEPS TO START:

### Step 1: Install Frontend Dependencies  
```bash
cd D:\ogero.lk_try\orego-hospital-system\fronteend
npm install
```

### Step 2: Start Backend (In one terminal)
```bash
cd D:\ogero.lk_try\orego-hospital-system\backend
.\venv\Scripts\Activate
python run.py
```

### Step 3: Start Frontend (In another terminal)
```bash
cd D:\ogero.lk_try\orego-hospital-system\fronteend
npm start
```

### Step 4: Create First Admin User
Open PostgreSQL and run:
```sql
INSERT INTO users (
  id, username, password_hash, role, name, birthday, 
  id_card_number, address, phone_number, email, is_active
) VALUES (
  gen_random_uuid(),
  'admin',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5jtI9tZFqE3fK',  -- password: admin123
  'admin',
  'System Administrator',
  '1990-01-01',
  '123456789V',
  'Hospital Address',
  '0771234567',
  'admin@hospital.com',
  true
);
```

Now you can login with:
- Username: `admin`
- Password: `admin123`

---

## 📂 REMAINING COMPONENTS TO BUILD:

### Week 1 - Days 1-7: Core Features

#### Day 1-2: Hospital Setup & User Registration Forms

**File: `src/components/HospitalSetupForm.tsx`**
- Form to enter hospital details (name, address, phone, email, registration number)
- Use Material-UI TextField, Button components
- Call `hospitalService.createOrUpdateHospital()`
- Show success message using Alert component

**File: `src/components/UserRegistrationForm.tsx`**
- Form fields: username, password, name, birthday, ID card, address, phone, email, role
- Conditional fields based on role:
  - Patient: medical_status, operation_type (required)
  - Doctor/Staff: speciality dropdown (required)
- Use Material-UI Select for role and speciality
- Call `userService.registerUser()`
- Show success/error messages

#### Day 3-4: Resource Management

**File: `src/components/ResourceRegistrationForm.tsx`**
- Form fields: type (dropdown: bed, operation_theatre, machine), name, status
- Conditional fields:
  - Bed: ward_id, bed_number
  - Operation Theatre: ot_number
  - Machine: serial_number
- Call `resourceService.registerResource()`

**File: `src/components/ResourceList.tsx`**
- Table/Grid showing all resources
- Filters by type and status
- Use Material-UI Table or DataGrid
- Call `resourceService.getAllResources()`
- Show resource identifier, type, status
- Edit/Delete buttons for each resource

#### Day 5-7: Booking System

**File: `src/components/BookingForm.tsx`**
- Select patient (dropdown from `userService.getPatients()`)
- Select doctor (dropdown from `userService.getDoctors()`)
- Select booking type (surgery, appointment, test)
- Date and time picker (use date-fns for formatting)
- Duration in hours (number input)
- Multi-select for resources:
  - Beds (from `resourceService.getBeds({ status: 'available' })`)
  - Operation Theatres (from `resourceService.getOperationTheatres({ status: 'available' })`)
  - Nurses (from `userService.getNurses()`)
  - Staff (from `userService.getStaff()`)
- Call `bookingService.createBooking()`
- Show conflict errors if doctor/resources unavailable

**File: `src/components/BookingCalendar.tsx`**
- Calendar view of all bookings
- Use Material-UI or date-fns for calendar
- Show bookings by date
- Color code by status (scheduled, completed, cancelled)
- Click booking to view details

---

### Week 2 - Days 8-14: Advanced Features & Testing

#### Day 8-9: Notifications & Discharge

**File: `src/components/NotificationList.tsx`**
- Display notifications for logged-in user
- Badge showing unread count
- Mark as read functionality
- Call `notificationService.getNotifications()`
- Integrate into DashboardLayout (Bell icon in AppBar)

**File: `src/components/DischargeForm.tsx`**
- Select patient (dropdown)
- Select doctor (dropdown)
- Admission date and discharge date (date pickers)
- Diagnosed disease (textarea)
- Treatment summary (textarea)
- Prescribed medicines (textarea)
- Follow-up instructions (textarea)
- Select bed to release (dropdown)
- Doctor approval checkbox (for doctors only)
- Call `dischargeService.createDischarge()`

**File: `src/components/DischargeReportViewer.tsx`**
- Display formatted discharge summary
- Print button to print the report
- Show patient details, dates, diagnosis, treatment, medicines

#### Day 10-11: Profile Management

**File: `src/components/ProfileSettings.tsx`**
- Display current user information
- Editable fields: name, address, phone, email
- Change password section
- Call `userService.updateUser()` and `authService.changePassword()`

#### Day 12-13: Dashboard Analytics & Statistics

**Implement in AdminDashboard.tsx:**
- Fetch counts:
  - Total users by role (call `userService.getAllUsers()`)
  - Total resources by type (call `resourceService.getAllResources()`)
  - Active bookings (call `bookingService.getAllBookings()`)
  - Total discharges (call `dischargeService.getAllDischarges()`)
- Display in Card components with icons
- Use Chart.js or Recharts for visualizations (optional)

**Implement in DoctorDashboard.tsx:**
- Today's appointments (filter bookings by scheduled_date)
- Upcoming surgeries
- Patients to discharge

**Implement in NurseDashboard/StaffDashboard:**
- Assigned tasks/surgeries
- Schedule for the day

**Implement in PatientDashboard:**
- Upcoming appointments
- Discharge history

#### Day 14: Testing & Bug Fixes

**Testing Checklist:**
- ✅ Admin can register all types of users
- ✅ Admin can register resources
- ✅ Doctor can create bookings
- ✅ Bookings prevent conflicts
- ✅ Notifications appear in dashboard
- ✅ Discharge process works
- ✅ Profile editing works
- ✅ Password change works
- ✅ All dashboards load correctly
- ✅ Logout works properly

---

## 💡 CODE TEMPLATES & EXAMPLES:

### Example: User Registration Component

```tsx
// src/components/UserRegistrationForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Alert,
} from '@mui/material';
import { userService } from '../services/userService';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const UserRegistrationForm: React.FC<Props> = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: '',
    name: '',
    birthday: '',
    id_card_number: '',
    address: '',
    phone_number: '',
    email: '',
    speciality: '',
    medical_status: '',
    operation_type: '',
  });
  
  const [specialities, setSpecialities] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const data = await userService.getSpecialities();
        setSpecialities(data.specialities);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSpecialities();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      await userService.registerUser(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Register New User</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Username"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={(e) => handleChange('role', e.target.value)}
              >
                <MenuItem value="doctor">Doctor</MenuItem>
                <MenuItem value="nurse">Nurse</MenuItem>
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Birthday"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={formData.birthday}
              onChange={(e) => handleChange('birthday', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="ID Card Number"
              value={formData.id_card_number}
              onChange={(e) => handleChange('id_card_number', e.target.value)}
              helperText="Format: 123456789V"
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Phone Number"
              value={formData.phone_number}
              onChange={(e) => handleChange('phone_number', e.target.value)}
              helperText="Format: 0771234567"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={2}
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
            />
          </Grid>
          
          {/* Conditional fields based on role */}
          {(formData.role === 'doctor' || formData.role === 'staff') && (
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Speciality</InputLabel>
                <Select
                  value={formData.speciality}
                  onChange={(e) => handleChange('speciality', e.target.value)}
                >
                  {specialities.map((spec) => (
                    <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          )}
          
          {formData.role === 'patient' && (
            <>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  required
                  label="Medical Status"
                  value={formData.medical_status}
                  onChange={(e) => handleChange('medical_status', e.target.value)}
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth required>
                  <InputLabel>Operation Type</InputLabel>
                  <Select
                    value={formData.operation_type}
                    onChange={(e) => handleChange('operation_type', e.target.value)}
                  >
                    <MenuItem value="surgical">Surgical</MenuItem>
                    <MenuItem value="medical">Medical</MenuItem>
                    <MenuItem value="operation">Operation</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {loading ? 'Registering...' : 'Register User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserRegistrationForm;
```

### Example: Integrating Form into Dashboard

```tsx
// In AdminDashboard.tsx - Add this to the User Management tab:

const [registerDialogOpen, setRegisterDialogOpen] = useState(false);

// In the User Management section:
<Button 
  variant="contained" 
  onClick={() => setRegisterDialogOpen(true)}
>
  Register New User
</Button>

<UserRegistrationForm
  open={registerDialogOpen}
  onClose={() => setRegisterDialogOpen(false)}
  onSuccess={() => {
    // Refresh user list
    alert('User registered successfully!');
  }}
/>
```

---

## 🛠️ IMPORTANT TIPS:

1. **CORS Issues?** Make sure backend is running on port 5000
2. **Database Errors?** Check if migrations ran successfully
3. **Login Not Working?** Verify admin user was created in database
4. **401 Errors?** Token might have expired, logout and login again

---

## 📞 NEED HELP?

If you encounter issues:
1. Check browser console for errors (F12)
2. Check backend terminal for API errors
3. Verify database connection
4. Make sure all dependencies are installed

---

**System is now ready for development! Continue building the components listed above, test thoroughly, and you'll have a working system in 2 weeks!** 🚀
