import orderService from "../services/orderService"

let list = async (req, res) => {
  try {
    const { status } = req.query;
    const orders = await orderService.listOrders(status);
    return res.status(200).json({ errCode: 0, orders });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi từ server' });
  }
}

let detail = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(200).json({ errCode: 1, errMessage: 'Thiếu id đơn hàng' });
    const order = await orderService.getOrderDetail(id);
    if (!order) return res.status(200).json({ errCode: 2, errMessage: 'Không tìm thấy đơn hàng' });
    return res.status(200).json({ errCode: 0, order });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi từ server' });
  }
}

let updateStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) return res.status(200).json({ errCode: 1, errMessage: 'Thiếu id hoặc status' });
    const order = await orderService.updateOrderStatus(id, status);
    if (!order) return res.status(200).json({ errCode: 2, errMessage: 'Không tìm thấy đơn hàng' });
    return res.status(200).json({ errCode: 0, order });
  } catch (error) {
    console.error(error);
    return res.status(200).json({ errCode: -1, errMessage: 'Lỗi từ server' });
  }
}

export default { list, detail, updateStatus };
