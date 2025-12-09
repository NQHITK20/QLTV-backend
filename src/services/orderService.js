const db = require('../models');

/**
 * Create an order + order items atomically. Supports idempotencyKey.
 * payload: { idempotencyKey, userId, buyer, items, subtotal, shipping, tax, total, paymentMethod, provider }
 */
const createOrder = (payload = {}) => {
  return new Promise(async (resolve, reject) => {
    const { idempotencyKey, userId, buyer, items = [], subtotal = 0, shipping = 0, tax = 0, total = 0, paymentMethod = 'cod', provider = null } = payload;

    try {
      if (!userId) throw new Error('userId required');
      if (!Array.isArray(items)) throw new Error('items must be array');

      // Idempotency: return existing order if same key and user
      if (idempotencyKey) {
        // Ensure we fetch a model instance (not raw) so callers can use instance methods if needed
        const exist = await db.Order.findOne({ where: { idempotencyKey, userId }, raw: false });
        if (exist) return resolve({ existing: true, order: exist });
      }

      const transaction = await db.sequelize.transaction();
      try {
        const order = await db.Order.create({
          userId,
          subtotal,
          shipping,
          tax,
          total,
          currency: 'VND',
          paymentMethod,
          provider,
          status: paymentMethod === 'cod' ? 'cod_pending' : 'pending',
          buyer: buyer || null,
          metadata: null,
          idempotencyKey: idempotencyKey || null
        }, { transaction });

        // Only include columns that exist in the `orderitems` table to avoid DB errors
        const itemsToCreate = items.map(it => ({
          orderId: order.id,
          bookId: it.bookId || null,
          bookname: it.bookname || it.bookName || null,
          image: it.image || null,
          quantity: Number(it.quantity || it.qty || 1),
          unitPrice: it.unitPrice != null ? it.unitPrice : (it.price != null ? it.price : null),
          subtotal: (Number(it.quantity || it.qty || 1) * (Number(it.unitPrice || it.price) || 0))
        }));

        if (itemsToCreate.length) {
          await db.OrderItem.bulkCreate(itemsToCreate, { transaction });
        }

        // Read created order within the same transaction to avoid post-commit errors
        // Force non-raw result so included associations return model instances
          const created = await db.Order.findOne({ where: { id: order.id }, include: [{ model: db.OrderItem, as: 'items' }], transaction, raw: false });
          await transaction.commit();
          // convert instance to plain object for callers
          const outOrder = (created && typeof created.get === 'function') ? created.get({ plain: true }) : created;
          return resolve({ existing: false, order: outOrder });
      } catch (err) {
        try { if (transaction && !transaction.finished) await transaction.rollback(); } catch(e) { /* ignore rollback errors */ }
        return reject(err);
      }
    } catch (err) {
      return reject(err);
    }
  });
};

/**
 * Mark order as paid and save provider data.
 */
const markPaid = (orderId, providerInfo = {}) => {
  return new Promise(async (resolve, reject) => {
    if (!orderId) return reject(new Error('orderId required'));
    const transaction = await db.sequelize.transaction();
    try {
      const order = await db.Order.findOne({ where: { id: orderId }, transaction, raw: false });
      if (!order) throw new Error('Order not found');
      order.status = 'paid';
      order.providerPaymentId = providerInfo.providerPaymentId || order.providerPaymentId;
      order.metadata = Object.assign({}, order.metadata || {}, providerInfo.raw || {});
      await order.save({ transaction });
      await transaction.commit();
        const outOrder = (order && typeof order.get === 'function') ? order.get({ plain: true }) : order;
        return resolve({ errCode: 0, order: outOrder });
    } catch (err) {
      try { if (transaction && !transaction.finished) await transaction.rollback(); } catch(e) { /* ignore rollback errors */ }
      return reject(err);
    }
  });
};

module.exports = { createOrder, markPaid };

/**
 * Save provider information (providerPaymentId and raw metadata) without changing order status.
 */
const saveProviderInfo = (orderId, providerInfo = {}) => {
  return new Promise(async (resolve, reject) => {
    if (!orderId) return reject(new Error('orderId required'));
    const transaction = await db.sequelize.transaction();
    try {
      const order = await db.Order.findOne({ where: { id: orderId }, transaction, raw: false });
      if (!order) throw new Error('Order not found');
      order.providerPaymentId = providerInfo.providerPaymentId || order.providerPaymentId;
      order.metadata = Object.assign({}, order.metadata || {}, providerInfo.raw || {});
      await order.save({ transaction });
      await transaction.commit();
        const outOrder = (order && typeof order.get === 'function') ? order.get({ plain: true }) : order;
        return resolve({ errCode: 0, order: outOrder });
    } catch (err) {
      try { if (transaction && !transaction.finished) await transaction.rollback(); } catch(e) { /* ignore rollback errors */ }
      return reject(err);
    }
  });
};

module.exports = { createOrder, markPaid, saveProviderInfo }; 
