import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// Import Capacitor
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'
import { SplashScreen } from '@capacitor/splash-screen'

// Configure native features
if (Capacitor.isNativePlatform()) {
  // Set status bar style
  StatusBar.setStyle({ style: Style.Light })
  StatusBar.setBackgroundColor({ color: '#22C55E' })

  // Configure keyboard
  Keyboard.setAccessoryBarVisible({ isVisible: true })

  // Hide splash screen after a short delay to ensure React has rendered
  setTimeout(() => {
    SplashScreen.hide().catch(err => console.warn('SplashScreen.hide failed', err));
  }, 1000);
}

// Global error handler for debugging
window.onerror = (message, source, lineno, colno, error) => {
  console.error('GLOBAL ERROR:', message, error);
  // Force hide splash screen on error so user isn't stuck
  if (Capacitor.isNativePlatform()) {
    SplashScreen.hide();
  }
};

createRoot(document.getElementById("root")!).render(<App />);
