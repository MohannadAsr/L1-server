const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Processes = sequelize.define('Processes', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    handlerId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    handlerName: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    productsList: {
      type: DataTypes.TEXT, // Use TEXT type to store a JSON string
      allowNull: false,
      get() {
        // Parse the stored JSON string when fetching the value
        const rawValue = this.getDataValue('productsList');
        return rawValue ? JSON.parse(rawValue) : null;
      },
      set(value) {
        // Stringify the JSON object when setting the value
        this.setDataValue('productsList', value ? JSON.stringify(value) : null);
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      // defaultValue: Sequelize.fn('NOW'), // Alternatively, you can use NOW()
    },
  });

  return Processes;
};
