import React, { useEffect, useState } from "react";

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from "@mui/material";
import Plot from "react-plotly.js";
import { getPatients, getAppointments, getBills } from "../../services/api";
import { toast } from "react-toastify";

export default function Analytics() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPatients(), getAppointments(), getBills()])
      .then(([p, a, b]) => {
        setPatients(p.data);
        setAppointments(a.data);
        setBills(b.data);
      })
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  // --- Chart 1: Appointment Status Distribution ---
  const statusCounts = appointments.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});

  // --- Chart 2: Patient Gender Distribution ---
  const genderCounts = patients.reduce((acc, p) => {
    acc[p.gender] = (acc[p.gender] || 0) + 1;
    return acc;
  }, {});

  // --- Chart 3: Blood Type Distribution ---
  const bloodCounts = patients.reduce((acc, p) => {
    if (p.bloodType) acc[p.bloodType] = (acc[p.bloodType] || 0) + 1;
    return acc;
  }, {});

  // --- Chart 4: Monthly Patients Registered ---
  const monthlyMap = patients.reduce((acc, p) => {
    const month = new Date(p.createdAt).toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  // --- Chart 5: Billing Status ---
  const billStatusCounts = bills.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1;
    return acc;
  }, {});

  // --- Chart 6: Top Chronic Diseases ---
  const diseaseCounts = patients.reduce((acc, p) => {
    (p.chronicDiseases || []).forEach((d) => {
      acc[d] = (acc[d] || 0) + 1;
    });
    return acc;
  }, {});

  const chartConfig = { displayModeBar: false };

  const chartLayout = (title) => ({
    title: { text: title, font: { size: 14 } },
    margin: { t: 40, b: 40, l: 40, r: 40 },
    paper_bgcolor: "transparent",
    plot_bgcolor: "transparent",
    font: { family: "Roboto, sans-serif" },
    height: 280,
  });

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          📊 Analytics Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time visual insights from your clinic data
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Chart 1 — Appointment Status */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Plot
                data={[
                  {
                    type: "pie",
                    labels: Object.keys(statusCounts),
                    values: Object.values(statusCounts),
                    hole: 0.4,
                    marker: {
                      colors: ["#ff9800", "#2196f3", "#4caf50", "#f44336"],
                    },
                  },
                ]}
                layout={chartLayout("Appointment Status")}
                config={chartConfig}
                style={{ width: "100%" }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 2 — Gender Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Plot
                data={[
                  {
                    type: "bar",
                    x: Object.keys(genderCounts),
                    y: Object.values(genderCounts),
                    marker: { color: ["#1976d2", "#e91e63", "#9c27b0"] },
                  },
                ]}
                layout={{
                  ...chartLayout("Patient Gender Distribution"),
                  xaxis: { title: "Gender" },
                  yaxis: { title: "Count" },
                }}
                config={chartConfig}
                style={{ width: "100%" }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 3 — Blood Type */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Plot
                data={[
                  {
                    type: "pie",
                    labels: Object.keys(bloodCounts),
                    values: Object.values(bloodCounts),
                    marker: {
                      colors: [
                        "#ef5350",
                        "#e53935",
                        "#c62828",
                        "#b71c1c",
                        "#ff5722",
                        "#ff7043",
                        "#ff8a65",
                        "#ffccbc",
                      ],
                    },
                  },
                ]}
                layout={chartLayout("Blood Type Distribution")}
                config={chartConfig}
                style={{ width: "100%" }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 4 — Monthly Registrations */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Plot
                data={[
                  {
                    type: "scatter",
                    mode: "lines+markers",
                    x: Object.keys(monthlyMap),
                    y: Object.values(monthlyMap),
                    line: { color: "#1976d2", width: 3 },
                    marker: { color: "#1976d2", size: 8 },
                  },
                ]}
                layout={{
                  ...chartLayout("Monthly Patient Registrations"),
                  xaxis: { title: "Month" },
                  yaxis: { title: "Patients" },
                }}
                config={chartConfig}
                style={{ width: "100%" }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 5 — Billing Status */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Plot
                data={[
                  {
                    type: "pie",
                    labels: Object.keys(billStatusCounts),
                    values: Object.values(billStatusCounts),
                    hole: 0.4,
                    marker: { colors: ["#f44336", "#4caf50", "#ff9800"] },
                  },
                ]}
                layout={chartLayout("Billing Status Overview")}
                config={chartConfig}
                style={{ width: "100%" }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Chart 6 — Chronic Diseases */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent>
              <Plot
                data={[
                  {
                    type: "bar",
                    orientation: "h",
                    x: Object.values(diseaseCounts),
                    y: Object.keys(diseaseCounts),
                    marker: { color: "#e53935" },
                  },
                ]}
                layout={{
                  ...chartLayout("Top Chronic Diseases"),
                  xaxis: { title: "Patients" },
                  margin: { t: 40, b: 40, l: 120, r: 40 },
                }}
                config={chartConfig}
                style={{ width: "100%" }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
