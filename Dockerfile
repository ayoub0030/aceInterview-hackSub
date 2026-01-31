# Stage 1: Build the frontend
FROM node:20-alpine AS frontend-builder

# Set working directory for frontend
WORKDIR /app/frontend

# Copy frontend files
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Build the frontend
RUN npm run build

# Stage 2: Build the backend
FROM node:20-alpine AS backend-builder

# Set working directory for backend
WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy backend source code
COPY . .

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Stage 3: Create the production image
FROM node:20-alpine

# Install dependencies required for Next.js and other tools
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# Copy package files and install production dependencies
COPY --from=backend-builder /app/package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=backend-builder /app/ ./

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Command to run the application
CMD ["npm", "start"]
