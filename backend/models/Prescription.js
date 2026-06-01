const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    diagnosis: { type: String, required: true },
    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String }, // '500mg'
        frequency: { type: String }, // 'twice a day'
        duration: { type: String }, // '7 days'
      },
    ],
    labTests: [{ type: String }],
    notes: { type: String },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Prescription", prescriptionSchema);
