const { DataTypes } = require('sequelize');
const Invitaions = require('./Invitaions');
const Vips = require('./Vips');
const Events = require('./Events');

module.exports = (sequelize) => {
  const InvitationModel = Invitaions(sequelize);
  const VipsModel = Vips(sequelize);
  const EventsModel = Events(sequelize);
  const Bills = sequelize.define(
    'Bills',
    {
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
      },
      vipId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      eventId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        defaultValue: new Date(),
        allowNull: true,
      },
      billDetails: {
        type: DataTypes.JSON,
        allowNull: false,
        get() {
          // Parse the stored JSON string when fetching the value
          const rawValue = this.getDataValue('billDetails');
          return rawValue ? JSON.parse(rawValue) : null;
        },
        set(value) {
          // Stringify the JSON object when setting the value
          this.setDataValue(
            'billDetails',
            value ? JSON.stringify(value) : null
          );
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

  Bills.belongsTo(InvitationModel, {
    foreignKey: 'invitationId',
    as: 'invitation',
    onDelete: 'CASCADE', // Cascade soft delete
  });
  Bills.belongsTo(VipsModel, {
    foreignKey: 'vipId',
    as: 'vip',
    onDelete: 'CASCADE', // Cascade soft delete
  });
  Bills.belongsTo(EventsModel, {
    foreignKey: 'eventId',
    as: 'event',
    onDelete: 'CASCADE', // Cascade soft delete
  });
  return Bills;
};
