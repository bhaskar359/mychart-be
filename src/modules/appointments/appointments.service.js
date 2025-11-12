const { v4: uuidv4 } = require("uuid"); // Using v4 from the 'uuid' package
const appointmentsModel = require("../../models/Appointment"); // Assuming correct path to your model
const ApiError = require("../../utils/ApiError"); // Assuming your custom error class

/**
 * Fetches all appointments (scheduled and past visits) for a specific user.
 * @param {string} userId - The UUID of the authenticated user.
 * @returns {Promise<Array<object>>} A list of all patient encounters.
 */
exports.fetchUserAppointments = async (userId) => {
	if (!userId) {
		throw new ApiError("User ID is required to fetch appointments.", 400);
	}
	// Business logic: Any data filtering or transformation before sending to controller goes here.
	const appointments = await appointmentsModel.findUserAppointments(userId);
	return appointments;
};

/**
 * Creates and saves a new appointment entry in the database.
 * This function is responsible for generating the UUID.
 * @param {object} appointmentData - Data received from the request body (e.g., physician_id, appointment_date) + the injected user_id.
 * @returns {Promise<string>} The UUID of the newly created appointment.
 */
exports.createAppointment = async (appointmentData) => {
	// 1. Generate the mandatory UUID using the imported uuid package
	const newAppointmentId = uuidv4();

	// 2. Set default status and ensure mandatory fields are checked
	const payload = {
		id: newAppointmentId,
		...appointmentData,
		status: appointmentData.status || "Scheduled", // Default status for new bookings
	};

	// 3. Perform basic validation
	if (!payload.user_id || !payload.physician_id || !payload.appointment_date) {
		throw new ApiError(
			"Missing required appointment fields (user, physician, or date).",
			400
		);
	}

	// 4. Call the model layer to persist the data
	const id = await appointmentsModel.saveAppointment(payload);

	return id;
};

// You would add more complex service functions here (e.g., rescheduleAppointment, cancelAppointment)
