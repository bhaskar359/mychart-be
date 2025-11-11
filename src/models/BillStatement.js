// src/models/BillStatement.js

const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const query = async (sql, values) => {
	const [rows] = await db.query(sql, values);
	return rows;
};

const BillStatementModel = {
	/**
	 * Finds all billing statements for a specific user.
	 */
	findUserStatements: async (userId) => {
		const sql =
			"SELECT * FROM bill_statements WHERE user_id = ? ORDER BY statement_date DESC";
		return query(sql, [userId]);
	},

	/**
	 * Finds the total outstanding balance for a user.
	 */
	findOutstandingBalance: async (userId) => {
		const sql = `
            SELECT SUM(patient_responsibility) AS total_due 
            FROM bill_statements 
            WHERE user_id = ? AND status = 'Outstanding'
        `;
		const rows = await query(sql, [userId]);
		return rows[0].total_due || 0;
	},

	/**
	 * Updates the status of a bill to 'Paid'.
	 * NOTE: A payment service would handle the complex logic here.
	 */
	markAsPaid: async (billId) => {
		const sql =
			"UPDATE bill_statements SET status = ?, patient_responsibility = 0.00 WHERE id = ?";
		const [result] = await db.query(sql, ["Paid", billId]);
		return result.affectedRows > 0;
	},
};

module.exports = BillStatementModel;
