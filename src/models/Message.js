// src/models/Message.js

const db = require("../config/db");
const { v4: uuidv4 } = require("uuid");

const query = async (sql, values) => {
	const [rows] = await db.query(sql, values);
	return rows;
};

const MessageModel = {
	/**
	 * Finds all messages for a specific conversation ID.
	 */
	findConversationMessages: async (conversationId) => {
		const sql =
			"SELECT id, sender_id, content, sent_at, is_read FROM messages WHERE conversation_id = ? ORDER BY sent_at ASC";
		return query(sql, [conversationId]);
	},

	/**
	 * Creates a new message and updates the parent conversation's last_message_at timestamp.
	 * NOTE: In a real app, this should be done in a single transaction in the Service layer.
	 */
	create: async ({ conversationId, senderId, content }) => {
		const id = uuidv4();
		const sql =
			"INSERT INTO messages (id, conversation_id, sender_id, content) VALUES (?, ?, ?, ?)";
		const values = [id, conversationId, senderId, content];
		await query(sql, values);

		// Update the conversation's timestamp (Crucial for sorting the inbox!)
		const updateSql =
			"UPDATE conversations SET last_message_at = NOW() WHERE id = ?";
		await db.query(updateSql, [conversationId]);

		return id;
	},

	/**
	 * Marks all messages in a conversation as read.
	 */
	markAllAsRead: async (conversationId, userId) => {
		// Only mark messages sent by others as read
		const sql =
			"UPDATE messages SET is_read = TRUE WHERE conversation_id = ? AND sender_id != ? AND is_read = FALSE";
		const [result] = await db.query(sql, [conversationId, userId]);
		return result.affectedRows;
	},
};

module.exports = MessageModel;
