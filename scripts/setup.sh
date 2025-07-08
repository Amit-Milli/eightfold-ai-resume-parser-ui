#!/bin/bash

# Eightfold AI Resume Parser UI Setup Script
# This script helps configure the frontend for connecting to the serverless backend

set -e

echo "🚀 Eightfold AI Resume Parser UI Setup"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20.x or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20.x or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm 10.x or higher."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# API Gateway URL for the serverless backend
# Replace with your actual API Gateway URL after deployment
REACT_APP_API_URL=https://your-api-gateway-url.execute-api.region.amazonaws.com/dev

# Development settings
REACT_APP_ENVIRONMENT=development
REACT_APP_DEBUG=true

# Optional: Enable mock data fallback when backend is unavailable
REACT_APP_USE_MOCK_FALLBACK=true
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

# Check if backend is deployed
echo ""
echo "🔧 Backend Configuration"
echo "========================"
echo "To connect to the serverless backend, you need to:"
echo ""
echo "1. Deploy the backend using the serverless framework:"
echo "   cd ../resume-parser-be-serverless"
echo "   npm install"
echo "   serverless deploy --stage dev"
echo ""
echo "2. Update the REACT_APP_API_URL in .env with your API Gateway URL"
echo "   The URL format is: https://{api-id}.execute-api.{region}.amazonaws.com/{stage}"
echo ""
echo "3. Start the frontend:"
echo "   npm start"
echo ""

# Ask if user wants to start the application
read -p "Do you want to start the application now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting the application..."
    npm start
else
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "To start the application later, run:"
    echo "  npm start"
    echo ""
    echo "To build for production:"
    echo "  npm run build"
fi 