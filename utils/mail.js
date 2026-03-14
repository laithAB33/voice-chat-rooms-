import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    post:465,
    secure:true,
    auth:{
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD
    },
    tls:{
        rejectUnauthorized:false,
        minVersion:"TLSv1.2",
    },

});

let verificationCodes = new Map();

export {transporter,verificationCodes};
////////////////////////////////////////////////////////////////////////////////////


