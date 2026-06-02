import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../../services/api";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["male", "female", "other"];

const emptyForm = {
  fullName: "",
  dateOfBirth: "",
  gender: "",
  bloodType: "",
  phone: "",
  email: "",
  allergies: "",
  chronicDiseases: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
};

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchPatients = async () => {
    try {
      const res = await getPatients();
      setPatients(res.data);
      setFiltered(res.data);
    } catch {
      toast.error("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      patients.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          (p.email || "").toLowerCase().includes(q),
      ),
    );
  }, [search, patients]);

  const openAdd = () => {
    setEditMode(false);
    reset(emptyForm);
    setOpenForm(true);
  };

  const openEdit = (patient) => {
    setEditMode(true);
    setSelected(patient);
    reset({
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth?.split("T")[0],
      gender: patient.gender,
      bloodType: patient.bloodType || "",
      phone: patient.phone,
      email: patient.email || "",
      allergies: (patient.allergies || []).join(", "),
      chronicDiseases: (patient.chronicDiseases || []).join(", "),
      emergencyContactName: patient.emergencyContact?.name || "",
      emergencyContactPhone: patient.emergencyContact?.phone || "",
    });
    setOpenForm(true);
  };

  const openViewDialog = (patient) => {
    setSelected(patient);
    setOpenView(true);
  };

  const onSubmit = async (data) => {
    const payload = {
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      bloodType: data.bloodType,
      phone: data.phone,
      email: data.email,
      allergies: data.allergies
        ? data.allergies.split(",").map((s) => s.trim())
        : [],
      chronicDiseases: data.chronicDiseases
        ? data.chronicDiseases.split(",").map((s) => s.trim())
        : [],
      emergencyContact: {
        name: data.emergencyContactName,
        phone: data.emergencyContactPhone,
      },
    };
    try {
      if (editMode) {
        await updatePatient(selected._id, payload);
        toast.success("Patient updated successfully");
      } else {
        await createPatient(payload);
        toast.success("Patient added successfully");
      }
      setOpenForm(false);
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?"))
      return;
    try {
      await deletePatient(id);
      toast.success("Patient deleted");
      fetchPatients();
    } catch {
      toast.error("Failed to delete patient");
    }
  };

  const getAge = (dob) => {
    if (!dob) return "-";
    return Math.floor(
      (new Date() - new Date(dob)) / (365.25 * 24 * 60 * 60 * 1000),
    );
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
            Patients
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {patients.length} total patients registered
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAdd}
          sx={{ borderRadius: 2 }}
        >
          Add Patient
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by name, phone or email..."
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

      {/* Table */}
      <Card sx={{ borderRadius: 3 }}>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f5f5f5" }}>
                <TableCell>
                  <b>Name</b>
                </TableCell>
                <TableCell>
                  <b>Age</b>
                </TableCell>
                <TableCell>
                  <b>Gender</b>
                </TableCell>
                <TableCell>
                  <b>Blood Type</b>
                </TableCell>
                <TableCell>
                  <b>Phone</b>
                </TableCell>
                <TableCell>
                  <b>Chronic Diseases</b>
                </TableCell>
                <TableCell>
                  <b>Actions</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ py: 4, color: "text.secondary" }}
                  >
                    No patients found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((patient) => (
                  <TableRow key={patient._id} hover>
                    <TableCell>
                      <Typography fontWeight="500">
                        {patient.fullName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {patient.email}
                      </Typography>
                    </TableCell>
                    <TableCell>{getAge(patient.dateOfBirth)} yrs</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {patient.gender}
                    </TableCell>
                    <TableCell>
                      {patient.bloodType && (
                        <Chip
                          label={patient.bloodType}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>
                      {(patient.chronicDiseases || []).map((d, i) => (
                        <Chip
                          key={i}
                          label={d}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={() => openViewDialog(patient)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => openEdit(patient)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(patient._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editMode ? "Edit Patient" : "Add New Patient"}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{ display: "grid", gap: 2 }}>
              <TextField
                fullWidth
                label="Full Name"
                {...register("fullName", { required: "Required" })}
                error={!!errors.fullName}
                helperText={errors.fullName?.message}
              />

              <TextField
                fullWidth
                label="Date of Birth"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...register("dateOfBirth", { required: "Required" })}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth?.message}
              />

              <TextField
                fullWidth
                select
                label="Gender"
                defaultValue=""
                {...register("gender", { required: "Required" })}
                error={!!errors.gender}
                helperText={errors.gender?.message}
              >
                {GENDERS.map((g) => (
                  <MenuItem
                    key={g}
                    value={g}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {g}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Blood Type"
                defaultValue=""
                {...register("bloodType")}
              >
                {BLOOD_TYPES.map((b) => (
                  <MenuItem key={b} value={b}>
                    {b}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Phone"
                {...register("phone", { required: "Required" })}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                {...register("email")}
              />

              <TextField
                fullWidth
                label="Allergies (comma separated)"
                {...register("allergies")}
                placeholder="Penicillin, Aspirin"
              />

              <TextField
                fullWidth
                label="Chronic Diseases (comma separated)"
                {...register("chronicDiseases")}
                placeholder="Diabetes, Hypertension"
              />

              <TextField
                fullWidth
                label="Emergency Contact Name"
                {...register("emergencyContactName")}
              />

              <TextField
                fullWidth
                label="Emergency Contact Phone"
                {...register("emergencyContactPhone")}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editMode ? "Update" : "Add Patient"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Patient Dialog */}
      <Dialog
        open={openView}
        onClose={() => setOpenView(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Patient Details</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
              {[
                ["Full Name", selected.fullName],
                ["Date of Birth", selected.dateOfBirth?.split("T")[0]],
                ["Gender", selected.gender],
                ["Blood Type", selected.bloodType],
                ["Phone", selected.phone],
                ["Email", selected.email],
                ["Allergies", (selected.allergies || []).join(", ") || "None"],
                [
                  "Chronic Diseases",
                  (selected.chronicDiseases || []).join(", ") || "None",
                ],
                [
                  "Emergency Contact",
                  selected.emergencyContact?.name
                    ? `${selected.emergencyContact.name} — ${selected.emergencyContact.phone}`
                    : "Not provided",
                ],
              ].map(([label, value]) => (
                <Box key={label} sx={{ display: "flex", gap: 2 }}>
                  <Typography fontWeight="bold" sx={{ minWidth: 160 }}>
                    {label}:
                  </Typography>
                  <Typography
                    color="text.secondary"
                    sx={{ textTransform: "capitalize" }}
                  >
                    {value || "-"}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => {
              setOpenView(false);
              openEdit(selected);
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
