import React from 'react';
import { Clipboard, ExternalLink } from 'lucide-react';

export const ObsOverlayTab: React.FC = () => {
  const overlayUrl = `${window.location.origin}/overlay`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(overlayUrl);
    alert('URL copied to clipboard!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-bold text-slate-100 mb-2">OBS Overlay Settings</h2>
        <p className="text-slate-400 mb-4">
          Use this URL as a Browser Source in OBS to display your alerts and GIFs on stream.
        </p>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              readOnly
              value={overlayUrl}
              className="flex-grow p-2 bg-slate-950 text-white rounded border border-slate-700 font-mono text-sm"
            />
            <button onClick={copyToClipboard} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium flex items-center">
              <Clipboard className="w-4 h-4 mr-2" />
              Copy
            </button>
            <button onClick={() => window.open(overlayUrl, '_blank')} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium flex items-center">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open
            </button>
          </div>
          <p className="text-sm text-slate-400">
            <strong>Instructions:</strong> In OBS, add a new "Browser" source, paste this URL, and set the dimensions to 1920x1080.
          </p>
        </div>
      </div>
    </div>
  );
};
