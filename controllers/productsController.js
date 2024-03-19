const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { Products } = require('../models');
const { Transactions } = require('../models');

exports.getAllProducts = catchAsync(async (req, res) => {
  try {
    const productList = await Products.findAll({
      order: [['updatedAt', 'DESC']],
    });
    res.json({ status: 200, data: productList });
  } catch (error) {
    throw error;
  }
});

exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Products.create({ ...req.body });
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

exports.updateProducts = catchAsync(async (req, res, next) => {
  // Assuming req.body.products is an array of objects containing updated product data
  const updatedProducts = await Promise.all(
    req.body.products.map(async (productData) => {
      const productId = productData.id; // Assuming each product data object has an 'id' field

      // Use the Sequelize 'update' method to update the product
      const [numRowsUpdated, updatedProduct] = await Products.update(
        productData, // Updated product data
        { where: { id: productId }, returning: true }
      );

      if (numRowsUpdated === 0) {
        // Handle the case where the product with the given ID was not found
        return null;
      }

      // Return the updated product
      return updatedProduct[0];
    })
  );

  // Filter out any null values (products not found)
  const validUpdatedProducts = updatedProducts.filter(
    (product) => product !== null
  );

  res.json({ data: validUpdatedProducts });
});
