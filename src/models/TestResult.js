// src/models/TestResult.js

const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const query = async (sql, values) => {
	const [rows] = await db.query(sql, values);
	return rows;
};

const TestResultModel = {
	/**
	 * Gets all test results for a specific user.
	 */
	findUserResults: async (userId) => {
		const sql = `
            SELECT 
                tr.id, tr.test_name, tr.result_date, tr.status, tr.result_details,
                p.first_name AS physician_first_name, 
                p.last_name AS physician_last_name
            FROM test_results tr
            JOIN physicians p ON tr.physician_id = p.id
            WHERE tr.user_id = ?
            ORDER BY tr.result_date DESC
        `;
		return query(sql, [userId]);
	},

	/**
	 * Gets details for a single test result.
	 */
	findById: async (resultId) => {
		const sql = "SELECT * FROM test_results WHERE id = ?";
		const rows = await query(sql, [resultId]);
		return rows[0] || null;
	},

	/**
	 * Creates a new test result record.
	 */
	create: async ({ userId, physicianId, name, date, status, details }) => {
		const id = uuidv4();
		const sql = `
            INSERT INTO test_results 
            (id, user_id, physician_id, test_name, result_date, status, result_details)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
		const values = [id, userId, physicianId, name, date, status, details];
		await query(sql, values);
		return id;
	},
};

module.exports = TestResultModel;
