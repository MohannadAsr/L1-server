const { DataTypes } = require('sequelize');
const { isEmail } = require('validator');

module.exports = (sequelize) => {
  const Vips = sequelize.define('Vips', {
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
      unique: true,
      defaultValue: null,
      validate: {
        isEmail: {
          msg: 'Invalid email format',
          validator: (value) => isEmail(value),
        },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  });

  return Vips;
};
