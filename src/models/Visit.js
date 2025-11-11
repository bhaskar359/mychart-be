// src/models/Visit.js

const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const query = async (sql, values) => {
	const [rows] = await db.query(sql, values);
	return rows;
};

const VisitModel = {
	/**
	 * Gets all past visits for a specific user.
	 */
	findUserVisits: async (userId) => {
		const sql = `
            SELECT 
                v.id, v.visit_date, v.visit_type, v.visit_summary,
                p.first_name AS physician_first_name, 
                p.last_name AS physician_last_name, 
                p.credentials
            FROM visits v
            JOIN physicians p ON v.physician_id = p.id
            WHERE v.user_id = ?
            ORDER BY v.visit_date DESC
        `;
		return query(sql, [userId]);
	},

	/**
	 * Gets details for a single visit.
	 */
	findById: async (visitId) => {
		const sql = "SELECT * FROM visits WHERE id = ?";
		const rows = await query(sql, [visitId]);
		return rows[0] || null;
	},

	/**
	 * Creates a new visit record (e.g., after an appointment is completed).
	 */
	create: async ({ userId, physicianId, date, type, summary }) => {
		const id = uuidv4();
		const sql = `
            INSERT INTO visits 
            (id, user_id, physician_id, visit_date, visit_type, visit_summary)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
		const values = [id, userId, physicianId, date, type, summary];
		await query(sql, values);
		return id;
	},
};

module.exports = VisitModel;
