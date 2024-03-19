const express = require('express');

const router = express.Router();
const productController = require('../controllers/productsController');
const usersController = require('../controllers/usersController');

router
  .route('/')
  .get(productController.getAllProducts)
  .post(
    usersController.protectRoute,
    usersController.restrictTo('admin'),
    productController.createProduct
  )
  .delete(
    usersController.protectRoute,
    usersController.restrictTo('admin'),
    productController.deleteProducts
  );

router
  .route('/updateproduct')
  .post(
    usersController.protectRoute,
    usersController.restrictTo('admin'),
    productController.updateProduct
  );

module.exports = router;
