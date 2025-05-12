const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const Course = require('../models/courseModel');


exports.getAllCourses = catchAsync(async (req, res, next) => {
    // Execute query
    const features = new APIFeatures(Course.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    
    const courses = await features.query;
    
    // Send response
    res.status(200).json({
        status: 'success',
        results: courses.length,
        data: {
        courses,
        },
    });
});