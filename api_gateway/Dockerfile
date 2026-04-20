# Build stage
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Production stage
FROM node:20-slim
WORKDIR /app
COPY --from=builder /app .
EXPOSE 8080
CMD ["node", "index.js"]
