// src/server.js

const app = require("./app");
const config = require("./config");
require("./config/db"); // Ensures database connection is tested on startup
const sequelize = require("./config/sequelize");

const port = config.PORT || 3000;

// sequelize
// 	.sync({
// 		// IMPORTANT: use 'alter: true' for development to add missing columns without dropping data.
// 		// NEVER use 'force: true' unless you want to lose ALL data in the tables!
// 		alter: true,
// 	})
// 	.then(() => {
// 		console.log("Database schema synchronized successfully.");

// 		// Start the server ONLY after the database is ready
// 		app.listen(port, () => {
// 			console.log(`Server running on port ${port} in ${config.NODE_ENV} mode.`);
// 		});
// 	})
// 	.catch((err) => {
// 		console.error("Could not synchronize database:", err);
// 		process.exit(1);
// 	});

// Start the server
const server = app.listen(port, () => {
	console.log(`🚀 Server running on port ${port} in ${config.NODE_ENV} mode.`);
	console.log(`API URL: http://localhost:${port}${config.API_BASE_URL}`);
});

// Handle unhandled rejections (e.g., failed promise outside of Express)
process.on("unhandledRejection", (err) => {
	console.error("UNHANDLED REJECTION! 💥 Shutting down...");
	console.error(err.name, err.message);
	server.close(() => {
		process.exit(1); // Exit with failure code
	});
});
