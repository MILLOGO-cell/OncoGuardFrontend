# ===============================
# 1️⃣ Étape de build : construction du frontend
# ===============================
FROM node:20-alpine AS builder

# Dossier de travail
WORKDIR /app

# Copier les fichiers nécessaires
COPY package*.json ./

# Installer les dépendances (production + build)
RUN npm install --legacy-peer-deps

# Copier le reste du code du frontend
COPY . .

# Construire le projet Next.js
RUN npm run build


# ===============================
# 2️⃣ Étape finale : image légère optimisée
# ===============================
FROM node:20-alpine AS runner

WORKDIR /app

# Copier uniquement les fichiers nécessaires à l’exécution
ENV NODE_ENV=production

# Copier le dossier .next (build), le package.json et les fichiers publics
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Installer uniquement les dépendances de production
RUN npm install --omit=dev --legacy-peer-deps

# Exposer le port
EXPOSE 3000

# Variable d’environnement pour le backend FastAPI
# ⚠️ Adapte cette URL selon ton backend (ex : http://localhost:8000 ou ton domaine Coolify)
ENV NEXT_PUBLIC_API_BASE_URL="http://localhost:8000"

# Commande de lancement du serveur Next.js
CMD ["npm", "run", "start"]
