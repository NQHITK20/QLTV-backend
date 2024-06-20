import { where } from "sequelize";
const db = require('../models');


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
            if (id=="ALL") {
                let data = await db.Book.findAll({
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
let showBook = (bookId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let book = await db.Book.findOne({
                where: { id: bookId },
                raw: false
            })
            if (book) {
                book.showing = 0
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



module.exports = {
    createBook,getAllCategory,getAllBook,
    editBook,deleteBook,showBook
}