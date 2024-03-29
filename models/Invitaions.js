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
      defaultValue: 'approved',
      allowNull: false,
    },
    peopleCount: {
      type: DataTypes.INTEGER, // Change to INTEGER
      allowNull: true,
    },
    peopleNames: {
      type: DataTypes.JSON, // Defines an array of integers
      allowNull: true,
      get() {
        // Parse the stored JSON string when fetching the value
        const rawValue = this.getDataValue('peopleNames');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        // Stringify the JSON object when setting the value
        this.setDataValue('peopleNames', value ? JSON.stringify(value) : null);
      },
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
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    products: {
      type: DataTypes.JSON, // Defines an array of integers
      allowNull: true,
      get() {
        // Parse the stored JSON string when fetching the value
        const rawValue = this.getDataValue('products');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        // Stringify the JSON object when setting the value
        this.setDataValue('products', value ? JSON.stringify(value) : null);
      },
    },
  });

  return Invitations;
};
