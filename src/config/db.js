// src/config/db.js

const mysql = require("mysql2/promise");
const config = require("./index"); // Imports environment variables

// Create a connection pool for efficient database handling
const pool = mysql.createPool({
	host: config.DB_HOST,
	user: config.DB_USER,
	password: config.DB_PASSWORD,
	database: config.DB_NAME,
	port: config.DB_PORT,
	waitForConnections: true,
	connectionLimit: 10, // Max number of concurrent connections
	queueLimit: 0,
});

// Test the connection when the application starts
pool
	.getConnection()
	.then((connection) => {
		console.log(
			`✅ Database connected successfully to ${config.DB_NAME} at ${config.DB_HOST}`
		);
		connection.release();
	})
	.catch((err) => {
		console.error("❌ Database connection failed:", err.message);
		// Exit the process if the database connection fails on startup
		process.exit(1);
	});

module.exports = pool;
