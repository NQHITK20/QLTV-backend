import orderService from '../services/orderService';

// Helper: build PayPal purchase_units from items with proper amount.breakdown
function toFixedString(n) {
  return Number(n || 0).toFixed(2);
}

function buildPurchaseUnits(items = [], shipping = 0, tax = 0, currency = 'USD') {
  const itemsFormatted = (items || []).map(it => ({
    name: it.bookname || it.name || it.bookName || 'Item',
    unit_amount: { currency_code: currency, value: toFixedString(it.unitPrice || it.unit_amount || it.price || 0) },
    quantity: String(it.quantity || it.qty || 1)
  }));

  const itemTotal = (items || []).reduce((s, it) => s + (Number(it.unitPrice || it.unit_amount || it.price || 0) * Number(it.quantity || it.qty || 1)), 0);
  const shippingNum = Number(shipping || 0);
  const taxNum = Number(tax || 0);
  const total = itemTotal + shippingNum + taxNum;

  return [
    {
      reference_id: 'default',
      amount: {
        currency_code: currency,
        value: toFixedString(total),
        breakdown: {
          item_total: { currency_code: currency, value: toFixedString(itemTotal) },
          shipping: { currency_code: currency, value: toFixedString(shippingNum) },
          tax_total: { currency_code: currency, value: toFixedString(taxNum) }
        }
      },
      items: itemsFormatted
    }
  ];
}

