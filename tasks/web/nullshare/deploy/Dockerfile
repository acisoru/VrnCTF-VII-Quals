
# Build stage
FROM oven/bun:latest as builder

WORKDIR /app

# Copy package files
COPY fullstack/package.json fullstack/package-lock.json ./

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY fullstack/ ./

# Build the application
RUN bun run build

# Production stage
FROM oven/bun:latest as production

WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./

# Expose the port
EXPOSE 3000

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

# Start the application
CMD ["bun", "run", ".output/server/index.mjs"]
