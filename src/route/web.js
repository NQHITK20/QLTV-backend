import express from "express";
import userController from "../controllers/userController";
import bookController from "../controllers/bookcontroller";
import { checkAuth, checkIsUser } from "../middleware/checkAuth";

let Router = express.Router();

let initWebRoute = (app) => {
    // Các yêu cầu user
    Router.post('/api/create-new-user', userController.createUser);
    Router.get('/api/get-all-user', checkAuth, userController.getAllUser); // Cần xác thực để lấy tất cả người dùng
    Router.post('/api/login', userController.handleLogin);
    Router.post('/api/get-user-by-id', checkAuth, checkIsUser, userController.getUser); // Cần xác thực và kiểm tra người dùng
    Router.post('/api/edit-user', checkAuth, checkIsUser, userController.editUser); // Cần xác thực và kiểm tra người dùng
    Router.delete('/api/delete-user', checkAuth, checkIsUser, userController.deleteUser); // Cần xác thực và kiểm tra người dùng
    Router.get('/api/export-data-user', checkAuth, userController.exportDataUser); // Cần xác thực để xuất dữ liệu người dùng
    Router.post('/api/send-email-to-change-password', userController.sendResetEmail);
    Router.post('/api/request-to-change-password', userController.requestResetEmail);
    Router.get('/api/get-count', checkAuth, userController.getCount); // Cần xác thực để lấy số lượng người dùng

    // Book
    Router.post('/api/create-new-book', checkAuth, bookController.createBook); // Cần xác thực để tạo sách mới
    Router.get('/api/get-all-category', checkAuth,bookController.getAllCategory);
    Router.post('/api/get-all-book', checkAuth, bookController.getAllBook); // Cần xác thực để lấy tất cả sách
    Router.post('/api/edit-book', checkAuth, bookController.editBook); // Cần xác thực để chỉnh sửa sách

    return app.use("/", Router);
};

module.exports = initWebRoute;
