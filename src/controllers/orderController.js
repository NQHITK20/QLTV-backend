import orderService from '../services/orderService';
import db from '../models';
import { translatePaymentStatus } from '../utils/paymentStatus';
let createOrder = async (req, res) => {
  try {
    const body = req.body || {};
    // prefer authenticated user, but allow null for guest/paypal flows
    const userId = req.user?.id || body.userId || null;
    const idempotencyKey = req.get('Idempotency-Key') || body.idempotencyKey || null;

    // normalize buyer (may be stringified)
    let buyer = body.buyer || { firstName: body.firstName || '', lastName: body.lastName || '', email: body.email || '', phoneNumber: body.phoneNumber || '', address: body.address || '', addressNote: body.addressNote || '' };
    if (buyer && typeof buyer === 'string') {
      try { buyer = JSON.parse(buyer); } catch (e) { /* ignore parse error */ }
    }

    const items = Array.isArray(body.items) ? body.items : [];

    // accept totals from client, or compute from items
    let subtotal = Number(body.subtotal != null ? body.subtotal : 0);
    let shipping = Number(body.shipping != null ? body.shipping : 0);
    let tax = Number(body.tax != null ? body.tax : 0);
    if ((!subtotal || subtotal === 0) && items.length) {
      subtotal = items.reduce((s, it) => s + (Number(it.subtotal != null ? it.subtotal : (Number(it.unitPrice || it.price || 0) * Number(it.quantity || it.qty || 1)))), 0);
      subtotal = Math.round(subtotal * 100) / 100;
    }
    // default tax to 10% if not provided
    if (!tax && subtotal) tax = Math.round(subtotal * 0.1 * 100) / 100;
    if (!shipping) shipping = Number(shipping || 0);
    const total = Number(body.total != null ? body.total : Math.round((subtotal + shipping + tax) * 100) / 100);

    const paymentMethod = (body.paymentMethod || 'cod').toLowerCase();
    const provider = body.provider || paymentMethod;
    const providerPaymentId = body.providerPaymentId || body.providerId || null;
    const image = body.image || null;
    const currency = body.currency || 'USD';

    // create order
    const result = await orderService.createOrder({ idempotencyKey, userId, buyer, items, subtotal, shipping, tax, total, paymentMethod, provider, currency });
    if (result.existing) {
      // ensure providerPaymentId saved if provided
      try { if (providerPaymentId && result.order && result.order.id) await orderService.saveProviderInfo(result.order.id, { providerPaymentId, raw: { providerPaymentId } }); } catch(e){/* ignore */}
      return res.status(200).json({ errCode: 0, message: 'Order already exists', orderId: result.order.id, data: result.order });
    }

    // save providerPaymentId if provided, otherwise auto-generate for COD
    try {
      if (providerPaymentId && result.order && result.order.id) {
        const saved = await orderService.saveProviderInfo(result.order.id, { providerPaymentId, raw: { providerPaymentId, provider } });
        if (saved && saved.order) result.order = saved.order;
      } else if (paymentMethod === 'cod' && result.order && result.order.id && !result.order.providerPaymentId) {
        const genId = `COD-${result.order.id}`;
        try {
          const saved = await orderService.saveProviderInfo(result.order.id, { providerPaymentId: genId, raw: { generated: true } });
          if (saved && saved.order) result.order = saved.order;
        } catch (e) { console.warn('auto saveProviderInfo failed', e); }
      }
    } catch (e) { console.warn('saveProviderInfo failed', e); }

    // return created order
    return res.status(200).json({ errCode: 0, message: 'Order created', orderId: result.order.id, data: result.order });
  } catch (error) {
    console.error('createOrder error', error);
    return res.status(500).json({ errCode: -1, errMessage: 'Lỗi tạo đơn', error: (error && error.message) ? error.message : null });
  }
};

