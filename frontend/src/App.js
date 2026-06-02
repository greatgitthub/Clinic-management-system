import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Patients from "./pages/patients/Patients";
import Appointments from './pages/appointments/Appointments';
import Billing from "./pages/billing/Billing";
import Doctors from "./pages/doctors/Doctors";
import AIPrediction from "./pages/ai/AIPrediction";
import Analytics from "./pages/dashboard/Analytics";

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="patients" element={<Patients />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="billing" element={<Billing />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
      <Route path="ai" element={<AIPrediction />} />
      <Route path="analytics" element={<Analytics />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </BrowserRouter>
    </AuthProvider>
  );
}
