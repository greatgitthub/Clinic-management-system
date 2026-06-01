const router = require("express").Router();
const {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointment.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.use(protect);

router
  .route("/")
  .get(getAllAppointments)
  .post(authorize("admin", "receptionist"), createAppointment);

router
  .route("/:id")
  .get(getAppointmentById)
  .put(authorize("admin", "receptionist", "doctor"), updateAppointment)
  .delete(authorize("admin"), deleteAppointment);

module.exports = router;
