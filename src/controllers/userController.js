import userService from "../services/userService"
import emailService from "../services/emailService"


let getCount = async (req, res) => {
    try {
        let data = await userService.getCount()
        return res.status(200).json(data)
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Lỗi từ sever'
        })
    }
}
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
      res.setHeader('Content-Disposition', 'attachment; filename=' + 'user_data.xlsx');
      return res.status(200).send(message)
    } catch (error) {
      console.error('Có lỗi khi xử lý yêu cầu:', error);
    }
};

let sendResetEmail = async (req, res) => {
    try {
      // Lấy dữ liệu từ service
      let message = await emailService.sendResetEmail(req.body)
      return res.status(200).json(message)
    } catch (error) {
      console.error('Có lỗi khi xử lý yêu cầu:', error);
    }
  };
let requestResetEmail = async (req, res) => {
    try {
      // Lấy dữ liệu từ service
      let message = await userService.requestResetEmail(req.body)
      return res.status(200).json(message)
    } catch (error) {
      console.error('Có lỗi khi xử lý yêu cầu:', error);
    }
  };
  


export default {
    createUser,getAllUser,deleteUser,sendResetEmail,requestResetEmail,
    handleLogin,getUser,editUser,exportDataUser,getCount
};
   