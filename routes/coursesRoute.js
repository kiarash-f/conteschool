const express = require('express');
const coursesController = require('../controllers/coursesController'); 

const router = express.Router();
// const authController = require('../controllers/authController');


router.route('/').get(coursesController.getAllCourses);




module.exports = router;