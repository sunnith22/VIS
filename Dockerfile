# ---- Build frontend ----
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ---- Backend + serve built frontend ----
FROM node:20-alpine
WORKDIR /app

COPY server/package.json ./server/
RUN cd server && npm install --omit=dev

COPY server/ ./server/
COPY --from=client-build /app/client/dist ./client/dist

WORKDIR /app/server
RUN npm run seed

EXPOSE 4000
CMD ["node", "server.js"]
