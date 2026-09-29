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
    newsController.createNews,
  );
router
  .route('/:id')
  .get(newsController.getNews)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    imageUpload,
    newsController.updateNews,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    newsController.deleteNews,
  );

module.exports = router;
