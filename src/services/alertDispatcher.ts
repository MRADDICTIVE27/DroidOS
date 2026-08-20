import { initFirebase } from '../lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export interface OverlayAlert {
  id: string;
  type: 'redeem' | 'shoutout' | 'sound' | 'duel' | 'test' | 'boss';
  title: string;
  subtitle?: string;
  username?: string;
  avatarUrl?: string;
  gifUrl?: string;
  audioUrl?: string;
  synthPreset?: string;
  volume?: number;
  durationMs?: number;
  timestamp?: number;
  theme?: string;
  customMessage?: string;
  pointsCost?: number;
}

const BROADCAST_CHANNEL_NAME = 'droidos_overlay_alerts';
const LOCAL_STORAGE_KEY = 'droidos_latest_alert';

let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch (e) {
  console.warn('[AlertDispatcher] BroadcastChannel not supported:', e);
}

/**
 * Dispatches an alert to all listening OBS Browser Sources via:
 * 1. BroadcastChannel (0ms local window/iframe sync)
 * 2. LocalStorage storage event (Cross-window backup)
 * 3. Server-side API /api/overlay/alerts (For OBS running in separate process/machine)
 * 4. Firestore alerts collection (Cloud synchronization)
 */
export async function dispatchOverlayAlert(alert: OverlayAlert): Promise<void> {
  const alertWithTimestamp: OverlayAlert = {
    ...alert,
    id: alert.id || `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: alert.timestamp || Date.now(),
    durationMs: alert.durationMs || 5000,
    volume: alert.volume !== undefined ? alert.volume : 0.6
  };

  console.log('[AlertDispatcher] Dispatching alert to OBS Overlay:', alertWithTimestamp);

  // 1. Broadcast Channel
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage(alertWithTimestamp);
    }
  } catch (e) {
    console.warn('[AlertDispatcher] BroadcastChannel error:', e);
  }

  // 2. Local Storage event
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(alertWithTimestamp));
    }
  } catch (e) {
    console.warn('[AlertDispatcher] LocalStorage error:', e);
  }

  // 3. Server-side in-memory queue
  try {
    fetch('/api/overlay/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertWithTimestamp)
    }).catch((e) => console.warn('[AlertDispatcher] Server alert dispatch warning:', e));
  } catch (e) {
    // Ignore offline errors
  }

  // 4. Firestore (if configured)
  try {
    const firebase = await initFirebase();
    if (firebase?.db) {
      await addDoc(collection(firebase.db, 'alerts'), {
        ...alertWithTimestamp,
        createdAt: serverTimestamp()
      });
    }
  } catch (e) {
    console.warn('[AlertDispatcher] Firestore sync note (optional):', e);
  }
}

/**
 * Subscribes to incoming alerts from all transport layers
 */
export function subscribeToOverlayAlerts(
  onAlert: (alert: OverlayAlert) => void
): () => void {
  const handledIds = new Set<string>();

  const handleUniqueAlert = (alert: OverlayAlert) => {
    if (!alert || !alert.id) return;
    if (handledIds.has(alert.id)) return;
    // Don't replay alerts older than 15 seconds on initial connect
    if (alert.timestamp && Date.now() - alert.timestamp > 15000) return;

    handledIds.add(alert.id);
    if (handledIds.size > 200) {
      const first = handledIds.values().next().value;
      if (first) handledIds.delete(first);
    }

    onAlert(alert);
  };

  // 1. Broadcast Channel listener
  let localChannel: BroadcastChannel | null = null;
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      localChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      localChannel.onmessage = (event) => {
        if (event.data) {
          handleUniqueAlert(event.data);
        }
      };
    }
  } catch (e) {
    console.warn('[AlertSubscriber] BroadcastChannel listener error:', e);
  }

  // 2. Storage event listener (Cross-tab/window)
  const storageListener = (e: StorageEvent) => {
    if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        handleUniqueAlert(parsed);
      } catch (err) {
        console.warn('[AlertSubscriber] Storage parse error:', err);
      }
    }
  };
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', storageListener);
  }

  // 3. Server-side long-polling / polling backup (every 1.5s)
  let isPolling = true;
  let lastServerTimestamp = Date.now() - 5000;

  const pollServer = async () => {
    if (!isPolling) return;
    try {
      const res = await fetch(`/api/overlay/alerts?since=${lastServerTimestamp}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.alerts)) {
          for (const a of data.alerts) {
            handleUniqueAlert(a);
            if (a.timestamp && a.timestamp > lastServerTimestamp) {
              lastServerTimestamp = a.timestamp;
            }
          }
        }
      }
    } catch (e) {
      // Ignore network errors
    } finally {
      if (isPolling) {
        setTimeout(pollServer, 1500);
      }
    }
  };
  pollServer();

  // Cleanup
  return () => {
    isPolling = false;
    if (localChannel) {
      localChannel.close();
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', storageListener);
    }
  };
}
