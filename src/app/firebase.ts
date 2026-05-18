import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// Replace these with your actual Firebase project configuration values
export const firebaseConfig = {
  apiKey: "AIzaSyADrmOZUQgwVouwDK8CEPAqQss5nsbtcTA",
  authDomain: "section-a-25a80.firebaseapp.com",
  projectId: "section-a-25a80",
  storageBucket: "section-a-25a80.firebasestorage.app",
  messagingSenderId: "829962681954",
  appId: "1:829962681954:web:00f48015fb91d127d59b3b",
  measurementId: "G-7QKVLZGKQ3"
};

// Check if placeholders are still present
if (firebaseConfig.apiKey === "YOUR_API_KEY") {
  console.warn("Firebase is not configured. Please update firebase.ts with your real API keys.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
