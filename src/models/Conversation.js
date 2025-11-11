// src/models/Conversation.js

const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const query = async (sql, values) => {
	const [rows] = await db.query(sql, values);
	return rows;
};

const ConversationModel = {
	/**
	 * Finds all conversations (threads) for a specific user's inbox.
	 * Orders by the last message time for the dashboard view.
	 */
	findUserInbox: async (userId) => {
		const sql = `
            SELECT id, subject, last_message_at, is_archived 
            FROM conversations 
            WHERE user_id = ? 
            ORDER BY last_message_at DESC
        `;
		return query(sql, [userId]);
	},

	/**
	 * Creates a new conversation thread.
	 */
	create: async ({ userId, subject }) => {
		const id = uuidv4();
		const sql =
			"INSERT INTO conversations (id, user_id, subject) VALUES (?, ?, ?)";
		const values = [id, userId, subject];
		await query(sql, values);
		return id;
	},
};

module.exports = ConversationModel;
