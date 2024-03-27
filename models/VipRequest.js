const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VipRequest = sequelize.define('VipRequest', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: null,
    },
    email: {
      type: DataTypes.STRING, // Assuming your email will be a string
      allowNull: true,
      defaultValue: null,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return VipRequest;
};
