import orderService from '../services/orderService';

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

export default { createOrder };

