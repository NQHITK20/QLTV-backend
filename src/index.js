'use strict';

// Sử dụng require để import các module
const express = require('express');
const bodyParser = require('body-parser');
const initWebRoute = require('./route/web');
const connectToDatabase = require('./config/connectDB');
const cors = require('cors');
require('dotenv').config();

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
