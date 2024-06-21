'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('categories', { // Đổi tên bảng thành 'Category' thay vì 'categories'
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            category: { // Đổi tên cột từ 'category' thành 'categories'
                type: Sequelize.STRING,
                allowNull: false,
            },
            createdAt: {
                allowNull: true,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: true,
                type: Sequelize.DATE
            }
        }, {
            freezeTableName: true // Giữ nguyên tên bảng, không chuyển đổi
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('categories');
    }
};
