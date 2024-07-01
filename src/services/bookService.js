import { where } from "sequelize";
const db = require('../models');
const exceljs = require('exceljs');


let createBook = (data) =>{
    return new Promise(async (resolve, reject) => {
        try {
            let check = await db.Book.findOne({
                where :{bookName:data.bookName}
            })
            if (check) {
                resolve({
                    errCode: 1,
                    errMessage: "Tên sách đã có trong kho.",
                });   
            }
            else{
                let cat = await db.Category.findOne({
                    where:{id:data.category}
                })
                await db.Book.create({
                    bookName: data.bookName,
                    author: data.author,
                    bookCode: data.bookCode,
                    category: cat.category,
                    soLuong: data.soLuong,
                    image: data.image,
                    showing: 0,
                    description: data.description,
                }),
                resolve({
                    errCode: 0,
                });
            }
        } catch (e) {
            reject(e);
        }
    })
}
let getAllCategory = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let data = await db.Category.findAll({
                attributes:['category','id']
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
let getAllBook = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode:2,
                    errMessage:"bug sever không nhận được id truyền 1 hay nhiều"
                })
            }
            if (id=="F10") {
                let data = await db.Book.findAll({
                    where :{showing: 1},
                    order: [['createdAt', 'DESC']],
                    limit: 12
                })
                if (data) {
                    resolve({
                        data
                    })
                } else {
                    resolve({
                        errCode:1,
                        errMessage:"bug sever ko load đc data"
                    })
                } 
            }
            if (id=="ALL") {
                let data = await db.Book.findAll({
                    where :{showing: 1},
                    order: [['createdAt', 'DESC']]
                })
                if (data) {
                    resolve({
                        data
                    })
                } else {
                    resolve({
                        errCode:1,
                        errMessage:"bug sever ko load đc data"
                    })
                } 
            }else{
                let data = await db.Book.findOne({
                    where:{id:id},
                })
                let category =  await db.Category.findOne({
                    where:{category:data.category},
                })
                if (data) {
                    resolve({
                        data,
                        category
                    })
                } else {
                    resolve({
                        errCode:3,
                        errMessage:"không tìm thấy data của id"
                    })
                } 
            }

        } catch (e) {
            reject(e);
        }
    })
}
let editBook = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
                let book = await db.Book.findOne({
                    where: { bookCode: data.bookCode },
                    raw: false
                })
                if (book) {
                    let cat = await db.Category.findOne({
                        where:{id:data.category}
                    })
                    book.author = data.author
                    book.bookName = data.bookName
                    book.category = cat.category
                    book.description = data.description
                    book.image = data.image
                    book.soLuong = data.soLuong
                    await book.save();
                    resolve({
                        errCode: 0,
                    });
                }
                else {
                    resolve({
                        errCode: 1,
                        errMessage: ' Lỗi sever không tìm thấy sách',
                    });
                }
        } catch (error) {
            reject(error)
        }
    })
}

let deleteBook = (bookId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let book = await db.Book.findOne({
                where: { id: bookId }
            })
            if (!book) {
                resolve({
                    errCode: 2,
                    errMessage: `Lối sever : Không tồn tại sách`
                })
            }
            await db.Book.destroy({
                where: { id: bookId }
            });
            resolve({
                errCode: 0,
            })
        } catch (error) {
            reject(error)
        }
    })
}
let showHideBook = (bookId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let book = await db.Book.findOne({
                where: { id: bookId },
                raw: false
            })
            if (book) {
                if (book.showing == 1) {
                    book.showing = 0
                    await book.save();
                    resolve({
                        errCode: 0,
                    });
                } else {
                    book.showing = 1
                    await book.save();
                    resolve({
                        errCode: 0,
                    });
                }
            }
            else {
                resolve({
                    errCode: 1,
                    errMessage: ' Lỗi sever không tìm thấy sách',
                });
            }
        } catch (error) {
            reject(error)
        }
    })
}
let exportDataBook = async () => {
    try {
        // Lấy dữ liệu từ cơ sở dữ liệu
        let data = await db.Book.findAll({
          attributes: {
            exclude: ['showing','image'],
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



module.exports = {
    createBook,getAllCategory,getAllBook,
    editBook,deleteBook,showHideBook,exportDataBook
}