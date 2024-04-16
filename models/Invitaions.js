const { DataTypes } = require('sequelize');
const { isEmail } = require('validator');
const Vips = require('./Vips');
const Events = require('./Events');
const Tabels = require('./Tabels');

module.exports = (sequelize) => {
  const VipsModel = Vips(sequelize); // Call the Vips model definition function
  const EventsModel = Events(sequelize); // Call the Vips model definition function
  const TabelsModel = Tabels(sequelize); // Call the Vips model definition function
  const Invitations = sequelize.define(
    'Invitations',
    {
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
        type: DataTypes.ENUM('pending', 'approved', 'completed', 'missed'),
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
          this.setDataValue(
            'peopleNames',
            value ? JSON.stringify(value) : null
          );
        },
      },
      paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },
      paymentUrl: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      paymentId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      tableReservation: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      tableId: {
        type: DataTypes.UUID,
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
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
      },
    },
    { paranoid: true }
  );

  Invitations.belongsTo(VipsModel, { foreignKey: 'vipId', as: 'vip' });
  Invitations.belongsTo(EventsModel, { foreignKey: 'eventId', as: 'event' });
  Invitations.belongsTo(TabelsModel, { foreignKey: 'tableId', as: 'table' });

  return Invitations;
};
