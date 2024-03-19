const express = require('express');

const router = express.Router();
const processesController = require('../controllers/processesController');
const userController = require('../controllers/usersController');

router
  .route('/')
  .get(
    userController.protectRoute,
    userController.restrictTo('admin'),
    processesController.getAllprocesses
  )
  .post(userController.protectRoute, processesController.createProcess)
  .delete(
    userController.protectRoute,
    userController.restrictTo('admin'),
    processesController.deleteProcesses
  );

router
  .route('/getProcesses')
  .get(userController.protectRoute, processesController.getProcesses);

router
  .route('/updateprocess')
  .post(userController.protectRoute, processesController.updateprocess);

router
  .route('/:id')
  .get(
    userController.protectRoute,
    userController.restrictTo('admin'),
    processesController.getProccessById
  );

module.exports = router;
