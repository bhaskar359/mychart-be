const MedicationModel = require("../../models/Medication");

const MedicationService = {
	fetchUserMedications: async (userId) => {
		const medications = await MedicationModel.findUserMedications(userId);
		return medications;
	},
};

module.exports = MedicationService;
