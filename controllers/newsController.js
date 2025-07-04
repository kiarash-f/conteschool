const mongoose = require('mongoose');
const News = require('../models/newsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getAllNews = catchAsync(async (req, res, next) => {
  const news = await News.find();
  res.status(200).json({
    status: 'success',
    results: news.length,
    data: { news },
  });
});

exports.getNews = catchAsync(async (req, res, next) => {
  const news = await News.findById(req.params.id);
  if (!news) {
    return next(new AppError('No news found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { news },
  });
});

exports.createNews = catchAsync(async (req, res, next) => {
  if (req.files['Image'] && req.files['Image'][0]) {
    req.body.Image = `http://localhost:3000/uploads/${req.files['Image'][0].filename}`;
  }

  const newNews = await News.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { news: newNews },
  });
});

exports.updateNews = catchAsync(async (req, res, next) => {
  if (req.files['Image'] && req.files['Image'][0]) {
    req.body.Image = `http://localhost:3000/uploads/${req.files['Image'][0].filename}`;
  }
  const newNews = await News.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { newNews },
  });
});

exports.deleteNews = catchAsync(async (req, res, next) => {
  const news = await News.findByIdAndDelete(req.params.id);
  if (!news) {
    return next(new AppError('No news found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
