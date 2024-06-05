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

const checkIsUser = (req, res, next) => {
    const userIdFromToken = req.user.id; 
    const userIdFromParams = req.params.userId; 

    if (userIdFromToken !== userIdFromParams) {
        return res.status(403).json({ message: 'Bạn không có quyền truy cập vào tài nguyên này' });
    }

    next();
};
module.exports = { checkAuth, checkIsUser };
