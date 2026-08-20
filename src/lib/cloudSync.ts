import { doc, getDoc, setDoc } from 'firebase/firestore';
import { initFirebase } from './firebase';
import { createDefaultUserState, getUserStatePayload } from './userState';

const getUserStateRef = async () => {
  const firebase = await initFirebase();
  if (!firebase?.db) return null;
  const auth = firebase.auth;
  if (!auth.currentUser) return null;
  return doc(firebase.db, 'workspaces', auth.currentUser.uid);
};

const ensureUserStateDocument = async () => {
  const docRef = await getUserStateRef();
  if (!docRef) return null;

  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    await setDoc(docRef, getUserStatePayload(createDefaultUserState()), { merge: true });
  }

  return docRef;
};

export const saveStateToCloud = async (state: any) => {
  try {
    const docRef = await ensureUserStateDocument();
    if (!docRef) return false;

    const payload = getUserStatePayload(state);
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    console.warn('[CloudSync] Failed to save state to cloud:', error);
    return false;
  }
};

export const loadStateFromCloud = async () => {
  try {
    const docRef = await getUserStateRef();
    if (!docRef) return null;

    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }

    await setDoc(docRef, getUserStatePayload(createDefaultUserState()), { merge: true });
    return getUserStatePayload(createDefaultUserState());
  } catch (error) {
    console.warn('[CloudSync] Failed to load state from cloud:', error);
    return null;
  }
};
