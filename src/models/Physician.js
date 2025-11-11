// src/models/Physician.js

const db = require("../config/db");

const query = async (sql, values) => {
	const [rows] = await db.query(sql, values);
	return rows;
};

const PhysicianModel = {
	/**
	 * Finds a physician by their unique ID (UUID).
	 */
	findById: async (id) => {
		const sql =
			"SELECT id, first_name, last_name, credentials FROM physicians WHERE id = ?";
		const rows = await query(sql, [id]);
		return rows[0] || null;
	},

	/**
	 * Lists all physicians (for scheduling/lookup).
	 */
	findAll: async () => {
		const sql =
			"SELECT id, first_name, last_name, credentials FROM physicians ORDER BY last_name";
		return query(sql);
	},
};

module.exports = PhysicianModel;
