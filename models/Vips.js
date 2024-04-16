const { DataTypes } = require('sequelize');
const { isEmail } = require('validator');
const Bills = require('./Bills');

module.exports = (sequelize) => {
  const Vips = sequelize.define(
    'Vips',
    {
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
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    { paranoid: true }
  );

  return Vips;
};
