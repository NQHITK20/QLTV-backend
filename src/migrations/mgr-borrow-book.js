'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('borrowbook', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            borrowcode: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            bookcode: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            bookname: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            soluong: {
                type: Sequelize.INTEGER,
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
        });
    },
    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('borrowbook');
    }
};