const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Images = sequelize.define('Images', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    imagename: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });
  return Images;
};
