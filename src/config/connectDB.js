const { Sequelize } = require('sequelize');

// Lấy thông tin kết nối từ biến môi trường
const sequelize = new Sequelize('test', 'root', null, {
    host: 'localhost',
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
