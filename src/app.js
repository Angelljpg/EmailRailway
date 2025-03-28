import bodyParser from "body-parser";
import express from "express";
import emailRoutes from "./routes/emailRoutes.js";
import { userEvents, passwordResetEvents } from "./services/rabbitServiceListener.js";

const app = express();

app.use(bodyParser.json());
app.use('/api/email', emailRoutes);

userEvents().catch((err) => {
    console.error('Error iniciando el consumidor de eventos:', err);
});

passwordResetEvents().catch((err) => {
    console.error('Error iniciando el consumidor de eventos de reset de contraseña:', err);
});



export default app;
