const router = require("express").Router();
const Prescription = require("../models/Prescription");
const { protect, authorize } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/", authorize("doctor", "admin"), async (req, res) => {
  try {
    const p = await Prescription.create(req.body);
    res.status(201).json(p);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/patient/:patientId", async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patientId: req.params.patientId,
    })
      .populate("doctorId", "fullName specialization")
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
