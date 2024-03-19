const { DataTypes } = require('sequelize');
const { isEmail } = require('validator');

module.exports = (sequelize) => {
  const QrCodes = sequelize.define('QrCodes', {
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
    qrUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  return QrCodes;
};
