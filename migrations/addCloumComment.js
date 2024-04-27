'use strict';

module.exports = {
  // up: async (queryInterface, Sequelize) => {
  //   await queryInterface.addColumn('Bills', 'amount', {
  //     type: Sequelize.DataTypes.BIGINT,
  //     allowNull: false,
  //   });
  // },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Bills', 'billDetails');
  },
};
