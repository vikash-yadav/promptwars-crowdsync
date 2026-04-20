FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["/bin/sh", "-c", "sed -i 's/80/8080/g' /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
