import express from "express"
import userController from "../controllers/userController"
import bookController from "../controllers/bookcontroller"
let Router = express.Router();

let initWebRoutes = (app) => {
    //Các yêu cầu user
    Router.post('/api/create-new-user', userController.createUser);
    Router.get('/api/get-all-user', userController.getAllUser);
    Router.post('/api/login', userController.handleLogin)
    Router.post('/api/get-user-by-id', userController.getUser);
    Router.post('/api/edit-user', userController.editUser);
    Router.delete('/api/delete-user', userController.deleteUser);
    Router.get('/api/export-data-user', userController.exportDataUser);
    Router.post('/api/send-email-to-change-password', userController.sendResetEmail);
    Router.post('/api/request-to-change-password', userController.requestResetEmail);
    Router.get('/api/get-count', userController.getCount);

    //Book
    Router.post('/api/create-new-book', bookController.createBook);
    Router.get('/api/get-all-category', bookController.getAllCategory);
    

    


    return app.use("/",Router)
}

module.exports = initWebRoutes;