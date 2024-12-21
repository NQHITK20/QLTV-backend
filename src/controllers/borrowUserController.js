import borrowUserService from "../services/borrowUserService"

let createBorrowUser = async (req, res) => {
    try {
        let data = await borrowUserService.createBorrowUser(req.body)
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
    createBorrowUser
}