import express from "express";
import userController from "../controllers/userController";
import bookController from "../controllers/bookcontroller";
import categoryController from "../controllers/categoryController";
import newController from "../controllers/newController";
import fvbookController from "../controllers/fvbookController";
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
    return app.use("/", Router);
};

module.exports = initWebRoute;
