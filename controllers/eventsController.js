const catchAsync = require('../utils/catchAsync');
const { Events, Vips, Invitations } = require('../models');
const { deleteImage, deleteQr } = require('./ImagesController');
const { Op } = require('sequelize');
const AppError = require('../utils/appError');

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
  const allInvitaions = await Promise.all(
    allEvents.map(async (item) => {
      const total = await Invitations.count({
        where: {
          status: 'pending',
          eventId: item.id,
        },
      });
      return total;
    })
  );

  res
    .status(200)
    .json({ message: 'success', data: allEvents, pending: allInvitaions });
});

exports.getEventByID = catchAsync(async (req, res, next) => {
  const event = await Events.findByPk(req.params.id);

  if (!event) {
    return next(new AppError('Cannot Find this Event', 404));
  }

  res.status(200).json({ message: 'success', data: event });
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
          await deleteQr(item.qrCodeId);
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

  res.status(200).json({
    message: 'success',
    data: {
      nextEvent: nextEvent,
      totalVips: totalVipsCount,
      totalEvents,
      totalInvitaions,
    },
  });
});
