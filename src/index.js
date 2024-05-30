'use strict';

// Sử dụng require để import các module
const express = require('express');
const bodyParser = require('body-parser');
const initWebRoute = require('./route/web');
const connectToDatabase = require('./config/connectDB');
require('dotenv').config();

// Khởi tạo ứng dụng Express
const app = express();

// Sử dụng middleware để kích hoạt CORS và xử lý body của request
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Kết nối tới cơ sở dữ liệu và sau đó khởi tạo các route của ứng dụng
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', "*");

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

connectToDatabase();
initWebRoute(app);
let port = process.env.PORT;
app.listen(port, () => {
    // callback
    console.log("Backend nodejs is running on port", +port);
})


// Xuất khẩu ứng dụng Express để sử dụng trong các test hoặc mục đích khác
module.exports = app;
