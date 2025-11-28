'use strict';
module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define('OrderItem', {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    bookId: DataTypes.INTEGER,
    bookcode: DataTypes.STRING,
    bookname: DataTypes.STRING,
    image: DataTypes.STRING,
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    unitPrice: DataTypes.DECIMAL(12,2),
    subtotal: DataTypes.DECIMAL(12,2)
  }, {
    tableName: 'orderitems'
  });

  OrderItem.associate = function(models){
    OrderItem.belongsTo(models.Order, { foreignKey: 'orderId' });
  };

  return OrderItem;
};
