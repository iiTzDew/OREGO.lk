# OREGO.lk Hospital Management System
# QUICK START GUIDE

## ✅ WHAT'S BEEN COMPLETED:

### ✅ Backend (100% Complete)
- Flask application with PostgreSQL database
- All database models (User, Hospital, Resource, Booking, Notification, Discharge)
- Authentication system with JWT
- User management APIs (register, update, deactivate)
- Hospital setup APIs
- Resource management APIs (beds, OTs, machines)
- Booking system APIs (with conflict prevention)
- Notification system APIs
- Discharge system APIs
- Password reset functionality
- Role-based access control

### ✅ Frontend Foundation (70% Complete)
- React + TypeScript setup
- Material-UI theme (Blue color palette)
- Authentication context and services
- All service files for API calls
- Login page
- Dashboard layouts for all 5 roles:
  - Admin Dashboard
  - Doctor Dashboard
  - Nurse Dashboard
  - Patient Dashboard
  - Staff Dashboard

### ⚠️ TO BE COMPLETED (30% - YOU NEED TO BUILD):
- User registration form UI
- Hospital setup form UI
- Resource registration form UI
- Resource listing with filters
- Booking creation form
- Booking calendar view
- Notification display component
- Discharge form UI
- Profile settings UI
- Dashboard statistics/analytics

---

## 🚀 HOW TO START NOW:

### Step 1: Setup Database

Open PowerShell as Administrator:

```powershell
# Start PostgreSQL service (if not running)
# Then create database
psql -U postgres
CREATE DATABASE orego_hospital;
\q
```

### Step 2: Setup Backend

```powershell
# Navigate to backend
cd D:\ogero.lk_try\orego-hospital-system\backend

# Activate virtual environment
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Start backend server
python run.py
```

Backend should now run on: **http://localhost:5000**

### Step 3: Create Admin User

Open another PowerShell and run:

```powershell
psql -U postgres -d orego_hospital

# Then paste this SQL:
INSERT INTO users (
  id, username, password_hash, role, name, birthday, 
  id_card_number, address, phone_number, email, is_active
) VALUES (
  gen_random_uuid(),
  'admin',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5jtI9tZFqE3fK',
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

**Login Credentials:**
- Username: `admin`
- Password: `admin123`

### Step 4: Setup Frontend

Open NEW PowerShell window:

```powershell
cd D:\ogero.lk_try\orego-hospital-system\fronteend

# Install dependencies
npm install

# Start frontend
npm start
```

Frontend should open automatically at: **http://localhost:3000**

---

## 🎯 SYSTEM ARCHITECTURE:

```
orego-hospital-system/
├── backend/                    ✅ COMPLETE
│   ├── app/
│   │   ├── models/            ✅ All database models
│   │   ├── routes/            ✅ All API endpoints
│   │   ├── services/          ✅ Business logic
│   │   ├── middleware/        ✅ Auth & validation
│   │   └── utils/             ✅ Helpers
│   ├── migrations/            ✅ Database migrations
│   ├── .env                   ✅ Configuration
│   └── run.py                 ✅ Main entry point
│
└── fronteend/                  ⚠️ 70% COMPLETE
    ├── src/
    │   ├── types/             ✅ TypeScript interfaces
    │   ├── services/          ✅ API service files
    │   ├── context/           ✅ Auth context
    │   ├── pages/             ✅ Dashboard pages (basic)
    │   ├── components/        ⚠️ Need forms & lists
    │   ├── theme.ts           ✅ Material-UI theme
    │   ├── App.tsx            ✅ Main app component
    │   └── index.tsx          ✅ Entry point
    └── package.json           ✅ Dependencies
```

---

## 📝 API ENDPOINTS AVAILABLE:

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/refresh` - Refresh token
- GET `/api/auth/me` - Get current user
- POST `/api/auth/change-password` - Change password
- POST `/api/auth/request-password-reset` - Request reset
- POST `/api/auth/reset-password` - Reset password

### Users
- POST `/api/users/register` - Register new user (admin only)
- GET `/api/users` - Get all users (with filters)
- GET `/api/users/{id}` - Get user by ID
- PUT `/api/users/{id}` - Update user
- POST `/api/users/{id}/deactivate` - Deactivate user
- GET `/api/users/doctors` - Get all doctors
- GET `/api/users/nurses` - Get all nurses
- GET `/api/users/staff` - Get all staff
- GET `/api/users/patients` - Get all patients
- GET `/api/users/specialities` - Get speciality list

