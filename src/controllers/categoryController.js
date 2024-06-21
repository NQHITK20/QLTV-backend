import categoryService from "../services/categoryService";

let createCategory = async (req, res) => {
    try {
        let data = await categoryService.createCategory(req.body)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}

let editCategory = async (req, res) => {
    try {
        let data = await categoryService.editCategory(req.body)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}

let deleteCategory = async (req, res) => {
    try {
        let data = await categoryService.deleteCategory(req.body.id)
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
    createCategory,deleteCategory,editCategory
}