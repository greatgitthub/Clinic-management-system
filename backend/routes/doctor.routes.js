const router = require("express").Router();
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth.middleware");

router.use(protect);

// Get all doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await User.find({ role: "doctor", isActive: true }).select(
      "-password",
    );
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get doctor by id
router.get("/:id", async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id).select("-password");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
