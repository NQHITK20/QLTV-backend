'use strict';

import { Sequelize } from 'sequelize'; // Correct the import path if needed
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  logging: false,
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
