const express = require('express');

const router = express.Router();
const productsController = require('../controllers/productsController');
const TablesController = require('../controllers/TablesController');

router
  .route('/')
  .get(productsController.getAllProducts)
  .post(productsController.createProduct)
  .delete(productsController.deleteProducts);
router.route('/productsList').get(productsController.getProuctsList);

router
  .route('/tabels')
  .get(TablesController.getAllTables)
  .post(TablesController.createTabel)
  .delete(TablesController.deleteTable);
router.route('/switchStatus/:id').post(productsController.switchProductStatus);

module.exports = router;
