# Capacitor Integration Guide
## Converting BCC Academic Portal to Hybrid Mobile App

This guide will help you convert the web application into a hybrid mobile app using Capacitor.

## Prerequisites
- Node.js and npm installed
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)
- A standard Vite + React project (not Figma Make environment)

## Step 1: Setup Standard Vite Project

```bash
# Create a new Vite + React project
npm create vite@latest bcc-portal -- --template react-ts
cd bcc-portal

# Copy all your src/ files from Figma Make to this project
# - src/app/
# - src/imports/
# - src/styles/
```

## Step 2: Install Dependencies

```bash
# Install all required dependencies
pnpm add react react-dom
pnpm add lucide-react date-fns

# Install Capacitor
pnpm add @capacitor/core @capacitor/cli
pnpm add @capacitor/ios @capacitor/android

# Install Capacitor plugins for native features
pnpm add @capacitor/app @capacitor/haptics @capacitor/keyboard @capacitor/status-bar
```

## Step 3: Initialize Capacitor

```bash
npx cap init
```

When prompted:
- **App name**: BCC Academic Portal
- **App ID**: com.bcc.academicportal
- **Web directory**: dist

## Step 4: Update capacitor.config.ts

Create `capacitor.config.ts` in your project root:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bcc.academicportal',
  appName: 'BCC Portal',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#22C55E",
      showSpinner: false
    }
  }
};

export default config;
```

## Step 5: Update vite.config.ts

Ensure your Vite config is compatible with Capacitor:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Important for Capacitor
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
```

## Step 6: Update index.html

Make sure your `index.html` includes:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <title>BCC Academic Portal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

## Step 7: Add Capacitor to Main Entry

Update `src/main.tsx`:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/theme.css'
import './styles/fonts.css'

// Import Capacitor
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'

// Configure native features
if (Capacitor.isNativePlatform()) {
  // Set status bar style
  StatusBar.setStyle({ style: Style.Light })
  StatusBar.setBackgroundColor({ color: '#22C55E' })
  
  // Configure keyboard
  Keyboard.setAccessoryBarVisible({ isVisible: true })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

## Step 8: Build Web Assets

```bash
# Build the web application
npm run build
```

## Step 9: Add Platforms

```bash
# Add Android platform
npx cap add android

# Add iOS platform (macOS only)
npx cap add ios
```

## Step 10: Sync and Open

```bash
# Sync web assets to native platforms
npx cap sync

# Open in Android Studio
npx cap open android

# Open in Xcode (macOS only)
npx cap open ios
```

## Step 11: Configure Android

### Update Android Manifest
Edit `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Add permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="BCC Portal"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        <!-- Your activities -->
    </application>
</manifest>
```

### Update build.gradle
Edit `android/app/build.gradle`:

```gradle
android {
    namespace "com.bcc.academicportal"
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "com.bcc.academicportal"
        minSdkVersion 22
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

## Step 12: Configure iOS

### Update Info.plist
Edit `ios/App/App/Info.plist`:

```xml
<dict>
    <key>CFBundleDisplayName</key>
    <string>BCC Portal</string>
    <key>CFBundleIdentifier</key>
    <string>com.bcc.academicportal</string>
    <!-- Add camera/photo library permissions if needed -->
</dict>
```

## Step 13: Add App Icons and Splash Screen

### For Android:
- Place icon files in `android/app/src/main/res/mipmap-*/`
- Sizes: 48x48, 72x72, 96x96, 144x144, 192x192

### For iOS:
- Use Xcode to add app icons in Assets.xcassets

### Recommended Tool:
Use https://icon.kitchen/ to generate all icon sizes from your BCC logo

## Step 14: Build Release APK/IPA

### Android:
```bash
cd android
./gradlew assembleRelease

# APK will be at: android/app/build/outputs/apk/release/app-release.apk
```

### iOS:
- Open in Xcode
- Select your device/simulator
- Product > Archive
- Distribute App

## Firebase Integration (Optional)

If you want to connect to real Firebase backend:

```bash
pnpm add firebase
```

Create `src/firebase/config.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

## Useful Capacitor Plugins

```bash
# Push notifications
pnpm add @capacitor/push-notifications

# Camera
pnpm add @capacitor/camera

# File system
pnpm add @capacitor/filesystem

# Share
pnpm add @capacitor/share

# Network status
pnpm add @capacitor/network
```

## Development Workflow

```bash
# 1. Make changes to your React code
# 2. Build the web assets
npm run build

# 3. Sync to native platforms
npx cap sync

# 4. Run on device/emulator
npx cap run android
npx cap run ios

# Or open in IDE
npx cap open android
npx cap open ios
```

## Testing on Device

### Android:
1. Enable USB debugging on your Android device
2. Connect via USB
3. Run: `npx cap run android --target=YOUR_DEVICE_ID`

### iOS:
1. Connect iPhone via USB
2. Open in Xcode: `npx cap open ios`
3. Select your device and click Run

## Publishing

### Google Play Store:
1. Create signed APK/AAB
2. Create Play Store listing
3. Upload AAB file
4. Submit for review

### Apple App Store:
1. Create App Store Connect listing
2. Archive in Xcode
3. Upload via Xcode
4. Submit for review

## Troubleshooting

### White screen on app launch:
- Check `base: './'` in vite.config.ts
- Verify `webDir: 'dist'` in capacitor.config.ts
- Run `npx cap sync` after build

### CORS errors:
- Capacitor uses `capacitor://` or `https://` schemes
- No CORS issues with proper server configuration

### Build errors:
- Clear build cache: `npx cap sync --inline`
- Clean Android: `cd android && ./gradlew clean`
- Clean iOS: Xcode > Product > Clean Build Folder

## Additional Resources

- Capacitor Docs: https://capacitorjs.com/docs
- Capacitor Plugins: https://capacitorjs.com/docs/plugins
- Vite Docs: https://vitejs.dev/
- Firebase Docs: https://firebase.google.com/docs

## Notes

- The current code is optimized for Figma Make environment
- You'll need to export and set up in a standard Vite project
- All UI components and logic are already mobile-friendly
- The app uses responsive Tailwind CSS classes
- Firebase integration is currently mocked - replace with real Firebase
