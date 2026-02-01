# Stage 1: Build with Bun
FROM oven/bun:1-alpine as builder
WORKDIR /app

# Copy source files
COPY . .

# Run the build script
RUN bun run build.ts

# Stage 2: Serve with Nginx
FROM nginxinc/nginx-unprivileged:alpine

# Copy the custom configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy ONLY the built artifacts from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
