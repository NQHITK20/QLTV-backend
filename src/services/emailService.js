'use strict'
require('dotenv').config()
import db from "../models";
import nodemailer from 'nodemailer'


let sendResetEmail = async (data) => {

    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: data.email }
            })
            if (!user) {
                resolve({
                    errCode: 2,
                    errMessage: `email này chưa được sử dụng .Vui lòng kiểm tra lại`
                })
            }
            else{
                const transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 465,
                    secure: true,
                    auth: {
                        // TODO: replace `user` and `pass` values from <https://forwardemail.net>
                        user: process.env.EMAIL_APP,
                        pass: process.env.EMAIL_APP_PASSWORD,
                    },
                });
            
                // send mail with defined transport object
                const info = await transporter.sendMail({
                    from: '"Web-app Quản lý thư viện"', // sender address
                    to: user.email, // list of receivers
                    subject: "Xác nhận yêu cầu đổi mật khẩu", // Subject line
                    html: getBodyHTML(user),
                    attachments: [
                        {
                            filename: `remedy-${user.firstName}-${user.lastName}-${new Date().getTime()}.png`,
                        }
                    ],
                }); 
                resolve({
                    errCode: 0,
                })       
            }    
        } catch (error) {
            reject(error)
        }
    }) 
}

let getBodyHTML = (data) => {
       let result = `<h3>Xin chào ${data.firstName} ${data.lastName}!</h3>
        <p>Bạn có yêu cầu được đổi mật khẩu</p>
        
        <p>Vui lòng nhấn vào link bên dưới để xác nhận</p>
        
        <div><a href="http://localhost:80/QLTV/backend/pages-reset-password.html?id=${data.id}" target="_blank">Bấm vào đây</a></div>
`
    return result
}

module.exports = {
    sendResetEmail, getBodyHTML
}