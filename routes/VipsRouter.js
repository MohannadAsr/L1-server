const express = require('express');

const router = express.Router();

const vipsController = require('../controllers/vipsController');
const usersController = require('../controllers/usersController');

router
  .route('/')
  .get(usersController.protectRoute, vipsController.getAllVips)
  .post(usersController.protectRoute, vipsController.createVip)
  .delete(usersController.protectRoute, vipsController.deleteVip);

router
  .route('/update')
  .post(usersController.protectRoute, vipsController.updateVip);

router.route('/login').post(vipsController.vipLogin);
module.exports = router;
