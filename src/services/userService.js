import { first, last } from "lodash";
import db from "../models/index";
import bcrypt from 'bcryptjs'
import exceljs from 'exceljs';


const jwt = require('jsonwebtoken');
let salt = bcrypt.genSaltSync(10);



let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }
    })
}


let createUser = (data) =>{
    return new Promise(async (resolve, reject) => {
        try {
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    errMessage: 'Email đã tồn tại.Vui lòng chọn email khác.'
                });
            }else{
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    confirmPassword: hashPasswordFromBcrypt,
                    roleId: data.roleId,
                    nationalId: data.nationalId,
                    avatar: data.avatar,
                    phoneNumber: data.phoneNumber,
                    address: data.address,
                })
                resolve({
                    errCode: 0,
                    errMessage: 'Bạn đã tạo tài khoản thành công'
                });
            }
        } catch (e) {
            reject(e);
        }
    })
}

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userr = await db.User.findOne({
                where: { email: userEmail }
            })
            if (userr) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getAllUser = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.User.findAll({
                attributes: {
                    exclude: ['password','confirmPassword']
                }
            })
            if (data) {
                resolve({
                    data
                })
            } else {
                resolve({
                    errCode:1,
                    errMessage:"bug sever hoặc không tìm thấy data"
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getUser = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode:2,
                    errMessage:"không tồn tại user"
                })
            }
            let data = await db.User.findOne({
                where: { id: id },
                attributes: {
                    exclude: ['password','confirmPassword']
                }
            })
            if (data) {
                resolve({
                    errCode:0,
                    data
                })
            } else {
                resolve({
                    errCode:1,
                    errMessage:"Lỗi sever"
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

let handleUserLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};

            let isExist = await checkUserEmail(email);
            if (isExist) {
                //exist that email
                //compare password
                let user = await db.User.findOne({
                    where: { email: email },
                    raw: true
                });
                if (user) {
                    let check = bcrypt.compareSync(password, user.password);
                    if (check) {
                        // Tạo JWT
                        let token = jwt.sign({ email: email }, 'ahoe2k1', { expiresIn: '1h' });
                        userData.errCode = 0;
                        userData.token = token;

                        // Xóa mật khẩu trước khi trả về dữ liệu người dùng
                        delete user.password;
                        userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = 'Mật khẩu không chính xác. Vui lòng nhập lại';
                    }
                } else {
                    userData.errCode = 2;
                    userData.errMessage = `Email không tồn tại. Vui lòng thử lại`;
                }
                resolve(userData)
            } else {
                //return err
                userData.errCode = 1;
                userData.errMessage = `Email không tồn tại. Vui lòng thử lại`
                resolve(userData)
            }
        } catch (e) {
            reject(e);
        }
    })
}

let editUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
                let user = await db.User.findOne({
                    where: { email: data.email },
                    raw: false
                })
                if (user) {
                    user.firstName = data.firstName
                    user.lastName = data.lastName
                    user.roleId = data.roleId
                    user.nationalId = data.nationalId
                    user.phonenumber = data.phonenumber
                    user.address = data.address
                    // if (data.avatar) {
                    //     user.image = data.avatar
                    // }
                    await user.save();
                    resolve({
                        errCode: 0,
                    });
                }
                else {
                    resolve({
                        errCode: 1,
                        errMessage: ' Lỗi sever không tìm thấy người dùng',
                    });
                }
        } catch (error) {
            reject(error)
        }
    })
}
let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { id: userId }
            })
            if (!user) {
                resolve({
                    errCode: 2,
                    errMessage: `Lối sever : Không tồn tại người dùng `
                })
            }
            await db.User.destroy({
                where: { id: userId }
            });
            resolve({
                errCode: 0,
            })
        } catch (error) {
            reject(error)
        }

    })
}
let exportDataUser = async () => {
    try {
      // Lấy dữ liệu từ cơ sở dữ liệu
      let data = await db.User.findAll({
        attributes: {
            exclude: ['password','confirmPassword']
        }
    })
    if (data) {        
      // Tạo workbook Excel
      const workbook = new exceljs.Workbook();
      const worksheet = workbook.addWorksheet('Data');
  
      // Thêm dữ liệu từ kết quả truy vấn vào worksheet
      data.forEach(row => {
        const rowData = Object.values(row);
        worksheet.addRow(rowData);
      });
      
  
      // Trả về buffer chứa dữ liệu workbook
      return await workbook.xlsx.writeBuffer();
    } else {
        resolve({
            errCode:1,
            errMessage:"bug sever hoặc không tìm thấy data"
        })
    }
    } catch (error) {
      console.error('Có lỗi khi xử lý yêu cầu:', error);
      throw new Error('Đã xảy ra lỗi khi xử lý yêu cầu.');
    }
  };


module.exports= {
    createUser,hashUserPassword,checkUserEmail,getAllUser,
    handleUserLogin,getUser,editUser,deleteUser,exportDataUser
}