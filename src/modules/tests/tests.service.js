const TestResultModel = require("../../models/TestResult");

const TestService = {
	fetchUserTests: async (userId) => {
		const tests = await TestResultModel.findUserResults(userId);
		return tests;
	},
};

module.exports = TestService;
