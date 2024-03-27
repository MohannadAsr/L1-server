const { DataTypes } = require('sequelize');
const { isEmail } = require('validator');

module.exports = (sequelize) => {
  const Invitations = sequelize.define('Invitations', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    eventId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    vipId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    qrCodeId: {
      type: DataTypes.UUID,
      defaultValue: null,
      allowNull: true,
    },
    qrCodeUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM('approved', 'completed', 'missed'),
      defaultValue: 'pending',
      allowNull: false,
    },
    optionsId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  });

  return Invitations;
};
