const express = require("express");
const appointmentsService = require("./appointments.service"); // Direct service import
const { protect } = require("../../middleware/auth");
const catchAsync = require("../../utils/catchAsync"); // Utility for handling async errors
const ApiError = require("../../utils/ApiError"); // Custom error class

const router = express.Router();

// --- Route Handlers (Controller Logic Embedded) ---

// Handler for GET /api/v1/appointments
const getAllAppointments = catchAsync(async (req, res, next) => {
	// 1. Get User ID from authentication middleware
	const userId = req.user.id;

	if (!userId) {
		// This should theoretically be caught by protect middleware, but is a safe guard.
		return next(new ApiError("Authentication error: User ID not found.", 401));
	}

	const appointments = await appointmentsService.fetchUserAppointments(userId);

	res.status(200).json({
		status: "success",
		results: appointments.length,
		data: {
			appointments,
		},
	});
});

// Handler for POST /api/v1/appointments
const createAppointment = catchAsync(async (req, res, next) => {
	// 1. Get User ID and request body
	if (!req.user) {
		return next(new ApiError(401, "You are not logged in!"));
	}
	const body = req.body;
	const userId = req.user.id;
	// 2. Inject the mandatory user_id into the payload before sending to service
	const payload = {
		...body,
		user_id: userId,
	};

	// 3. Call the service to validate, generate UUID, and save
	const newAppointmentId = await appointmentsService.createAppointment(payload);

	res.status(201).json({
		status: "success",
		message: "Appointment scheduled successfully.",
		data: {
			id: newAppointmentId,
		},
	});
});

// --- Route Definition ---

// Apply protection middleware to all appointment routes
router.use(protect);

// 1. Route to get all appointments (scheduled and completed visits) for the logged-in user
// GET /api/v1/appointments
router.get("/fetch-all", getAllAppointments);

// 2. Route to create a new appointment
// POST /api/v1/appointments
router.post("/create", createAppointment);

module.exports = router;
