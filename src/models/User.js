// src/models/User.js (Refactored for Sequelize and UUID)
const argon2 = require("argon2");
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelize"); // Assuming your Sequelize instance
const { ar } = require("zod/locales");

const User = sequelize.define(
	"User",
	{
		id: {
			type: DataTypes.UUID, // ⬅️ DEFINED AS UUID
			defaultValue: DataTypes.UUIDV4, // ⬅️ AUTOMATIC UUID GENERATION
			primaryKey: true,
		},
		firstName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		lastName: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true,
			},
		},
		password: {
			type: DataTypes.BLOB,
			allowNull: true,
		},
		authTypes: {
			type: DataTypes.JSON, // Stores array like: ['manual', 'google']
			allowNull: false,
			defaultValue: ["manual"],
		},
		googleId: {
			type: DataTypes.STRING,
			allowNull: true,
			unique: true,
		},
	},
	{
		tableName: "users",
		timestamps: true,
		underscored: true,

		// Scopes to control password visibility
		defaultScope: {
			attributes: { exclude: ["password"] },
		},
		scopes: {
			withPassword: {
				attributes: { include: ["password"] },
			},
		},
	}
);

// --- SEQUELIZE HOOK for Password Hashing ---

User.beforeSave(async (user, options) => {
	const passwordProvided = user.changed("password") && user.password;
	const isManualAuth = user.authTypes && user.authTypes.includes("manual");

	if (passwordProvided && isManualAuth) {
		const hashedPassword = await argon2.hash(String(user.password));
		console.log(`Saving hashed password: ${hashedPassword}`);
		user.password = hashedPassword;
	}
});

// --- INSTANCE METHOD for Password Comparison ---

User.prototype.comparePassword = async function (candidatePassword) {
	// This requires fetching the user with the 'withPassword' scope.
	console.log(
		`Comparing candidate password [${candidatePassword}] with stored hash [${this.password}]`
	);
	const storedHashString = String(this.password);
	return await argon2.verify(storedHashString, candidatePassword);
};

module.exports = User;
