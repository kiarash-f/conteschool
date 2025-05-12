const APIFeatures = require('../utils/apiFeatures');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');




exports.getAllUsers = catchAsync(async (req, res, next) => {
    // Execute query
    const features = new APIFeatures(User.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

    const users = await features.query;

    // Send response
    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});