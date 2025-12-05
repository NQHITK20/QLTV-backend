import orderService from '../services/orderService';
const emailService = require('../services/emailService');

let notifyOrder = async (req, res) => {
  try {
    const body = req.body || {};
    const { orderId, type } = body;
    if (!orderId) return res.status(400).json({ errCode: 1, errMessage: 'orderId required' });

    const db = require('../models');
    const order = await db.Order.findOne({ where: { id: orderId } });
    if (!order) return res.status(404).json({ errCode: 2, errMessage: 'Order not found' });

    // Prefer looking up user by order.userId for email/name; fallback to order.buyer
    let toEmail = null;
    let firstName = '';
    let lastName = '';

    if (order.userId) {
      const user = await db.User.findOne({ where: { id: order.userId } });
      if (user) {
        toEmail = user.email || null;
        firstName = user.firstName || user.firstname || '';
        lastName = user.lastName || user.lastname || '';
      }
    }

    // fallback to buyer information stored in order if user lookup failed
    if (!toEmail) {
      const buyer = order.buyer || {};
      toEmail = buyer.email || order.email || null;
      firstName = firstName || buyer.firstName || buyer.firstname || '';
      lastName = lastName || buyer.lastName || buyer.lastname || '';
    }

    if (!toEmail) return res.status(400).json({ errCode: 3, errMessage: 'No recipient email found for order (check User or Order.buyer)' });

    const frontendBase = (process.env.FRONTEND_URL && process.env.FRONTEND_URL.replace(/\/$/, '')) || null;

    const result = await emailService.sendOrderNotification({ toEmail, firstName, lastName, orderId, type, frontendBase });
    return res.status(200).json({ errCode: 0, message: 'Notification sent', result });
  } catch (error) {
    console.error('notifyOrder error', error);
    return res.status(500).json({ errCode: -1, errMessage: 'Lỗi gửi thông báo', raw: error && error.message });
  }
};

export default { notifyOrder };
