import userCartService from "../services/userCartService";

let saveCart = async (req, res) => {
  try {
    // Lấy userId từ token hoặc body (fallback cho dev)
    const userId = req.user?.id || req.body.userId || req.query.userId;
    if (!userId) return res.status(200).json({ errCode: 1, errMessage: 'Vui lòng đăng nhập hoặc gửi userId' });
    // Support both: items array OR single-item fields (bookId, bookcode, bookName, quantity, price, image)
    let items = req.body.items;
    if (!Array.isArray(items)) {
      // Try to build single-item from body fields
      const bookId = req.body.bookId || req.body.bookid || null;
      const bookcode = req.body.bookcode || req.body.bookCode || null;
      const bookname = req.body.bookName || req.body.bookname || null;
      const quantity = req.body.qty || req.body.quantity || 1;
      const price = req.body.price != null ? req.body.price : (req.body.priCe || null);
      const image = req.body.image || null;
      if (bookId || bookcode || bookname) {
        items = [{ bookId: bookId ? Number(bookId) : null, bookcode, bookname, quantity: Number(quantity) || 1, price: price != null ? Number(price) : null, image }];
      } else {
        return res.status(200).json({ errCode: 1, errMessage: 'items phải là mảng hoặc gửi bookId/bookcode/bookName' });
      }
    }

    const result = await userCartService.saveUserCart(userId, items, { cartcode: req.body.cartcode });
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi server' });
  }
};

let getCart = async (req, res) => {
  try {
    // Lấy userId từ token, query hoặc body (hỗ trợ POST testing qua Postman)
    const userId = req.user?.id || req.query.userId || req.body?.userId;
    if (!userId) return res.status(200).json({ errCode: 1, errMessage: 'Vui lòng đăng nhập hoặc gửi userId' });
    const cart = await userCartService.getUserCart(userId);
    return res.status(200).json({ errCode: 0, data: cart });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi server' });
  }
};

let getCart3 = async (req, res) => {
  try {
    // Lấy userId từ token, query hoặc body
    const userId = req.user?.id || req.body?.userId || req.query?.userId;
    if (!userId) return res.status(200).json({ errCode: 1, errMessage: 'Vui lòng đăng nhập hoặc gửi userId' });
    const data = await userCartService.getCart3(userId);
    return res.status(200).json(data);
  } catch (error) {
    console.error(error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi server' });
  }
};

let deleteCartItem = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId || req.query.userId;
    if (!userId) return res.status(200).json({ errCode: 1, errMessage: 'Vui lòng đăng nhập hoặc gửi userId' });

    // Require cartItemId (id of cartitem) to delete
    const cartItemId = req.body.cartItemId || req.body.id || null;
    if (!cartItemId) return res.status(200).json({ errCode: 1, errMessage: 'cartItemId is required' });

    // Pass raw value so service can accept special flags like 'ALL'
    const rawId = cartItemId;
    const result = await userCartService.deleteCartItem(userId, rawId);
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi server' });
  }
};

export default { saveCart, getCart, getCart3, deleteCartItem };
