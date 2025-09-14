#!/bin/bash

# Redstone Oracle Price Dashboard Deployment Script
echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running linter..."
npm run lint

# Build the application
echo "🏗️  Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 Your Redstone Oracle Price Dashboard is ready for deployment!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Push your code to GitHub"
    echo "   2. Connect to Vercel/Netlify for automatic deployment"
    echo "   3. Or use Docker: docker build -t redstone-dashboard ."
    echo "   4. Or deploy manually to your server"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