let createPayment = async (req, res) => {
  try {
    const body = req.body || {};
    const userId = req.user?.id || body.userId || body.buyer?.userId || null;
    if (!userId) return res.status(200).json({ errCode: 1, errMessage: 'Vui lòng đăng nhập hoặc gửi userId' });

    const idempotencyKey = req.get('Idempotency-Key') || body.idempotencyKey || null;
    const items = Array.isArray(body.items) ? body.items : [];
    const subtotal = Number(body.subtotal || 0);
    const shipping = Number(body.shipping || 0);
    const tax = Number(body.tax || Math.round(subtotal * 0.05));
    const total = Number(body.total || subtotal + shipping + tax);
    const buyer = body.buyer || {};

    const paymentMethod = (body.paymentMethod || 'paypal').toLowerCase();

    // If payment method is paypal, do NOT create the DB order yet.
    // The DB order will be created after successful capture (or via webhook) to ensure we only save paid orders.
    let preCreatedOrder = null;
    if (paymentMethod !== 'paypal') {
      // create immediately for non-paypal methods (e.g., cod)
      const created = await orderService.createOrder({ idempotencyKey, userId, buyer, items, subtotal, shipping, tax, total, paymentMethod, provider: paymentMethod });
      preCreatedOrder = created.order || created;
    }

    // If PayPal credentials available, call PayPal create order API
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = process.env.PAYPAL_MODE || 'sandbox';
    if (clientId && clientSecret) {
      try {
        const tokenRes = await fetch((mode==='live'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com') + '/v1/oauth2/token', {
          method: 'POST',
          headers: { 'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'grant_type=client_credentials'
        });
        const tokenJson = await tokenRes.json();
        const accessToken = tokenJson.access_token;
        if (!accessToken) throw new Error('No PayPal access token');

        // Create PayPal order
          const currency = process.env.PAYPAL_CURRENCY || 'USD';
          const purchase_units = buildPurchaseUnits(items, shipping, tax, currency); // PayPal expects supported currency; adjust as needed
        // Build application_context with return/cancel URLs (can be configured via env)
        // Determine return/cancel URLs. Priority: explicit PAYPAL_RETURN_URL/CANCEL, then FRONTEND_URL, then localhost fallback.
        const port = process.env.PORT || '3000';
        const frontendBase = (process.env.FRONTEND_URL && process.env.FRONTEND_URL.replace(/\/$/, '')) || `http://localhost:${port}`;
        let returnUrl = (process.env.PAYPAL_RETURN_URL && process.env.PAYPAL_RETURN_URL) || `http://localhost/QLTV-ChatboxAi/frontend/admin-ui/paypal-return.html`;
        let cancelUrl = (process.env.PAYPAL_CANCEL_URL && process.env.PAYPAL_CANCEL_URL) || `http://localhost/QLTV-ChatboxAi/frontend/admin-ui/paypal-cancel.html`;
        // append local order id so the return page can correlate the PayPal token with our DB order
        try {
          const rSep = returnUrl.includes('?') ? '&' : '?';
          const cSep = cancelUrl.includes('?') ? '&' : '?';
          returnUrl = `${returnUrl}${rSep}localOrderId=${encodeURIComponent(order.id)}`;
          cancelUrl = `${cancelUrl}${cSep}localOrderId=${encodeURIComponent(order.id)}`;
        } catch (e) { /* ignore */ }

        const createBody = { intent: 'CAPTURE', purchase_units };
        if (returnUrl || cancelUrl) {
          createBody.application_context = {};
          if (returnUrl) createBody.application_context.return_url = returnUrl;
          if (cancelUrl) createBody.application_context.cancel_url = cancelUrl;
        }

        const createRes = await fetch((mode==='live'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com') + '/v2/checkout/orders', {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer ' + accessToken },
          body: JSON.stringify(createBody)
        });
        const createJson = await createRes.json();
        const providerPaymentId = createJson.id;
        // If we pre-created an order (non-paypal) save provider info there (best-effort)
        try {
          if (preCreatedOrder && preCreatedOrder.id) await orderService.saveProviderInfo(preCreatedOrder.id, { providerPaymentId, raw: createJson });
        } catch(e){ /* don't block response */ }

        // find approval link
        const approval = (createJson.links||[]).find(l=>l.rel==='approve');
        return res.status(200).json({ errCode: 0, approvalUrl: approval ? approval.href : null, providerPaymentId });
      } catch (e) {
        console.error('PayPal create error', e);
        // Fallthrough to mock response below
      }
    }

    // If no PayPal creds or real API failed, return a mock approval URL so frontend can be tested
    const mockProviderId = 'MOCK-' + (preCreatedOrder ? preCreatedOrder.id : ('tmp-' + Date.now()));
    try { if (preCreatedOrder && preCreatedOrder.id) await orderService.saveProviderInfo(preCreatedOrder.id, { providerPaymentId: mockProviderId, raw: { mock: true } }); } catch(e){ /* ignore */ }
    const mockUrl = `/mock-paypal-approve?providerId=${mockProviderId}`;
    return res.status(200).json({ errCode: 0, approvalUrl: mockUrl, providerPaymentId: mockProviderId });
  } catch (error) {
    console.error('createPayment error', error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi khởi tạo thanh toán' });
  }
};

// Simple webhook placeholder: expects { providerPaymentId, orderId, status }
let webhookPayPal = async (req, res) => {
  try {
    const body = req.body || {};
    const orderId = body.orderId || body.resource?.invoice_id || null;
    const providerPaymentId = body.providerPaymentId || body.resource?.id || null;
    const status = body.status || body.resource?.status || 'COMPLETED';
    if (!orderId && !providerPaymentId) return res.status(400).send('Missing orderId/providerPaymentId');

    // For simplicity: if status looks successful, mark order paid
    if (status === 'COMPLETED' || status === 'CAPTURED' || status === 'APPROVED' || status === 'completed') {
      // try to find order by id or providerPaymentId then mark paid
      try {
        if (orderId) await orderService.markPaid(orderId, { providerPaymentId, raw: body });
        // else: find order by providerPaymentId (not implemented here)
      } catch(e) { console.error('webhook markPaid error', e); }
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('webhook error', error);
    return res.status(500).send('ERR');
  }
};

let capturePayment = async (req, res) => {
  try {
    const body = req.body || {};
    const providerPaymentId = body.providerPaymentId || body.token || body.orderID || body.orderId || null;
    const localOrderId = body.localOrderId || body.orderId || body.local_order_id || null;

    if (!providerPaymentId && !localOrderId) return res.status(400).json({ errCode: 1, errMessage: 'providerPaymentId or localOrderId required' });

    // find order either by local id or by providerPaymentId
    const db = require('../models');
    let order = null;
    if (localOrderId) order = await db.Order.findOne({ where: { id: localOrderId } });
    if (!order && providerPaymentId) order = await db.Order.findOne({ where: { providerPaymentId } });
    // If order not found, we'll attempt to create it after successful capture (so orders are only saved when paid)
    // but keep a reference to whether we created it here
    let createdOrder = null;

    if (order && order.status === 'paid') return res.status(200).json({ errCode: 0, message: 'Order already paid', orderId: order.id });

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = process.env.PAYPAL_MODE || 'sandbox';
    if (!clientId || !clientSecret) return res.status(500).json({ errCode: -1, errMessage: 'PayPal credentials not configured' });

    // get access token
    const tokenRes = await fetch((mode==='live'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com') + '/v1/oauth2/token', {
      method: 'POST',
      headers: { 'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=client_credentials'
    });
    const tokenJson = await tokenRes.json();
    const accessToken = tokenJson.access_token;
    if (!accessToken) return res.status(500).json({ errCode: -1, errMessage: 'Cannot obtain PayPal access token', raw: tokenJson });

    // call capture
    const targetOrderId = providerPaymentId || order.providerPaymentId;
    const capRes = await fetch((mode==='live'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com') + `/v2/checkout/orders/${targetOrderId}/capture`, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer ' + accessToken }
    });
    const capJson = await capRes.json();
    if (!capRes.ok) {
      return res.status(400).json({ errCode: -1, errMessage: 'Capture failed', raw: capJson });
    }

    // determine success from response
    const captured = (capJson.status && (capJson.status === 'COMPLETED')) ||
      ((capJson.purchase_units || [])[0] && ((capJson.purchase_units[0].payments && capJson.purchase_units[0].payments.captures && capJson.purchase_units[0].payments.captures[0] && (capJson.purchase_units[0].payments.captures[0].status === 'COMPLETED'))));

    if (captured) {
      try {
        // if we didn't find order earlier, create it now using purchase unit info
        if (!order) {
          // build items from capture response
          const pu = (capJson.purchase_units || [])[0] || {};
          const capItems = (pu.items || []).map(it => ({
            bookname: it.name || it.description || '',
            image: it.sku || '',
            unitPrice: Number(it.unit_amount && it.unit_amount.value ? it.unit_amount.value : 0),
            quantity: Number(it.quantity || 1),
            subtotal: Number((it.unit_amount && it.unit_amount.value ? it.unit_amount.value : 0) * Number(it.quantity || 1))
          }));
          const subtotalCalc = capItems.reduce((s,i)=>s+ (Number(i.subtotal||0)),0);
          const totalCalc = Number(pu.amount && pu.amount.value ? pu.amount.value : subtotalCalc);
          const buyerInfo = req.user ? { firstName: req.user.firstName || req.user.name || '', lastName: req.user.lastName || '', email: req.user.email || '' } : {};
          const created = await orderService.createOrder({ idempotencyKey: null, userId: req.user?.id || null, buyer: buyerInfo, items: capItems, subtotal: subtotalCalc, shipping: 0, tax: 0, total: totalCalc, paymentMethod: 'paypal', provider: 'paypal' });
          createdOrder = created.order || created;
          order = createdOrder;
        }

        await orderService.markPaid(order.id, { providerPaymentId: targetOrderId, raw: capJson });
      } catch (e) { console.error('markPaid error', e); }

      const finalOrderId = order ? order.id : (createdOrder ? createdOrder.id : null);
      const redirectUrl = `/QLTV-ChatboxAi/frontend/index.php?orderId=${finalOrderId}`;
      return res.status(200).json({ errCode: 0, message: 'Capture successful', capture: capJson, orderId: finalOrderId, redirectUrl });
    }

    return res.status(400).json({ errCode: -1, errMessage: 'Capture did not return completed status', raw: capJson });
  } catch (error) {
    console.error('capturePayment error', error);
    return res.status(500).json({ errCode: -1, errMessage: 'Capture error', raw: (error && error.message) ? { message: error.message } : null });
  }
};

export default { createPayment, webhookPayPal, capturePayment };
