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
                return resolve({
                    errCode: 1,
                    errMessage: "Thiếu thông tin vào.",
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
                                id: book.id,
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


module.exports = {
    createNewFv,getFv
}