### Hospital
- POST `/api/hospital` - Create/update hospital
- GET `/api/hospital` - Get hospital details
- PUT `/api/hospital` - Update hospital

### Resources
- POST `/api/resources/register` - Register resource
- GET `/api/resources` - Get all resources (with filters)
- GET `/api/resources/{id}` - Get resource by ID
- PUT `/api/resources/{id}` - Update resource
- DELETE `/api/resources/{id}` - Delete resource
- GET `/api/resources/available` - Get available resources
- GET `/api/resources/beds` - Get all beds
- GET `/api/resources/operation-theatres` - Get all OTs
- GET `/api/resources/machines` - Get all machines

### Bookings
- POST `/api/bookings/create` - Create booking
- GET `/api/bookings` - Get all bookings
- GET `/api/bookings/{id}` - Get booking by ID
- POST `/api/bookings/{id}/complete` - Complete booking
- POST `/api/bookings/{id}/cancel` - Cancel booking

### Notifications
- GET `/api/notifications` - Get user notifications
- POST `/api/notifications/{id}/read` - Mark as read
- POST `/api/notifications/mark-all-read` - Mark all as read
- DELETE `/api/notifications/{id}` - Delete notification
- POST `/api/notifications/create` - Create notification (admin)
- POST `/api/notifications/broadcast` - Broadcast (admin)

### Discharges
- POST `/api/discharges/create` - Create discharge
- GET `/api/discharges` - Get all discharges
- GET `/api/discharges/{id}` - Get discharge by ID
- PUT `/api/discharges/{id}` - Update discharge
- POST `/api/discharges/{id}/approve` - Approve discharge

---

## 📋 NEXT STEPS (Follow in Order):

### Week 1: Core Features

1. **Day 1-2:** Build User Registration Form
   - File: `src/components/UserRegistrationForm.tsx`
   - See example in IMPLEMENTATION_GUIDE.md
   - Integrate into AdminDashboard

2. **Day 3-4:** Build Resource Management
   - ResourceRegistrationForm.tsx
   - ResourceList.tsx
   - Integrate into AdminDashboard

3. **Day 5-7:** Build Booking System
   - BookingForm.tsx (with multi-select for resources)
   - BookingCalendar.tsx
   - BookingList.tsx

### Week 2: Advanced Features

4. **Day 8-9:** Discharge & Notifications
   - DischargeForm.tsx
   - NotificationList.tsx
   - Integrate into all dashboards

5. **Day 10-11:** Profile & Settings
   - ProfileSettings.tsx
   - HospitalSetupForm.tsx

6. **Day 12-13:** Dashboard Statistics
   - Fetch and display counts
   - Add charts (optional)

7. **Day 14:** Testing & Polish
   - Test all features
   - Fix bugs
   - Improve UI/UX

---

## 🐛 TROUBLESHOOTING:

### Backend won't start?
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env file
- Run `flask db upgrade` to create tables

### Frontend won't start?
- Delete `node_modules` and run `npm install` again
- Check if port 3000 is available

### Login not working?
- Verify admin user was created in database
- Check backend console for errors
- Open browser console (F12) for frontend errors

### API calls failing?
- Make sure backend is running on port 5000
- Check CORS settings in backend
- Verify token is being sent in headers

---

## 💡 DEVELOPMENT TIPS:

1. **Keep both terminals open** (backend + frontend)
2. **Use browser DevTools** (F12) to debug
3. **Check backend console** for API errors
4. **Test each feature** after building it
5. **Commit to Git** after each major feature

---

## 📚 RESOURCES:

- Material-UI Documentation: https://mui.com/
- React Router: https://reactrouter.com/
- Flask Documentation: https://flask.palletsprojects.com/
- PostgreSQL Guide: https://www.postgresql.org/docs/

---

## ✅ SUCCESS CRITERIA:

Your system is complete when:
- ✅ Admin can login and register users
- ✅ Admin can setup hospital details
- ✅ Admin/Staff can register resources
- ✅ Doctor can create bookings
- ✅ System prevents booking conflicts
- ✅ Notifications appear in dashboards
- ✅ Staff can process discharges
- ✅ All users can edit their profiles
- ✅ All dashboards show relevant data

---

**You now have a solid foundation! Follow the guide, build the components, and test thoroughly. Good luck! 🚀**
