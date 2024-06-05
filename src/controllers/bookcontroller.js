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
export default {
    createBook,getAllCategory,getAllBook,editBook
}