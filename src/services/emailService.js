'use strict'
require('dotenv').config()
const db = require('../models');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');


let sendResetEmail = async (data) => {

    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: data.email }
            })
            if (!user) {
                resolve({
                    errCode: 2,
                    errMessage: `email này chưa được sử dụng .Vui lòng kiểm tra lại`
                })
            }
            else{
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                        user: process.env.EMAIL_APP,
                        pass: process.env.EMAIL_APP_PASSWORD,
                    },
                });
            
                // send mail with defined transport object
                // verify transporter first to provide clearer auth errors
                try { await transporter.verify(); } catch(e) { throw new Error('Email transporter verify failed: ' + (e && e.message)); }

                const info = await transporter.sendMail({
                    from: '"Web-app Quản lý thư viện"', // sender address
                    to: user.email, // list of receivers
                    subject: "Xác nhận yêu cầu đổi mật khẩu", // Subject line
                    html: getBodyHTML(user)
                }); 
                resolve({
                    errCode: 0,
                })       
            }    
        } catch (error) {
            reject(error)
        }
    }) 
}

let getBodyHTML = (data) => {
       let result = `<h3>Xin chào ${data.firstName} ${data.lastName}!</h3>
        <p>Bạn có yêu cầu được đổi mật khẩu</p>
        
        <p>Vui lòng nhấn vào link bên dưới để xác nhận</p>
        
        <div><a href="http://localhost/QLTV-ChatboxAi/frontend/admin-ui/pages-reset-password.html?id=${data.id}" target="_blank">Bấm vào đây</a></div>
`
    return result
}

