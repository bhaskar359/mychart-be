// src/modules/auth/auth.routes.js

const express = require("express");
const router = express.Router();
const AuthService = require("./auth.service");
const catchAsync = require("../../utils/catchAsync");
const ApiError = require("../../utils/ApiError");
const { protect } = require("../../middleware/auth");
// Assuming simple validation here. For production, consider 'joi' or 'express-validator'.

// --- Helper for sending JWT via cookie and JSON ---
const sendAuthResponse = (res, token, user) => {
	// Optional: Set the token in an HttpOnly cookie for browser security
	// const cookieOptions = {
	//     expires: new Date(Date.now() + config.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
	//     httpOnly: true,
	//     secure: process.env.NODE_ENV === 'production' // Set to true in production
	// };
	// res.cookie('jwt', token, cookieOptions);

	res.status(200).json({
		status: "success",
		token,
		data: {
			user: {
				id: user.id,
				email: user.email,
				firstName: user.first_name,
				lastName: user.last_name,
			},
		},
	});
};

// --- ROUTE HANDLERS ---

/**
 * @route POST /api/v1/auth/register
 * @desc Registers a new user using email and password (Local Auth)
 */
router.post(
	"/register",
	catchAsync(async (req, res, next) => {
		const { email, password, firstName, lastName, confirmPassword } = req.body;

		if (!email || !password || !firstName || !lastName) {
			return next(
				new ApiError(
					400,
					"Please provide email, password, first name, and last name for registration."
				)
			);
		}
		if (password !== confirmPassword) {
			return next(
				new ApiError(400, "Password and confirmation password do not match.")
			);
		}

		const { token, data } = await AuthService.registerUser(req);

		res.status(201).json({
			status: "success",
			message: "Registration successful. User created.",
			token,
			data,
		});
	})
);

/**
 * @route POST /api/v1/auth/login
 * @desc Authenticates a user using email and password (Local Auth)
 */
router.post(
	"/login",
	catchAsync(async (req, res, next) => {
		const { email, password } = req.body;

		// 1. Basic Input Validation
		if (!email || !password) {
			return next(new ApiError(400, "Please provide email and password."));
		}

		// 2. Call the Service Layer for Business Logic
		const { token, data } = await AuthService.login(email, password);

		// NOTE: Similar to register, you'd fetch the full user object to send back.
		// For this example, we just return the token.

		res.status(200).json({
			status: "success",
			message: "Login successful.",
			token,
			data,
		});
	})
);

router.get(
	"/me",
	protect,
	catchAsync(async (req, res, next) => {
		// Assuming req.user is populated by an authentication middleware
		if (!req.user) {
			return next(new ApiError(401, "You are not logged in!"));
		}

		// Fetch user details from the database if needed
		const user = await AuthService.getUserById(req.user.id);

		res.status(200).json({
			status: "success",
			data: {
				user,
			},
		});
	})
);

module.exports = router;
