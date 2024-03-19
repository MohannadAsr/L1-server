const express = require('express');

const router = express.Router();
const resetController = require('../controllers/resetController');
const userController = require('../controllers/usersController');

router.route('/').delete(
  // userController.protectRoute,
  // userController.restrictTo('admin'),
  resetController.resetDatabase
);

module.exports = router;
