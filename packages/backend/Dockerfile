# Development Dockerfile for Backend API
FROM node:20-alpine AS development

# Install dependencies for Prisma
RUN apk add --no-cache openssl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Development command (with hot reload)
CMD ["npm", "run", "dev"]

# Production build stage
FROM node:20-alpine AS production

# Install dependencies for Prisma
RUN apk add --no-cache openssl

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from development stage
COPY --from=development /app/dist ./dist
COPY --from=development /app/prisma ./prisma
COPY --from=development /app/node_modules/.prisma ./node_modules/.prisma

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Production command
CMD ["npm", "run", "start"]