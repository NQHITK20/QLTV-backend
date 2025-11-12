const db = require('../models'); // Import models từ Sequelize

/**
 * Hàm xử lý dữ liệu đầu vào thành mảng các đối tượng
 * @param {Object} inputData - Dữ liệu từ client
 * @returns {Array} - Mảng đối tượng đã chuẩn bị
 */
const processDataForBulkCreate = (inputData) => {
  const borrowcode = inputData.borrowcode;
  const books = inputData.data;

  // Nếu books là mảng hoặc object, chuyển về mảng các object
  let keys = [];
  if (Array.isArray(books)) keys = books.map((b, i) => i);
  else keys = Object.keys(books || {});

  const result = keys.map((key) => {
    const book = Array.isArray(books) ? books[key] : books[key];
    return {
      borrowcode: borrowcode,
      bookcode: book?.bookcode,
      bookname: book?.bookname,
      soluong: book?.soluong,
    };
  });

  return result;
};

/**
 * Hàm lưu dữ liệu vào bảng BorrowBook
 * - Validate dữ liệu
 * - Dùng transaction để đảm bảo atomic
 * @param {Object} inputData - Dữ liệu từ client
 * @returns {Promise} - Promise resolve/reject giống các service khác
 */
const createBorrowBook = (inputData) => {
  return new Promise(async (resolve, reject) => {
    let transaction;
    try {
      // Quick validation for required top-level fields
      if (!inputData || !inputData.borrowcode || !inputData.data) {
        return resolve({ errCode: 1, errMessage: 'Thiếu dữ liệu đầu vào (borrowcode hoặc data)' });
      }

      const preparedData = processDataForBulkCreate(inputData);
      if (!Array.isArray(preparedData) || preparedData.length === 0) {
        return resolve({ errCode: 1, errMessage: 'Không có dữ liệu để lưu' });
      }

      // Validate each item
      const errors = [];
      preparedData.forEach((item, idx) => {
        if (!item.bookcode || typeof item.bookcode !== 'string' || !item.bookcode.trim()) {
          errors.push({ index: idx, field: 'bookcode', message: 'bookcode bắt buộc' });
        }
        if (!item.bookname || typeof item.bookname !== 'string' || !item.bookname.trim()) {
          errors.push({ index: idx, field: 'bookname', message: 'bookname bắt buộc' });
        }
        if (item.soluong == null || isNaN(Number(item.soluong)) || Number(item.soluong) <= 0) {
          errors.push({ index: idx, field: 'soluong', message: 'soluong phải là số lớn hơn 0' });
        }
      });
      if (errors.length) {
        return resolve({ errCode: 2, errMessage: 'Dữ liệu đầu vào không hợp lệ', errors });
      }

      // Use transaction to ensure all-or-nothing insert
      transaction = await db.sequelize.transaction();
      const created = await db.borrowBook.bulkCreate(preparedData, { transaction, validate: true });
      await transaction.commit();
      return resolve({ errCode: 0, message: 'Dữ liệu đã được lưu thành công!', data: created });
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.error('Lỗi khi lưu BorrowBook:', error);
      return reject(error);
    }
  });
};

module.exports = {
  createBorrowBook,
  processDataForBulkCreate,
};
