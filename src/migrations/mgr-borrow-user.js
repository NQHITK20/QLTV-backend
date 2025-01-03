'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('borrowuser', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            fullname: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            borrowcode: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            dateborrow: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            datareturn: {
                type: Sequelize.DATE,
                allowNull: false,
            },
            borrowstatus: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            description: {
                type: Sequelize.STRING,
                allowNull: true,
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
        await queryInterface.dropTable('borrowuser');
    }
};