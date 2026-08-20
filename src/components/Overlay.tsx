import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { initFirebase } from '../lib/firebase';
import { playCustomAudioUrl } from '../services/soundService';

export const Overlay: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<any | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    const setup = async () => {
      const firebase = await initFirebase();
      if (!firebase || !firebase.db) return;

      // Listen to an 'alerts' collection in Firestore
      const q = query(
        collection(firebase.db, 'alerts'),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const alert = change.doc.data();
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
      });
    };

    setup();
    return () => unsubscribe && unsubscribe();
  }, []);

  if (!activeAlert) return null;

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
