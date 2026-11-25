FROM node:20-alpine

WORKDIR /app

# Kopiraj zavisnosti iz api foldera i instaliraj ih
COPY api/package*.json ./api/
RUN cd api && npm ci --omit=dev || npm install --omit=dev

# Kopiraj ostatak projekta
COPY . .

# Osiguraj da uploads folder postoji
RUN mkdir -p /app/api/uploads

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "api/server.js"]