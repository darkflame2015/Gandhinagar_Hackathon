#!/bin/bash
# Build script for Render deployment

echo "🔧 Installing dependencies..."
npm install

echo "🏗️  Building TypeScript..."
npm run build

echo "✅ Build complete!"
echo "📂 Output directory: dist/"
ls -la dist/
