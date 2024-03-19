const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const FilterFn = require('../utils/FilterFn');
const { DataTypes } = require('sequelize');
const { Processes, Products, Users } = require('../models'); // Adjust the path accordingly
const { Op } = require('sequelize');

exports.createProcess = catchAsync(async (req, res, next) => {
  const { handlerId, productsList } = req.body;

  // Find the user based on the provided ID
  const user = await Users.findOne({ where: { id: handlerId } });

  if (!user) {
    return next(new AppError('Invalid Branch ID', 400));
  }

  // Check if the user is a worker or branch
  if (
    user.role === 'supplier' &&
    productsList.some((product) => product.quantity < 0)
  ) {
    // Supplier can only deposit to the warehouse
    return next(
      new AppError('Supplier can only deposit to the warehouse', 400)
    );
  }

  if (
    user.role === 'branch' &&
    productsList.some((product) => product.quantity > 0)
  ) {
    // Branch can only withdraw from the warehouse
    return next(
      new AppError('Branch can only withdraw from the warehouse', 400)
    );
  }
  // Check if there is enough quantity for each product
  const insufficientQuantity = await Promise.all(
    productsList.map(async (product) => {
      const existingProduct = await Products.findOne({
        where: { id: product.id },
      });

      return (
        !existingProduct || existingProduct.quantity + product.quantity < 0
      );
    })
  );

  if (insufficientQuantity.some((result) => result)) {
    return next(new AppError('Not enough quantity in the warehouse', 400));
  }

  // Create a new transaction
  const newTrans = await Processes.create({
    handlerName: user.name,
    createdAt: req.body.createdAt ? new Date(req.body.createdAt) : Date.now(),
    handlerId: user.id, // Assuming the handlerId is the user's ID
    productsList,
  });

  console.log('wee');

  // Update the quantity for each product in productsList
  await Promise.all(
    productsList.map(async (product) => {
      const oldProduct = await Products.findOne({
        where: { id: product.id },
      });
      await Products.update(
        { quantity: oldProduct.quantity + product.quantity },
        { where: { id: product.id } }
      );
    })
  );

  res.json({
    status: 'success',
    data: { transaction: newTrans },
  });
});

exports.deleteProcesses = catchAsync(async (req, res) => {
  const processesIds = req.body;
  // Delete users based on the provided array of user IDs
  const deletedPorducts = await Processes.destroy({
    where: { id: processesIds },
  });

  if (deletedPorducts > 0) {
    return res.status(200).json({ message: 'Processes deleted successfully' });
  } else {
    next(new AppError('No Processes found with the provided IDs', 404));
  }
});

exports.getAllprocesses = catchAsync(async (req, res) => {
  const trans = await Processes.findAll({
    order: [['createdAt', 'DESC']],
  });
  res.json({ status: 200, data: trans });
});

exports.getProcesses = catchAsync(async (req, res, next) => {
  // Pagination
  const page = parseInt(req.query.pageIndex) || 1; // Current page (default: 1)
  const pageSize = parseInt(req.query.pageSize) || 10;

  const offset = (page - 1) * pageSize;

  // Filtering

  const filters = { ...req.query };

  delete filters['productId'];
  delete filters['pageIndex'];
  delete filters['pageSize'];

  const whereClause = FilterFn(filters);

  if (req.query.productId && req.query.productId.length > 0) {
    whereClause['productsList'] = {
      [Op.or]: req.query.productId.map((id) => ({
        [Op.like]: `%${id}%`,
      })),
    };
  }

  // work for single id
  // whereClause['productsList'] = {
  //   [Op.like]: `%${req.query.productId}%`,
  // };

  const processes = await Processes.findAll({
    order: [['createdAt', 'DESC']],
    where: whereClause,
    limit: pageSize,
    offset: offset,
  });

  // total count for pagination
  const totalCount = await Processes.count({
    where: whereClause,
  });

  // get the statistics from processes without pagination
  const fullProcessWithoutPagination = await Processes.findAll({
    order: [['createdAt', 'DESC']],
    where: whereClause,

    offset: offset,
  });

  const flatData = fullProcessWithoutPagination.flatMap(
    (item) => item.productsList
  );
  const groupedBy = flatData.reduce((acc, item) => {
    const key = item.id;
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});

  const final = Object.keys(groupedBy).map((group) => {
    const totalCount = groupedBy[group]
      .map((item) => item.quantity)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    return {
      id: group,
      name: groupedBy[group][0].productName,
      totalCount: totalCount,
    };
  });

  res.status(200).json({
    status: 'success',
    data: {
      processes,
      stats: final,
      pagination: {
        pageIndex: page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
        totalCount: totalCount,
      },
    },
  });
});

exports.getProccessById = catchAsync(async (req, res, next) => {
  const targetProcces = await Processes.findByPk(req.params.id);

  if (!targetProcces) {
    return next(new AppError('Proccess Not Exist', 404));
  }

  res.status(200).json({
    message: 'success',
    data: targetProcces,
  });
});

exports.updateprocess = catchAsync(async (req, res, nex) => {
  // Assuming req.body contains the updated product information
  const updateProcess = await Processes.update(req.body, {
    where: {
      id: req.body.id,
    },
  });

  // Check if any rows were affected (updated)
  if (updateProcess[0] === 0) {
    return res
      .status(404)
      .json({ message: 'process not found or not updated.' });
  }

  // Optionally, fetch the updated product and send it in the response
  const updateProcessInstance = await Processes.findByPk(req.body.id);
  res.status(200).json({
    message: 'process updated successfully',
    process: updateProcessInstance,
  });
});
