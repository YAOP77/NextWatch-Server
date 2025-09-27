# Dockerfile pour NextWatch Backend (Express)

FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Variables d'environnement (à adapter)
ENV PORT=5000

EXPOSE 5000
CMD ["node", "server.js"]
