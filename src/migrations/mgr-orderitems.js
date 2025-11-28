'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('orderitems', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.BIGINT },
      orderId: { type: Sequelize.BIGINT, allowNull: false },
      bookId: { type: Sequelize.INTEGER, allowNull: true },
      bookcode: { type: Sequelize.STRING, allowNull: true },
      bookname: { type: Sequelize.STRING, allowNull: true },
      image: { type: Sequelize.STRING, allowNull: true },
      quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
      unitPrice: { type: Sequelize.DECIMAL(12,2), allowNull: true },
      subtotal: { type: Sequelize.DECIMAL(12,2), allowNull: true },
      createdAt: { allowNull: true, type: Sequelize.DATE },
      updatedAt: { allowNull: true, type: Sequelize.DATE }
    });
    await queryInterface.addIndex('orderitems', ['orderId']);
    await queryInterface.addConstraint('orderitems', {
      fields: ['orderId'],
      type: 'foreign key',
      name: 'fk_orderitems_order',
      references: { table: 'orders', field: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('orderitems');
  }
};
