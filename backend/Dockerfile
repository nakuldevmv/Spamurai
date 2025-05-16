# Use official Node slim image
FROM node:20-slim

# Install Chrome for Puppeteer and necessary libs
RUN apt-get update && apt-get install -y \
    chromium \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    --no-install-recommends && rm -rf /var/lib/apt/lists/*

# Allow Puppeteer to find Chrome
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium"

# Create non-root user for running Puppeteer
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser && \
    mkdir -p /home/pptruser/Downloads && chown -R pptruser:pptruser /home/pptruser

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Ensure Puppeteer downloads its binary if needed
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false

# Install dependencies and fetch Puppeteer browsers if needed
RUN npm install && npx puppeteer install

# Copy application code
COPY . .

# Change ownership to non-root
RUN chown -R pptruser:pptruser /app

# Run as non-root user
USER pptruser

# Expose the port your Node app listens on
EXPOSE 10000

# Launch the app
CMD ["node", "index.js"]
