'use strict';

// Sử dụng require để import các module
const express = require('express');
const bodyParser = require('body-parser');
const initWebRoute = require('./route/web');
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

// Khởi tạo ứng dụng Express
const app = express();

// Sử dụng middleware để kích hoạt CORS và xử lý body của request
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Kết nối tới cơ sở dữ liệu và sau đó khởi tạo các route của ứng dụng
connectToDatabase().then(() => {
  // Sử dụng middleware CORS sau khi kết nối tới cơ sở dữ liệu thành công
  const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204
  };
  app.use(cors(corsOptions));

  // Khởi tạo các route của ứng dụng sau khi kết nối tới cơ sở dữ liệu thành công
  initWebRoute(app);

  // Lắng nghe các kết nối tới cổng PORT hoặc cổng mặc định 8000
  const port = process.env.PORT || 3306;
  app.listen(port, () => {
    console.log(`Backend nodejs is running on port ${port}`);
  });
}).catch(error => {
  console.error('Failed to start the server:', error);
});

// Xuất khẩu ứng dụng Express để sử dụng trong các test hoặc mục đích khác
module.exports = app;
