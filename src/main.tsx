import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// Import Capacitor
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Keyboard } from '@capacitor/keyboard'
import { SplashScreen } from '@capacitor/splash-screen'

const rootElement = document.getElementById("root");

// Configure native features
async function initApp() {
  console.log('BCC Portal: Initializing Application...');

  if (Capacitor.isNativePlatform()) {
    try {
      // Set status bar style
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#22C55E' });

      // Configure keyboard
      await Keyboard.setAccessoryBarVisible({ isVisible: true });
    } catch (e) {
      console.warn('Native initialization error:', e);
    }
  }

  if (rootElement) {
    try {
      const root = createRoot(rootElement);
      root.render(<App />);
      console.log('BCC Portal: React Rendered successfully');

      // Hide startup loading screen and splash screen
      setTimeout(async () => {
        const loader = document.getElementById('loading-screen');
        if (loader) loader.style.display = 'none';

        if (Capacitor.isNativePlatform()) {
          await SplashScreen.hide();
        }
      }, 800);
    } catch (renderError) {
      console.error('BCC Portal: Critical Render Error', renderError);
      handleLoadError(renderError);
    }
  } else {
    console.error('BCC Portal: Root element not found!');
    handleLoadError('Root element not found');
  }
}

function handleLoadError(error: any) {
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: sans-serif; color: #333; background: white; height: 100vh; display: flex; flex-direction: column; justify-content: center;">
        <h1 style="color: #e53e3e;">Application Load Error</h1>
        <p>Something went wrong while starting the portal.</p>
        <pre style="background: #f7fafc; padding: 10px; border-radius: 8px; text-align: left; overflow: auto; font-size: 12px; margin-top: 20px;">
${JSON.stringify(error, Object.getOwnPropertyNames(error))}
        </pre>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #22c55e; color: white; border: none; border-radius: 8px; font-weight: bold;">
          Retry Launch
        </button>
      </div>
    `;
  }
  if (Capacitor.isNativePlatform()) {
    SplashScreen.hide();
  }
}

// Start the app
initApp().catch(e => {
  console.error('Bootstrapping error:', e);
  handleLoadError(e);
});
