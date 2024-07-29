import { where } from "sequelize";
const db = require('../models');


let createNewFv = (idusername, fvIdBook) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra các tham số
            if (!idusername && !fvIdBook) {
                return resolve({
                    errCode: 1,
                    errMessage: "Thiếu thông tin vào.",
                });
            }
            let finduplicate = await db.FvBook.findOne({
                where :{
                    idusername:idusername,
                    idfvbook: fvIdBook,
                }
            })

            if (finduplicate) {
                resolve({
                    errCode: 2,
                    errMessage: 'Sách đã có trong danh sách yêu thích',
                });
            }else{
                 // Tạo mới vào cơ sở dữ liệu
            await db.FvBook.create({
                idusername: idusername,
                idfvbook: fvIdBook,
            });

            // Trả về kết quả thành công
            resolve({
                errCode: 0,
                errMessage: 'Bạn đã thêm vào yêu thích thành công',
            });    
            }
        } catch (e) {
            // Xử lý lỗi và trả về thông tin lỗi
            reject({
                errCode: 3,
                errMessage: 'Đã xảy ra lỗi khi thêm vào yêu thích.',
                details: e.message
            });
        }
    });
};

let getFv = (idusername) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra các tham số
            if (!idusername) {
                resolve({
                    errCode: 1,
                    errMessage: "Vui lòng đăng nhập để có thể thêm sách vào danh sách yêu thích.",
                });
            }
    
            // Lấy danh sách sách yêu thích
            let bookIds = await db.FvBook.findAll({
                where: {
                    idusername: idusername,
                }
            });
    
            // Kiểm tra nếu có sách yêu thích
            if (bookIds.length > 0) {
                const results = [];
                
                // Xử lý từng sách yêu thích
                for (const book of bookIds) {
                    try {
                        let fvbook = await db.Book.findOne({
                            where: {
                                id: book.idfvbook,
                            }
                        });
                        results.push(fvbook);
                    } catch (error) {
                        console.error('Lỗi khi tìm kiếm sách:', error);
                    }
                }
    
                // Trả về kết quả
                resolve({
                    errCode: 0,
                    results
                });
            } else {
                resolve({
                    errCode: 2,
                    errMessage: "Bạn chưa có sách yêu thích nào.",
                });
            }
        } catch (e) {
            // Xử lý lỗi và trả về thông tin lỗi
            reject({
                errCode: 3,
                errMessage: 'Đã xảy ra lỗi khi thêm vào yêu thích.',
                details: e.message
            });
        }
    });    
};

let getFv3Book = (idusername) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra các tham số
            if (!idusername) {
                resolve({
                    errCode: 1,
                    errMessage: "Vui lòng đăng nhập để có thể thêm sách vào danh sách yêu thích.",
                });
            }
    
            // Lấy danh sách sách yêu thích
            let bookIds = await db.FvBook.findAll({
                where: {
                    idusername: idusername,
                },
                limit: 3, // Giới hạn số lượng bản ghi trả về là 3
                order: [['createdAt', 'DESC']] // Sắp xếp theo createdAt giảm dần
            });
            let bookIdscount = await db.FvBook.findAll({
                where: {
                    idusername: idusername,
                },
            });
            let bookCount = bookIdscount.length;
    
            // Kiểm tra nếu có sách yêu thích
            if (bookIds.length > 0) {
                const results = [];
                
                // Xử lý từng sách yêu thích
                for (const book of bookIds) {
                    try {
                        let fvbook = await db.Book.findOne({
                            where: {
                                id: book.idfvbook,
                            }
                        });
                        results.push(fvbook);
                    } catch (error) {
                        console.error('Lỗi khi tìm kiếm sách:', error);
                    }
                }
    
                // Trả về kết quả
                resolve({
                    errCode: 0,
                    results,
                    bookCount
                });
            } else {
                resolve({
                    errCode: 2,
                    errMessage: "Bạn chưa có sách yêu thích nào.",
                });
            }
        } catch (e) {
            // Xử lý lỗi và trả về thông tin lỗi
            reject({
                errCode: 3,
                errMessage: 'Đã xảy ra lỗi khi thêm vào yêu thích.',
                details: e.message
            });
        }
    });    
};

let checkFvBook = (idusername,bookId) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra các tham số
            if (!idusername || !bookId) {
                resolve({
                    errCode: 1,
                    errMessage: "Lỗi sever. Thiếu thông số iduser hoặc bookId",
                });
            }
    
            // Lấy danh sách sách yêu thích
            let bookIds = await db.FvBook.findOne({
                where: {
                    idusername: idusername,
                    idfvbook: bookId
                }
            });
            if (bookIds) {
                resolve({
                    check: 1,
                });
            } else {
                resolve({
                    check: 0,
                });
            }
        } catch (e) {
            // Xử lý lỗi và trả về thông tin lỗi
            reject({
                errCode: 3,
                errMessage: 'Đã xảy ra lỗi khi thêm vào yêu thích.',
                details: e.message
            });
        }
    });    
};
let deleteFvBook = (idusername,bookId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!idusername || !bookId) {
                resolve({
                    errCode: 1,
                    errMessage: "Lỗi sever. Thiếu thông số iduser hoặc bookId",
                });
            }
            let fvbook = await db.FvBook.findOne({
                where: {
                    idusername: idusername,
                    idfvbook: bookId
                }
            })
            if (!fvbook) {
                resolve({
                    errCode: 2,
                    errMessage: `Lối sever : Không tồn tại sách yêu th `
                })
            }
            await db.FvBook.destroy({
                where: {
                    idusername: idusername,
                    idfvbook: bookId
                }
            });
            resolve({
                errCode: 0,
                errMessage:'Bạn đã xoá sách ra khỏi danh sách yêu thích thành công'
            })
        } catch (error) {
            reject(error)
        }
    })
}



module.exports = {
    createNewFv,getFv,getFv3Book,checkFvBook,deleteFvBook
}