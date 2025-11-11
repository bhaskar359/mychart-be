// src/modules/auth/auth.service.js

const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const UserModel = require("../../models/User");
const config = require("../../config");
const ApiError = require("../../utils/ApiError");
const { get } = require("./auth.routes");

// Helper function to create the JWT token
const signToken = (id) => {
	return jwt.sign({ id }, config.JWT_SECRET, {
		expiresIn: config.JWT_EXPIRES_IN,
	});
};

const AuthService = {
	/**
	 * Handles local user registration (manual signup).
	 * @param {Object} userData - User data (email, password, names, etc.)
	 * @returns {Promise<string>} JWT token for the new user.
	 */
	registerUser: async (req) => {
		const { email, password, firstName, lastName } = req.body;
		// 1. Check if the user already exists
		const existingUser = await UserModel.findOne({ where: { email } });
		if (existingUser) {
			// Check if the existing user is local or Google authenticated
			if (existingUser.authTypes.includes("manual")) {
				throw new ApiError(
					409,
					"A local account with this email already exists."
				);
			} else if (existingUser.authTypes.includes("google")) {
				// Allows user to be notified to use Google sign-in instead
				throw new ApiError(
					409,
					"This email is already linked to a Google account."
				);
			}
		}

		// 2. Hash the password (Business Logic)

		const trimmedPassword = password.trim();

		// 3. Create the user in the database (Data Access via Model)
		const newUser = await UserModel.create({
			email,
			password: trimmedPassword, // Use 'password' if following our final model
			firstName,
			lastName,
			google_id: null,
		});

		// 4. Generate and return JWT
		const token = signToken(newUser.id);
		const userForClient = {
			id: newUser.id,
			email: newUser.email,
			firstName: newUser.firstName,
			lastName: newUser.lastName,
		};
		return { token, data: { user: userForClient } };
	},

	/**
	 * Handles local user login.
	 * @param {string} email - User's email.
	 * @param {string} password - User's plain password.
	 * @returns {Promise<string>} JWT token.
	 */
	login: async (email, password) => {
		const trimmedPassword = password.trim();
		const user = await UserModel.scope("withPassword").findOne({
			where: { email },
		});

		if (!user || user.authTypes.includes("manual") === -1) {
			throw new ApiError(401, "Mail not found");
		}

		console.log(
			`Input Password Type: ${typeof password}, Value: [${password}]`
		);
		console.log(
			`Stored Hash Type: ${typeof user?.password}, Value: [${user?.password}]`
		);

		const passwordMatch = await user.comparePassword(trimmedPassword);
		console.log(`Comparison Result: ${passwordMatch}`);

		if (!passwordMatch) {
			throw new ApiError(401, "Incorrect email or password.");
		}

		// 4. Generate and return JWT
		const token = signToken(user.id);
		const userForClient = {
			id: user.id,
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
		};
		return { token, data: { user: userForClient } };
	},

	getUserById: async (userId) => {
		const user = await UserModel.findByPk(userId);
		if (!user) {
			throw new ApiError(404, "User not found.");
		}
		return user;
	},
};

module.exports = AuthService;
