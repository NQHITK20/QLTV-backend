const db = require('../models'); // Import models từ Sequelize

/**
 * Hàm xử lý dữ liệu đầu vào thành mảng các đối tượng
 * @param {Object} inputData - Dữ liệu từ client
 * @returns {Array} - Mảng đối tượng đã chuẩn bị
 */
const processDataForBulkCreate = (inputData) => {
  const borrowcode = inputData.borrowcode;
  const books = inputData.data;

  // Chuyển đổi dữ liệu thành mảng các object
  const result = Object.keys(books).map((key) => {
    const book = books[key];
    return {
      borrowcode: borrowcode,
      bookcode: book.bookcode,
      bookname: book.bookname,
      soluong: book.soluong,
    };
  });

  return result;
};

/**
 * Hàm lưu dữ liệu vào bảng BorrowBook
 * @param {Object} inputData - Dữ liệu từ client
 * @returns {Promise} - Promise resolve nếu thành công, reject nếu lỗi
 */
const createBorrowBook = (inputData) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Xử lý dữ liệu đầu vào
      const preparedData = processDataForBulkCreate(inputData);

      // Lưu dữ liệu vào database
      await db.borrowBook.bulkCreate(preparedData);

      // Resolve khi thành công
      resolve({
        errcode: 0,
        message: 'Dữ liệu đã được lưu thành công!',
      });
    } catch (error) {
      // Reject khi có lỗi
      console.error('Lỗi khi lưu BorrowBook:', error);
      reject({
        errcode: 1,
        message: 'Lỗi khi lưu dữ liệu!',
        error,
      });
    }
  });
};

module.exports = {
  createBorrowBook,
  processDataForBulkCreate,
};
