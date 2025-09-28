const express = require('express');
const newsController = require('../controllers/newsController');
const authController = require('../controllers/authController');
const { imageUpload } = require('../controllers/uploadController');

const router = express.Router();

router
  .route('/')
  .get(newsController.getAllNews)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    imageUpload,
    newsController.createNews
  );
router
  .route('/:id')

  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    imageUpload,
    newsController.updateNews
  )
  .delete(
    newsController.deleteNews,
    authController.protect,
    authController.restrictTo('admin')
  )
  .get(newsController.getNews);

module.exports = router;
