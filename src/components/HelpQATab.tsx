import React, { useState } from 'react';
import {
  HelpCircle,
  FolderOpen,
  Globe,
  Youtube,
  Tv,
  Key,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileCode,
  Info,
  BookOpen,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
  category: 'oauth' | 'appdata' | 'obs' | 'general';
}

export const HelpQATab: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'oauth' | 'appdata' | 'obs' | 'general'>('all');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      category: 'oauth',
      question: 'What JavaScript Origin & Redirect URI do I put in the Google Developer Console?',
      answer: (
        <div className="space-y-2">
          <p>When creating your OAuth 2.0 Web Client Credentials in the Google Cloud Developer Console, you MUST set the following exact values:</p>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-white/5 font-mono text-[11px] space-y-2 text-cyan-300">
            <div>
              <span className="text-slate-400 block text-[9px] font-sans font-bold uppercase tracking-wider mb-0.5">Authorized JavaScript Origins:</span>
              <code>http://localhost:3000</code>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] font-sans font-bold uppercase tracking-wider mb-0.5">Authorized Redirect URIs:</span>
              <code>http://localhost:3000/oauth2callback</code>
            </div>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            <strong>Note:</strong> Do not use HTTPS. DroidOS runs its local backend web server on port 3000 HTTP. If these are incorrect, Google will throw a <code>redirect_uri_mismatch</code> error during sign-in.
          </p>
        </div>
      )
    },
    {
      category: 'appdata',
      question: 'What files need to go in the local AppData directory and where is it?',
      answer: (
        <div className="space-y-3">
          <p>
            DroidOS is a local-first application. All configurations, user profiles, points, achievements, and assets are stored directly on your computer inside the local app data folder:
          </p>
          <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5 font-mono text-xs text-purple-300 flex items-center justify-between">
            <code>%APPDATA%\Local\DroidOS</code>
            <span className="text-[10px] text-slate-500 font-sans">(Typically C:\Users\Username\AppData\Local\DroidOS)</span>
          </div>
          <div className="space-y-2 text-[11px] text-slate-300">
            <p className="font-bold text-white">Files you can place or edit there:</p>
            <ul className="list-disc pl-4 space-y-1.5 leading-relaxed">
              <li>
                <strong className="text-white">client_secret.json</strong>: The Google OAuth Client ID file downloaded from Google Cloud. When placed in the root of the DroidOS folder, the app instantly configures OAuth login credentials.
              </li>
              <li>
                <strong className="text-white">data/settings.json</strong>: General app preferences, custom styling, and layout settings.
              </li>
              <li>
                <strong className="text-white">data/viewers.json</strong>: Active user economy wallets, inventories, roles, and message statistics.
              </li>
              <li>
                <strong className="text-white">data/commands.json &amp; responses.json</strong>: Your custom bot command logic and overlay responses.
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      category: 'oauth',
      question: 'How do I set up separate Host and Bot accounts for YouTube Live chat?',
      answer: (
        <div className="space-y-2 text-slate-300 text-[11px] leading-relaxed">
          <p>
            To separate broadcaster logs from bot responses, DroidOS supports a **Dual-OAuth separation topology**:
          </p>
          <ol className="list-decimal pl-4 space-y-1.5">
            <li>
              Under the <strong className="text-white">Settings</strong> tab, upload your <code>client_secret.json</code> file or enter your OAuth details.
            </li>
            <li>
              Click <strong className="text-red-400">Sign in with Google</strong> under the Host Account panel and authorize your primary streaming channel.
            </li>
            <li>
              Enable <strong className="text-white">Separate Bot Account</strong>, then click <strong className="text-purple-400">Sign in as Bot Account</strong> and log in with your dedicated chatbot account.
            </li>
            <li>
              Make sure to promote your bot account to a <strong className="text-white">Moderator</strong> in your primary channel's Community settings so it can post links and trigger overlay commands without being blocked.
            </li>
          </ol>
        </div>
      )
    },
    {
      category: 'obs',
      question: 'My Chat Games or popups are not showing in OBS. How do I fix it?',
      answer: (
        <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
          <p>
            Ensure your DroidOS Local Server is running and OBS is configured correctly:
          </p>
          <ul className="list-disc pl-4 space-y-1.5">
            <li>
              In OBS Studio, add a new <strong className="text-white">Browser Source</strong>.
            </li>
            <li>
              Set the URL to: <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded">http://localhost:3000/overlay.html</code>
            </li>
            <li>
              Set Width to <strong className="text-white">1920</strong> and Height to <strong className="text-white">1080</strong> (or your stream output resolution).
            </li>
            <li>
              Check the box: <strong className="text-white">Refresh browser when scene becomes active</strong>. This ensures overlay animations synchronize perfectly.
            </li>
            <li>
              If you want overlay sound effect alerts to play through OBS, check <strong className="text-white">Control audio via OBS</strong> in the Browser Source properties.
            </li>
          </ul>
        </div>
      )
    },
    {
      category: 'general',
      question: 'How does DroidOS connect to a Live Chat when the stream is Private or Unlisted?',
      answer: (
        <p className="text-[11px] leading-relaxed text-slate-300">
          Unlike ordinary chat parsers that require public URLs, DroidOS calls the YouTube Live API with <code>mine=true</code> and searches your active Google Broadcast dashboard. This allows DroidOS to connect to the live chat of <strong>private, unlisted, and scheduled streams</strong> automatically the moment you start broadcasting, ensuring you can test redeems and chat games in a sandbox before going live.
        </p>
      )
    },
    {
      category: 'obs',
      question: 'How do I connect DroidOS to my OBS WebSocket server?',
      answer: (
        <div className="space-y-2 text-[11px] leading-relaxed text-slate-300">
          <p>
            DroidOS can automatically switch scenes, mute audio inputs, and toggle sources when viewers redeem rewards:
          </p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>In OBS Studio, click <strong>Tools &gt; WebSocket Server Settings</strong>.</li>
            <li>Check <strong>Enable WebSocket Server</strong> (Port defaults to <code>4455</code>).</li>
            <li>Click <strong>Show Connect Info</strong> to view your server password.</li>
            <li>Enter this port and password in the <strong>OBS Integration</strong> tab in DroidOS, and toggle <strong>Connect</strong>.</li>
          </ol>
        </div>
      )
    }
  ];

  const filteredFaqs = activeCategory === 'all'
    ? faqs
    : faqs.filter(faq => faq.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-slate-900/60 to-purple-950/40 border border-purple-500/20 backdrop-blur-xl shadow-xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white tracking-wide">Help Desk &amp; Workstation Q&amp;A</h1>
            <p className="text-xs text-slate-400 mt-1">Configure your local sandbox, links, Google Cloud keys, and OBS overlays.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white/[0.04] text-purple-300 border border-white/10">
            Local Server: http://localhost:3000
          </span>
        </div>
      </div>

      {/* Categories & Filter Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
        {[
          { id: 'all', label: 'All Guides & Q&A', icon: BookOpen },
          { id: 'oauth', label: 'Google Login & OAuth', icon: Globe },
          { id: 'appdata', label: 'AppData Files', icon: FolderOpen },
          { id: 'obs', label: 'OBS & Overlay Settings', icon: Tv },
          { id: 'general', label: 'General Troubleshooting', icon: Info }
        ].map(cat => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id as any);
                setExpandedIndex(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-purple-600/25 border-purple-400/50 text-white shadow-md'
                  : 'bg-white/[0.02] border-white/5 text-slate-400 hover:text-white hover:border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main FAQ Accodion List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border transition-all duration-150 overflow-hidden bg-slate-900/40 border-white/5 hover:border-white/10"
              >
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-bold text-xs text-white cursor-pointer select-none bg-white/[0.01]"
                >
                  <span className="flex items-center gap-2.5">
                    {faq.category === 'oauth' && <Globe className="w-4 h-4 text-red-400 shrink-0" />}
                    {faq.category === 'appdata' && <FolderOpen className="w-4 h-4 text-purple-400 shrink-0" />}
                    {faq.category === 'obs' && <Tv className="w-4 h-4 text-cyan-400 shrink-0" />}
                    {faq.category === 'general' && <Info className="w-4 h-4 text-amber-400 shrink-0" />}
                    <span>{faq.question}</span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 text-xs text-slate-300 leading-relaxed border-t border-white/[0.04] bg-[#0c0f1a]/40 animate-in slide-in-from-top-2 duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quick Tips Sidebar */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-white/10 pb-3">
              <Key className="w-4 h-4 text-amber-400" />
              <span>OAuth Client Secrets Checklist</span>
            </div>
            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
              <p>
                To generate your own credentials on Google Cloud Developer Console:
              </p>
              <ul className="space-y-2.5">
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  <span>Enable <strong>YouTube Data API v3</strong> in Library.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  <span>Set OAuth status to **In Production** (or add your test emails to the test users list if in Testing mode).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  <span>Download the client secrets JSON, rename to <strong>client_secret.json</strong>, and upload it in the Settings page.</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/20 to-slate-900/60 border border-purple-500/20 space-y-3.5">
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-purple-400 animate-pulse" />
              <span>Looking for API logs?</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open the local AppData folder using the explorer modal to inspect raw request records and runtime collection files in real time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
