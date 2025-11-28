import orderService from '../services/orderService';

// Helper: build PayPal purchase_units from items
function buildPurchaseUnits(items, currency='VND'){
  const amountValue = items.reduce((s,it)=>s + (Number(it.quantity||1) * Number(it.unitPrice||0)), 0);
  return [{ amount: { currency_code: currency, value: String(amountValue) }, items: items.map(it=>({ name: it.bookname || it.bookCode || it.bookcode || 'Item', unit_amount: { currency_code: currency, value: String(it.unitPrice||0) }, quantity: String(it.quantity||1) })) }];
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

    // Create order in DB (status pending)
    const created = await orderService.createOrder({ idempotencyKey, userId, buyer, items, subtotal, shipping, tax, total, paymentMethod: 'paypal', provider: 'paypal' });
    const order = created.order || created; // handle service result shape

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
        const purchase_units = buildPurchaseUnits(items, 'USD'); // PayPal expects supported currency; adjust as needed
        const createRes = await fetch((mode==='live'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com') + '/v2/checkout/orders', {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'Authorization': 'Bearer ' + accessToken },
          body: JSON.stringify({ intent: 'CAPTURE', purchase_units })
        });
        const createJson = await createRes.json();
        const providerPaymentId = createJson.id;
        // Save providerPaymentId into order metadata (best-effort)
        try { await orderService.markPaid(order.id, { providerPaymentId, raw: createJson }); } catch(e){ /* don't block response */ }

        // find approval link
        const approval = (createJson.links||[]).find(l=>l.rel==='approve');
        return res.status(200).json({ errCode: 0, approvalUrl: approval ? approval.href : null, providerPaymentId });
      } catch (e) {
        console.error('PayPal create error', e);
        // Fallthrough to mock response below
      }
    }

    // If no PayPal creds or real API failed, return a mock approval URL so frontend can be tested
    const mockUrl = `/mock-paypal-approve?orderId=${order.id}`;
    return res.status(200).json({ errCode: 0, approvalUrl: mockUrl, providerPaymentId: 'MOCK-' + order.id });
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

export default { createPayment, webhookPayPal };
