const router = require("express").Router();
const Billing = require("../models/Billing");
const { protect, authorize } = require("../middleware/auth.middleware");

router.use(protect);

router.post("/", authorize("admin", "receptionist"), async (req, res) => {
  try {
    const bill = await Billing.create(req.body);
    res.status(201).json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/", authorize("admin", "receptionist"), async (req, res) => {
  try {
    const bills = await Billing.find()
      .populate("patientId", "fullName")
      .sort({ createdAt: -1 });
    res.json(bills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/pay", authorize("admin", "receptionist"), async (req, res) => {
  try {
    const bill = await Billing.findByIdAndUpdate(
      req.params.id,
      {
        status: "paid",
        paymentMethod: req.body.paymentMethod,
        paidAt: new Date(),
      },
      { new: true },
    );
    res.json(bill);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
