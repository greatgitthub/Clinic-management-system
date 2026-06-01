const mongoose = require("mongoose");
const billingSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    items: [
      {
        description: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["unpaid", "paid", "partial"],
      default: "unpaid",
    },
    paymentMethod: { type: String, enum: ["cash", "card", "insurance"] },
    paidAt: { type: Date },
  },
  { timestamps: true },
);
module.exports = mongoose.model("Billing", billingSchema);
