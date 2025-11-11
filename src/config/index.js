// src/config/index.js

require("dotenv").config();

// Export environment variables for use across the application
module.exports = {
	NODE_ENV: process.env.NODE_ENV || "development",
	PORT: process.env.PORT || 3000,
	API_BASE_URL: process.env.API_BASE_URL || "/api/v1",

	// Database
	DB_HOST: process.env.DB_HOST,
	DB_USER: process.env.DB_USER,
	DB_PASSWORD: process.env.DB_PASSWORD,
	DB_NAME: process.env.DB_NAME,
	DB_PORT: process.env.DB_PORT,

	// JWT
	JWT_SECRET: process.env.JWT_SECRET,
	JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
	JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRES_IN,
};
