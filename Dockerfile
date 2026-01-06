FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* bun.lock* ./
RUN npm install

COPY . .

# Build the Vite app for production
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Production image using nginx to serve static files
FROM nginx:1.27-alpine

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

