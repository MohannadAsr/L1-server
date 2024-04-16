
const FilterFn = (filterOptions) => {
  const whereClause = {};
  // For Regex
  // whereClause[key] = {
  //   [Op.iLike]: `%${filterOptions[key]}%`,
  // };
  for (const key in filterOptions) {
    if (filterOptions[key] && key !== 'startDate' && key !== 'endDate') {
      whereClause[key] = filterOptions[key];
    }
  }

  if (filterOptions.startDate && filterOptions.endDate) {
    whereClause.createdAt = {
      [Op.between]: [
        new Date(filterOptions.startDate),
        new Date(filterOptions.endDate),
      ],
    };
  } else if (filterOptions.startDate && !filterOptions.endDate) {
    // Handle the case when only one of startDate or endDate is provided
    whereClause.createdAt = {
      [Op.gte]: new Date(filterOptions.startDate),
    };
  } else if (!filterOptions.startDate && filterOptions.endDate) {
    whereClause.createdAt = {
      [Op.between]: [new Date(), new Date(filterOptions.endDate)],
    };
  }

  return whereClause;
};

module.exports = FilterFn;
