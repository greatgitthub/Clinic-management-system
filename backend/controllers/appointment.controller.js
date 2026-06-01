const Appointment = require("../models/Appointment");

exports.createAppointment = async (req, res) => {
  try {
    const conflict = await Appointment.findOne({
      doctorId: req.body.doctorId,
      date: req.body.date,
      timeSlot: req.body.timeSlot,
      status: { $ne: "cancelled" },
    });
    if (conflict)
      return res
        .status(400)
        .json({ message: "This time slot is already booked" });
    const appointment = await Appointment.create(req.body);
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "fullName phone")
      .populate("doctorId", "fullName specialization")
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate("patientId")
      .populate("doctorId");
    if (!appt)
      return res.status(404).json({ message: "Appointment not found" });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: "Appointment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
