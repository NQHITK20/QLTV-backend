'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    static associate(models) {
      // CartItem is a temporary item linked to a user (cartId removed)
      CartItem.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  CartItem.init({
    // image: store book image filename/path for frontend
    image: DataTypes.STRING,
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
