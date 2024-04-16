const { Tables } = require('../models');
const catchAsync = require('../utils/catchAsync');

exports.getAllTables = catchAsync(async (req, res, next) => {
  const AllTables = await Tables.findAll();

  res.status(200).json({ data: AllTables });
});

exports.createTabel = catchAsync(async (req, res, next) => {
  const table = await Tables.create(req.body);

  res.status(200).json({ data: table });
});

exports.deleteTable = catchAsync(async (req, res, next) => {
  const id = req.body;
  const table = await Tables.destroy({
    where: {
      id: id,
    },
  });

  res.status(200).json({ data: table });
});

exports.deleteTable;
