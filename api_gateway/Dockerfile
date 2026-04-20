# Build stage
FROM node:24-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Production stage
FROM node:24-slim
WORKDIR /app
COPY --from=builder /app .
EXPOSE 4000
CMD ["node", "index.js"]
