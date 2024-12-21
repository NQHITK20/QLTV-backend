import borrowBookService from "../services/borrowBookService"

let createBorrowBook = async (req, res) => {
    try {
        let data = await borrowBookService.createBorrowBook(req.body)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}

export default {
    createBorrowBook
}