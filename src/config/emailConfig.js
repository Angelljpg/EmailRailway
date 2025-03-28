import nodemailer from 'nodemailer';
import { resolve } from 'path';
import hbs from 'nodemailer-express-handlebars';
import dotenv from 'dotenv';

dotenv.config();

// Configurar el transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // or 'STARTTLS'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Configurar Handlebars como motor de plantillas
const handlebarOptions = {
    viewEngine: {
        extName: "hbs",
        partialsDir: resolve('./src/views/'),
        defaultLayout: false,
    },
    viewPath: resolve('./src/views/'),
    extName: ".hbs",
};

transporter.use('compile', hbs(handlebarOptions));

export default transporter;
