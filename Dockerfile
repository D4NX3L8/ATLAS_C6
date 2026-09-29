FROM node:22-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código
COPY . .

# Exponer el puerto de Vite y el de Express
EXPOSE 5173 3009

# Iniciar ambos servicios en paralelo como define tu package.json
CMD ["npm", "run", "dev"]