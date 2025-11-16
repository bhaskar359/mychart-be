// src/models/Medication.js

const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const query = async (sql, values) => {
	const [rows] = await db.query(sql, values);
	return rows;
};

const MedicationModel = {
	/**
	 * Finds all active medications for a specific user.
	 */
	findUserMedications: async (userId) => {
		const sql =
			"SELECT me.id, me.user_id, me.status, me.physician_id, me.medication_name, me.dosage_strength, me.form_route, me.prescription_date, me.instructions, me.pharmacy_name, me.pharmacy_phone, p.first_name AS physician_first_name, p.last_name AS physician_last_name, me.refill_details as refill_details FROM medications me JOIN physicians p ON me.physician_id = p.id WHERE me.user_id = ? ORDER BY prescription_date DESC";
		return query(sql, [userId]);
	},

	/**
	 * Gets details for a single medication by ID.
	 */
	findById: async (medicationId) => {
		const sql = "SELECT * FROM medications WHERE id = ?";
		const rows = await query(sql, [medicationId]);
		return rows[0] || null;
	},

	/**
	 * Creates a new medication record.
	 */
	create: async ({ userId, name, dosage, refillDate, instructions }) => {
		const id = uuidv4();
		const sql = `
            INSERT INTO medications 
            (id, user_id, name, dosage, refill_date, instructions)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
		const values = [id, userId, name, dosage, refillDate, instructions];
		await query(sql, values);
		return id;
	},

	/**
	 * Updates the refill date and instructions for an existing medication.
	 */
	update: async (id, { dosage, refillDate, instructions }) => {
		const sql = `
            UPDATE medications SET 
            dosage = ?, refill_date = ?, instructions = ?
            WHERE id = ?
        `;
		const values = [dosage, refillDate, instructions, id];
		const [result] = await db.query(sql, values);
		return result.affectedRows > 0;
	},
};

module.exports = MedicationModel;
