const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Events = sequelize.define('Events', {
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
    },
    description: {
      type: DataTypes.TEXT,

      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    imageId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });
  return Events;
};
