const { DataTypes } = require('sequelize');
const Tables = require('./Tabels');
module.exports = (sequelize) => {
  const TablesModel = Tables(sequelize);

  const Events = sequelize.define(
    'Events',
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
      tableIds: {
        type: DataTypes.JSON, // Defines an array of integers
        allowNull: false,
        defaultValue: '[]',
        get() {
          // Parse the stored JSON string when fetching the value
          const rawValue = this.getDataValue('tableIds');
          return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
          // Stringify the JSON object when setting the value
          this.setDataValue('tableIds', value ? JSON.stringify(value) : null);
        },
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    { paranoid: true }
  );

  return Events;
};
