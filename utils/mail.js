import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    post:465,
    secure:true,
    service:'gmail',
    auth:{
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD
    },
    tls:{
        rejectUnauthorized:false
    }

});

let verificationCodes = new Map();

export {transporter,verificationCodes};