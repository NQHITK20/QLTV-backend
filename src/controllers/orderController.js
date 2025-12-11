import orderService from '../services/orderService';
import db from '../models';
import { translatePaymentStatus } from '../utils/paymentStatus';

let createOrder = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || req.query.userId;
    if (!userId) return res.status(200).json({ errCode: 1, errMessage: 'Vui lòng đăng nhập hoặc gửi userId' });

    const body = req.body || {};
    const idempotencyKey = req.get('Idempotency-Key') || body.idempotencyKey || null;
    const items = Array.isArray(body.items) ? body.items : [];
    const subtotal = Number(body.subtotal || 0);
    const shipping = Number(body.shipping || 0);
    const tax = Number(body.tax || Math.round(subtotal * 0.05));
    const total = Number(body.total || subtotal + shipping + tax);
    const paymentMethod = body.paymentMethod || 'cod';
    const buyer = body.buyer || { firstName: body.firstName || '', lastName: body.lastName || '', email: body.email || '', phoneNumber: body.phoneNumber || '', address: body.address || '', addressNote: body.addressNote || '' };

    const result = await orderService.createOrder({ idempotencyKey, userId, buyer, items, subtotal, shipping, tax, total, paymentMethod });
    if (result.existing) {
      return res.status(200).json({ errCode: 0, message: 'Order already exists', orderId: result.order.id });
    }

    return res.status(200).json({ errCode: 0, message: 'Order created', orderId: result.order.id, data: result.order });
  } catch (error) {
    console.error('createOrder error', error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi tạo đơn' });
  }
};

let getMyOrders = (req, res) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userId = req.user?.id || req.body?.userId || req.query?.userId;
      if (!userId) {
        res.status(401).json({ errCode: 1, errMessage: 'Vui lòng đăng nhập' });
        return resolve(null);
      }

      // Fetch orders and items in two queries to avoid Sequelize internal include bugs
      const orders = await db.Order.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        raw: true
      });

      const orderIds = orders.map(o => o.id).filter(Boolean);
      let items = [];
      if (orderIds.length) {
        items = await db.OrderItem.findAll({ where: { orderId: orderIds }, raw: true });
      }

      const itemsByOrder = {};
      for (const it of items) {
        const oid = it.orderId;
        if (!itemsByOrder[oid]) itemsByOrder[oid] = [];
        itemsByOrder[oid].push(it);
      }

      // Map to a lightweight shape expected by the frontend orders table
      const out = orders.map((o) => {
        const plainItems = (itemsByOrder[o.id] || []).map(it => ({
          bookname: it.bookname || it.bookName || it.name || '',
          image: it.image || it.img || '',
          unitPrice: Number(it.unitPrice || it.price || 0),
          quantity: Number(it.quantity || it.qty || 1),
          subtotal: Number(it.subtotal || (Number(it.unitPrice || it.price || 0) * Number(it.quantity || it.qty || 1)) || 0)
        }));
        return {
          id: o.id,
          createdAt: o.createdAt,
          status: o.status || o.state || 'unknown',
          statusText: translatePaymentStatus(o.status || o.state || 'unknown'),
          items: plainItems
        };
      });
      res.status(200).json({ errCode: 0, data: out });
      return resolve(out);
    } catch (err) {
      console.error('getMyOrders error', err);
      res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi lấy đơn hàng' });
      return reject(err);
    }
  });
};

// expose getMyOrders alongside createOrder
module.exports = { createOrder, getMyOrders };

