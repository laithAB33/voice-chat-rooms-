import nodemailer from 'nodemailer';

let transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.APP_EMAIL,
        pass: process.env.APP_PASSWORD
    },

});

let verificationCodes = new Map();

export {transporter,verificationCodes};