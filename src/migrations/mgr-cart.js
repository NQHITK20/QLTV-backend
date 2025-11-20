'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('cart', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      cartcode: { type: Sequelize.STRING, allowNull: true, unique: true },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'pending' },
      total: { type: Sequelize.DECIMAL(10,2), allowNull: true },
      createdAt: { allowNull: true, type: Sequelize.DATE },
      updatedAt: { allowNull: true, type: Sequelize.DATE }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('cart');
  }
};
