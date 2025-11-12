// Cart service: store cart in session. Exposes helper functions used by controllers.

const CartService = {
  addToCart: (req, book) => {
    if (!req.session) req.session = {};
    if (!req.session.cart) req.session.cart = [];
    const id = Number(book.id);
    const idx = req.session.cart.findIndex(item => Number(item.id) === id);
    if (idx > -1) {
      req.session.cart[idx].quantity = (req.session.cart[idx].quantity || 0) + (book.quantity || 1);
    } else {
      req.session.cart.push({ id, title: book.title || '', quantity: book.quantity || 1 });
    }
    return req.session.cart;
  },

  getCart: (req) => {
    if (!req.session) return [];
    return req.session.cart || [];
  },

  removeFromCart: (req, bookId) => {
    if (!req.session) return [];
    const id = Number(bookId);
    req.session.cart = (req.session.cart || []).filter(item => Number(item.id) !== id);
    return req.session.cart;
  },

  clearCart: (req) => {
    if (req.session) req.session.cart = [];
  }
};

module.exports = CartService;
