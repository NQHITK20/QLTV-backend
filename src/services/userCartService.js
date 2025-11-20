const db = require('../models');

const saveUserCart = async (userId, items, options = {}) => {
  // items: [{ bookId, bookcode, bookname, quantity, price }]
  if (!userId) throw new Error('userId required');
  if (!Array.isArray(items)) throw new Error('items must be an array');

  const transaction = await db.sequelize.transaction();
  try {
    // find existing pending cart
    let cart = await db.cart.findOne({ where: { userId, status: 'pending' }, transaction });
    if (!cart) {
      const cartcode = options.cartcode || `CART-${Date.now()}`;
      cart = await db.cart.create({ userId, cartcode, status: 'pending', total: 0 }, { transaction });
    }

    // remove existing items for the cart
    await db.cartitem.destroy({ where: { cartId: cart.id }, transaction });

    // enrich items (ensure numeric fields)
    const itemsToInsert = items.map(it => {
      const qty = Number(it.quantity) || 1;
      const price = it.price != null ? Number(it.price) : null;
      const subtotal = price != null ? (qty * price) : null;
      return {
        cartId: cart.id,
        userId,
        bookId: it.bookId || null,
        bookcode: it.bookcode || null,
        bookname: it.bookname || null,
        quantity: qty,
        price,
        subtotal
      };
    });

    await db.cartitem.bulkCreate(itemsToInsert, { transaction });

    // compute total from subtotals (if available) else sum quantity
    let total = 0;
    if (itemsToInsert.some(i => i.subtotal != null)) {
      total = itemsToInsert.reduce((s, it) => s + (Number(it.subtotal) || 0), 0);
    } else {
      total = itemsToInsert.reduce((s, it) => s + (Number(it.quantity) || 0), 0);
    }

    cart.total = total;
    await cart.save({ transaction });

    await transaction.commit();
    return { errCode: 0, message: 'Cart saved', data: { cartId: cart.id, cartcode: cart.cartcode, total } };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getUserCart = async (userId) => {
  if (!userId) throw new Error('userId required');
  const cart = await db.cart.findOne({ where: { userId, status: 'pending' }, include: [{ model: db.cartitem, as: 'items' }] });
  return cart;
};

module.exports = { saveUserCart, getUserCart };
