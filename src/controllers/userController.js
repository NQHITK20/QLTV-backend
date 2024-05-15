import userService from "../services/userService"
import exceljs from 'exceljs';

let createUser = async (req, res) => {
    try {
        let data = await userService.createUser(req.body)
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}
let getAllUser = async (req,res) => {
    try {
        let data = await userService.getAllUser()
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}

let handleLogin = async (req,res) => {
    try {
        let email = req.body.email;
        let password = req.body.password;
        let userData = await userService.handleUserLogin(email, password);
        return res.status(200).json(userData)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}
let getUser = async (req,res) => {
    try {
        let id = req.body.id;
        let userData = await userService.getUser(id);
        return res.status(200).json(userData)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}

let editUser = async (req,res) => {
    try {
        let userData = await userService.editUser(req.body);
        return res.status(200).json(userData)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}

let deleteUser = async (req,res) => {
    try {
        if (!req.body.id) {
            return res.status(200).json({
                errCode: 1,
                errMessage: 'Missing input parameters!'
            })
    
        }
        let message = await userService.deleteUser(req.body.id)
        return res.status(200).json(message)
    } catch (error) {
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}

let exportDataUser = async (req, res) => {
    try {
      // Lấy dữ liệu từ service
      let message = await userService.exportDataUser()
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=data.xlsx');
      res.send(message);
      return res.status(200).json(message)
    } catch (error) {
      console.error('Có lỗi khi xử lý yêu cầu:', error);
      res.status(500).send('Đã xảy ra lỗi khi xử lý yêu cầu.');
    }
  };
  



module.exports = {
    createUser,getAllUser,deleteUser,
    handleLogin,getUser,editUser,exportDataUser
}