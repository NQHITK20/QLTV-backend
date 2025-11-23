const db = require('../models');

const saveUserCart = async (userId, items, options = {}) => {
  // items: [{ bookId, bookcode, bookname, quantity, price }]
  // Chỉ lưu vào cartitem (giỏ hàng tạm), không tạo cart (cart dùng cho đơn đã thanh toán)
  if (!userId) throw new Error('userId required');
  if (!Array.isArray(items)) throw new Error('items must be an array');

  const transaction = await db.sequelize.transaction();
  try {
    // Thay vì xóa toàn bộ giỏ tạm, chúng ta sẽ gộp (upsert) từng item.
    // Nếu item cùng bookId tồn tại -> cộng số lượng; nếu không -> tạo mới.
    const processedItems = [];

    for (const it of items) {
      const qty = Number(it.quantity) || 1;
      const price = it.price != null ? Number(it.price) : null;
      const subtotal = price != null ? (qty * price) : null;

      // Nếu có bookId, tìm item hiện tại của user
      let existing = null;
      if (it.bookId) {
        existing = await db.CartItem.findOne({ where: { userId, bookId: it.bookId }, transaction });
      }

      if (existing) {
        // Cập nhật số lượng (cộng) và subtotal/price nếu cần
        const newQty = (Number(existing.quantity) || 0) + qty;
        const newPrice = price != null ? price : existing.price;
        const newSubtotal = newPrice != null ? (newQty * newPrice) : null;
        // also update image if provided
        const newImage = it.image != null ? it.image : existing.image;
        await existing.update({ quantity: newQty, price: newPrice, subtotal: newSubtotal, image: newImage }, { transaction });
        processedItems.push(existing);
      } else {
        // Tạo mới
        const created = await db.CartItem.create({
          userId,
          bookId: it.bookId || null,
          bookcode: it.bookcode || null,
          bookname: it.bookname || null,
          image: it.image || null,
          quantity: qty,
          price,
          subtotal
        }, { transaction });
        processedItems.push(created);
      }
    }

    // Tính tổng cho user: lấy tất cả item hiện tại
    const allItems = await db.CartItem.findAll({ where: { userId }, transaction });
    let total = 0;
    if (allItems.some(i => i.subtotal != null)) {
      total = allItems.reduce((s, it) => s + (Number(it.subtotal) || 0), 0);
    } else {
      total = allItems.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
    }

    await transaction.commit();
    return { errCode: 0, message: 'Cart saved', data: { total, itemCount: allItems.length } };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getUserCart = async (userId) => {
  if (!userId) throw new Error('userId required');
  // Lấy items tạm (chưa thanh toán)
  const items = await db.CartItem.findAll({ where: { userId } });
  return items;
};

module.exports = { saveUserCart, getUserCart };
