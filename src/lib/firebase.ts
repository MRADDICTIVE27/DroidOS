import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import localConfig from '../../firebase-applet-config.json';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

export const initFirebase = async (): Promise<{ auth: Auth; db: Firestore } | null> => {
  if (auth && db) return { auth, db };
  
  try {
    let config: any = null;

    // 1. Try to load from Vite environment variables (for Vercel deployments)
    if (import.meta.env.VITE_FIREBASE_API_KEY) {
      config = {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
        firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID
      };
    } else if (localConfig && localConfig.apiKey) {
      // 2. Local config from project root
      config = localConfig;
    }

    if (!config || !config.apiKey) {
       console.warn("No valid Firebase configuration found.");
       return null;
    }

    if (getApps().length === 0) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    
    auth = getAuth(app);
    
    // Set persistence to LOCAL
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (e) {
      console.warn("Could not set local persistence:", e);
    }
    
    // Explicitly connect to the named database if provided, otherwise default
    if (config.firestoreDatabaseId) {
      db = getFirestore(app, config.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
    
    return { auth, db };
  } catch (error) {
    console.warn('Firebase configuration error:', error);
    return null;
  }
};

