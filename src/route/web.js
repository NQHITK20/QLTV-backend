import express from "express";
import userController from "../controllers/userController";
import bookController from "../controllers/bookcontroller";
import categoryController from "../controllers/categoryController";
import newController from "../controllers/newController";
import fvbookController from "../controllers/fvbookController";
import userCartController from "../controllers/userCartController";
import orderController from "../controllers/orderController";
import paymentController from "../controllers/paymentController";
import notificationController from "../controllers/notificationController";
import statisticsController from "../controllers/statisticsController";
import checkAuth from "../middleware/checkAuth";

let Router = express.Router();

let initWebRoute = (app) => {

    // Các yêu cầu user
    Router.post('/api/create-new-user', userController.createUser);
    Router.get('/api/get-all-user', checkAuth, userController.getAllUser);
    Router.post('/api/login', userController.handleLogin);
    Router.post('/api/get-user-by-id', checkAuth, userController.getUser); 
    Router.post('/api/edit-user', checkAuth, userController.editUser);
    Router.delete('/api/delete-user', checkAuth, userController.deleteUser); 
    Router.post('/api/send-email-to-change-password', userController.sendResetEmail);
    Router.post('/api/request-to-change-password', userController.requestResetEmail);
    Router.get('/api/get-count', checkAuth, userController.getCount); 
    Router.post('/api/export-data-user', checkAuth, userController.exportDataUser); 

    // Book
    Router.post('/api/create-new-book', checkAuth, bookController.createBook); 
    Router.get('/api/get-all-category',bookController.getAllCategory);
    Router.post('/api/get-all-book',  bookController.getAllBook);
    Router.post('/api/get-books-by-category', bookController.getBooksByCategory);
    Router.post('/api/search-book',  bookController.searchBook);
    Router.post('/api/get-related-book', bookController.getRelatedBook); 
    Router.post('/api/show-hide-book', checkAuth, bookController.showHideBook); 
    Router.post('/api/edit-book', checkAuth, bookController.editBook); 
    Router.delete('/api/delete-book', checkAuth, bookController.deleteBook);
    Router.post('/api/export-data-book', checkAuth, bookController.exportDataBook);

    //Category
    Router.post('/api/create-category', checkAuth, categoryController.createCategory);
    Router.delete('/api/delete-category', checkAuth, categoryController.deleteCategory);
    Router.post('/api/edit-category', checkAuth, categoryController.editCategory);
    Router.post('/api/get-category-by-id',categoryController.getCategory);

    //News
    Router.post('/api/create-news', checkAuth, newController.createNew);
    Router.post('/api/get-news', newController.getNew);
    Router.post('/api/edit-news', checkAuth, newController.editNew);
    Router.delete('/api/delete-news', checkAuth, newController.deleteNew);
    Router.post('/api/show-hide-new', checkAuth, newController.showHideNew); 

    //FvBook
    Router.post('/api/create-fvbook',  fvbookController.createNewFv);
    Router.post('/api/get-fvbook',  fvbookController.getFv);
    Router.post('/api/get-fv3',  fvbookController.getFv3Book);
    Router.post('/api/check-fvbook',  fvbookController.checkFvBook);
    Router.post('/api/delete-fvbook',  fvbookController.deleteFvBook);

    // Cart
        Router.post('/api/save-cart', checkAuth, userCartController.saveCart);
        Router.post('/api/get-saved-cart', userCartController.getCart);
        Router.post('/api/get-cart3', userCartController.getCart3);
        Router.post('/api/delete-cartitem', checkAuth, userCartController.deleteCartItem);

        // Orders
        Router.post('/api/orders/create', checkAuth, orderController.createOrder);
        Router.post('/api/orders/get-order', checkAuth, orderController.getMyOrders);
        // Admin list: lightweight orders for admin UI (customer, orderCode, createdAt, total, status)
        Router.post('/api/orders/admin-list', checkAuth, orderController.getAdminOrders);
        Router.post('/api/orders/get-by-id', checkAuth, orderController.getOrderById);
        // Approve / mark COD order as paid (admin only)
        Router.post('/api/orders/approve', checkAuth, orderController.approveOrder);
        

        // Payments
        Router.post('/api/payments/create', checkAuth, paymentController.createPayment);
        Router.post('/api/payments/capture', checkAuth, paymentController.capturePayment);
        // PayPal webhook (unprotected endpoint)
        Router.post('/api/payments/webhook/paypal', paymentController.webhookPayPal);

        // Notifications (send order notification email)
        Router.post('/api/notify/order', checkAuth, notificationController.notifyOrder);
        // Revenue statistics
        Router.post('/api/statistics/revenue', checkAuth, statisticsController.revenue);
        


    return app.use("/", Router);
};

module.exports = initWebRoute;
