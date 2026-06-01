const mongoose = require("mongoose");

const aiPredictionSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    symptoms: [{ type: String }],
    predictedDisease: { type: String },
    confidence: { type: Number, min: 0, max: 1 },
    riskLevel: { type: String, enum: ["low", "medium", "critical"] },
    suggestedDrugs: [{ type: String }],
    modelVersion: { type: String, default: "1.0" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AIPrediction", aiPredictionSchema);
