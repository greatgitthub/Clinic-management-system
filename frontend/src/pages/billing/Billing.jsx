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
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PaymentIcon from "@mui/icons-material/Payment";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  getBills,
  createBill,
  payBill,
  getPatients,
  getAppointments,
} from "../../services/api";

const STATUS_COLORS = {
  unpaid: "error",
  paid: "success",
  partial: "warning",
};

export default function Billing() {
  const [bills, setBills] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [openPay, setOpenPay] = useState(false);
  const [selected, setSelected] = useState(null);
  const [items, setItems] = useState([{ description: "", amount: "" }]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { register: regPay, handleSubmit: handlePay } = useForm();

  const fetchAll = async () => {
    try {
      const [b, p, a] = await Promise.all([
        getBills(),
        getPatients(),
        getAppointments(),
      ]);
      setBills(b.data);
      setFiltered(b.data);
      setPatients(p.data);
      setAppointments(a.data);
    } catch {
      toast.error("Failed to load billing data");
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
      bills.filter(
        (b) =>
          b.patientId?.fullName?.toLowerCase().includes(q) ||
          b.status?.toLowerCase().includes(q),
      ),
    );
  }, [search, bills]);

  const addItem = () => setItems([...items, { description: "", amount: "" }]);

  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    setItems(updated);
  };

  const totalAmount = items.reduce(
    (sum, i) => sum + (parseFloat(i.amount) || 0),
    0,
  );

  const openAddForm = () => {
    reset({ patientId: "", appointmentId: "" });
    setItems([{ description: "Consultation Fee", amount: "100" }]);
    setOpenForm(true);
  };

  const onSubmit = async (data) => {
    const validItems = items.filter((i) => i.description && i.amount);
    if (validItems.length === 0) {
      toast.error("Add at least one billing item");
      return;
    }
    try {
      await createBill({
        patientId: data.patientId,
        appointmentId: data.appointmentId,
        items: validItems.map((i) => ({
          description: i.description,
          amount: parseFloat(i.amount),
        })),
        totalAmount: totalAmount,
      });
      toast.success("Bill created successfully");
      setOpenForm(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create bill");
    }
  };

  const onPay = async (data) => {
    try {
      await payBill(selected._id, { paymentMethod: data.paymentMethod });
      toast.success("Payment recorded successfully");
      setOpenPay(false);
      fetchAll();
    } catch {
      toast.error("Failed to record payment");
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
            Billing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {bills.length} total bills — Total collected: $
            {bills
              .filter((b) => b.status === "paid")
              .reduce((s, b) => s + b.totalAmount, 0)
              .toFixed(2)}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAddForm}
          sx={{ borderRadius: 2 }}
        >
          Create Bill
        </Button>
      </Box>

      {/* Search */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search by patient name or status..."
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
                  <b>Items</b>
                </TableCell>
                <TableCell>
                  <b>Total Amount</b>
                </TableCell>
                <TableCell>
                  <b>Status</b>
                </TableCell>
                <TableCell>
                  <b>Payment Method</b>
                </TableCell>
                <TableCell>
                  <b>Date</b>
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
                    No bills found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((bill) => (
                  <TableRow key={bill._id} hover>
                    <TableCell>
                      <Typography fontWeight="500">
                        {bill.patientId?.fullName || "Unknown"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {(bill.items || []).map((item, i) => (
                        <Typography key={i} variant="caption" display="block">
                          {item.description}: ${item.amount}
                        </Typography>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight="bold" color="primary">
                        ${bill.totalAmount?.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={bill.status}
                        color={STATUS_COLORS[bill.status]}
                        size="small"
                        sx={{ textTransform: "capitalize" }}
                      />
                    </TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {bill.paymentMethod || "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(bill.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {bill.status !== "paid" && (
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => {
                            setSelected(bill);
                            setOpenPay(true);
                          }}
                        >
                          <PaymentIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton size="small" color="error">
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

      {/* Create Bill Dialog */}
      <Dialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Bill</DialogTitle>
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
                label="Appointment"
                defaultValue=""
                {...register("appointmentId", { required: "Required" })}
                error={!!errors.appointmentId}
                helperText={errors.appointmentId?.message}
              >
                {appointments.map((a) => (
                  <MenuItem key={a._id} value={a._id}>
                    {a.patientId?.fullName} —{" "}
                    {new Date(a.date).toLocaleDateString()} {a.timeSlot}
                  </MenuItem>
                ))}
              </TextField>

              {/* Billing Items */}
              <Typography fontWeight="bold">Billing Items</Typography>
              {items.map((item, i) => (
                <Box
                  key={i}
                  sx={{ display: "flex", gap: 1, alignItems: "center" }}
                >
                  <TextField
                    label="Description"
                    size="small"
                    sx={{ flex: 2 }}
                    value={item.description}
                    onChange={(e) =>
                      updateItem(i, "description", e.target.value)
                    }
                  />
                  <TextField
                    label="Amount $"
                    size="small"
                    type="number"
                    sx={{ flex: 1 }}
                    value={item.amount}
                    onChange={(e) => updateItem(i, "amount", e.target.value)}
                  />
                  {items.length > 1 && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeItem(i)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ))}

              <Button variant="outlined" size="small" onClick={addItem}>
                + Add Item
              </Button>

              <Box sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: 2 }}>
                <Typography fontWeight="bold">
                  Total: ${totalAmount.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenForm(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create Bill
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Pay Dialog */}
      <Dialog
        open={openPay}
        onClose={() => setOpenPay(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Record Payment</DialogTitle>
        <form onSubmit={handlePay(onPay)}>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Typography>
                Patient: <b>{selected?.patientId?.fullName}</b>
              </Typography>
              <Typography>
                Amount: <b>${selected?.totalAmount?.toFixed(2)}</b>
              </Typography>
            </Box>
            <TextField
              fullWidth
              select
              label="Payment Method"
              defaultValue=""
              {...regPay("paymentMethod", { required: "Required" })}
            >
              {["cash", "card", "insurance"].map((m) => (
                <MenuItem
                  key={m}
                  value={m}
                  sx={{ textTransform: "capitalize" }}
                >
                  {m}
                </MenuItem>
              ))}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenPay(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="success">
              Confirm Payment
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
