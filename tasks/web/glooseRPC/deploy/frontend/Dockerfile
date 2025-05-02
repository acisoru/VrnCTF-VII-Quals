FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build Next.js app, i believe public env vars are bundled at build time
RUN NODE_TLS_REJECT_UNAUTHORIZED=0 NEXT_PUBLIC_GRPC_WEB_URL=/grpc npm run build

# Expose port for Next.js app
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
