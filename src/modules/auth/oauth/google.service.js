// src/modules/auth/oauth/google.service.js

const { OAuth2Client } = require("google-auth-library");
const User = require("../../../models/User");
const AuthService = require("../auth.service"); // To generate JWT
const ApiError = require("../../../utils/ApiError");

// Initialize the Google OAuth client with your ID
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const AUTH_TYPE = "google";

/**
 * Core logic for verifying Google Token and handling user creation/linking.
 * @param {string} googleToken - The ID token received from the frontend.
 * @returns {string} The server's generated JWT.
 */
exports.signInOrSignUp = async (googleToken) => {
	// 1. Verify the Google ID Token
	let ticket;
	try {
		ticket = await client.verifyIdToken({
			idToken: googleToken,
			audience: process.env.GOOGLE_CLIENT_ID, // Ensure token is meant for your app
		});
	} catch (err) {
		throw new ApiError(401, "Invalid or expired Google token.");
	}

	const payload = ticket.getPayload();
	const { email, given_name, family_name, sub: googleId } = payload;

	// 2. Look up user by email
	let user = await User.findOne({ email }).select("+password");

	if (user) {
		// --- CASE 2 & 3: User record already exists ---

		// Check if 'google' is already an auth type
		if (!user.authTypes.includes(AUTH_TYPE)) {
			// CASE 2/3 LINKING LOGIC: User exists, but this is the first time they used Google Sign-In.
			// This covers:
			// - User with 'manual' only trying Google sign-in (CASE 2)
			// - User with 'manual' only trying to register again via Google (CASE 3 is covered here too)

			user.authTypes.push(AUTH_TYPE);
			user.googleId = googleId;
			// Note: We don't change the password or remove the manual auth type.
			await user.save({ validateBeforeSave: false });

			console.log(`User ${email} linked with Google account.`);
		} else if (
			user.authTypes.includes(AUTH_TYPE) &&
			user.authTypes.includes("manual")
		) {
			// User linked with both and is signing in with Google. All good.
			console.log(`User ${email} signed in via linked Google account.`);
		} else if (user.authTypes.includes(AUTH_TYPE) && !user.googleId) {
			// Edge case: update googleId if missing
			user.googleId = googleId;
			await user.save({ validateBeforeSave: false });
		}
	} else {
		// --- CASE 1: New User via Google Sign-In ---

		user = await User.create({
			firstName: given_name,
			lastName: family_name,
			email,
			authTypes: [AUTH_TYPE],
			googleId: googleId,
			// Password is not required, as it is a Google auth type.
		});
		console.log(`New user ${email} created via Google.`);
	}

	// 3. Generate and return server JWT
	const token = AuthService.createSendToken(user);

	return token;
};
