FROM node:22-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Puerto de la API Express (habitualmente 3000 o 4000) y de Vite (5173)
EXPOSE 3000 5173

# Arrancar backend y frontend simultáneamente
CMD ["npm", "run", "dev", "--", "--host"]
