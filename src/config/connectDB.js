const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    dialect: 'mysql',
    dialectModule: mysql2,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 10,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 60000, // Tăng thời gian chờ lấy kết nối
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    },
  }
);
