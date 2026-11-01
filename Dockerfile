FROM node:22.22.2-alpine3.22 AS client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:22.22.2-alpine3.22 AS server
WORKDIR /app/server
ENV NODE_ENV=production
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
COPY --from=client /app/client/dist /app/client/dist
ENV PORT=3000
EXPOSE 3000
USER node
CMD ["node", "src/index.js"]
