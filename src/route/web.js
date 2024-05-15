import express from "express"
import userController from "../controllers/userController"


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

    


    return app.use("/",Router)
}

module.exports = initWebRoutes;