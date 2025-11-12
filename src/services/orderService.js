const db = require('../models');

const OrderService = {
  createOrder: async (userId, items, total) => {
    try {
      const order = await db.Order.create({ userId, items, total, status: 'pending' });
      return order;
    } catch (error) {
      throw error;
    }
  },

  listOrders: async (status) => {
    try {
      const where = {};
      if (status && status !== 'all') where.status = status;
      const orders = await db.Order.findAll({ where, order: [['createdAt', 'DESC']] });
      return orders;
    } catch (error) {
      throw error;
    }
  },

  getOrderDetail: async (id) => {
    try {
      const order = await db.Order.findByPk(id);
      return order;
    } catch (error) {
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const order = await db.Order.findByPk(id);
      if (!order) return null;
      order.status = status;
      await order.save();
      return order;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = OrderService;
