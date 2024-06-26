const db = require('../models');
const category = require('../models/category');

let createCategory = (data) =>{
    return new Promise(async (resolve, reject) => {
        try {
            let check = await db.Category.findOne({
                where :{category:data.category}
            })
            if (check) {
                resolve({
                    errCode: 1,
                    errMessage: "Tên danh mục đã tồn tại vui lòng chọn cái khác.",
                });   
            }
            else{
                await db.Category.create({
                    category: data.category,
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

let deleteCategory = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let book = await db.Category.findOne({
                where: { id: id }
            })
            if (!book) {
                resolve({
                    errCode: 2,
                    errMessage: `Lối sever : Không tồn tại danh mục`
                })
            }
            await db.Category.destroy({
                where: { id: id }
            });
            resolve({
                errCode: 0,
            })
        } catch (error) {
            reject(error)
        }
    })
}

let editCategory = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
                let cat = await db.Category.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (cat) {
                    cat.category = data.category;
                    await cat.save();
                    resolve({
                        errCode: 0,
                    });
                }
                else {
                    resolve({
                        errCode: 1,
                        errMessage: ' Lỗi sever không tìm thấy danh mục',
                    });
                }
        } catch (error) {
            reject(error)
        }
    })
}

let getCategory = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 2,
                    errMessage: "bug sever không nhận được id truyền 1 hay nhiều"
                });
            }

            if (id === "ALL") {
                let data = await db.Category.findAll();
                if (data) {
                    resolve({
                        data
                    });
                } else {
                    resolve({
                        errCode: 1,
                        errMessage: "bug sever ko load đc data"
                    });
                }
            } else if (id === "F8") {
                let data = await db.Category.findAll({
                    limit: 8
                });
                if (data) {
                    resolve({
                        errCode: 0,
                        data
                    });
                } else {
                    resolve({
                        errCode: 1,
                        errMessage: "bug sever ko load đc data"
                    });
                }
            } else {
                let data = await db.Category.findOne({
                    where: { id: id }
                });
                if (data) {
                    resolve({
                        errCode: 0,
                        data
                    });
                } else {
                    resolve({
                        errCode: 3,
                        errMessage: "không tìm thấy data của id"
                    });
                }
            }
        } catch (e) {
            reject({
                errCode: 500,
                errMessage: "Lỗi server",
                error: e
            });
        }
    });
}



module.exports= {
    createCategory,deleteCategory,editCategory,getCategory
}