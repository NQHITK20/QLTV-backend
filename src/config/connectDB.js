'use strict';

import { Sequelize } from '../models';
const mysql2 = require('mysql2');
const retry = require('async-retry');

require('dotenv').config();

let sequelize;

// Hàm khởi tạo Sequelize
function initializeSequelize() {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      dialect: 'mysql',
      dialectModule: mysql2,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 10,
        min: parseInt(process.env.DB_POOL_MIN) || 0,
        acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
        idle: parseInt(process.env.DB_POOL_IDLE) || 10000
      },
      dialectOptions: {
        connectTimeout: 60000, // 60 giây
        // Thêm các tùy chọn bổ sung nếu cần
        reconnect: true, // Tự động kết nối lại khi bị mất kết nối
        retryAttempts: 3, // Số lần thử lại khi kết nối thất bại
        retryDelay: 1000 // Thời gian chờ giữa các lần thử lại (milliseconds)
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
  await retry(async () => {
    initializeSequelize();
    try {
      await sequelize.authenticate();
      console.log('Kết nối đã được thiết lập thành công.');
    } catch (error) {
      console.error('Không thể kết nối tới cơ sở dữ liệu:', error);
      throw error;
    }
  }, {
    retries: 5, // Số lần thử lại
    minTimeout: 1000, // Thời gian chờ tối thiểu giữa các lần thử lại (milliseconds)
    onRetry: (err, attempt) => {
      console.log(`Retry attempt ${attempt}: ${err.message}`);
    }
  });
}

// Khởi động kết nối với thử lại
connectWithRetry();

module.exports = connectToDatabase;
