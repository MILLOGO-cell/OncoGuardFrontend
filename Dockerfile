# ===============================
# 1️⃣ Étape de build : construction du frontend
# ===============================
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers nécessaires
COPY package*.json ./

# Installer les dépendances (inclut dev)
RUN npm install --legacy-peer-deps

# Copier le reste du code du projet
COPY . .

# Construire le projet Next.js
RUN npm run build


# ===============================
# 2️⃣ Étape finale : exécution
# ===============================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copier les fichiers essentiels depuis le builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.ts ./    
COPY --from=builder /app/tsconfig.json ./     
COPY --from=builder /app/next-env.d.ts ./     

# Installer uniquement les dépendances de production
RUN npm install --omit=dev --legacy-peer-deps

# Exposer le port
EXPOSE 3000

# Définir l'URL du backend FastAPI (modifie si besoin)
ENV NEXT_PUBLIC_API_BASE_URL="http://localhost:8000"

# Démarrer le serveur Next.js
CMD ["npm", "run", "start"]
