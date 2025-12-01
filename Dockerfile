FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

RUN npm install --omit=dev --legacy-peer-deps

EXPOSE 3000

ENV NEXT_PUBLIC_API_BASE_URL=https://vcgckw80k8gc0c88osk0kk4w.37.27.42.12.sslip.io

CMD ["npm", "run", "start"]
