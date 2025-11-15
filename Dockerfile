# Utiliser une image Node.js officielle
FROM node:20-slim

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration
COPY package*.json ./
COPY tsconfig.json ./

# Installer toutes les dépendances (prod + dev)
RUN npm ci

# Copier le code source
COPY src ./src

# Compiler TypeScript
RUN npm run build

# Exposer le port Cloud Run
EXPOSE 8080

# Variable d'environnement pour le port
ENV PORT=8080

# Commande par défaut (serveur HTTP)
CMD ["node", "dist/server-http.js"]

