import userCartService from "../services/userCartService";

let saveCart = async (req, res) => {
  try {
    // Lấy userId từ token hoặc body (fallback cho dev)
    const userId = req.user?.id || req.body.userId || req.query.userId;
    if (!userId) return res.status(200).json({ errCode: 1, errMessage: 'Vui lòng đăng nhập hoặc gửi userId' });
    const items = req.body.items;
    if (!Array.isArray(items)) return res.status(200).json({ errCode: 1, errMessage: 'items phải là mảng' });

    const result = await userCartService.saveUserCart(userId, items, { cartcode: req.body.cartcode });
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi server' });
  }
};

let getCart = async (req, res) => {
  try {
    // Lấy userId từ token hoặc query (fallback cho dev)
    const userId = req.user?.id || req.query.userId;
    if (!userId) return res.status(200).json({ errCode: 1, errMessage: 'Vui lòng đăng nhập hoặc gửi userId' });
    const cart = await userCartService.getUserCart(userId);
    return res.status(200).json({ errCode: 0, data: cart });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi server' });
  }
};

export default { saveCart, getCart };
