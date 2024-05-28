// Import thư viện dotenv và cấu hình
require('dotenv').config();

const { Sequelize } = require('sequelize');

// Lấy các biến môi trường từ file .env
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
    pool: {
        max: parseInt(process.env.DB_POOL_MAX) || 10,
        min: parseInt(process.env.DB_POOL_MIN) || 0,
        acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
        idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    }
});

// Kiểm tra kết nối đến cơ sở dữ liệu
async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

// Gọi hàm connectDB để kết nối đến cơ sở dữ liệu khi ứng dụng khởi động
connectDB();

// Export sequelize để có thể sử dụng trong các module khác
module.exports = sequelize;
