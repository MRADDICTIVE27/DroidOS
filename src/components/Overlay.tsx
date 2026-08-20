import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { initFirebase } from '../lib/firebase';
import { playCustomAudioUrl } from '../services/soundService';

export const Overlay: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<any | null>(null);
  const [status, setStatus] = useState<string>('Connecting...');

  useEffect(() => {
    let unsubscribe: () => void;
    
    const setup = async () => {
      try {
        const firebase = await initFirebase();
        if (!firebase || !firebase.db) {
            setStatus('Error: Firebase initialization failed');
            return;
        }
        setStatus('Connected');

        // Listen to an 'alerts' collection in Firestore
        console.log("Setting up snapshot listener on 'alerts' collection...");
        const q = query(
          collection(firebase.db, 'alerts'),
          orderBy('timestamp', 'desc'),
          limit(1)
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          console.log("Snapshot received, docs:", snapshot.docs.length);
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const alert = change.doc.data();
              console.log("New alert received:", alert);
              setActiveAlert(alert);
              
              // Trigger audio if URL exists
              if (alert.audioUrl) {
                playCustomAudioUrl(alert.audioUrl, alert.volume || 0.5);
              }

              // Auto-hide alert
              setTimeout(() => {
                setActiveAlert(null);
              }, alert.durationMs || 5000);
            }
          });
        }, (error) => {
          console.error("Snapshot error:", error);
          setStatus('Snapshot error');
        });
      } catch (e) {
          console.error("Setup error:", e);
          setStatus('Error: ' + e);
      }
    };

    setup();
    return () => unsubscribe && unsubscribe();
  }, []);

  if (!activeAlert) return (
    <div className="fixed top-4 left-4 text-white bg-black/50 p-2 text-xs">
        OBS Overlay: {status}
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent pointer-events-none">
      <div className="animate-in fade-in zoom-in duration-300">
        {activeAlert.gifUrl && (
          <img 
            src={activeAlert.gifUrl} 
            alt="Alert" 
            className="max-w-[400px] max-h-[400px] object-contain"
          />
        )}
      </div>
    </div>
  );
};
