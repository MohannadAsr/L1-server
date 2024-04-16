const catchAsync = require('../utils/catchAsync');
const { Events, Invitations, Vips, Bills } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const AppError = require('../utils/appError');
const sequelize = require('sequelize');

exports.getGeneralStats = catchAsync(async (req, res, next) => {
  const { currentYear } = req.query;

  const eventStats = await Events.findAll({
    attributes: [
      [fn('date_format', col('date'), '%m'), 'month'],
      [fn('count', col('id')), 'count'],
    ],
    where: {
      date: {
        [Op.between]: [
          `${currentYear || new Date().getFullYear()}-01-01`,
          `${currentYear || new Date().getFullYear()}-12-31`,
        ],
      },
    },
    group: [fn('date_format', col('date'), '%m')],
    paranoid: false,
  });

  const InvitationsStats = await Invitations.findAll({
    attributes: [
      [fn('date_format', col('createdAt'), '%m'), 'month'],
      [fn('count', col('id')), 'count'],
    ],
    where: {
      createdAt: {
        [Op.between]: [
          `${currentYear || new Date().getFullYear()}-01-01`,
          `${currentYear || new Date().getFullYear()}-12-31`,
        ],
      },
    },
    group: [fn('date_format', col('createdAt'), '%m')],
    paranoid: false,
  });
  const VipsStats = await Vips.findAll({
    attributes: [
      [fn('date_format', col('createdAt'), '%m'), 'month'],
      [fn('count', col('id')), 'count'],
    ],
    where: {
      createdAt: {
        [Op.between]: [
          `${currentYear || new Date().getFullYear()}-01-01`,
          `${currentYear || new Date().getFullYear()}-12-31`,
        ],
      },
    },
    group: [fn('date_format', col('createdAt'), '%m')],
    paranoid: false,
  });

  res.json({
    year: currentYear,
    events: eventStats,
    invitations: InvitationsStats,
    vips: VipsStats,
  });
});
