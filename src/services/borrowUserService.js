const { where } = require('sequelize');
const db = require('../models');

let createBorrowUser = (data) =>{
    return new Promise(async (resolve, reject) => {
        try {
                await db.borrowUser.create({
                    fullname:data.username,
                    borrowcode:data.orderCode,
                    dateborrow:data.timeborrow,
                    datareturn:data.timereturn,
                    borrowstatus:'Đang mượn',
                    description: data.description,
                }),
                resolve({
                    errCode: 0,
                });
            
        } catch (e) {
            reject(e);
        }
    })
}


module.exports ={
    createBorrowUser
}