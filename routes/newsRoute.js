const express = require('express');
const newsController = require('../controllers/newsController');
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/')
  .get(newsController.getAllNews)
  .post(
    newsController.createNews,
    authController.protect,
    authController.restrictTo('admin')
  );
router
  .route('/:id')
  .get(newsController.getNews)
  .patch(
    newsController.updateNews,
    authController.protect,
    authController.restrictTo('admin')
  )
  .delete(
    newsController.deleteNews,
    authController.protect,
    authController.restrictTo('admin')
  );

module.exports = router;
