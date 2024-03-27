const express = require('express');

const router = express.Router();
const productsController = require('../controllers/productsController');

router
  .route('/')
  .get(productsController.getAllProducts)
  .post(productsController.createProduct)
  .delete(productsController.deleteProducts);

router.route('/switchStatus/:id').post(productsController.switchProductStatus);

module.exports = router;
