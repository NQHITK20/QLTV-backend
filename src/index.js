'use strict';

// Sử dụng require để import các module
const express = require('express');
const bodyParser = require('body-parser');
const initWebRoute = require('./route/web');
const connectDB = require('./config/connectDB');
const cors = require('cors');
const Sequelize = require('sequelize');
const mysql2 = require('mysql2');
require('dotenv').config();

// Khởi tạo đối tượng Sequelize cho kết nối database
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'mysql',
    dialectModule: mysql2, // Sử dụng mysql2 module cho Sequelize
    host: process.env.DB_HOST,
    port: process.env.DB_PORT // Sử dụng biến môi trường DB_PORT
  }
);

// Hàm kết nối tới cơ sở dữ liệu và đồng bộ hóa Sequelize
async function connectToDatabase() {
  console.log('Trying to connect via Sequelize...');
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // Đồng bộ hóa Sequelize với database
    console.log('=> Created a new connection.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

// Khởi tạo ứng dụng Express
const app = express();

// Sử dụng middleware để kích hoạt CORS và xử lý body của request
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Khởi tạo các route của ứng dụng
initWebRoute(app);

// Kết nối tới cơ sở dữ liệu
connectDB();

// Lắng nghe các kết nối tới cổng PORT hoặc cổng mặc định 8000
const port = process.env.PORT || 3306;
app.listen(port, () => {
  console.log(`Backend nodejs is running on port ${port}`);
});

// Xuất khẩu ứng dụng Express để sử dụng trong các test hoặc mục đích khác
module.exports = app;
