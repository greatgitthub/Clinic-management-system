const router = require("express").Router();
const {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require("../controllers/patient.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.use(protect);

router
  .route("/")
  .get(getAllPatients)
  .post(authorize("admin", "receptionist"), createPatient);

router
  .route("/:id")
  .get(getPatientById)
  .put(authorize("admin", "receptionist"), updatePatient)
  .delete(authorize("admin"), deletePatient);

module.exports = router;
