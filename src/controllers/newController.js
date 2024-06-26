import newService from "../services/newService"


let createNew = async (req, res) => {
    try {
        let data = await newService.createNew(req.body)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}

let getNew = async (req, res) => {
    try {
        let data = await newService.getNew(req.body.id)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}

let editNew = async (req, res) => {
    try {
        let data = await newService.editNew(req.body)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}

let deleteNew = async (req, res) => {
    try {
        let data = await newService.deleteNew(req.body.id)
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
    createNew,getNew,editNew,deleteNew
};
