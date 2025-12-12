import { first, last } from "lodash";
const db = require('../models');
const bcrypt = require('bcryptjs');
const exceljs = require('exceljs');


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
                    errMessage: 'Email này đã được sử dụng.Vui lòng chọn email khác.'
                });
            }else{
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    password: hashPasswordFromBcrypt,
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
                    exclude: ['password'],
                    order: [['createdAt', 'DESC']]
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
                    exclude: ['password']
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
                        userData.errCode = 0;
                        // Xóa mật khẩu trước khi trả về dữ liệu người dùng
                        delete user.password;
                        userData.user = user;
                        const payload = {
                            id: user.id,
                            name: user.lastName,
                            role: user.roleId,
                            email: user.email
                        };
                        if (payload.role === "2" || payload.role === "3" || payload.role === "1") {
                            userData.token = jwt.sign(payload, process.env.JWT, { expiresIn: '10000h' });
                        }
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = 'Mật khẩu không chính xác. Vui lòng nhập lại';
                    }
                } else {
                    userData.errCode = 2;
                    userData.errMessage = `Email này chưa được sử dụng. Vui lòng thử lại`;
                }
                resolve(userData)
            } else {
                //return err
                userData.errCode = 1;
                userData.errMessage = `Email này chưa được sử dụng. Vui lòng thử lại`
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
            exclude: ['password'],
            order: [['createdAt', 'DESC']]
          },
          raw: true // Lấy dữ liệu ở dạng đơn giản (plain objects)
        });
    
        if (data && data.length > 0) {
          // Tạo workbook Excel
          const workbook = new exceljs.Workbook();
          const worksheet = workbook.addWorksheet('Data');
    
          // Lấy các thuộc tính của model làm tiêu đề cột
          const columnHeaders = Object.keys(data[0]); // Lấy tên cột từ đối tượng đầu tiên
    
          // Thêm tiêu đề cột trực tiếp vào hàng đầu tiên của worksheet
          worksheet.addRow(columnHeaders);
    
          // Điền dữ liệu vào các hàng
          data.forEach((row) => {
            worksheet.addRow(Object.values(row)); // Thêm dữ liệu hàng vào worksheet
          });
    
          // Trả về buffer chứa dữ liệu workbook
          const buffer = await workbook.xlsx.writeBuffer();
          return buffer;
        } else {
          return {
            errCode: 1,
            errMessage: "Không tìm thấy dữ liệu hoặc có lỗi từ server"
          };
        }
      } catch (error) {
        console.error('Có lỗi khi xử lý yêu cầu:', error);
        return {
          errCode: 2,
          errMessage: "Có lỗi khi xử lý yêu cầu"
        };
      }
};
let requestResetEmail = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật mật khẩu trong cơ sở dữ liệu
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false
            })
            if (user) {
                user.password = await hashUserPassword(data.password);
                await user.save();
                resolve({
                    errCode: 0,
                })
            }else{
                resolve({
                    errCode: 1,
                    errMessage:"Lỗi sever . Vui lòng thử lại sau"
                }) 
            }
        } catch (error) {
            reject(error)
        }
    })
}
let getCount = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let countUser = await db.User.count()
            let countBook = await db.Book.count()
            let countCategory = await db.Category.count()
            let countNews = await db.News.count()
            let countOrder = await db.Order.count()
            resolve({
                countUser, countBook, countCategory, countNews, countOrder
            })
        } catch (e) {
            reject(e);
        }
    })
}



module.exports= {
    createUser,hashUserPassword,checkUserEmail,getAllUser,requestResetEmail,
    handleUserLogin,getUser,editUser,deleteUser,exportDataUser,getCount
}