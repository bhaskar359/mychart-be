const express = require("express");
const router = express.Router();
const MedicationService = require("./medications.service");

const catchAsync = require("../../utils/catchAsync");

router.get(
	"/:id",
	catchAsync(async (req, res, next) => {
		const userId = req.params.id;
		const medications = await MedicationService.fetchUserMedications(userId);
		res.status(200).json({
			status: "success",
			data: {
				medications,
			},
		});
	})
);

module.exports = router;
