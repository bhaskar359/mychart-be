// src/models/Appointment.js

const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const query = async (sql, values) => {
	const [rows] = await db.query(sql, values);
	return rows;
};

const AppointmentModel = {
	/**
	 * Finds all upcoming appointments for a specific user.
	 */
	findUpcomingAppointments: async (userId) => {
		const sql = `
            SELECT 
                a.id, a.appointment_time, a.reason_for_visit, a.status, a.location,
                p.first_name AS physician_first_name, 
                p.last_name AS physician_last_name
            FROM appointments a
            JOIN physicians p ON a.physician_id = p.id
            WHERE a.user_id = ? AND a.appointment_time > NOW() 
            ORDER BY a.appointment_time ASC
        `;
		return query(sql, [userId]);
	},

	/**
	 * Updates the status of an appointment (e.g., 'Canceled').
	 */
	updateStatus: async (appointmentId, status) => {
		const sql = "UPDATE appointments SET status = ? WHERE id = ?";
		const [result] = await db.query(sql, [status, appointmentId]);
		return result.affectedRows > 0;
	},
	// Creation and findById methods would follow the same pattern as other models
};

module.exports = AppointmentModel;
