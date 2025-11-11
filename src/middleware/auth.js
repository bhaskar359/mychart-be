const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const UserModel = require("../models/User"); // Assumed: Your Sequelize/Mongoose User model
const catchAsync = require("../utils/catchAsync"); // Assumed: Utility to handle async errors
const ApiError = require("../utils/ApiError"); // Assumed: Custom error class

// IMPORTANT: Replace 'YOUR_JWT_SECRET_KEY' with your actual secret key
// You should load this from environment variables (e.g., process.env.JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET || "YOUR_JWT_SECRET_KEY";

/**
 * Middleware to protect routes:
 * 1. Checks if a token exists in the Authorization header.
 * 2. Verifies the token's validity and expiration.
 * 3. Extracts the user ID from the token payload.
 * 4. Fetches the user from the database.
 * 5. Attaches the user object to req.user for use in controllers.
 */
exports.protect = catchAsync(async (req, res, next) => {
	let token;

	// 1. Check for token existence and format (e.g., "Bearer <token>")
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	// If no token is provided, deny access
	if (!token) {
		return next(
			new ApiError("You are not logged in! Please log in to get access.", 401)
		);
	}

	// 2. Verify and decode the token
	const decoded = await promisify(jwt.verify)(token, JWT_SECRET);

	// 3. Check if the user still exists
	// The decoded ID is usually the payload { id: userId, ... }
	const currentUser = await UserModel.findByPk(decoded.id);

	if (!currentUser) {
		return next(
			new ApiError("The user belonging to this token no longer exists.", 401)
		);
	}

	// 4. Check if user changed password after the token was issued (Optional but recommended)
	// Assuming your User model has a method `changedPasswordAfter(JWTTimestamp)`
	// if (currentUser.changedPasswordAfter(decoded.iat)) {
	//   return next(
	//     new ApiError('User recently changed password! Please log in again.', 401)
	//   );
	// }

	// 5. GRANT ACCESS TO PROTECTED ROUTE
	// Attach the user object (excluding the sensitive password field) to the request
	// We attach only the necessary data (id, email, etc.)
	req.user = {
		id: currentUser.id,
		// Note: If you have a password field on the object, you should manually remove it
		// or ensure your model query already excludes it for security.
	};

	next();
});
