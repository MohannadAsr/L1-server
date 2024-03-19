const catchAsync = require('../utils/catchAsync');
const { Vips, Users } = require('../models');
const Pagination = require('../utils/Pagination');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');

exports.getaccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.getAllVips = catchAsync(async (req, res, next) => {
  const PaginationInstance = new Pagination(
    parseInt(req.query.pageIndex) || 1,
    parseInt(req.query.pageSize) || 10
  );

  const count = await Vips.count();
  const AllVips = await Vips.findAll({
    order: [['updatedAt', 'DESC']],
    offset: PaginationInstance.offset(),
    limit: PaginationInstance.pageSize,
  });

  const pagination = {
    ...PaginationInstance,
    totalPages: PaginationInstance.totalPages(count),
    totalCount: count,
  };

  res.status(200).json({ message: 'success', data: AllVips, pagination });
});

exports.createVip = catchAsync(async (req, res, next) => {
  const newVip = await Vips.create(req.body);
  res.status(200).json({ message: 'success', data: newVip });
});

exports.deleteVip = catchAsync(async (req, res, next) => {
  const vipIds = req.body;
  // Delete users based on the provided array of user IDs
  const deletedVips = await Vips.destroy({
    where: { id: vipIds },
  });

  if (deletedVips > 0) {
    return res.status(200).json({ message: 'Vips deleted successfully' });
  } else {
    next(new AppError('No Vips found with the provided IDs', 404));
  }
});

exports.updateVip = catchAsync(async (req, res, nex) => {
  // Assuming req.body contains the updated product information
  const updateVips = await Vips.update(req.body, {
    where: {
      id: req.body.id,
    },
  });

  // Check if any rows were affected (updated)
  if (updateVips[0] === 0) {
    return res.status(404).json({ message: 'Vip not found or not updated.' });
  }

  // Optionally, fetch the updated product and send it in the response
  const updateVipsInstance = await Vips.findByPk(req.body.id);
  res.status(200).json({
    message: 'Vip updated successfully',
    product: updateVipsInstance,
  });
});

exports.vipLogin = catchAsync(async (req, res, next) => {
  const { email, phone } = req.body;

  // Check if the code is provided
  if (!email && !phone) {
    return next(new AppError('Please Provide email or  phone Number', 400));
  }

  let user;
  if (email) {
    // Check if the user exists and the code is correct
    user = await Vips.findOne({
      where: { email: email },
    });
  } else {
    user = await Vips.findOne({
      where: { phone: phone },
    });
  }

  if (!user) {
    return next(new AppError('Incorrect email or phone number', 400));
  }

  // Generate and send the JWT token
  let token = this.getaccessToken(user.id);

  res.status(200).json({
    status: 'success',
    data: {
      name: user.name,
      id: user.id,
      email: user.email,
      token,
    },
  });
});
