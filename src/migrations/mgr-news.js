'use strict';

const { first, last } = require("lodash");

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('news', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            image: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            author: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            showing: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            publicAt: {
                allowNull: true,
                type: Sequelize.DATE
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
        await queryInterface.dropTable('news');
    }
};