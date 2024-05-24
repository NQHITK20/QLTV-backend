const { Sequelize } = require('sequelize');

// Lấy thông tin kết nối từ biến môi trường
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
});

let connectDB = async () => {
    try {
        // Kiểm tra kết nối đến cơ sở dữ liệu
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

module.exports = connectDB;