let sendOrderNotification = async ({ toEmail, firstName, lastName, orderId, providerPaymentId = null, provider = null, type = 'paypal', frontendBase }) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!toEmail) return resolve({ errCode: 2, errMessage: 'Recipient email required' });

            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: process.env.EMAIL_APP,
                    pass: process.env.EMAIL_APP_PASSWORD,
                },
            });

            // build frontend URLs
            const base = (frontendBase && frontendBase.replace(/\/$/, '')) || (process.env.FRONTEND_URL && process.env.FRONTEND_URL.replace(/\/$/, '')) || `http://localhost/QLTV-ChatboxAi/frontend`;
            const logoUrl = `${base}/images/logo.png`;
            // try to find local logo file in several common frontend paths and attach as inline CID
            const projectRoot = path.resolve(__dirname, '..', '..', '..');
            const candidatePaths = [
                path.join(projectRoot, 'frontend', 'admin-ui', 'images', 'logo.png'),
                path.join(projectRoot, 'frontend', 'images', 'logo.png'),
                path.join(projectRoot, 'frontend', 'images', 'logo-02.png'),
                path.join(projectRoot, 'frontend', 'admin-ui', 'images', 'logo-02.png'),
                path.join(projectRoot, 'frontend', 'images', 'flogo.png')
            ];
            let localLogoPath = null;
            for (const p of candidatePaths) {
                if (fs.existsSync(p)) { localLogoPath = p; break; }
            }
            const hasLocalLogo = !!localLogoPath;
            const ordersUrl = `${base}/orders.php`;
            const orderLink = `${ordersUrl}?orderId=${encodeURIComponent(orderId || '')}`;

            const subject = (type === 'approved') ? `Đơn hàng #${orderId} — Đã được duyệt` : `Thanh toán thành công — Đơn #${orderId}`;
            const recipientName = ((firstName || '') + ' ' + (lastName || '')).trim();
            const greeting = recipientName ? `Kính chào ${recipientName},` : `Kính chào Quý khách,`;
            const statusLine = (type === 'approved') ? `Đơn hàng <strong>#${orderId}</strong> của bạn đã được <strong>duyệt</strong>.` : `Chúng tôi xác nhận thanh toán cho đơn hàng <strong>#${orderId}</strong> đã <strong>thành công</strong>.`;
            const imgSrc = hasLocalLogo ? 'cid:site-logo' : logoUrl;
                const html = `
                    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#333; max-width:640px; margin:0 auto;">
                        <div style="padding:20px 0; text-align:left;">
                            <img src="${imgSrc}" alt="Logo" style="max-height:64px;">
                        </div>
                        <div style="background:#ffffff; border:1px solid #e6e9ee; border-radius:8px; padding:24px; box-shadow:0 1px 3px rgba(16,24,40,0.05);">
                            <p style="margin:0 0 16px; font-size:16px;">${greeting}</p>
                            <p style="margin:0 0 20px; font-size:15px; line-height:1.5;">${statusLine}</p>

                            <div style="padding:12px; background:#f7f9fc; border-radius:6px; margin-bottom:20px;">
                                ${providerPaymentId ? `<p style="margin:4px 0 0; font-size:13px;color:#666">Mã giao dịch: <strong>${providerPaymentId}</strong>${provider ? ` <small style="color:#999">(${provider.toUpperCase()})</small>` : ''}</p>` : ''}
                                <p style="margin:4px 0 0; font-size:13px;color:#666">Ngày: ${new Date().toLocaleString('vi-VN')}</p>
                            </div>

                            <div style="text-align:left; margin-bottom:18px;">
                                <a href="${orderLink}" target="_blank" style="display:inline-block; background:#0d6efd; color:#fff; padding:12px 18px; border-radius:6px; text-decoration:none; font-weight:600;">Xem chi tiết đơn hàng</a>
                            </div>

                            <p style="color:#6b7280; font-size:13px; line-height:1.5;">Nếu bạn cần trợ giúp, vui lòng liên hệ với chúng tôi tại <a href="mailto:${process.env.SUPPORT_EMAIL || process.env.EMAIL_APP || 'support@example.com'}">${process.env.SUPPORT_EMAIL || process.env.EMAIL_APP || 'support@example.com'}</a>.</p>
                            <div style="height:1px; background:#eef2f7; margin:20px 0;"></div>
                            <p style="margin:0; font-size:13px; color:#374151;">Trân trọng,<br><strong>Đội ngũ Web-app Quản lý thư viện</strong></p>
                        </div>
                        <p style="text-align:center; color:#9ca3af; font-size:12px; margin-top:12px;">Bạn nhận được email này vì bạn đã tạo đơn hàng trên hệ thống của chúng tôi. Nếu bạn không yêu cầu thông báo này, vui lòng bỏ qua hoặc liên hệ admin.</p>
                    </div>
                `;

                // plain-text fallback
                const text = `${recipientName ? 'Kính chào ' + recipientName + ',' : 'Kính chào,'}\n\n${type === 'approved' ? `Đơn hàng #${orderId} của bạn đã được duyệt.` : `Thanh toán cho đơn hàng #${orderId} đã thành công.`}${providerPaymentId ? `\nMã giao dịch: ${providerPaymentId}${provider ? ` (${provider.toUpperCase()})` : ''}` : ''}\n\nXem chi tiết: ${orderLink}\n\nNếu cần trợ giúp liên hệ: ${process.env.SUPPORT_EMAIL || process.env.EMAIL_APP || 'support@example.com'}\n\nTrân trọng,\nĐội ngũ Web-app Quản lý thư viện`;

            const mailOptions = {
                from: '"Web-app Quản lý thư viện" <' + (process.env.EMAIL_APP || 'no-reply@example.com') + '>',
                to: toEmail,
                subject,
                html,
                text,
            };

            if (hasLocalLogo) {
                // log which local logo was chosen for easier debugging
                try { console.debug('emailService: using local logo at', localLogoPath); } catch(e){}
                mailOptions.attachments = [{ filename: path.basename(localLogoPath), path: localLogoPath, cid: 'site-logo' }];
            }

            const info = await transporter.sendMail(mailOptions);

            return resolve({ errCode: 0, info });
        } catch (error) {
            return reject(error);
        }
    });
}

module.exports = {
    sendResetEmail,
    getBodyHTML,
    sendOrderNotification
}