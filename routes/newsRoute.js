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
router.route('/:slug').get(newsController.getNews);

module.exports = router;
