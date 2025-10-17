#!/bin/bash

# Development Environment Setup Script
# This script sets up the development environment including data files

echo "🚀 Setting up development environment..."

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

# Check if AWS is configured
echo "🔐 Checking AWS configuration..."
if ! aws sts get-caller-identity --profile default >/dev/null 2>&1; then
    echo "⚠️  AWS not configured. Setting up AWS SSO..."
    ./scripts/setup-aws-sso.sh
fi

# Fetch data files
echo "📥 Fetching development data files..."
npm run fetch-data

# Check if data was successfully downloaded
if [ -d "public/imp" ] && [ -d "public/perf" ]; then
    echo "✅ Development environment setup complete!"
    echo "📊 Data files ready in public/ directory"
    echo "🎯 You can now run: npm run dev"
else
    echo "❌ Failed to download data files"
    echo "💡 Try running: npm run fetch-data manually"
    exit 1
fi