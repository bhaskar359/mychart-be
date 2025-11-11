// src/middleware/error.js

const ApiError = require("../utils/ApiError");
const config = require("../config");

const globalErrorHandler = (err, req, res, next) => {
	let error = err;
	let statusCode = error.statusCode || 500;
	let message = error.message || "Internal Server Error";

	// Log the full error internally
	console.error("GLOBAL ERROR:", error);

	// If the error isn't a custom ApiError (i.e., a programming or DB error),
	// we wrap it to hide sensitive details from the client
	if (!(error instanceof ApiError)) {
		statusCode = 500;
		message = "Something went wrong on the server.";
		error = new ApiError(statusCode, message, false);
	}

	// Send a standardized error response
	res.status(statusCode).json({
		status: error.status,
		message: error.message,
		// Stack trace only in development
		stack: config.NODE_ENV === "development" ? error.stack : undefined,
	});
};

module.exports = globalErrorHandler;
