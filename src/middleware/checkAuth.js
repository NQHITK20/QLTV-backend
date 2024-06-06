const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Không có token, từ chối truy cập' });
    }

    try {
        const tokenParts = token.split(' ');
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
