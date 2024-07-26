import fvbookService from "../services/fvbookService"

let createNewFv = async (req, res) => {
    try {
        let data = await fvbookService.createNewFv(req.body.idusername , req.body.fvIdBook)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}

let getFv = async (req, res) => {
    try {
        let data = await fvbookService.getFv(req.body.idusername)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}
let getFv3Book = async (req, res) => {
    try {
        let data = await fvbookService.getFv3Book(req.body.idusername)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}

module.exports = {
    createNewFv,getFv,getFv3Book
};