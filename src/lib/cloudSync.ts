import { doc, getDoc, setDoc } from 'firebase/firestore';
import { initFirebase } from './firebase';

export const saveStateToCloud = async (state: any) => {
  try {
    const firebase = await initFirebase();
    if (!firebase?.db) return false;
    
    // Check if user is signed in to auth
    const auth = firebase.auth;
    if (!auth.currentUser) return false;
    
    const docRef = doc(firebase.db, 'workspaces', auth.currentUser.uid);
    await setDoc(docRef, state, { merge: true });
    return true;
  } catch (error) {
    console.warn('[CloudSync] Failed to save state to cloud:', error);
    return false;
  }
};

export const loadStateFromCloud = async () => {
  try {
    const firebase = await initFirebase();
    if (!firebase?.db) return null;
    
    // Check if user is signed in
    const auth = firebase.auth;
    if (!auth.currentUser) return null;
    
    const docRef = doc(firebase.db, 'workspaces', auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.warn('[CloudSync] Failed to load state from cloud:', error);
    return null;
  }
};
