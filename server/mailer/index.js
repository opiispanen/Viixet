const nodemailer = require('nodemailer');
const template = require('./template.js');
/*
const transporter = nodemailer.createTransport({
    port: 465,               // true for 465, false for other ports
    host: 'smtp.gmail.com',
       auth: {
            user: process.env.MAILER_EMAIL,
            pass: process.env.MAILER_PASSWORD,
         },
    secure: true,
});
*/
const transporter = nodemailer.createTransport({
    port: 25,
    host: 'localhost',
    tls: {
        rejectUnauthorized: false
    },
})

function sendMail(to, subject, text, html) {
    return new Promise((resolve, reject) => {
        var message = {
            from: process.env.MAILER_FROM,
            to,
            subject,
            text,
            html: template(subject, html)
        };
        
        transporter.sendMail(message, (error, info) => {
            if (error) {
                return reject(error);
            }

            resolve(info);
        });
    })    
}

module.exports = {
    sendMail
}