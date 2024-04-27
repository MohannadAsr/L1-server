const catchAsync = require('../utils/catchAsync');
const { Bills, Invitations, Vips, Events } = require('../models');
const AppError = require('../utils/appError');
const { Pagination } = require('../utils/Pagination');

exports.getAllBills = catchAsync(async (req, res, next) => {
  const PaginationInstance = new Pagination(
    parseInt(req.query.pageIndex) || 1,
    parseInt(req.query.pageSize) || 10
  );

  const count = await Bills.count();
  const AllBills = await Bills.findAll({
    include: {
      model: Invitations,
      as: 'invitation',
      include: [
        {
          model: Vips,
          as: 'vip',
        },
        { model: Events, as: 'event' },
      ],
    },
  });

  const pagination = {
    ...PaginationInstance,
    totalPages: PaginationInstance.totalPages(count),
    totalCount: count,
  };
  res.status(200).json({
    data: AllBills,
    pagination,
  });
});

exports.deleteBills = catchAsync(async (req, res, next) => {
  const vipIds = req.body;

  // Delete users based on the provided array of user IDs
  const deletedVips = await Bills.destroy({
    where: { id: vipIds },
  });

  if (deletedVips > 0) {
    return res.status(200).json({ message: 'Vips deleted successfully' });
  } else {
    next(new AppError('No Vips found with the provided IDs', 404));
  }
});
