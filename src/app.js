import bodyParser from "body-parser";
import express from "express";
import emailRoutes from "./routes/emailRoutes.js";
import { userEvents, passwordResetEvents } from "./services/rabbitServiceListener.js";
import cors from 'cors';

const app = express();

app.use(cors({
    origin: "*",  // Puedes cambiar esto a la URL del ESB si deseas restringir el acceso
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(bodyParser.json());
app.use('/api/email', emailRoutes);

userEvents().catch((err) => {
    console.error('Error iniciando el consumidor de eventos:', err);
});

passwordResetEvents().catch((err) => {
    console.error('Error iniciando el consumidor de eventos de reset de contraseña:', err);
});



export default app;
