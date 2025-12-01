const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
    // Accept token via Authorization header or via cookie named 'token'
    let tokenHeader = req.headers['authorization'];
    if (!tokenHeader && req.headers && req.headers.cookie) {
        // parse cookies manually to find 'token'
        const cookieHeader = req.headers.cookie; // e.g. 'a=1; token=xxx; b=2'
        const parts = cookieHeader.split(';').map(c => c.trim());
        for (const p of parts) {
            if (p.startsWith('token=')) {
                const cookieVal = p.substring('token='.length);
                // Treat cookie value as a Bearer token
                tokenHeader = 'Bearer ' + cookieVal;
                break;
            }
        }
    }

    if (!tokenHeader) {
        return res.status(401).json({ message: 'Không có token, từ chối truy cập' });
    }

    try {
        const tokenParts = tokenHeader.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return res.status(401).json({ message: 'Token không hợp lệ' });
        }

        const decoded = jwt.verify(tokenParts[1], process.env.JWT);
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token đã hết hạn' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token không hợp lệ' });
        }
        return res.status(500).json({ message: 'Lỗi xác thực token' });
    }
};


module.exports =  checkAuth;
