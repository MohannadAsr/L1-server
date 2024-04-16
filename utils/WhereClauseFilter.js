const { Op } = require('sequelize');

const WhereClauseFilter = (filters) => {
  let whereClause = {};

  filters.forEach((element) => {
    if (
      element.value !== null &&
      element.value !== undefined &&
      element.value !== ''
    ) {
      whereClause[element.key] = element.whereValue;
    }
  });

  return whereClause;
};

module.exports = WhereClauseFilter;
