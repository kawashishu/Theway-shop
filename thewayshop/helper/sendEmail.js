const jwt = require("jsonwebtoken")
const transporter = require('../config/transporter')

module.exports = (user_id,email,baseurl)=>{
    return jwt.sign({
        id:user_id,
    },process.env.JWT_SECRET,{
        expiresIn: '1d',
    },(err,emailToken)=>{
        const url = baseurl + emailToken;
        transporter.sendMail({
            to:email,
            subject: 'Thewayshop Confirm Email',
            html:`Please click this link to confirm your email: <a href="${url}">${url}</a>`
        })
    })
}