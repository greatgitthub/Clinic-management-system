const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["admin", "doctor", "receptionist"],
      required: true,
    },
    specialization: { type: String },
    phone: { type: String },
    workingDays: [{ type: String }],
    workingHours: {
      from: { type: String },
      to: { type: String },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// No pre save hook at all — password hashed in controller instead
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
