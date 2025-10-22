#!/bin/bash

# Build and deploy script for production deployment
# This script builds the application and creates a zip archive ready for upload

set -e  # Exit on any error

echo "🚀 Starting build and deployment package creation..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if zip command is available
if ! command -v zip &> /dev/null; then
    echo -e "${RED}Error: 'zip' command not found. Please install zip utility.${NC}"
    echo "On Ubuntu/Debian: sudo apt install zip"
    echo "On macOS: zip should be pre-installed"
    exit 1
fi

# Step 1: Run the build process
echo -e "${BLUE}📦 Building the application...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}Error: Build failed - dist directory not found${NC}"
    exit 1
fi

# Step 2: Create deployment directory and zip archive
echo -e "${BLUE}📁 Creating deployment archive...${NC}"

# Get timestamp for unique archive names
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
ARCHIVE_NAME="deployment-${TIMESTAMP}.zip"

# Create the zip archive from the dist folder contents
cd dist
zip -r "../${ARCHIVE_NAME}" . -x "*.DS_Store" "*.gitkeep"
cd ..

# Display results
ARCHIVE_SIZE=$(du -h "${ARCHIVE_NAME}" | cut -f1)
echo -e "${GREEN}✅ Deployment package created successfully!${NC}"
echo -e "${GREEN}📦 Archive: ${ARCHIVE_NAME}${NC}"
echo -e "${GREEN}📏 Size: ${ARCHIVE_SIZE}${NC}"
echo -e "${GREEN}📂 Contents: All files from dist/ folder${NC}"

echo ""
echo -e "${BLUE}🎯 Ready for deployment:${NC}"
echo "   Upload ${ARCHIVE_NAME} to your production server"
echo "   Extract the contents to your web server's document root"

# Optional: List contents of the archive for verification
# Optional: Clean up old deployment archives (keep last 5)
echo ""
echo -e "${BLUE}🧹 Cleaning up old deployment archives...${NC}"
OLD_ARCHIVES=($(ls -t deployment-*.zip 2>/dev/null | tail -n +6))
if [ ${#OLD_ARCHIVES[@]} -gt 0 ]; then
    for archive in "${OLD_ARCHIVES[@]}"; do
        echo "   Removing old archive: $archive"
        rm "$archive"
    done
    echo "   Cleaned up ${#OLD_ARCHIVES[@]} old archive(s)"
else
    echo "   No old archives to clean up"
fi

echo ""
echo -e "${BLUE}📋 Archive contents:${NC}"
unzip -l "${ARCHIVE_NAME}" | head -20
if [ $(unzip -l "${ARCHIVE_NAME}" | wc -l) -gt 25 ]; then
    echo "   ... and more files"
fi