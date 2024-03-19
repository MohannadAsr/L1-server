const { DataTypes } = require('sequelize');
const { isEmail } = require('validator');

module.exports = (sequelize) => {
  const InviteOptions = sequelize.define('InviteOptions', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    invitationId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    vipId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    peopleCount: {
      type: DataTypes.INTEGER, // Change to INTEGER
      allowNull: true,
    },
    tableReservation: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    deliveryOption: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    deliveryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  return InviteOptions;
};
