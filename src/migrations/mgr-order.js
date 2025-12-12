'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orders', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      userId: { type: Sequelize.INTEGER, allowNull: true },
      subtotal: { type: Sequelize.DECIMAL(12,2), defaultValue: 0 },
      shipping: { type: Sequelize.DECIMAL(12,2), defaultValue: 0 },
      tax: { type: Sequelize.DECIMAL(12,2), defaultValue: 0 },
      total: { type: Sequelize.DECIMAL(12,2), defaultValue: 0 },
      currency: { type: Sequelize.STRING, defaultValue: 'USD' },
      paymentMethod: { type: Sequelize.STRING },
      provider: { type: Sequelize.STRING },
      providerPaymentId: { type: Sequelize.STRING },
      status: { type: Sequelize.STRING, defaultValue: 'pending' },
      buyer: { type: Sequelize.JSON, allowNull: true },
      metadata: { type: Sequelize.JSON, allowNull: true },
      idempotencyKey: { type: Sequelize.STRING, allowNull: true },
      createdAt: { allowNull: true, type: Sequelize.DATE },
      updatedAt: { allowNull: true, type: Sequelize.DATE }
    });
    await queryInterface.addIndex('orders', ['userId']);
    await queryInterface.addIndex('orders', ['providerPaymentId']);
    await queryInterface.addIndex('orders', ['status']);
    await queryInterface.addIndex('orders', ['idempotencyKey']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('orders');
  }
};
