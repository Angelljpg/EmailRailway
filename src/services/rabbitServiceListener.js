import amqp from 'amqplib';
import dotenv from 'dotenv';
import transporter from '../config/emailConfig.js';
import { sendEmailPass } from '../controller/emailController.js';

dotenv.config();

const RABBITMQ_URL = "amqp://admin:admin@localhost";

export async function userEvents() {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST || 'rabbitmq',
            port:5672,
            username: process.env.RABBITMQ_USER || 'user',
            password: process.env.RABBITMQ_PASSWORD || 'password',
        });
        const channel = await connection.createChannel();

        const exchange = 'user_event';
        const queue = 'user_created_queue';
        const routingKey = 'user.created';

        await channel.assertExchange(exchange, 'topic', { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);

        console.log(`Waiting for messages ${queue}`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    const response = JSON.parse(msg.content.toString());
                    console.log(response);

                    const to = response.username; // El correo está en `username`
                    const subject = 'Bienvenido a la familia';
                    const text = to.split('@')[0]; // Extrae el nombre antes del '@'

                    if (!to) {
                        console.error("Error: El destinatario (to) está vacío o no definido.");
                        channel.nack(msg, false, false);
                        return;
                    }

                    await transporter.sendMail({
                        from: process.env.EMAIL_USER,
                        to,
                        subject,
                        template: 'email',
                        context: { nombre: text, mensaje: "Bienvenido a la familia" }
                    });

                    console.log(`Correo enviado con éxito a ${to}`);
                    channel.ack(msg);
                } catch (error) {
                    console.error("Error al procesar el mensaje o enviar el correo:", error);
                    channel.nack(msg, false, false);
                }
            }
        }, { noAck: false });

        connection.on('close', () => {
            console.error('Conexión cerrada, intentando reconectar en 5s...');
            setTimeout(userEvents, 5000);
        });
    } catch (error) {
        console.error('Error conectando a RabbitMQ:', error.message);
        console.log('Reintentando en 5s...');
        setTimeout(userEvents, 5000);
    }
}

export async function passwordResetEvents() {
    try {
        console.log("Conectando a RabbitMQ para eventos de password reset...");
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST || RABBITMQ_URL,
            port:5672,
            username: process.env.RABBITMQ_USER || 'admin',
            password: process.env.RABBITMQ_PASSWORD || 'admin',
        });
        const channel = await connection.createChannel();

        const exchange = "password_reset_event";
        const queue = "password_reset_queue";
        const routingKey = "password.reset";

        await channel.assertExchange(exchange, "topic", { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);

        console.log(`Escuchando mensajes en la cola: ${queue}`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                console.log(`Mensaje recibido: ${msg.content.toString()}`);
                const { id, username, resetToken } = JSON.parse(msg.content.toString());

                console.log(`Token recibido para usuario ${username}: ${resetToken}`);

                // Enviar el email al usuario
                try {
                    // Aquí llamamos a la función que envía el correo
                    await sendEmailPass({
                        body: { id, username, resetToken }
                    });
                    console.log(`Correo enviado a ${username}`);
                } catch (emailError) {
                    console.error("Error al enviar el correo:", emailError.message);
                }

                channel.ack(msg);
            }
        }, { noAck: false });

        connection.on("close", () => {
            console.error("Conexión cerrada, reintentando en 5s...");
            setTimeout(passwordResetEvents, 5000);
        });

    } catch (error) {
        console.error("Error en el consumidor:", error.message);
        console.log("Reintentando en 5s...");
        setTimeout(passwordResetEvents, 5000);
    }
}
