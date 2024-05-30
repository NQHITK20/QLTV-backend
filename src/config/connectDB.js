'use strict';

import { Sequelize } from 'sequelize'; // Correct the import path if needed
const mysql2 = require('mysql2');
const retry = require('async-retry');
require('dotenv').config();

let sequelize;

// Hàm khởi tạo Sequelize
function initializeSequelize() {
  sequelize = new Sequelize(
    'sql12710182',  // DB_NAME
    'sql12710182',  // DB_USER
    'SMziuZ7Tkd',   // DB_PASSWORD
    {
      dialect: 'mysql',
      dialectModule: mysql2,
      host: 'sql12.freesqldatabase.com',  // DB_HOST
      port: 3307,  // PORT
      pool: {
        max: 30,  // DB_POOL_MAX
        min: 0,   // DB_POOL_MIN
        acquire: 90000,  // DB_POOL_ACQUIRE
        idle: 10000,  // DB_POOL_IDLE
        evict: 15000,
      },
      dialectOptions: {
        connectTimeout: 120000, // 120 giây
        reconnect: true, // Tự động kết nối lại khi bị mất kết nối
        retryAttempts: 5, // Số lần thử lại khi kết nối thất bại
        retryDelay: 30000 // Thời gian chờ giữa các lần thử lại (milliseconds)
      }
    }
  );
}

// Hàm kết nối tới cơ sở dữ liệu và đồng bộ hóa Sequelize
async function connectToDatabase() {
  console.log('Trying to connect via Sequelize...');
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Đồng bộ hóa Sequelize với database
    console.log('=> Created a new connection.');
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

// Hàm kết nối với thử lại
async function connectWithRetry() {
  await retry(async (bail, attempt) => {
    try {
      console.log(`Attempt ${attempt} to connect to the database...`);
      await connectToDatabase();
      console.log('Kết nối đã được thiết lập thành công.');
    } catch (error) {
      console.error('Không thể kết nối tới cơ sở dữ liệu:', error);
      if (/Deadlock/i.test(error.message) || error instanceof Sequelize.ConnectionError) {
        console.log(`Retry attempt ${attempt}: ${error.message}`);
        throw error;
      } else {
        bail(error); // Do not retry for other types of errors
      }
    }
  }, {
    retries: 3, // Maximum retry 3 times
    minTimeout: 5000, // Initial backoff duration in milliseconds
    factor: 2, // Exponent to increase backoff each try
  });
}

// Khởi tạo Sequelize và thử kết nối lại
initializeSequelize();
connectWithRetry().catch(err => {
  console.error('Failed to connect after multiple retries:', err);
});

module.exports = connectToDatabase;
