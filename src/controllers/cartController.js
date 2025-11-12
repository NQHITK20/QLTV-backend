import cartService from "../services/cartService"
import orderService from "../services/orderService"

let addToCart = async (req, res) => {
  try {
    const { id, title, quantity } = req.body;
    if (!id) {
      return res.status(200).json({ errCode: 1, errMessage: 'Thiếu id sách' });
    }
    let cart = cartService.addToCart(req, { id, title, quantity });
    return res.status(200).json({ errCode: 0, cart });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi từ server' });
  }
}

let getCart = async (req, res) => {
  try {
    let cart = cartService.getCart(req);
    return res.status(200).json({ errCode: 0, cart });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi từ server' });
  }
}

let removeFromCart = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) {
      return res.status(200).json({ errCode: 1, errMessage: 'Thiếu id sách' });
    }
    let cart = cartService.removeFromCart(req, id);
    return res.status(200).json({ errCode: 0, cart });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi từ server' });
  }
}

let checkout = async (req, res) => {
  try {
    const userId = req.user?.id || 1; // adjust as needed
    const cart = cartService.getCart(req);
    if (!cart || cart.length === 0) {
      return res.status(200).json({ errCode: 1, errMessage: 'Giỏ hàng trống' });
    }
    const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const order = await orderService.createOrder(userId, cart, total);
    cartService.clearCart(req);
    return res.status(200).json({ errCode: 0, order });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi từ server' });
  }
}

export default {
  addToCart, getCart, removeFromCart, checkout
}
