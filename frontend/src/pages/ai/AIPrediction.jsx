import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  LinearProgress,
} from "@mui/material";
import PsychologyIcon from "@mui/icons-material/Psychology";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { predictDisease } from "../../services/api";
import { toast } from "react-toastify";

const SYMPTOMS = [
  { key: "fever", label: "🌡️ Fever" },
  { key: "cough", label: "😮‍💨 Cough" },
  { key: "headache", label: "🤕 Headache" },
  { key: "fatigue", label: "😴 Fatigue" },
  { key: "nausea", label: "🤢 Nausea" },
  { key: "chest_pain", label: "💔 Chest Pain" },
  { key: "shortness_breath", label: "😮 Shortness of Breath" },
  { key: "back_pain", label: "🦴 Back Pain" },
  { key: "sore_throat", label: "🤒 Sore Throat" },
  { key: "runny_nose", label: "🤧 Runny Nose" },
];

const RISK_CONFIG = {
  low: {
    color: "success",
    icon: <CheckCircleIcon />,
    label: "Low Risk",
    bg: "#e8f5e9",
  },
  medium: {
    color: "warning",
    icon: <WarningIcon />,
    label: "Medium Risk",
    bg: "#fff3e0",
  },
  critical: {
    color: "error",
    icon: <ErrorIcon />,
    label: "Critical Risk",
    bg: "#fce4ec",
  },
};

export default function AIPrediction() {
  const [symptoms, setSymptoms] = useState({});
  const [age, setAge] = useState(30);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (key) => {
    setSymptoms((prev) => ({ ...prev, [key]: prev[key] ? 0 : 1 }));
  };

  const selectedCount = Object.values(symptoms).filter((v) => v === 1).length;

  const handlePredict = async () => {
    if (selectedCount === 0) {
      toast.warning("Please select at least one symptom");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...symptoms, age: parseInt(age) };
      const res = await predictDisease(payload);
      setResult(res.data);
      toast.success("Prediction complete!");
    } catch {
      toast.error(
        "AI service unavailable — make sure Python server is running",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSymptoms({});
    setAge(30);
    setResult(null);
  };

  const risk = result ? RISK_CONFIG[result.riskLevel] : null;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          fontWeight="bold"
          sx={{ display: "flex", alignItems: "center", gap: 1 }}
        >
          <PsychologyIcon color="primary" /> AI Disease Prediction
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select patient symptoms and age to get an AI-powered diagnosis
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Left — Symptom Selector */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={1}>
                Patient Symptoms
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {selectedCount} symptom{selectedCount !== 1 ? "s" : ""} selected
              </Typography>

              {/* Age input */}
              <TextField
                fullWidth
                label="Patient Age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                inputProps={{ min: 1, max: 120 }}
                sx={{ mb: 3 }}
              />

              {/* Symptom checkboxes */}
              <Grid container spacing={1}>
                {SYMPTOMS.map((s) => (
                  <Grid item xs={6} key={s.key}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={!!symptoms[s.key]}
                          onChange={() => toggleSymptom(s.key)}
                          color="primary"
                        />
                      }
                      label={<Typography variant="body2">{s.label}</Typography>}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Buttons */}
              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handlePredict}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "🤖 Predict Disease"
                  )}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleReset}
                  sx={{ borderRadius: 2 }}
                >
                  Reset
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right — Prediction Result */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                AI Prediction Result
              </Typography>

              {!result && !loading && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    py: 8,
                    color: "text.secondary",
                  }}
                >
                  <PsychologyIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                  <Typography>Select symptoms and click Predict</Typography>
                </Box>
              )}

              {loading && (
                <Box sx={{ py: 4 }}>
                  <Typography align="center" mb={2}>
                    Analyzing symptoms...
                  </Typography>
                  <LinearProgress />
                </Box>
              )}

              {result && !loading && (
                <Box sx={{ display: "grid", gap: 2 }}>
                  {/* Disease Name */}
                  <Alert
                    severity={risk.color}
                    icon={risk.icon}
                    sx={{ borderRadius: 2, fontSize: 16 }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {result.predictedDisease}
                    </Typography>
                  </Alert>

                  {/* Confidence */}
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        AI Confidence
                      </Typography>
                      <Typography
                        variant="body2"
                        color="primary"
                        fontWeight="bold"
                      >
                        {Math.round(result.confidence * 100)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={result.confidence * 100}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>

                  {/* Risk Level */}
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      bgcolor: risk.bg,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {risk.icon}
                    <Box>
                      <Typography fontWeight="bold">{risk.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {result.riskLevel === "critical"
                          ? "Immediate medical attention required"
                          : result.riskLevel === "medium"
                            ? "Medical consultation recommended"
                            : "Monitor symptoms and rest"}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  {/* Suggested Drugs */}
                  <Box>
                    <Typography fontWeight="bold" mb={1}>
                      💊 Suggested Medications
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {result.suggestedDrugs.map((drug, i) => (
                        <Chip
                          key={i}
                          label={drug}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Detected Symptoms */}
                  <Box>
                    <Typography fontWeight="bold" mb={1}>
                      🔍 Detected Symptoms
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {(result.symptoms || []).map((s, i) => (
                        <Chip
                          key={i}
                          label={s.replace(/_/g, " ")}
                          size="small"
                          color="error"
                          variant="outlined"
                          sx={{ textTransform: "capitalize" }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Disclaimer */}
                  <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    <Typography variant="caption">
                      ⚠️ This AI prediction is for assistance only. Always
                      consult a qualified doctor for final diagnosis.
                    </Typography>
                  </Alert>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
