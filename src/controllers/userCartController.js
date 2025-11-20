import userCartService from "../services/userCartService";

let saveCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(200).json({ errCode: 1, errMessage: 'Vui lòng đăng nhập' });
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
    const userId = req.user?.id;
    if (!userId) return res.status(200).json({ errCode: 1, errMessage: 'Vui lòng đăng nhập' });
    const cart = await userCartService.getUserCart(userId);
    return res.status(200).json({ errCode: 0, data: cart });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi server' });
  }
};

export default { saveCart, getCart };
