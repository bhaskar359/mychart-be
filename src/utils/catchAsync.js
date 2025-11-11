// src/utils/catchAsync.js

const catchAsync = (fn) => {
	return (req, res, next) => {
		// Automatically catches promise rejections (errors) and passes them to next()
		fn(req, res, next).catch(next);
	};
};

module.exports = catchAsync;
