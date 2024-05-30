'use strict';

import { Sequelize } from '../models';
const mysql2 = require('mysql2');
const retry = require('async-retry');

require('dotenv').config();

let sequelize;

// Hàm khởi tạo Sequelize
function initializeSequelize() {
  const sequelize = new Sequelize(
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
        idle: 10000  // DB_POOL_IDLE
      },
      dialectOptions: {
        connectTimeout: 90000, // 60 giây
        // Thêm các tùy chọn bổ sung nếu cần
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
function connectWithRetry() {
  return retry((bail, attempt) => {
    return new Promise((resolve, reject) => {
      initializeSequelize();
      sequelize.authenticate()
        .then(() => {
          console.log('Kết nối đã được thiết lập thành công.');
          resolve();
        })
        .catch(error => {
          console.error('Không thể kết nối tới cơ sở dữ liệu:', error);
          if (/Deadlock/i.test(error.message) || error instanceof Sequelize.ConnectionError) {
            console.log(`Retry attempt ${attempt}: ${error.message}`);
            reject(error);
          } else {
            bail(error); // Do not retry for other types of errors
          }
        });
    });
  }, {
    retries: 3, // Maximum retry 3 times
    minTimeout: 3000, // Initial backoff duration in milliseconds
    factor: 1.5, // Exponent to increase backoff each try
  });
}

// Example usage
connectWithRetry().catch(err => {
  console.error('Failed to connect after multiple retries:', err);
});
module.exports = connectToDatabase;
