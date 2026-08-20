
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { initFirebase } from './firebase';


const provider = new GoogleAuthProvider();
// The scopes confirmed by user
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly'
];
SCOPES.forEach(scope => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  let unsubscribe: (() => void) | null = null;

  initFirebase().then(firebase => {
    const authInstance = firebase?.auth;
    if (!authInstance) {
      if (onAuthFailure) onAuthFailure();
      return;
    }
    unsubscribe = onAuthStateChanged(authInstance, async (user: User | null) => {
      if (user) {
        if (cachedAccessToken) {
          if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
        } else if (!isSigningIn) {
          if (onAuthFailure) onAuthFailure();
        }
      } else {
        cachedAccessToken = null;
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
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => cachedAccessToken;

export const logout = async () => {
  const firebase = await initFirebase();
  const authInstance = firebase?.auth;
  if (authInstance) {
    await authInstance.signOut();
  }
  cachedAccessToken = null;
};
