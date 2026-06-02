import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

// Patients
export const getPatients = () => API.get("/patients");
export const getPatient = (id) => API.get(`/patients/${id}`);
export const createPatient = (data) => API.post("/patients", data);
export const updatePatient = (id, data) => API.put(`/patients/${id}`, data);
export const deletePatient = (id) => API.delete(`/patients/${id}`);

// Doctors
export const getDoctors = () => API.get("/doctors");
export const getDoctor = (id) => API.get(`/doctors/${id}`);

// Appointments
export const getAppointments = () => API.get("/appointments");
export const createAppointment = (data) => API.post("/appointments", data);
export const updateAppointment = (id, data) =>
  API.put(`/appointments/${id}`, data);
export const deleteAppointment = (id) => API.delete(`/appointments/${id}`);

// Billing
export const getBills = () => API.get("/billing");
export const createBill = (data) => API.post("/billing", data);
export const payBill = (id, data) => API.put(`/billing/${id}/pay`, data);

// Prescriptions
export const getPrescriptionsByPatient = (patientId) =>
  API.get(`/prescriptions/patient/${patientId}`);
export const createPrescription = (data) => API.post("/prescriptions", data);
// AI Service
export const predictDisease = (data) =>
  axios.post('http://localhost:5001/predict', data);

export const getAnalytics = () =>
  axios.get('http://localhost:5001/analytics');