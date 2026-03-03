#!/bin/bash

# Zero-downtime deployment script
# Builds in a temp folder and swaps when complete

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUILD_DIR="$PROJECT_DIR/.next"
TEMP_BUILD_DIR="$PROJECT_DIR/.next-temp"
BACKUP_BUILD_DIR="$PROJECT_DIR/.next-backup"
PM2_PROCESS="trafficsource"

echo -e "${YELLOW}Starting zero-downtime deployment...${NC}"
echo "Project directory: $PROJECT_DIR"

cd "$PROJECT_DIR"

# Step 1: Pull latest changes
echo -e "\n${YELLOW}[1/5] Pulling latest changes...${NC}"
git pull

# Step 2: Clean up any previous temp/backup directories
echo -e "\n${YELLOW}[2/5] Cleaning up old temp directories...${NC}"
rm -rf "$TEMP_BUILD_DIR" "$BACKUP_BUILD_DIR"

# Step 3: Set Next.js to build to temp directory and run build
echo -e "\n${YELLOW}[3/5] Building to temporary directory...${NC}"
NEXT_BUILD_DIR=".next-temp" yarn build

if [ ! -d "$TEMP_BUILD_DIR" ]; then
    echo -e "${RED}Build failed - temp directory not created${NC}"
    exit 1
fi

echo -e "${GREEN}Build completed successfully!${NC}"

# Step 4: Swap directories atomically
echo -e "\n${YELLOW}[4/5] Swapping build directories...${NC}"

# Move current build to backup (if exists)
if [ -d "$BUILD_DIR" ]; then
    mv "$BUILD_DIR" "$BACKUP_BUILD_DIR"
    echo "  - Backed up current build"
fi

# Move new build to production
mv "$TEMP_BUILD_DIR" "$BUILD_DIR"
echo "  - Swapped new build into place"

# Clean up backup
rm -rf "$BACKUP_BUILD_DIR"
echo "  - Removed backup directory"

# Step 5: Restart PM2
echo -e "\n${YELLOW}[5/5] Restarting PM2 process...${NC}"
pm2 restart "$PM2_PROCESS"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
