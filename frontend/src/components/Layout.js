import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Avatar,
  Divider,
  ListItemButton,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import EventIcon from "@mui/icons-material/Event";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PaymentIcon from "@mui/icons-material/Payment";
import LogoutIcon from "@mui/icons-material/Logout";
import { useAuth } from "../context/AuthContext";
import PsychologyIcon from "@mui/icons-material/Psychology";
import BarChartIcon from "@mui/icons-material/BarChart";


const DRAWER_WIDTH = 240;

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
  { label: "Patients", path: "/patients", icon: <PeopleIcon /> },
  { label: "Appointments", path: "/appointments", icon: <EventIcon /> },
  { label: "Doctors", path: "/doctors", icon: <LocalHospitalIcon /> },
  { label: "Billing", path: "/billing", icon: <PaymentIcon /> },
  { label: "AI Predict", path: "/ai", icon: <PsychologyIcon /> },
  { label: "Analytics", path: "/analytics", icon: <BarChartIcon /> },
];

export default function Layout() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            bgcolor: "#1976d2",
          },
        }}
      >
        <Box sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h6" fontWeight="bold" color="white">
            🏥 ClinicAI
          </Typography>
        </Box>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)" }} />

        <List sx={{ mt: 1 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                color: "white",
                "&.Mui-selected": { bgcolor: "rgba(255,255,255,0.2)" },
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              <ListItemIcon sx={{ color: "white", minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>

        <Box sx={{ mt: "auto", p: 2 }}>
          <Divider sx={{ bgcolor: "rgba(255,255,255,0.2)", mb: 2 }} />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "white",
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "rgba(255,255,255,0.3)",
                fontSize: 14,
              }}
            >
              {user?.fullName?.charAt(0)}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                {user?.fullName}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {user?.role}
              </Typography>
            </Box>
            <IconButton
              onClick={handleLogout}
              sx={{ color: "white" }}
              size="small"
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
