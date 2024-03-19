const { Invitations, Events, Vips, QrCodes } = require('../models');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.createInvitaion = catchAsync(async (req, res, next) => {
  const checkEvent = await Events.findByPk(req.body.eventId);
  const checkVip = await Vips.findByPk(req.body.vipId);

  if (!req.body.eventId || !checkEvent) {
    return next(new AppError('Event Not exist', 404));
  }
  if (!req.body.vipId || !checkVip) {
    return next(new AppError('Unable to recognize the customer', 404));
  }

  const checkDuplicatedInvitaion = await Invitations.findOne({
    where: {
      eventId: req.body.eventId,
      vipId: req.body.vipId,
    },
  });

  if (checkDuplicatedInvitaion) {
    next(new AppError('User Already Have Invitaion for this Event', 400));
  }

  const newInvitation = await Invitations.create(req.body);

  res.status(200).json({ message: 'success', data: newInvitation });
});

exports.getInviationsByEvent = catchAsync(async (req, res, next) => {
  const Allinvitations = await Invitations.findAll({
    where: { eventId: req.params.id },
  });

  const AllInvitaionDetails = await Promise.all(
    Allinvitations.map(async (item) => {
      const vip = await Vips.findByPk(item.vipId);
      const event = await Events.findByPk(item.eventId); // Assuming your event model is named "Events"

      // Include event details in the invitation object
      return {
        id: item.id,
        event: event,
        vip: vip,
        qrCodeId: item.qrCodeId,
        qrCodeUrl: item.qrCodeUrl,
        status: item.status,
        optionsId: item.optionsId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      };
    })
  );

  res.status(200).json({
    message: 'success',
    data: AllInvitaionDetails,
    totalCount: AllInvitaionDetails.length,
  });
});

exports.getInvitation = catchAsync(async (req, res, next) => {
  const invitation = await Invitations.findByPk(req.params.id);

  if (!invitation) {
    return next(new AppError('Invitation Not Exist', 404));
  }
  const event = await Events.findByPk(invitation.eventId);
  const vip = await Vips.findByPk(invitation.vipId);

  if (!event || !vip) {
    return next(new AppError('Event or Vip Not Exist', 404));
  }

  res.status(200).json({
    message: 'success',
    data: {
      invitation,
      event,
      vip,
    },
  });
});

exports.getInvitaionByEventandUserIds = catchAsync(async (req, res, next) => {
  const invitation = await Invitations.findOne({
    where: { eventId: req.query.eventId, vipId: req.query.vipId },
  });

  if (!invitation) {
    return next(new AppError('No Invitaion for this event or vip', 404));
  }

  res.status(200).json({ message: 'success', data: invitation });
});

exports.updateInvitationStatus = catchAsync(async (req, res, next) => {
  const invitationId = req.body.id; // Assuming the invitation ID is passed in the request params
  const newStatus = req.body.status; // Assuming the new status is passed in the request body

  // Update the invitation status
  const updatedInvitation = await Invitations.update(
    { status: newStatus },
    {
      where: { id: invitationId },
      returning: true, // This ensures that the updated record is returned
    }
  );

  if (updatedInvitation[0] === 0) {
    // If no records were updated, the invitation with the given ID does not exist
    return res.status(404).json({ message: 'Invitation not found' });
  }

  // The updatedInvitation variable contains an array with two elements:
  // - The number of updated rows (updatedInvitation[0])
  // - An array of the updated records (updatedInvitation[1])

  const updatedInvitationRecord = updatedInvitation[1][0];

  res.status(200).json({ message: 'Success', data: updatedInvitationRecord });
});

const sharp = require('sharp');
const qr = require('qrcode');

exports.approveInvitaion = catchAsync(async (req, res, nex) => {
  const { id } = req.body;

  const targetInvitiation = await Invitations.findByPk(id);

  if (!targetInvitiation) {
    return next('Unable to Find this Invitation', 404);
  }

  // Url for database to use it
  const url = `${req.protocol}://${req.get('host')}/images/${req?.body.id}.png`;

  // Create New Qr for This Invitation
  const newQrCode = await QrCodes.create({
    qrUrl: url,
    invitationId: id,
  });

  // set the Qr Url that send me to qrInvitationPage
  const urlScan = `${id}`;

  // Generate QR code as a data URL
  const qrCodeDataURL = await qr.toDataURL(urlScan, {
    width: 500,
    height: 500,
  });

  // Create a buffer from the data URL
  const qrCodeBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');

  // Create a sharp object from the buffer
  const sharpImage = sharp(qrCodeBuffer);

  // Save the image to a file (e.g., public/images/qrcode.png)
  const imagePath = `public/images/${id}.png`;

  await sharpImage.toFile(imagePath);

  const updatedInvitation = await Invitations.update(
    { status: 'approved', qrCodeId: newQrCode.id, qrCodeUrl: url },
    {
      where: { id: id },
      returning: true, // This ensures that the updated record is returned
    }
  );

  res
    .status(200)
    .json({ message: 'done', updatedInvite: updatedInvitation[1][0] });
});

exports.rejectInvitaion = catchAsync(async (req, res, next) => {
  const { id } = req.body;

  const updatedInvitation = await Invitations.update(
    { status: 'rejected' },
    {
      where: { id: id },
      returning: true, // This ensures that the updated record is returned
    }
  );

  res
    .status(200)
    .json({ message: 'done', updatedInvite: updatedInvitation[1][0] });
});
