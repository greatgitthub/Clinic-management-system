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
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getPatients,
  getDoctors,
} from "../../services/api";

const STATUS_COLORS = {
  pending: "warning",
  confirmed: "info",
  completed: "success",
  cancelled: "error",
};

const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchAll = async () => {
    try {
      const [appts, pts, drs] = await Promise.all([
        getAppointments(),
        getPatients(),
        getDoctors(),
      ]);
      setAppointments(appts.data);
      setFiltered(appts.data);
      setPatients(pts.data);
      setDoctors(drs.data);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      appointments.filter(
        (a) =>
          a.patientId?.fullName?.toLowerCase().includes(q) ||
          a.doctorId?.fullName?.toLowerCase().includes(q) ||
          a.reason?.toLowerCase().includes(q),
      ),
    );
  }, [search, appointments]);

  const openAdd = () => {
    setEditMode(false);
    reset({
      patientId: "",
      doctorId: "",
      date: "",
      timeSlot: "",
      reason: "",
      status: "pending",
      notes: "",
    });
    setOpenForm(true);
  };

  const openEdit = (appt) => {
    setEditMode(true);
    setSelected(appt);
    reset({
      patientId: appt.patientId?._id || "",
      doctorId: appt.doctorId?._id || "",
      date: appt.date?.split("T")[0],
      timeSlot: appt.timeSlot,
      reason: appt.reason,
      status: appt.status,
      notes: appt.notes || "",
    });
    setOpenForm(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editMode) {
        await updateAppointment(selected._id, data);
        toast.success("Appointment updated");
      } else {
        await createAppointment(data);
        toast.success("Appointment booked");
      }
      setOpenForm(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await deleteAppointment(id);
      toast.success("Appointment deleted");
      fetchAll();
    } catch {
      toast.error("Failed to delete");
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
            Appointments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {appointments.length} total appointments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAdd}
          sx={{ borderRadius: 2 }}
        >
          Book Appointment
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by patient, doctor or reason..."
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
                  <b>Patient</b>
                </TableCell>
                <TableCell>
                  <b>Doctor</b>
                </TableCell>
                <TableCell>
                  <b>Date</b>
                </TableCell>
                <TableCell>
                  <b>Time</b>
                </TableCell>
                <TableCell>
                  <b>Reason</b>
                </TableCell>
                <TableCell>
                  <b>Status</b>
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
                    No appointments found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((appt) => (
                  <TableRow key={appt._id} hover>
                    <TableCell>
                      <Typography fontWeight="500">
                        {appt.patientId?.fullName || "Unknown"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography>
                        {appt.doctorId?.fullName || "Unknown"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {appt.doctorId?.specialization}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {new Date(appt.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{appt.timeSlot}</TableCell>
                    <TableCell>{appt.reason}</TableCell>
                    <TableCell>
                      <Chip
                        label={appt.status}
                        color={STATUS_COLORS[appt.status]}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => openEdit(appt)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(appt._id)}
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
          {editMode ? "Edit Appointment" : "Book New Appointment"}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{ display: "grid", gap: 2, mt: 1 }}>
              <TextField
                fullWidth
                select
                label="Patient"
                defaultValue=""
                {...register("patientId", { required: "Required" })}
                error={!!errors.patientId}
                helperText={errors.patientId?.message}
              >
                {patients.map((p) => (
                  <MenuItem key={p._id} value={p._id}>
                    {p.fullName}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                select
                label="Doctor"
                defaultValue=""
                {...register("doctorId", { required: "Required" })}
                error={!!errors.doctorId}
                helperText={errors.doctorId?.message}
              >
                {doctors.map((d) => (
                  <MenuItem key={d._id} value={d._id}>
                    {d.fullName} — {d.specialization}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...register("date", { required: "Required" })}
                error={!!errors.date}
                helperText={errors.date?.message}
              />

              <TextField
                fullWidth
                select
                label="Time Slot"
                defaultValue=""
                {...register("timeSlot", { required: "Required" })}
                error={!!errors.timeSlot}
                helperText={errors.timeSlot?.message}
              >
                {TIME_SLOTS.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Reason for Visit"
                {...register("reason", { required: "Required" })}
                error={!!errors.reason}
                helperText={errors.reason?.message}
              />

              {editMode && (
                <TextField
                  fullWidth
                  select
                  label="Status"
                  defaultValue="pending"
                  {...register("status")}
                >
                  {["pending", "confirmed", "completed", "cancelled"].map(
                    (s) => (
                      <MenuItem
                        key={s}
                        value={s}
                        sx={{ textTransform: "capitalize" }}
                      >
                        {s}
                      </MenuItem>
                    ),
                  )}
                </TextField>
              )}

              <TextField
                fullWidth
                label="Notes (optional)"
                multiline
                rows={3}
                {...register("notes")}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editMode ? "Update" : "Book Appointment"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
