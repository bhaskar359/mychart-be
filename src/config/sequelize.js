// src/config/sequelize.js

const { Sequelize } = require("sequelize");
const config = require("./index"); // ⬅️ Imports your environment variables object

// Create the Sequelize instance
const sequelize = new Sequelize(
	config.DB_NAME, // Database name
	config.DB_USER, // User
	config.DB_PASSWORD, // Password
	{
		host: config.DB_HOST,
		port: config.DB_PORT,
		dialect: "mysql", // Specify the dialect
		logging: false, // Set to true to see SQL queries
		define: {
			// Ensures columns like createdAt/updatedAt use snake_case in the DB
			timestamps: true,
			underscored: true,
		},
		pool: {
			max: 10,
			min: 0,
			acquire: 30000,
			idle: 10000,
		},
	}
);

// Test the Sequelize connection
sequelize
	.authenticate()
	.then(() => {
		console.log(`✅ Sequelize connected successfully to ${config.DB_NAME}`);
	})
	.catch((err) => {
		console.error(
			"❌ Sequelize connection failed. Check DB_HOST, DB_USER, etc.:",
			err.message
		);
		// You might want to exit the process here if the DB is critical
	});

// Export the initialized Sequelize INSTANCE, which contains the .define() method
module.exports = sequelize;
