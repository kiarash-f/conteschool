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
exports.getCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findById(req.params.id);
    
    if (!course) {
        return next(new AppError('No course found with that ID', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
        course,
        },
    });
});
exports.createCourse = catchAsync(async (req, res, next) => {
    const newCourse = await Course.create(req.body);
    
    res.status(201).json({
        status: 'success',
        data: {
        course: newCourse,
        },
    });
});
exports.updateCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    
    if (!course) {
        return next(new AppError('No course found with that ID', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
        course,
        },
    });
});
exports.deleteCourse = catchAsync(async (req, res, next) => {
    const course = await Course.findByIdAndDelete(req.params.id);
    
    if (!course) {
        return next(new AppError('No course found with that ID', 404));
    }
    
    res.status(204).json({
        status: 'success',
        data: null,
    });
});