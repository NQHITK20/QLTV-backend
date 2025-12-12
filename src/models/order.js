'use strict';
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    userId: DataTypes.INTEGER,
    subtotal: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
    shipping: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
    tax: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(12,2), defaultValue: 0 },
    currency: { type: DataTypes.STRING, defaultValue: 'USD' },
    paymentMethod: DataTypes.STRING,
    provider: DataTypes.STRING,
    providerPaymentId: DataTypes.STRING,
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    buyer: DataTypes.JSON,
    metadata: DataTypes.JSON,
    idempotencyKey: DataTypes.STRING
  }, {
    tableName: 'orders'
  });

  Order.associate = function(models){
    Order.hasMany(models.OrderItem, { foreignKey: 'orderId', as: 'items' });
  };

  return Order;
};
