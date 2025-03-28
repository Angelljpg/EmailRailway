import transporter from '../config/emailConfig.js';
import dotenv from 'dotenv';

dotenv.config();

export const sendEmail = async (req, res) => {
    const {to, subject, text} = req.body;
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            template: 'email',
            context: {nombre: text, mensaje: "Bienvenido a la familia"}
        });
        return res.json({ message : 'Correo enviado con exito'}); 
    } catch (error) {
        return res.status(500).json({ error: error.message})
    }
}

export const sendEmailPass = async ({ body }) => {
    const { id, username, resetToken } = body;

    try {
        // Definir el contenido del correo
        const subject = "Recuperación de contraseña";
        const URL = process.env.URL || 'http://localhost:3000/';

        // Enviar el correo con la plantilla
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: username, 
            subject,
            template: 'EmailPassTemplate',  // Asegúrate de que la plantilla esté correctamente ubicada
            context: {
                email: username,  // Esto reemplazará {{email}} en la plantilla
                message: `Para restablecer tu contraseña, utiliza el siguiente token: ${URL}api/users/newpass/${resetToken}` // Esto reemplazará {{message}} en la plantilla
            }
        });

        console.log(`Correo de recuperación enviado a ${username}`);
        return { message: 'Correo de recuperación enviado' }; // Retornar un mensaje si es necesario
    } catch (error) {
        console.error("Error al enviar el correo:", error.message);
        throw new Error("No se pudo enviar el correo de recuperación");
    }
};


