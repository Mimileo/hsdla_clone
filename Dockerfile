# Use official Node.js 18 Debian-based image
FROM node:18

# Install Puppeteer dependencies using apt-get
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libfreetype6 \
    fonts-freefont-ttf \
    fontconfig \
    libharfbuzz0b \
    ca-certificates \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Set environment variables for Puppeteer to use system Chromium
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Set working directory
WORKDIR /app

# Copy root package.json and lockfile if any
COPY package*.json ./

# Install root dependencies if needed
RUN npm install

# Copy frontend and backend folders
COPY frontend ./frontend
COPY backend ./backend

# Install frontend dependencies and build frontend
RUN npm --prefix frontend install
RUN npm --prefix frontend run build

# Copy frontend build output (frontend/dist) to backend/public
RUN rm -rf backend/public && mkdir -p backend/public
RUN cp -r frontend/dist/* backend/public/

# Install backend dependencies and build backend
RUN npm --prefix backend install
RUN npm --prefix backend run build

# Expose backend port
EXPOSE 4004

# Start the backend server
CMD ["node", "backend/dist/server.js"]
