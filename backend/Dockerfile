# Use Playwright’s official image—everything you need is baked in
FROM mcr.microsoft.com/playwright:focal

# Create app dir
WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install JS deps (Playwright browsers are already installed in this image)
RUN npm install

# Copy the rest of your backend code
COPY . .

# Expose your port
EXPOSE 10000

# Run your server
CMD ["npm", "start"]
