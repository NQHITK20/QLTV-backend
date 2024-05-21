import { where } from "sequelize";
import db from "../models/index";

let generateRandomCode=(length)=> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }
    return result;
}

let createBook = (data) =>{
    return new Promise(async (resolve, reject) => {
        try {
            let check = await db.Book.findOne({
                where :{bookCode:data.bookCode}
            })
            if (check) {
                resolve({
                    errCode: 1,
                    errMessage: "Sách đã có trong kho.",
                });   
            }
            else{
                await db.Book.create({
                    bookName: data.bookName,
                    author: data.author,
                    bookCode: generateRandomCode(6),
                    category: data.category,
                    soLuong: data.soLuong,
                    image: data.image,
                    description: data.description,
                })
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


module.exports = {
    createBook,generateRandomCode,getAllCategory
}