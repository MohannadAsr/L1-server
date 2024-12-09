const catchAsync = require('../utils/catchAsync');
const { Vips, Users, VipRequest, Invitations, Bills } = require('../models');
const Pagination = require('../utils/Pagination');
const AppError = require('../utils/appError');
const jwt = require('jsonwebtoken');

exports.getaccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.getAllVips = catchAsync(async (req, res, next) => {
  const { List, pagination } = await Pagination.getPaginatedResults(req, Vips);
  const allVipRequests = await VipRequest.findAll();

  res
    .status(200)
    .json({ message: 'success', data: List, allVipRequests, pagination });
});

exports.createVip = catchAsync(async (req, res, next) => {
  const { email, phone } = req.body;

  const checkDuplicateEmail = await Vips.findOne({
    where: {
      email: email,
    },
  });
  const checkDuplicatePhone = await Vips.findOne({
    where: {
      phone: phone,
    },
  });

  if (!email && !phone) {
    return next(new AppError('Please Provide Email or phone number'));
  }

  if (checkDuplicateEmail && email) {
    return next(new AppError('Duplicated Email  Vip Already exist'));
  }
  if (checkDuplicatePhone && phone) {
    console.log(checkDuplicatePhone);
    return next(new AppError('Duplicated Phone Vip Already exist'));
  }

  const newVip = await Vips.upsert(req.body);
  res.status(200).json({ message: 'success', data: newVip });
});

exports.deleteVip = catchAsync(async (req, res, next) => {
  const vipIds = req.body;

  // Delete invitations associated with the vips
  await Invitations.destroy({
    where: { vipId: vipIds },
  });

  await Bills.destroy({
    where: {
      vipId: vipIds,
    },
  });

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
    // Please Provide email or  phone Number
    return next(
      new AppError(
        'Bitte geben Sie Ihre E-Mail-Adresse oder Telefonnummer an.',
        400
      )
    );
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
    // Incorrect email or phone number
    return next(
      new AppError('Falsche E-Mail-Adresse oder Telefonnummer.', 404)
    );
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

exports.VipRequest = catchAsync(async (req, res, next) => {
  const { email, phone } = req.body;

  const checkDuplicateEmail = await Vips.findOne({
    where: {
      email: email,
    },
  });
  const checkDuplicatePhone = await Vips.findOne({
    where: {
      phone: phone,
    },
  });
  const checkDuplicateEmailReq = await VipRequest.findOne({
    where: {
      email: email,
    },
  });
  const checkDuplicatePhoneReq = await VipRequest.findOne({
    where: {
      phone: phone,
    },
  });

  if (!email && !phone) {
    return next(new AppError('Please Provide Email or phone number'));
  }

  if (checkDuplicateEmail && email) {
    return next(new AppError('Already in Vip List'));
  }
  if (checkDuplicatePhone && phone) {
    console.log(checkDuplicatePhone);
    return next(new AppError('Already in Vip List'));
  }
  if (checkDuplicateEmailReq && email) {
    return next(new AppError('Already Requested to join . '));
  }
  if (checkDuplicatePhoneReq && phone) {
    console.log(checkDuplicatePhone);
    return next(new AppError('Already Requested to join . '));
  }

  const newVip = await VipRequest.create(req.body);
  res.status(200).json({ message: 'success', data: newVip });
});

exports.AcceptVipRequest = catchAsync(async (req, res, next) => {
  const targetRequest = await VipRequest.findOne({
    where: {
      id: req.params.id,
    },
  });
  if (!targetRequest) return next(new AppError('No Request with that Id', 404));
  console.log(targetRequest.name);
  const newVip = await Vips.upsert({
    name: targetRequest.name,
    email: targetRequest.email,
    phone: targetRequest.phone,
  });
  if (newVip) {
    await VipRequest.destroy({
      where: {
        id: req.params.id,
      },
    });
  }
  res.status(200).json({
    message: 'done',
  });
});

exports.rejectVipRequest = catchAsync(async (req, res, next) => {
  const deleteTarget = await VipRequest.destroy({
    where: {
      id: req.params.id,
    },
  });
  res.status(200).json({ message: 'done' });
});
