const { create } = require('lodash');
const db = require('../models');

let getCurrentDateISO =()=> {
    const today = new Date();
    return today.toISOString();
}

let createNew = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let check = await db.News.findOne({
                where: { title: data.title }
            });

            if (check) {
                resolve({
                    errCode: 1,
                    errMessage: "Tiêu đề tin tức bị trùng.",
                });
            } else {
                let newNews = await db.News.create({
                    title: data.title,
                    image: data.image,
                    content: data.content,
                    author: data.author,
                    publicAt : getCurrentDateISO()
                });

                // Cập nhật publicAt cho đối tượng vừa tạo
                if (newNews) {
                    resolve({
                        errCode: 0,
                    });
                }
                else{
                    resolve({
                        errCode: 2,
                        errMessage: "Lỗi sever không tạo được tin tức.",
                    });
                }
            }
        } catch (e) {
            reject(e);
        }
    });
};


let getNew = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode:2,
                    errMessage:"bug sever không nhận được id truyền 1 hay nhiều"
                })
            }
            if (id=="ALL") {
                let data = await db.News.findAll({
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
                let data = await db.News.findOne({
                    where:{id:id},
                })
                if (data) {
                    resolve({
                        data
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

module.exports = {
    createNew,getNew
};
