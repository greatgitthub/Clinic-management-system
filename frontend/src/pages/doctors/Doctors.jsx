import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getDoctors } from "../../services/api";
import { register as registerUser } from "../../services/api";

const SPECIALIZATIONS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Neurology",
  "Gynecology",
  "ENT",
  "Ophthalmology",
  "Psychiatry",
];

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchDoctors = async () => {
    try {
      const res = await getDoctors();
      setDoctors(res.data);
      setFiltered(res.data);
    } catch {
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      doctors.filter(
        (d) =>
          d.fullName.toLowerCase().includes(q) ||
          (d.specialization || "").toLowerCase().includes(q),
      ),
    );
  }, [search, doctors]);

  const onSubmit = async (data) => {
    try {
      await registerUser({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: "doctor",
        specialization: data.specialization,
        phone: data.phone,
        workingHours: { from: data.from, to: data.to },
      });
      toast.success("Doctor added successfully");
      setOpenForm(false);
      reset();
      fetchDoctors();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add doctor");
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            Doctors
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {doctors.length} doctors on staff
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            reset();
            setOpenForm(true);
          }}
          sx={{ borderRadius: 2 }}
        >
          Add Doctor
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Doctor Cards Grid */}
      <Grid container spacing={3}>
        {filtered.length === 0 ? (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
              No doctors found
            </Typography>
          </Grid>
        ) : (
          filtered.map((doctor) => (
            <Grid item xs={12} sm={6} md={4} key={doctor._id}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, height: "100%" }}>
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: "#1976d2",
                        fontSize: 22,
                      }}
                    >
                      {doctor.fullName?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography fontWeight="bold">
                        {doctor.fullName}
                      </Typography>
                      <Chip
                        label={doctor.specialization || "General"}
                        size="small"
                        color="primary"
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: "grid", gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      📧 {doctor.email}
                    </Typography>
                    {doctor.phone && (
                      <Typography variant="body2" color="text.secondary">
                        📞 {doctor.phone}
                      </Typography>
                    )}
                    {doctor.workingHours?.from && (
                      <Typography variant="body2" color="text.secondary">
                        🕐 {doctor.workingHours.from} — {doctor.workingHours.to}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 0.5,
                        flexWrap: "wrap",
                        mt: 1,
                      }}
                    >
                      {(doctor.workingDays || []).map((day) => (
                        <Chip
                          key={day}
                          label={day}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Add Doctor Dialog */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Doctor</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                label="Full Name"
                {...register("fullName", { required: "Required" })}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register("email", { required: "Required" })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                fullWidth
                label="Password"
                type="password"
                {...register("password", {
                  required: "Required",
                  minLength: { value: 6, message: "Min 6 characters" },
                })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              <TextField
                fullWidth
                select
                label="Specialization"
                defaultValue=""
                {...register("specialization", { required: "Required" })}
                error={!!errors.specialization}
                helperText={errors.specialization?.message}
              >
                {SPECIALIZATIONS.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>

              <TextField fullWidth label="Phone" {...register("phone")} />

              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <TextField
                  label="Working From"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  {...register("from")}
                />
                <TextField
                  label="Working To"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  {...register("to")}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Add Doctor
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
