import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

// Patient
import PatientDashboard from './pages/patient/Dashboard';
import BrowseDoctors from './pages/patient/BrowseDoctors';
import BookAppointment from './pages/patient/BookAppointment';
import UploadReports from './pages/patient/UploadReports';
import VideoConsultation from './pages/patient/VideoConsultation';

// Doctor
import DoctorDashboard from './pages/doctor/Dashboard';
import ManageAvailability from './pages/doctor/ManageAvailability';
import ViewAppointments from './pages/doctor/ViewAppointments';
import StartConsultation from './pages/doctor/StartConsultation';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import ManageUsers from './pages/admin/ManageUsers';
import VerifyDoctors from './pages/admin/VerifyDoctors';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{textAlign:'center',marginTop:'50px'}}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/login" />;
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
          <Route path="/patient/browse-doctors" element={<ProtectedRoute role="patient"><BrowseDoctors /></ProtectedRoute>} />
          <Route path="/patient/book-appointment" element={<ProtectedRoute role="patient"><BookAppointment /></ProtectedRoute>} />
          <Route path="/patient/upload-reports" element={<ProtectedRoute role="patient"><UploadReports /></ProtectedRoute>} />
          <Route path="/patient/video-consultation" element={<ProtectedRoute role="patient"><VideoConsultation /></ProtectedRoute>} />

          {/* Doctor Routes */}
          <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/availability" element={<ProtectedRoute role="doctor"><ManageAvailability /></ProtectedRoute>} />
          <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><ViewAppointments /></ProtectedRoute>} />
          <Route path="/doctor/consultation" element={<ProtectedRoute role="doctor"><StartConsultation /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="admin"><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/verify-doctors" element={<ProtectedRoute role="admin"><VerifyDoctors /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;