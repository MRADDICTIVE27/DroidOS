import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

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
    } 
    
    // 2. Fallback to local config file (for AI Studio preview ONLY)
    if (!config) {
      try {
        const configPath = '../../firebase-applet-config.json';
        const localConfig = await import(/* @vite-ignore */ configPath);
        config = localConfig.default || localConfig;
      } catch (e) {
        console.warn("Could not load AI Studio local firebase config");
      }
    }

    if (!config || !config.apiKey) {
       console.warn("No valid Firebase configuration found.");
       return null;
    }

    app = initializeApp(config);
    auth = getAuth(app);
    
    // Set persistence to LOCAL
    await setPersistence(auth, browserLocalPersistence);
    
    // Explicitly connect to the named database if provided, otherwise default
    if (config.firestoreDatabaseId) {
      db = getFirestore(app, config.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
    
    return { auth, db };
  } catch (error) {
    console.warn('Firebase configuration missing or invalid. Cloud features will be disabled.', error);
    return null;
  }
};
