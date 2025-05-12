const express = require('express');
// const studentWorkController = require('../controllers/studentWorkController');
const newsController = require('../controllers/newsController');

const router = express.Router();

router
  .route('/')
  .get(newsController.getAllNews)
  .post(newsController.createNews);
router
  .route('/:id')
  .get(newsController.getNews)
  .patch(newsController.updateNews)
  .delete(newsController.deleteNews);

module.exports = router;
