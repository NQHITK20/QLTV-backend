const db = require('../models');

const saveUserCart = async (userId, items, options = {}) => {
  // items: [{ bookId, bookcode, bookname, quantity, price }]
  // Chỉ lưu vào cartitem (giỏ hàng tạm), không tạo cart (cart dùng cho đơn đã thanh toán)
  if (!userId) throw new Error('userId required');
  if (!Array.isArray(items)) throw new Error('items must be an array');

  const transaction = await db.sequelize.transaction();
  try {
    // Xóa items cũ của user này (giỏ hàng tạm)
    await db.CartItem.destroy({ where: { userId, cartId: null }, transaction });

    // Enrich items (ensure numeric fields)
    const itemsToInsert = items.map(it => {
      const qty = Number(it.quantity) || 1;
      const price = it.price != null ? Number(it.price) : null;
      const subtotal = price != null ? (qty * price) : null;
      return {
        cartId: null, // Không gắn với cart nào (giỏ hàng tạm)
        userId,
        bookId: it.bookId || null,
        bookcode: it.bookcode || null,
        bookname: it.bookname || null,
        quantity: qty,
        price,
        subtotal
      };
    });

    await db.CartItem.bulkCreate(itemsToInsert, { transaction });

    // Tính total
    let total = 0;
    if (itemsToInsert.some(i => i.subtotal != null)) {
      total = itemsToInsert.reduce((s, it) => s + (Number(it.subtotal) || 0), 0);
    } else {
      total = itemsToInsert.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
    }

    await transaction.commit();
    return { errCode: 0, message: 'Cart saved', data: { total, itemCount: itemsToInsert.length } };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getUserCart = async (userId) => {
  if (!userId) throw new Error('userId required');
  // Lấy items tạm (chưa thanh toán) - cartId = null
  const items = await db.CartItem.findAll({ where: { userId, cartId: null } });
  return items;
};

module.exports = { saveUserCart, getUserCart };
