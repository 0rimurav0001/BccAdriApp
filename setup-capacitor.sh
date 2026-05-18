#!/bin/bash

# BCC Academic Portal - Capacitor Setup Script
# This script helps you set up Capacitor for mobile deployment

echo "🎓 BCC Academic Portal - Capacitor Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in correct directory
if [ ! -f "package.json" ]; then
    echo "${YELLOW}⚠️  Warning: package.json not found${NC}"
    echo "Please run this script from your project root directory"
    exit 1
fi

echo "${BLUE}Step 1: Installing Capacitor...${NC}"
pnpm add @capacitor/core @capacitor/cli
pnpm add -D @capacitor/android @capacitor/ios

echo ""
echo "${BLUE}Step 2: Installing Capacitor Plugins...${NC}"
pnpm add @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar @capacitor/splash-screen

echo ""
echo "${BLUE}Step 3: Initializing Capacitor...${NC}"
npx cap init "BCC Portal" "com.bcc.academicportal" --web-dir=dist

echo ""
echo "${GREEN}✅ Capacitor Core Installed!${NC}"
echo ""

# Ask if user wants to add platforms
read -p "Do you want to add Android platform? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "${BLUE}Adding Android platform...${NC}"
    npx cap add android
    echo "${GREEN}✅ Android platform added!${NC}"
fi

echo ""
read -p "Do you want to add iOS platform? (requires macOS) (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "${BLUE}Adding iOS platform...${NC}"
    npx cap add ios
    echo "${GREEN}✅ iOS platform added!${NC}"
fi

echo ""
echo "${BLUE}Step 4: Building web assets...${NC}"
npm run build

echo ""
echo "${BLUE}Step 5: Syncing to native platforms...${NC}"
npx cap sync

echo ""
echo "${GREEN}========================================${NC}"
echo "${GREEN}✅ Setup Complete!${NC}"
echo "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "📱 To open in Android Studio:"
echo "   ${BLUE}npx cap open android${NC}"
echo ""
echo "📱 To open in Xcode (macOS only):"
echo "   ${BLUE}npx cap open ios${NC}"
echo ""
echo "🔄 After making code changes:"
echo "   ${BLUE}npm run build && npx cap sync${NC}"
echo ""
echo "🚀 To run on device:"
echo "   ${BLUE}npx cap run android${NC}"
echo "   ${BLUE}npx cap run ios${NC}"
echo ""
echo "📖 Read CAPACITOR_SETUP_GUIDE.md for detailed instructions"
echo ""
