#!/bin/bash

# Render build script for eProcurement Scraper
echo "🚀 Starting Render build process..."

# Install system dependencies for Puppeteer
echo "📦 Installing system dependencies..."
apt-get update -qq
apt-get install -y -qq \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils

# Install Chrome
echo "🌐 Installing Google Chrome..."
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list
apt-get update -qq
apt-get install -y -qq google-chrome-stable

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Puppeteer browser
echo "🕷️ Installing Puppeteer browser..."
npx puppeteer browsers install chrome

# Set environment variable for Chrome path
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

echo "✅ Render build completed successfully!" 