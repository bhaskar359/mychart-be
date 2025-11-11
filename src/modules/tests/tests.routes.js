const express = require("express");
const router = express.Router();
const TestService = require("./tests.service");
const catchAsync = require("../../utils/catchAsync");

router.get(
	"/results/:id",
	catchAsync(async (req, res, next) => {
		const userId = req.params.id;
		const tests = await TestService.fetchUserTests(userId);
		res.status(200).json({
			status: "success",
			data: {
				tests,
			},
		});
	})
);

module.exports = router;
