import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyADrmOZUQgwVouwDK8CEPAqQss5nsbtcTA",
  authDomain: "section-a-25a80.firebaseapp.com",
  projectId: "section-a-25a80",
  storageBucket: "section-a-25a80.firebasestorage.app",
  messagingSenderId: "829962681954",
  appId: "1:829962681954:web:00f48015fb91d127d59b3b",
  measurementId: "G-7QKVLZGKQ3",
  databaseURL: "https://section-a-25a80-default-rtdb.firebaseio.com" // Update this if your URL is different in the console
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);
