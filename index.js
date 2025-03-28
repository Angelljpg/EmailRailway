import app from "./src/app.js";
import dotenv from 'dotenv';

dotenv.config()

const PORT = process.env.PORT_EXPRESS || 3010;

app.listen(PORT, () => {
    console.log(`Servicio funcionando en el puerto ${PORT}`);
});