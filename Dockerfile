#Usar una imagen basada en node
FROM node:18

#Crear un directorio de trabajo
WORKDIR /app

#Copiar el archivo package.json y package-lock.json
COPY package*.json /app

#Instalar las dependencias
RUN npm install

#Copiar el resto de los archivos
COPY . /app

#Exponer el puerto 3000
EXPOSE 3000

#Ejecutar la aplicación
CMD ["node", "index.js"]