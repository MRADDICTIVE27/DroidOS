
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { initFirebase } from './firebase';

const provider = new GoogleAuthProvider();
// Request full YouTube permissions to read and post chat messages
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];
SCOPES.forEach(scope => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  let unsubscribe: (() => void) | null = null;
  cachedAccessToken = localStorage.getItem('droidos_token');

  initFirebase().then(firebase => {
    const authInstance = firebase?.auth;
    if (!authInstance) {
      if (onAuthFailure) onAuthFailure();
      return;
    }
    unsubscribe = onAuthStateChanged(authInstance, async (user: User | null) => {
      if (user) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        cachedAccessToken = null;
        localStorage.removeItem('droidos_token');
        if (onAuthFailure) onAuthFailure();
      }
    });
  });

  return () => {
    if (unsubscribe) unsubscribe();
  };
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  const firebase = await initFirebase();
  const authInstance = firebase?.auth;
  if (!authInstance) {
    throw new Error('Firebase is not configured. Please check your config.');
  }

  try {
    isSigningIn = true;
    const result = await signInWithPopup(authInstance, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || '';
    if (token) {
      cachedAccessToken = token;
      localStorage.setItem('droidos_token', cachedAccessToken);
    }
    return { user: result.user, accessToken: token };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => cachedAccessToken || localStorage.getItem('droidos_token');

export const logout = async () => {
  const firebase = await initFirebase();
  const authInstance = firebase?.auth;
  if (authInstance) {
    await authInstance.signOut();
  }
  cachedAccessToken = null;
  localStorage.removeItem('droidos_token');
};

