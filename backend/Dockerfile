# Use official Node slim image
FROM node:20-slim

# Install necessary libs for Puppeteer (Chromium) to run
RUN apt-get update && apt-get install -y \
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
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Create non-root user for running Puppeteer
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser && \
    mkdir -p /home/pptruser/Downloads && \
    chown -R pptruser:pptruser /home/pptruser

# Set working directory
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies, including Puppeteer
RUN npm install

# Copy application code
COPY . .

# Allow the non-root user to own the app directory
RUN chown -R pptruser:pptruser /app

# Run as non-root user
USER pptruser

# Expose the port your Node app listens on
EXPOSE 3000

# Launch the app
CMD ["node", "index.js"]
