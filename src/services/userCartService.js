const db = require('../models');

const saveUserCart = async (userId, items, options = {}) => {
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
        const newImage = it.image != null ? it.image : (existing.image || null);
        // Use Model.update with where clause to avoid calling instance.update on a plain object
        await db.CartItem.update(
          { quantity: newQty, price: newPrice, subtotal: newSubtotal, image: newImage },
          { where: { id: existing.id }, transaction }
        );
        // Re-fetch the updated row to obtain a model instance (or current data)
        const updated = await db.CartItem.findOne({ where: { id: existing.id }, transaction });
        processedItems.push(updated);
      } else {
        // Tạo mới (bao gồm bookcode và image nếu client gửi)
        const created = await db.CartItem.create({
          userId,
          bookId: it.bookId || null,
          bookcode: it.bookcode || it.bookCode || null,
          bookname: it.bookname || null,
          quantity: qty,
          price,
          subtotal,
          image: it.image || null
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


// Trả về top 3 mục trong giỏ hàng (mới nhất) cùng tổng số mục
const getCart3 = async (userId) => {
  if (!userId) throw new Error('userId required');

  // Lấy 3 mục mới nhất
  const topItems = await db.CartItem.findAll({ where: { userId }, limit: 3, order: [['createdAt', 'DESC']] });

  // Đếm tổng số mục
  const allItems = await db.CartItem.findAll({ where: { userId } });
  const itemCount = allItems.length;

  const results = [];
  for (const ci of topItems) {
    try {
      if (ci.bookId) {
        // Nếu có liên kết bookId, lấy thông tin sách từ bảng Book
        const book = await db.Book.findOne({ where: { id: ci.bookId } });
        if (book) {
          results.push(book);
          continue;
        }
      }

      // Nếu không có bookId hoặc không tìm thấy Book, trả về dữ liệu từ cartitem
      results.push({
        bookId: ci.bookId || null,
        bookname: ci.bookname || null,
        quantity: ci.quantity || null,
        price: ci.price || null,
        subtotal: ci.subtotal || null
      });
    } catch (error) {
      console.error('Error loading cart item book:', error);
    }
  }

  return { errCode: 0, results, itemCount };
};

// Xóa một cart item theo cartItem id (yêu cầu cartItemId)
const deleteCartItem = async (userId, cartItemId) => {
  if (!userId) throw new Error('userId required');
  if (!cartItemId && cartItemId !== 0) throw new Error('cartItemId required');

  // Support special flag: if cartItemId is string 'ALL' (case-insensitive), delete all items for user
  if (String(cartItemId).toUpperCase() === 'ALL') {
    await db.CartItem.destroy({ where: { userId } });
    return { errCode: 0, message: 'Deleted all', itemCount: 0 };
  }

  const idNum = Number(cartItemId);
  if (!Number.isFinite(idNum) || idNum <= 0) return { errCode: 1, errMessage: 'Invalid cartItemId' };

  const item = await db.CartItem.findOne({ where: { userId, id: idNum } });
  if (!item) return { errCode: 1, errMessage: 'Cart item not found' };
  await db.CartItem.destroy({ where: { userId, id: idNum } });

  // Return remaining count
  const remainingCount = await db.CartItem.count({ where: { userId } });
  return { errCode: 0, message: 'Deleted', itemCount: remainingCount };
};

module.exports = { saveUserCart, getUserCart, getCart3, deleteCartItem };
