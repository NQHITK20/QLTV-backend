'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // define association here if needed
      Order.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Order.init({
    userId: DataTypes.INTEGER,
    items: DataTypes.JSON,
    status: DataTypes.ENUM('pending', 'completed', 'cancelled'),
    total: DataTypes.FLOAT,
  }, {
    sequelize,
    modelName: 'Order',
  });

  return Order;
};
