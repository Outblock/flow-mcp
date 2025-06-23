#!/bin/bash

echo "🚀 Noah Business API MCP - Quick Start"
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ ! -f "dist/index.js" ]; then
    echo "❌ Build failed. Please check the error messages above."
    exit 1
fi

echo "✅ Build successful!"

# Test the MCP server
echo "🧪 Testing MCP server..."
node test-mcp.js

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To connect to Cursor:"
echo "1. Open Cursor settings"
echo "2. Find the MCP section"
echo "3. Add the configuration from mcp-config.json"
echo "4. Replace 'your_noah_api_key_here' with your actual API key"
echo "5. Restart Cursor"
echo ""
echo "For detailed instructions, see CURSOR_SETUP.md" 