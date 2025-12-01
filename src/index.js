'use strict';

// Sử dụng require để import các module
const express = require('express');
const bodyParser = require('body-parser');
const initWebRoute = require('./route/web');
const connectToDatabase = require('./config/connectDB');
require('dotenv').config();
const cors = require('cors');

// Khởi tạo ứng dụng Express
const app = express();

// Sử dụng middleware để kích hoạt CORS và xử lý body của request
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Kết nối tới cơ sở dữ liệu và sau đó khởi tạo các route của ứng dụng
// Enable CORS with credentials support. Do NOT use wildcard '*' when credentials=true.
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests from the configured FRONTEND_URL or from same-origin during dev
        const allowed = (process.env.FRONTEND_URL) ? [process.env.FRONTEND_URL] : null;
        if (!origin) return callback(null, true); // allow non-browser requests like curl/postman
        if (allowed && allowed.indexOf(origin) !== -1) return callback(null, true);
        // if no FRONTEND_URL configured, allow the origin (useful for local dev)
        if (!allowed) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
};
app.use(cors(corsOptions));

connectToDatabase();
initWebRoute(app);
let port = process.env.PORT;
app.listen(port, () => {
    // callback
    console.log("Backend nodejs is running on port", +port);
})


// Xuất khẩu ứng dụng Express để sử dụng trong các test hoặc mục đích khác
module.exports = app;
