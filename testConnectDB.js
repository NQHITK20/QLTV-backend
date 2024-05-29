const connectToDatabase = require('./path/to/connectToDatabase'); // Thay đổi đường dẫn tùy theo cấu trúc thư mục của bạn

connectToDatabase()
  .then(() => {
    console.log('Database connection successful.');
    process.exit(0); // Kết thúc quá trình với mã thành công
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    process.exit(1); // Kết thúc quá trình với mã lỗi
  });
