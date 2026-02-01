# Stage 1: Build with Node + Esbuild
FROM node:22 as builder
WORKDIR /app

# Install esbuild
RUN npm install terser clean-css

# Copy source files
COPY . .

# Run the fixed build script
RUN node build.mjs

# Stage 2: Serve with Nginx
FROM nginxinc/nginx-unprivileged:alpine

# Copy config
COPY nginx.conf /etc/nginx/nginx.conf

# Copy artifacts
COPY --from=builder /app/dist /usr/share/nginx/html
COPY fonts /usr/share/nginx/html/fonts

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
