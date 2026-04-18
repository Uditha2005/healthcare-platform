import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientLayout from './components/patient/PatientLayout';

// Patient
import PatientDashboard from './pages/patient/Dashboard';
import BrowseDoctors from './pages/patient/BrowseDoctors';
import BookAppointment from './pages/patient/BookAppointment';
import UploadReports from './pages/patient/UploadReports';
import VideoConsultation from './pages/patient/VideoConsultation';
import PatientProfile from './pages/patient/Profile';
import PatientAppointments from './pages/patient/MyAppointments';
import PatientMedicalRecords from './pages/patient/MedicalRecords';
import Payment from './pages/patient/Payment';

// Doctor
import DoctorDashboard from './pages/doctor/Dashboard';
import ManageAvailability from './pages/doctor/ManageAvailability';
import ViewAppointments from './pages/doctor/ViewAppointments';
import StartConsultation from './pages/doctor/StartConsultation';
import DoctorProfile from './pages/doctor/Profile';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import VerifyDoctors from './pages/admin/VerifyDoctors';
import AdminProfile from './pages/admin/Profile';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{textAlign:'center',marginTop:'50px'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientLayout><PatientDashboard /></PatientLayout></ProtectedRoute>} />
          <Route path="/patient/browse-doctors" element={<ProtectedRoute role="patient"><PatientLayout><BrowseDoctors /></PatientLayout></ProtectedRoute>} />
          <Route path="/patient/book-appointment" element={<ProtectedRoute role="patient"><PatientLayout><BookAppointment /></PatientLayout></ProtectedRoute>} />
          <Route path="/patient/payment" element={<ProtectedRoute role="patient"><PatientLayout><Payment /></PatientLayout></ProtectedRoute>} />
          <Route path="/patient/profile" element={<ProtectedRoute role="patient"><PatientLayout><PatientProfile /></PatientLayout></ProtectedRoute>} />
          <Route path="/patient/appointments" element={<ProtectedRoute role="patient"><PatientLayout><PatientAppointments /></PatientLayout></ProtectedRoute>} />
          <Route path="/patient/medical-records" element={<ProtectedRoute role="patient"><PatientLayout><PatientMedicalRecords /></PatientLayout></ProtectedRoute>} />
          <Route path="/patient/upload-reports" element={<ProtectedRoute role="patient"><PatientLayout><UploadReports /></PatientLayout></ProtectedRoute>} />
          <Route path="/patient/video-consultation" element={<ProtectedRoute role="patient"><PatientLayout><VideoConsultation /></PatientLayout></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/availability" element={<ProtectedRoute role="doctor"><ManageAvailability /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><ViewAppointments /></ProtectedRoute>} />
          <Route path="/doctor/consultation" element={<ProtectedRoute role="doctor"><StartConsultation /></ProtectedRoute>} />
          <Route path="/doctor/profile" element={<ProtectedRoute role="doctor"><DoctorProfile /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/verify-doctors" element={<ProtectedRoute role="admin"><VerifyDoctors /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute role="admin"><AdminProfile /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
};

export default App;