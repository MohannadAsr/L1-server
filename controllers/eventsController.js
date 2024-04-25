const catchAsync = require('../utils/catchAsync');
const { Events, Vips, Invitations, Products, Tables } = require('../models');
const { deleteImage, deleteQr } = require('./ImagesController');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');
const cloudinary = require('../utils/cloudinary');

exports.createEvent = catchAsync(async (req, res, next) => {
  const createdEvent = await Events.create({
    ...req.body,
    imageId: req?.createdImage?.id || null,
    image: req?.createdImage?.imageUrl || null,
  });

  res.status(200).json({ message: 'success', data: createdEvent });
});

exports.getEvents = catchAsync(async (req, res, next) => {
  const allEvents = await Events.findAll({
    order: [['date', 'ASC']],
  });

  res.status(200).json({ message: 'success', data: allEvents });
});

exports.getEventByID = catchAsync(async (req, res, next) => {
  const event = await Events.findByPk(req.params.id);

  if (!event) {
    return next(new AppError('Cannot Find this Event', 404));
  }

  const AllTablesDetails = await Tables.findAll({
    where: { id: event.tableIds },
  });

  const InvitationHaveTables = await Invitations.findAll({
    where: {
      eventId: event.id,
      tableId: {
        [Op.in]: event.tableIds, // Use [Op.in] instead of [Op.contains]
      },
    },
    attributes: ['tableId'],
  });

  const AllTables = InvitationHaveTables.map((item) => item.tableId);

  const AvailableTables = event.tableIds.filter(
    (item) => !AllTables.includes(item)
  );

  res.status(200).json({
    message: 'success',
    data: {
      event,
      AvailableTables,
      AllTablesDetails,
    },
  });
});

exports.deleteEvent = catchAsync(async (req, res, next) => {
  const eventId = req.body.id;
  const targetEvent = await Events.findByPk(eventId);

  // Delete All Related Invitaions
  if (targetEvent) {
    const allRelatedInvitatinos = await Invitations.findAll({
      where: {
        eventId: targetEvent.id,
      },
    });

    await Promise.all(
      allRelatedInvitatinos?.map(async (item) => {
        if (item.qrCodeId) {
          await cloudinary.uploader.destroy(item.qrCodeId);
        }
      })
    );

    await Invitations.destroy({
      where: {
        eventId: targetEvent.id,
      },
    });
  }

  await Events.destroy({ where: { id: eventId } });
  if (targetEvent?.imageId) {
    await deleteImage(targetEvent.imageId);
  }

  res.status(204).json({ message: 'success' });
});

exports.getHomeInfos = catchAsync(async (req, res, next) => {
  const currentDate = new Date();
  const nextEvent = await Events.findOne({
    where: {
      date: { [Op.gt]: currentDate },
    },
    order: [['date', 'ASC']],
  });

  const totalEvents = await Events.count();
  const totalVipsCount = await Vips.count();
  const totalInvitaions = await Invitations.count();
  const totalProducts = await Products.count();

  res.status(200).json({
    message: 'success',
    data: {
      nextEvent: nextEvent,
      totalVips: totalVipsCount,
      totalEvents,
      totalInvitaions,
      totalProducts,
    },
  });
});
