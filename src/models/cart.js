'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      Cart.hasMany(models.CartItem, { foreignKey: 'cartId', as: 'items' });
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
