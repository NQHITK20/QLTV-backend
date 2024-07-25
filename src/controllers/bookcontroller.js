import bookService from "../services/bookService"

let createBook = async (req, res) => {
    try {
        let data = await bookService.createBook(req.body)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}
let getAllCategory = async (req, res) => {
    try {
        let data = await bookService.getAllCategory()
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}
let getAllBook = async (req, res) => {
    try {
        let data = await bookService.getAllBook(req.body.id)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}
let getRelatedBook = async (req, res) => {
    try {
        let data = await bookService.getRelatedBook(req.body.categoryBook,req.body.bookId)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}
let editBook = async (req,res) => {
    try {
        let userData = await bookService.editBook(req.body);
        return res.status(200).json(userData)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}
let showHideBook = async (req,res) => {
    try {
        let userData = await bookService.showHideBook(req.body.id);
        return res.status(200).json(userData)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}
let deleteBook = async (req,res) => {
    try {
        let userData = await bookService.deleteBook(req.body.id);
        return res.status(200).json(userData)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}

let exportDataBook = async (req, res) => {
    try {
      // Lấy dữ liệu từ service
      let message = await bookService.exportDataBook()
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + 'book_data.xlsx');
      return res.status(200).send(message)
    } catch (error) {
      console.error('Có lỗi khi xử lý yêu cầu:', error);
    }
};

let searchBook = async (req,res) => {
    try {
        let userData = await bookService.searchBook(req.body.tukhoa);
        return res.status(200).json(userData)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}

export default {
    createBook,getAllCategory,getAllBook,getRelatedBook,searchBook,
    editBook,deleteBook,showHideBook,exportDataBook
}