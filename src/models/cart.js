'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      // Cart-items relationship removed because CartItem no longer stores cartId
      Cart.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Cart.init({
    userId: DataTypes.INTEGER,
    cartcode: DataTypes.STRING,
    status: DataTypes.STRING,
    total: DataTypes.DECIMAL(10,2)
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'cart'
  });

  return Cart;
};
