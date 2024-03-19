const { Users } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

exports.getaccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.createUser = catchAsync(async (req, res, next) => {
  const isAdminExist = await Users.findOne({ where: { role: 'admin' } });
  if (req.body.role == 'admin' && isAdminExist)
    return next(new AppError('Only One Admin Allowed', 400));

  const duplicateCheck = await Users.findOne({
    where: { email: req.body.email },
  });
  // If a user with the same code exists, return an error
  if (duplicateCheck) {
    return next(new AppError('Code Already Used', 400));
  }

  // Create a new user if no duplicate is found
  const newUser = await Users.create({ ...req.body });
  console.log(newUser);
  res.json({ status: 'done', data: newUser });
});

exports.deleteUsers = catchAsync(async (req, res) => {
  const userIds = req.body;
  // Delete users based on the provided array of user IDs
  const deletedUsers = await Users.destroy({
    where: { id: userIds },
  });

  if (deletedUsers > 0) {
    return res.status(200).json({ message: 'Users deleted successfully' });
  } else {
    next(new AppError('No users found with the provided IDs', 404));
  }
});

exports.updateuser = catchAsync(async (req, res, nex) => {
  // Assuming req.body contains the updated product information
  const updatedUser = await Users.update(req.body, {
    where: {
      id: req.body.id,
    },
  });

  // Check if any rows were affected (updated)
  if (updatedUser[0] === 0) {
    return res.status(404).json({ message: 'user not found or not updated.' });
  }

  // Optionally, fetch the updated product and send it in the response
  const updateUserInstance = await Users.findByPk(req.body.id);
  res.status(200).json({
    message: 'user updated successfully',
    user: updateUserInstance,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await Users.findAll({
    attributes: { exclude: req?.user?.role !== 'admin' ? ['code'] : [] },
    order: [['createdAt', 'DESC']],
  });
  res.json({ status: 200, data: users });
});

// Login Controller
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if the code is provided
  if (!email) {
    return next(new AppError('Please provide the email', 400));
  }
  if (!password) {
    return next(new AppError('Please provide the Password', 400));
  }

  // Check if the user exists and the code is correct
  const user = await Users.findOne({
    where: { email: email, password: password },
  });

  if (!user) {
    return next(new AppError('Incorrect email or password', 400));
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

exports.protectRoute = catchAsync(async (req, res, next) => {
  // 1- Getting the token and check if it's exist
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token)
    return next(new AppError('Please Login to get access to this route', 401));

  // 2- Verify the token

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3- check if user still exist
  const currentUser = await Users.findOne({
    where: { id: decoded.id },
  });
  if (!currentUser) {
    return next(
      new AppError(
        'the user that belong to token is no longer exist or banned',
        401
      )
    );
  }

  req.user = currentUser;
  next();
});

// Permission That Restricted to Specific Users
// Array of Allowed roles and check if the current user that requesting the data have Permission By checking his role
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have Permission to do this', 403));
    }
    next();
  };
};
