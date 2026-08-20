import React, { useState } from 'react';
import { ExternalLink, CheckCircle2, ChevronRight, Info } from 'lucide-react';

export const FirebaseSetup: React.FC<{ onComplete: (config: any) => void }> = ({ onComplete }) => {
  const [config, setConfig] = useState({
    projectId: '',
    apiKey: '',
    authDomain: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });
  
  const [pasteText, setPasteText] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handlePasteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPasteText(text);
    
    // Try to extract values from standard Firebase config JS snippet
    const extract = (key: string) => {
      const match = text.match(new RegExp(`${key}['"]?\\s*:\\s*['"]([^'"]+)['"]`));
      return match ? match[1] : '';
    };

    const parsedConfig = {
      apiKey: extract('apiKey'),
      authDomain: extract('authDomain'),
      projectId: extract('projectId'),
      storageBucket: extract('storageBucket'),
      messagingSenderId: extract('messagingSenderId'),
      appId: extract('appId')
    };

    if (parsedConfig.apiKey && parsedConfig.projectId) {
      setConfig(parsedConfig);
      setIsSuccess(true);
    } else {
      setIsSuccess(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.apiKey || !config.projectId) return;
    localStorage.setItem('droidos_firebase_config', JSON.stringify(config));
    onComplete(config);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-2xl w-full shadow-2xl flex flex-col md:flex-row overflow-hidden my-8">
        
        {/* Left Side: Instructions */}
        <div className="w-full md:w-1/2 p-6 md:p-8 bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-800">
          <h2 className="text-xl font-bold text-white mb-2">Connect Your Data</h2>
          <p className="text-slate-400 text-sm mb-6">
            To keep your data private and secure, you need your own database. It's free and takes 2 minutes.
          </p>

          <div className="space-y-4 text-sm">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">1</div>
              <div>
                <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                  Open Firebase Console <ExternalLink className="w-3 h-3" />
                </a>
                <p className="text-slate-500 mt-0.5">Click "Create a project".</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">2</div>
              <div>
                <p className="text-slate-300 font-medium">Add a Web App</p>
                <p className="text-slate-500 mt-0.5">Click the web icon `&lt;/&gt;` on the project overview page to register an app.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">3</div>
              <div>
                <p className="text-slate-300 font-medium">Enable Firestore</p>
                <p className="text-slate-500 mt-0.5">Go to Firestore Database in the menu and click "Create database" (Start in test mode).</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">4</div>
              <div>
                <p className="text-slate-300 font-medium">Copy Configuration</p>
                <p className="text-slate-500 mt-0.5">Go back to Project Settings, scroll down, and copy the `firebaseConfig` code block.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Setup */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Paste your Firebase Config here:
            </label>
            <textarea
              value={pasteText}
              onChange={handlePasteChange}
              placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "...",\n  projectId: "...",\n  ...\n};`}
              className="w-full h-32 bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl p-3 text-slate-300 text-xs font-mono resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 mb-6 min-h-[140px] flex flex-col justify-center">
            {!isSuccess ? (
              <div className="text-center text-slate-500 flex flex-col items-center">
                <Info className="w-6 h-6 mb-2 opacity-50" />
                <p className="text-xs">Paste your config above to auto-fill your credentials.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium mb-3">
                  <CheckCircle2 className="w-4 h-4" /> Config detected successfully
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-slate-500 truncate">Project ID:</div>
                  <div className="text-slate-300 font-mono truncate">{config.projectId}</div>
                  <div className="text-slate-500 truncate">App ID:</div>
                  <div className="text-slate-300 font-mono truncate">{config.appId.substring(0, 8)}...</div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleSubmit}
            disabled={!isSuccess}
            className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              isSuccess 
                ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Connect & Launch <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
