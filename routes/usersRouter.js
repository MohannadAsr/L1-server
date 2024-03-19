const express = require('express');

const router = express.Router();
const userController = require('../controllers/usersController');

router
  .route('/')
  .get(
    userController.protectRoute,
    userController.restrictTo('admin'),
    userController.getAllUsers
  )
  .post(
    userController.protectRoute,
    userController.restrictTo('admin'),
    userController.createUser
  )
  .delete(
    userController.protectRoute,
    userController.restrictTo('admin'),
    userController.deleteUsers
  );

router
  .route('/updateuser')
  .post(
    userController.protectRoute,
    userController.restrictTo('admin'),
    userController.updateuser
  );

router.route('/login').post(userController.login);

module.exports = router;