let getMyOrders = (req, res) => {
  return new Promise(async (resolve, reject) => {
    try {
      const authUserId = req.user?.id;
      const requestedUserId = req.body?.userId || req.query?.userId;
      const isAdmin = req.user && (req.user.role === "3" || req.user.role === 3);

      // Nếu là admin và không yêu cầu userId cụ thể, trả về tất cả đơn
      const userId = (!isAdmin) ? (authUserId || requestedUserId) : (requestedUserId || null);
      if (!isAdmin && !userId) {
        res.status(401).json({ errCode: 1, errMessage: 'Vui lòng đăng nhập' });
        return resolve(null);
      }

      // Fetch orders and items in two queries to avoid Sequelize internal include bugs
      const findOptions = { order: [['createdAt', 'DESC']], raw: true };
      if (userId) findOptions.where = { userId };
      const orders = await db.Order.findAll(findOptions);

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

      // Lấy tên người dùng nếu buyer không có tên đầy đủ
      const missingUserIds = [];
      for (const o of orders) {
        try {
          const hasBuyerName = o.buyer && (o.buyer.firstName || o.buyer.lastName);
          if (!hasBuyerName && o.userId) missingUserIds.push(o.userId);
        } catch (e) { }
      }
      const uniqueMissingUserIds = Array.from(new Set(missingUserIds.filter(Boolean)));
      let usersById = {};
      if (uniqueMissingUserIds.length) {
        const users = await db.User.findAll({ where: { id: uniqueMissingUserIds }, attributes: ['id','firstName','lastName'], raw: true });
        usersById = users.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
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

        // Tính fullName ưu tiên buyer, nếu không có thì dùng user table
        let fullName = '-';
        try {
          if (o.buyer && (o.buyer.firstName || o.buyer.lastName)) {
            fullName = ((o.buyer.firstName || '') + ' ' + (o.buyer.lastName || '')).trim() || '-';
          } else if (o.userId && usersById[o.userId]) {
            const u = usersById[o.userId];
            fullName = ((u.firstName || '') + ' ' + (u.lastName || '')).trim() || '-';
          }
        } catch (e) { }

        // Tính total và áp thêm 10%
        const totalOrig = Number(o.total || 0);
        const totalWithExtra = Number((totalOrig * 1.1).toFixed(2));

        return {
          id: o.id,
          createdAt: o.createdAt,
          status: o.status || o.state || 'unknown',
          statusText: translatePaymentStatus(o.status || o.state || 'unknown'),
          items: plainItems,
          buyer: o.buyer || null,
          fullName,
          total: totalOrig,
          totalWithExtra
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
let getAdminOrders = (req, res) => {
  return new Promise(async (resolve, reject) => {
    try {
      // fetch orders
      const orders = await db.Order.findAll({ order: [['createdAt', 'DESC']], raw: true });

      // fetch user names for orders where buyer not provided
      const userIds = Array.from(new Set(orders.map(o => o.userId).filter(Boolean)));
      let usersById = {};
      if (userIds.length) {
        const users = await db.User.findAll({ where: { id: userIds }, attributes: ['id','firstName','lastName'], raw: true });
        usersById = users.reduce((acc,u)=>{ acc[u.id]=u; return acc; }, {});
      }

      const out = orders.map(o => {
        let customer = '-';
        try {
          if (o.buyer && (o.buyer.firstName || o.buyer.lastName)) {
            customer = ((o.buyer.firstName || '') + ' ' + (o.buyer.lastName || '')).trim();
          } else if (o.userId && usersById[o.userId]) {
            const u = usersById[o.userId];
            customer = ((u.firstName||'') + ' ' + (u.lastName||'')).trim();
          }
        } catch (e) { /* ignore */ }

        return {
          id: o.id,
          orderCode: o.providerPaymentId || `ORD-${o.id}`,
          customer,
          createdAt: o.createdAt,
          total: Number(o.total || 0),
          status: o.status || 'pending',
        };
      });

      res.status(200).json({ errCode: 0, data: out });
      return resolve(out);
    } catch (err) {
      console.error('getAdminOrders error', err);
      res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi lấy danh sách đơn hàng' });
      return reject(err);
    }
  });
};

module.exports = { createOrder, getMyOrders, getAdminOrders };

