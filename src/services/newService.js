const { create } = require('lodash');
const db = require('../models');

let getCurrentDateISO =()=> {
    const today = new Date();
    return today.toISOString();
}
//fake news
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
                    showing: 0,
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
            if (id == "F7") {
                let data = await db.News.findAll({
                    order: [['publicAt', 'DESC']],
                    where :{
                        showing :1
                    },
                    attributes: {
                        exclude: ['content', 'createdAt','updatedAt']
                    },
                    limit:7
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
            if (id=="ALLSHOW") {
                let data = await db.News.findAll({
                    where :{showing: 1},
                    attributes: {
                        exclude: ['content']
                    },
                    order: [['publicAt', 'DESC']]
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
                let data = await db.News.findAll({
                    order: [['publicAt', 'DESC']],
                    attributes: {
                        exclude: ['content']
                    },
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

let editNew = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
                let book = await db.News.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (book) {
                    book.title = data.title
                    book.image = data.image
                    book.content = data.content
                    book.author = data.author
                    await book.save();
                    resolve({
                        errCode: 0,
                    });
                }
                else {
                    resolve({
                        errCode: 1,
                        errMessage: ' Lỗi sever không tìm thấy tin tức',
                    });
                }
        } catch (error) {
            reject(error)
        }
    })
}

let deleteNew = (newId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let book = await db.News.findOne({
                where: { id: newId },

            })
            if (!book) {
                resolve({
                    errCode: 2,
                    errMessage: `Lối sever : Không tồn tại tin tức`
                })
            }
            await db.News.destroy({
                where: { id: newId }
            });
            resolve({
                errCode: 0,
            })
        } catch (error) {
            reject(error)
        }
    })
}

let showHideNew = (newId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let booknew  = await db.News.findOne({
                where: { id: newId },
                raw: false
            })
            if (booknew) {
                let curdate = booknew.createdAt
                if (booknew.showing === 0) {
                    booknew.publicAt = getCurrentDateISO()
                    booknew.showing = 1
                    await booknew.save();
                    resolve({
                        errCode: 0,
                    });
                } else {
                    booknew.publicAt = curdate
                    booknew.showing = 0
                    await booknew.save();
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

module.exports = {
    createNew,getNew,editNew,deleteNew,showHideNew
};
