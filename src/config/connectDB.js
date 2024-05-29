'use strict';

const Sequelize = require('sequelize');
const mysql2 = require('mysql2');
require('dotenv').config();

//Test
// const sequelize = new Sequelize(
//     'qltv',     // Tên database
//     'root',     // Tên người dùng MySQL
//     '',         // Mật khẩu MySQL
//     {
//       dialect: 'mysql',
//       dialectModule: mysql2, // Sử dụng mysql2 module cho Sequelize
//       host: 'localhost',     // Địa chỉ host của MySQL
//       port: 3306,             // Cổng của MySQL
//       pool: {
//         max: 10,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//       }
//     }
//   );

// Khởi tạo đối tượng Sequelize cho kết nối database
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'mysql',
    dialectModule: mysql2, // Sử dụng mysql2 module cho Sequelize
    host: process.env.DB_HOST,
    port: process.env.DB_PORT, // Sử dụng biến môi trường DB_PORT
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    }
  }
);

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

module.exports = connectToDatabase;
