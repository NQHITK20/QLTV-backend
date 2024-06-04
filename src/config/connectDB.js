'use strict';
const { Sequelize } = require('sequelize'); // Correct the import path if needed
require('dotenv').config();

const sequelize = new Sequelize('qltv', 'root', '', {
  host: '127.0.0.1',
  dialect: 'mysql',
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 15,
    min: parseInt(process.env.DB_POOL_MIN) || 5,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 20000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 30000
  },
});
let connectToDatabase = async () => {
  try {
      await sequelize.authenticate();
      console.log('Connection has been established successfully.');
  } catch (error) {
      console.error('Unable to connect to the database:', error);
      console.log('check sequelize',sequelize)
  }
}

module.exports = connectToDatabase;
