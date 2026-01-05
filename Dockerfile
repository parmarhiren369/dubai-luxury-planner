FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* bun.lock* ./
RUN npm install

COPY . .

# Build the Vite app for production
RUN npm run build

# Production image using nginx to serve static files
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Default nginx config is enough for a SPA
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

