#!/bin/bash
set -e

echo "Starting Railway build process..."

# Configure npm to avoid cache issues
npm config set cache /tmp/.npm-cache
npm config set prefer-offline true
npm config set audit false
npm config set fund false
npm config set progress false

# Clean any existing node_modules to avoid conflicts
rm -rf node_modules

# Install dependencies
echo "Installing production dependencies..."
npm ci --only=production --silent

# Install dev dependencies for build
echo "Installing dev dependencies..."
npm ci --include=dev --silent

# Build the application
echo "Building application..."
npm run build

# Remove dev dependencies after build
echo "Cleaning up dev dependencies..."
npm prune --production --silent

# Clean npm cache
npm cache clean --force

echo "Build completed successfully!"
