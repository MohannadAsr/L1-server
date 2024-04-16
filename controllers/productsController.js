const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { Products } = require('../models');
const { Transactions } = require('../models');
const Pagination = require('../utils/Pagination');

exports.getProuctsList = catchAsync(async (req, res) => {
  const ProductsList = await Products.findAll({
    where: {
      active: true,
    },
  });

  res.json({ status: 200, data: ProductsList });
});

exports.getAllProducts = catchAsync(async (req, res) => {
  const { List, pagination } = await Pagination.getPaginatedResults(
    req,
    Products
  );

  res.json({ status: 200, data: List, pagination });
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Products.upsert({ ...req.body });
  res.json({ data: newProduct });
});

exports.deleteProducts = catchAsync(async (req, res) => {
  const productsIds = req.body;
  // Delete users based on the provided array of user IDs
  const deletedPorducts = await Products.destroy({
    where: { id: productsIds },
  });

  if (deletedPorducts > 0) {
    return res.status(200).json({ message: 'Products deleted successfully' });
  } else {
    next(new AppError('No Products found with the provided IDs', 404));
  }
});

exports.switchProductStatus = catchAsync(async (req, res, nex) => {
  // Assuming req.body contains the updated product information
  const productTarget = await Products.findByPk(req.params.id);

  const updatedProduct = await Products.update(
    { ...productTarget, active: !productTarget.active },
    {
      where: {
        id: productTarget.id,
      },
    }
  );

  // Check if any rows were affected (updated)
  if (updatedProduct[0] === 0) {
    return res
      .status(404)
      .json({ message: 'Product not found or not updated.' });
  }

  // Optionally, fetch the updated product and send it in the response
  res.status(200).json({
    message: 'Product updated successfully',
  });
});

exports.updateProduct = catchAsync(async (req, res, nex) => {
  // Assuming req.body contains the updated product information
  const updatedProduct = await Products.update(req.body, {
    where: {
      id: req.body.id,
    },
  });

  // Check if any rows were affected (updated)
  if (updatedProduct[0] === 0) {
    return res
      .status(404)
      .json({ message: 'Product not found or not updated.' });
  }

  // Optionally, fetch the updated product and send it in the response
  const updatedProductInstance = await Products.findByPk(req.body.id);
  res.status(200).json({
    message: 'Product updated successfully',
    product: updatedProductInstance,
  });
});
