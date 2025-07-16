#!/bin/bash

echo "🚀 Starting Render build process..."

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
npm install

# Install Puppeteer browser
echo "🌐 Installing Puppeteer Chrome browser..."
npx puppeteer browsers install chrome

# Update package lists
echo "🔄 Updating package lists..."
apt-get update -qq

# Install required packages for Chrome
echo "📥 Installing Chrome dependencies..."
apt-get install -y -qq wget gnupg ca-certificates

# Add Google Chrome repository
echo "🔑 Adding Google Chrome repository..."
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - > /dev/null 2>&1
echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list

# Update package lists again
echo "🔄 Updating package lists after adding Chrome repository..."
apt-get update -qq

# Install Google Chrome
echo "🌐 Installing Google Chrome..."
apt-get install -y -qq google-chrome-stable

# Verify Chrome installation
echo "✅ Verifying Chrome installation..."
google-chrome-stable --version
ls -l /usr/bin/google-chrome*
which google-chrome-stable

# Test Chrome executable
echo "🧪 Testing Chrome executable..."
if [ -f "/usr/bin/google-chrome-stable" ]; then
    echo "✅ Chrome found at /usr/bin/google-chrome-stable"
else
    echo "❌ Chrome not found at expected location"
    exit 1
fi

echo "✅ Build process completed successfully!" 