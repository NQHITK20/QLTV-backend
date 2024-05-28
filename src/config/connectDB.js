const { Sequelize } = require('sequelize');

// Lấy thông tin kết nối từ biến môi trường
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Disable logging in production for performance and security reasons
    pool: {
        max: 10, // Maximum number of connections in pool
        min: 0,  // Minimum number of connections in pool
        acquire: 30000, // Maximum time (in ms) that pool will try to get connection before throwing error
        idle: 10000   // Maximum time (in ms) that a connection can be idle before being released
    },
    dialectOptions: {
        ssl: {
            require: true, // If your database requires SSL
            rejectUnauthorized: false // Adjust based on your security requirements
        }
    }
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
