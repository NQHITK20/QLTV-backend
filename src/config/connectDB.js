'use strict';
const fs = require('fs')
const { Sequelize } = require('sequelize'); // Correct the import path if needed
require('dotenv').config();
const serverCa = [fs.readFileSync(certificatePath, 'utf8')]

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 15,
    min: parseInt(process.env.DB_POOL_MIN) || 5,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 20000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 30000
  },
  dialectOptions: {
    ssl: {
    rejectUnauthorized: true,
    ca: serverCa
    }
  }
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
