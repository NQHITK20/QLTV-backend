'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      CartItem.belongsTo(models.Cart, { foreignKey: 'cartId', as: 'cart' });
      CartItem.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  CartItem.init({
    cartId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
    bookId: DataTypes.INTEGER,
    bookcode: DataTypes.STRING,
    bookname: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    price: DataTypes.DECIMAL(10,2),
    subtotal: DataTypes.DECIMAL(10,2)
  }, {
    sequelize,
    modelName: 'CartItem',
    tableName: 'cartitem'
  });

  return CartItem;
};
