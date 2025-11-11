// src/app.js

const express = require("express");
// const morgan = require("morgan"); // Optional: for logging HTTP requests
// const helmet = require("helmet"); // Optional: for security headers
const globalErrorHandler = require("./middleware/error");
const ApiError = require("./utils/ApiError");
const config = require("./config");
const cors = require("cors");

const allowedOrigins = ["http://localhost:5173"];

const corsOptions = {
	origin: function (origin, callback) {
		// Allow requests with no origin (like mobile apps or postman)
		if (!origin) return callback(null, true);
		if (allowedOrigins.indexOf(origin) === -1) {
			const msg =
				"The CORS policy for this site does not allow access from the specified Origin.";
			return callback(new Error(msg), false);
		}
		return callback(null, true);
	},
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
	credentials: true, // Allow cookies and authentication headers
	optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

// Import your route files here (example)
const authRoutes = require("./modules/auth/auth.routes");
const testsRoutes = require("./modules/tests/tests.routes");
const medicationsRoutes = require("./modules/medications/medications.routes");

const app = express();

// 1. GLOBAL MIDDLEWARE
// app.use(helmet()); // Set security HTTP headers
// if (config.NODE_ENV === "development") {
// 	app.use(morgan("dev")); // HTTP request logger
// }

app.use(cors(corsOptions));
app.use(express.json()); // Body parser, reading data from body into req.body

// 2. ROUTES
// Example of mounting an imported route file
app.use(`${config.API_BASE_URL}/auth`, authRoutes);
app.use(`${config.API_BASE_URL}/test`, testsRoutes);
app.use(`${config.API_BASE_URL}/medications`, medicationsRoutes);

// 3. UNHANDLED ROUTES (404)
// This catches all requests that didn't match any route
app.all(/.*/, (req, res, next) => {
	next(new ApiError(404, `Cannot find ${req.originalUrl} on this server!`));
});

// 4. GLOBAL ERROR HANDLER (MUST BE LAST)
app.use(globalErrorHandler);

module.exports = app;
