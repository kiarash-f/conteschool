const StudentWork = require('../models/studentWorkModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getAllStudentWorks = catchAsync(async (req, res, next) => {
  const studentWorks = await StudentWork.find();
  res.status(200).json({
    status: 'success',
    results: studentWorks.length,
    data: {
      studentWorks,
    },
  });
});
exports.getStudentWork = catchAsync(async (req, res, next) => {
  const studentWork = await StudentWork.findById(req.params.id);
  if (!studentWork) {
    return next(new AppError('No student work found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      studentWork,
    },
  });
});
exports.createStudentWork = catchAsync(async (req, res, next) => {
  const newStudentWork = await StudentWork.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      studentWork: newStudentWork,
    },
  });
});
exports.updateStudentWork = catchAsync(async (req, res, next) => {
  const studentWork = await StudentWork.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }); 
    if (!studentWork) {
        return next(new AppError('No student work found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            studentWork,
        },
    });
}
);
exports.deleteStudentWork = catchAsync(async (req, res, next) => {
  const studentWork = await StudentWork.findByIdAndDelete(req.params.id);
  if (!studentWork) {
    return next(new AppError('No student work found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
