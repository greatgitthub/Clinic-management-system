import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PaymentIcon from "@mui/icons-material/Payment";
import {
  getPatients,
  getAppointments,
  getDoctors,
  getBills,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
    <CardContent>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" fontWeight="bold" mt={1}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            bgcolor: color,
            borderRadius: "50%",
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    patients: 0,
    appointments: 0,
    doctors: 0,
    bills: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPatients(), getAppointments(), getDoctors(), getBills()])
      .then(([p, a, d, b]) => {
        setStats({
          patients: p.data.length,
          appointments: a.data.length,
          doctors: d.data.length,
          bills: b.data.length,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={1}>
        Welcome back, {user?.fullName} 👋
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={4}>
        Here is what is happening in your clinic today
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Patients"
            value={stats.patients}
            color="#e3f2fd"
            icon={<PeopleIcon sx={{ color: "#1976d2" }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Appointments"
            value={stats.appointments}
            color="#e8f5e9"
            icon={<EventIcon sx={{ color: "#388e3c" }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Doctors"
            value={stats.doctors}
            color="#fff3e0"
            icon={<LocalHospitalIcon sx={{ color: "#f57c00" }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Billing Records"
            value={stats.bills}
            color="#fce4ec"
            icon={<PaymentIcon sx={{ color: "#c62828" }} />}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
