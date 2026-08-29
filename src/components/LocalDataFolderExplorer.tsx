import React, { useState, useRef } from 'react';
import {
  Folder,
  FileCode,
  Database,
  FileText,
  FileJson,
  Music,
  Tv,
  Layers,
  Sparkles,
  Settings,
  Shield,
  Search,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RefreshCw,
  Copy,
  Check,
  Download,
  Upload,
  X,
  ExternalLink,
  ChevronRight,
  HardDrive,
  Home,
  Monitor,
  FolderOpen,
  Eye,
  Edit3,
  Save,
  CheckCircle2,
  Lock,
  Volume2,
  Key,
  Globe,
  Youtube,
  AlertCircle
} from 'lucide-react';
import {
  StorageNamespaceData,
  VirtualFileItem,
  buildVirtualFileSystem,
  saveSettingsLocal,
  saveMetadataLocal
} from '../services/localDataStorage';
import {
  parseClientSecretsJson,
  applyParsedClientSecrets,
  ParsedClientSecretsResult,
  getSampleClientSecretsTemplate
} from '../services/clientSecretsParser';
import {
  ViewerProfile,
  CustomCommand,
  AutoResponse,
  AutomationTimer,
  BotPersonality,
  AppSettings,
  StreamMetadata,
  EconomySettings,
  RedeemItem,
  AchievementItem
} from '../types';
import { soundSynth } from '../services/soundSynthesizer';

export interface LocalDataFolderExplorerProps {
  isOpen?: boolean;
  onClose?: () => void;
  data?: StorageNamespaceData;
  viewers?: ViewerProfile[];
  customCommands?: CustomCommand[];
  autoResponses?: AutoResponse[];
  automationTimers?: AutomationTimer[];
  personalities?: BotPersonality[];
  appSettings?: AppSettings;
  streamMetadata?: StreamMetadata;
  economy?: EconomySettings;
  redeems?: RedeemItem[];
  achievements?: AchievementItem[];
  onReloadData?: () => void;
  onUpdateFileContent?: (folder: string, fileName: string, content: string) => void;
  onClientSecretsApplied?: (result: ParsedClientSecretsResult) => void;
}

export const LocalDataFolderExplorer: React.FC<LocalDataFolderExplorerProps> = ({
  isOpen = true,
  onClose,
  data,
  viewers,
  customCommands,
  autoResponses,
  automationTimers,
  personalities,
  appSettings,
  streamMetadata,
  economy,
  redeems,
  achievements,
  onReloadData,
  onUpdateFileContent,
  onClientSecretsApplied
}) => {
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<VirtualFileItem | null>(null);
  const [viewingFile, setViewingFile] = useState<VirtualFileItem | null>(null);
  const [fileEditBuffer, setFileEditBuffer] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [copiedContent, setCopiedContent] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'details'>('details');
  const [detectedSecretsResult, setDetectedSecretsResult] = useState<ParsedClientSecretsResult | null>(null);
  const [appliedSecretsSuccess, setAppliedSecretsSuccess] = useState<string | null>(null);
  const [secretsError, setSecretsError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Build storage data from either prop shape
  const safeData: StorageNamespaceData = data || {
    profiles: viewers || [],
    viewers: viewers || [],
    commands: customCommands || [],
    customCommands: customCommands || [],
    responses: autoResponses || [],
    autoResponses: autoResponses || [],
    automations: automationTimers || [],
    automationTimers: automationTimers || [],
    personalities: personalities || [],
    settings: appSettings || {} as AppSettings,
    appSettings: appSettings || {} as AppSettings,
    streamMetadata: streamMetadata || {} as StreamMetadata,
    obsConfig: {} as any,
    shoutoutConfig: {} as any,
    economy: economy || {} as EconomySettings,
    redeems: redeems || [],
    achievements: achievements || [],
    bosses: [],
    chatGames: {} as any
  };

  const { rootItems, folderContents } = buildVirtualFileSystem(safeData);

  // Active items to display
  let itemsToDisplay: VirtualFileItem[] = [];
  if (currentFolder) {
    itemsToDisplay = folderContents[currentFolder] || [];
  } else {
    itemsToDisplay = rootItems;
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    if (currentFolder) {
      itemsToDisplay = itemsToDisplay.filter((i) => i.name.toLowerCase().includes(q));
    } else {
      // search across all folders
      const matchingRoot = rootItems.filter((i) => i.name.toLowerCase().includes(q));
      const matchingSub: VirtualFileItem[] = [];
      Object.entries(folderContents).forEach(([folderName, files]) => {
        files.forEach((f) => {
          if (f.name.toLowerCase().includes(q)) {
            matchingSub.push({ ...f, name: `${folderName}/${f.name}` });
          }
        });
      });
      itemsToDisplay = [...matchingRoot, ...matchingSub];
    }
  }

  const handleItemClick = (item: VirtualFileItem) => {
    setSelectedItem(item);
    if (item.name === 'client_secret.json' || item.name.includes('client_secret')) {
      const parsed = parseClientSecretsJson(item.content || '');
      if (parsed.valid) {
        setDetectedSecretsResult(parsed);
      }
    }
  };

  const handleItemDoubleClick = (item: VirtualFileItem) => {
    if (item.type === 'folder') {
      setCurrentFolder(item.name);
      setSelectedItem(null);
      setSearchQuery('');
    } else {
      setViewingFile(item);
      setFileEditBuffer(item.content || '');
      setIsEditing(false);

      if (item.name === 'client_secret.json' || item.name.includes('client_secret')) {
        const parsed = parseClientSecretsJson(item.content || '');
        if (parsed.valid) {
          setDetectedSecretsResult(parsed);
        }
      }
    }
  };

  const handleApplyClientSecrets = (parsed: ParsedClientSecretsResult) => {
    try {
      if (onClientSecretsApplied) {
        onClientSecretsApplied(parsed);
      } else if (safeData.settings && safeData.streamMetadata) {
        const { updatedSettings, updatedMeta } = applyParsedClientSecrets(
          parsed,
          safeData.settings,
          safeData.streamMetadata
        );
        saveSettingsLocal(updatedSettings);
        saveMetadataLocal(updatedMeta);
      }
      soundSynth.play('victory');
      setAppliedSecretsSuccess(`Google OAuth credentials & YouTube API v3 auto-detected from Project "${parsed.projectId || 'Google Cloud'}" and saved!`);
      setSecretsError(null);
      setTimeout(() => setAppliedSecretsSuccess(null), 5000);
      if (onReloadData) {
        onReloadData();
      }
    } catch (err: any) {
      setSecretsError(err?.message || 'Failed to apply client secrets');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseClientSecretsJson(text);

      if (parsed.valid) {
        setDetectedSecretsResult(parsed);
        handleApplyClientSecrets(parsed);
      } else {
        setSecretsError(parsed.errorMessage || 'Invalid client_secret.json structure');
        setTimeout(() => setSecretsError(null), 5000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveEditedFile = () => {
    if (viewingFile) {
      const targetFolder = currentFolder || 'Root';
      if (onUpdateFileContent) {
        onUpdateFileContent(targetFolder, viewingFile.name, fileEditBuffer);
      }

      if (viewingFile.name === 'client_secret.json' || viewingFile.name.includes('client_secret')) {
        const parsed = parseClientSecretsJson(fileEditBuffer);
        if (parsed.valid) {
          setDetectedSecretsResult(parsed);
          handleApplyClientSecrets(parsed);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      if (onReloadData) {
        onReloadData();
      }
    }
  };

  const handleCopyPath = () => {
    const path = currentFolder
      ? `C:\\Users\\%USERNAME%\\AppData\\Local\\DroidOS\\${currentFolder}`
      : `C:\\Users\\%USERNAME%\\AppData\\Local\\DroidOS`;
    navigator.clipboard.writeText(path);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleDownloadFile = (file: VirtualFileItem) => {
    const blob = new Blob([file.content || ''], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadSampleSecrets = () => {
    const template = getSampleClientSecretsTemplate();
    const blob = new Blob([template], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_secret.json';
    a.click();
    URL.revokeObjectURL(url);
    soundSynth.play('coin');
  };

  const getFolderIcon = (name: string) => {
    switch (name) {
      case 'Profiles':
        return <Folder className="w-5 h-5 text-purple-400 fill-purple-400/20" />;
      case 'Commands':
      case 'Responses':
      case 'Automations':
        return <Folder className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />;
      case 'Achievements':
        return <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20" />;
      case 'Redeems':
      case 'Games':
        return <Folder className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />;
      case 'Sounds':
      case 'Music':
        return <Folder className="w-5 h-5 text-pink-400 fill-pink-400/20" />;
      case 'Overlays':
      case 'Themes':
        return <Folder className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />;
      case 'Backups':
      case 'Logs':
        return <Folder className="w-5 h-5 text-blue-400 fill-blue-400/20" />;
      default:
        return <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20" />;
    }
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.db')) {
      return <Database className="w-5 h-5 text-emerald-400" />;
    }
    if (name.includes('client_secret')) {
      return <Key className="w-5 h-5 text-amber-400" />;
    }
    if (name.endsWith('.json')) {
      return <FileJson className="w-5 h-5 text-cyan-400" />;
    }
    if (name.endsWith('.log')) {
      return <FileText className="w-5 h-5 text-amber-400" />;
    }
    if (name.endsWith('.wav') || name.endsWith('.mp3')) {
      return <Volume2 className="w-5 h-5 text-pink-400" />;
    }
    if (name.endsWith('.html') || name.endsWith('.css') || name.endsWith('.js')) {
      return <FileCode className="w-5 h-5 text-purple-400" />;
    }
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[88vh] bg-[#1a1f2c] border border-white/20 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-slate-200 font-sans">
        
        {/* Hidden File Input for client_secret.json upload */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Windows Explorer Style Header Bar */}
        <div className="bg-[#131620] px-4 py-2.5 border-b border-white/10 flex items-center justify-between select-none flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-cyan-400/30 flex items-center justify-center">
              <Folder className="w-2.5 h-2.5 text-cyan-300" />
            </div>
            <span className="text-xs font-semibold text-white tracking-wide flex items-center gap-2">
              <span>AppData &gt; Local &gt; DroidOS</span>
              {currentFolder && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                  <span className="text-cyan-300 font-bold">{currentFolder}</span>
                </>
              )}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Persistent Local Storage
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Upload client_secret.json Quick Action */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold border border-amber-500/40 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Upload Google Cloud client_secret.json to auto-detect OAuth credentials"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Upload client_secret.json</span>
            </button>

            <button
              onClick={handleDownloadSampleSecrets}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Download empty client_secret.json template"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Template</span>
            </button>

            <button
              onClick={handleCopyPath}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Copy Local Directory Path"
            >
              {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPath ? 'Copied Path!' : 'Copy Local Path'}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Client Secrets Banner (Success or Error notification) */}
        {appliedSecretsSuccess && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-4 py-2 flex items-center justify-between text-xs text-emerald-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{appliedSecretsSuccess}</span>
            </div>
            <button onClick={() => setAppliedSecretsSuccess(null)} className="text-emerald-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {secretsError && (
          <div className="bg-red-950/80 border-b border-red-500/40 px-4 py-2 flex items-center justify-between text-xs text-red-200 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="font-semibold">{secretsError}</span>
            </div>
            <button onClick={() => setSecretsError(null)} className="text-red-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Explorer Address Bar & Search Navigation */}
        <div className="bg-[#171b26] p-2.5 border-b border-white/10 flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentFolder(null)}
              disabled={!currentFolder}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 cursor-pointer"
              title="Back to DroidOS Root"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentFolder(null)}
              disabled={!currentFolder}
              className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300 cursor-pointer"
              title="Up one folder"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Breadcrumb Path Box */}
          <div className="flex-1 bg-[#0f121a] border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-purple-400 shrink-0" />
            <span className="text-slate-500">AppData</span>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <span className="text-slate-500">Local</span>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            <button
              onClick={() => setCurrentFolder(null)}
              className="font-bold text-white hover:text-cyan-300 transition-colors cursor-pointer"
            >
              DroidOS
            </button>
            {currentFolder && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
                <span className="font-bold text-cyan-300">{currentFolder}</span>
              </>
            )}
          </div>

          {/* Search Box */}
          <div className="w-60 bg-[#0f121a] border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
            <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              placeholder={`Search ${currentFolder || 'DroidOS'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-white placeholder:text-slate-600 w-full"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Main Explorer Workspace */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Left Navigation Tree */}
          <div className="w-56 bg-[#131620] border-r border-white/10 p-3 overflow-y-auto space-y-4 text-xs select-none">
            {/* Quick Access */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider px-2">Quick Access</span>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:bg-white/5 cursor-pointer">
                  <Home className="w-3.5 h-3.5 text-blue-400" />
                  <span>Home</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:bg-white/5 cursor-pointer">
                  <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Desktop</span>
                </div>
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-slate-400 hover:bg-white/5 cursor-pointer">
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Downloads</span>
                </div>
              </div>
            </div>

            {/* This PC -> AppData DroidOS */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider px-2">This PC &gt; Local Storage</span>
              <div className="space-y-0.5">
                <button
                  onClick={() => setCurrentFolder(null)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left cursor-pointer transition-colors ${
                    currentFolder === null
                      ? 'bg-purple-600/25 text-white border border-purple-500/40 font-bold'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-purple-400" />
                    <span>DroidOS (AppData)</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">18</span>
                </button>

                {/* Sub folders list in side tree */}
                <div className="pl-4 space-y-0.5 pt-1 border-l border-white/5 ml-3">
                  {[
                    'Achievements',
                    'Automations',
                    'Backups',
                    'Commands',
                    'Games',
                    'Logs',
                    'Music',
                    'Overlays',
                    'Plugins',
                    'Profiles',
                    'Redeems',
                    'Responses',
                    'Settings',
                    'Sounds',
                    'Themes'
                  ].map((folderName) => (
                    <button
                      key={folderName}
                      onClick={() => {
                        setCurrentFolder(folderName);
                        setSelectedItem(null);
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1 rounded-md text-left text-[11px] cursor-pointer transition-colors ${
                        currentFolder === folderName
                          ? 'bg-cyan-500/25 text-cyan-200 font-bold border border-cyan-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <Folder className="w-3 h-3 text-amber-400/80" />
                      <span className="truncate">{folderName}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Main File View */}
          <div className="flex-1 bg-[#171b26] flex flex-col overflow-hidden">
            
            {/* Folder View Toolbar */}
            <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span>{itemsToDisplay.length} item{itemsToDisplay.length === 1 ? '' : 's'}</span>
                {selectedItem && (
                  <>
                    <span>•</span>
                    <span className="text-white font-medium">Selected: {selectedItem.name}</span>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500">Double click any folder or file to inspect/edit</span>
              </div>
            </div>

            {/* Files List / Table View */}
            <div className="flex-1 overflow-y-auto p-3">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 text-[11px]">
                    <th className="py-2 px-3 font-semibold">Name</th>
                    <th className="py-2 px-3 font-semibold">Date modified</th>
                    <th className="py-2 px-3 font-semibold">Type</th>
                    <th className="py-2 px-3 font-semibold text-right">Size</th>
                  </tr>
                </thead>
                <tbody>
                  {itemsToDisplay.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        onDoubleClick={() => handleItemDoubleClick(item)}
                        className={`border-b border-white/[0.03] transition-colors cursor-pointer select-none ${
                          isSelected
                            ? 'bg-purple-600/20 text-white font-medium'
                            : 'hover:bg-white/[0.04] text-slate-300'
                        }`}
                      >
                        <td className="py-2.5 px-3 flex items-center gap-3">
                          {item.type === 'folder' ? getFolderIcon(item.name) : getFileIcon(item.name)}
                          <span className="font-medium">{item.name}</span>
                          {item.itemCount !== undefined && (
                            <span className="text-[10px] text-slate-500 font-mono">({item.itemCount} items)</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{item.modified}</td>
                        <td className="py-2.5 px-3 text-slate-400 capitalize">
                          {item.type === 'folder' ? 'File folder' : item.name.split('.').pop()?.toUpperCase() + ' File'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px] text-right">
                          {item.type === 'folder' ? '' : item.size || '1.0 KB'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {itemsToDisplay.length === 0 && (
                <div className="text-center py-16 text-slate-500 space-y-2">
                  <FolderOpen className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-xs">No items found matching "{searchQuery}"</p>
                </div>
              )}
            </div>

            {/* Bottom Status / Local Path Summary */}
            <div className="bg-[#131620] px-4 py-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Isolated Local Disk Sandbox: <strong>%APPDATA%\Local\DroidOS</strong> (Zero data loss across updates)</span>
              </div>

              {selectedItem && selectedItem.type === 'file' && (
                <button
                  onClick={() => handleItemDoubleClick(selectedItem)}
                  className="px-3 py-1 rounded bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect & Edit File</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Inspector & Editor Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-150">
          <div className="w-full max-w-3xl max-h-[85vh] bg-[#121622] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
            
            {/* Modal Header */}
            <div className="bg-[#181d2c] px-5 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon(viewingFile.name)}
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{viewingFile.name}</span>
                    <span className="text-[10px] font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                      {currentFolder ? `AppData/Local/DroidOS/${currentFolder}` : 'AppData/Local/DroidOS'}
                    </span>
                  </h3>
                  <span className="text-[11px] text-slate-400">Size: {viewingFile.size || '1 KB'} • Modified: {viewingFile.modified}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadFile(viewingFile)}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 flex items-center gap-1.5 cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export</span>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(fileEditBuffer);
                    setCopiedContent(true);
                    setTimeout(() => setCopiedContent(false), 2000);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold border border-white/10 flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedContent ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedContent ? 'Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  onClick={() => setViewingFile(null)}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Code / Text Area */}
            <div className="flex-1 p-4 overflow-hidden flex flex-col bg-[#0b0e17]">
              <div className="flex items-center justify-between pb-2 text-xs text-slate-400 border-b border-white/5 mb-2">
                <span className="font-mono text-[11px] text-purple-300">UTF-8 • Direct File Editor</span>
                <span className="text-[11px] text-slate-500">Live Changes sync directly with DroidOS Runtime Engine</span>
              </div>
              <textarea
                value={fileEditBuffer}
                onChange={(e) => {
                  setFileEditBuffer(e.target.value);
                  setIsEditing(true);
                }}
                className="flex-1 w-full bg-transparent font-mono text-xs text-emerald-300 leading-relaxed resize-none outline-none focus:ring-0 p-2 overflow-y-auto"
                spellCheck={false}
              />
            </div>

            {/* Modal Footer */}
            <div className="bg-[#181d2c] px-5 py-3 border-t border-white/10 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {saveSuccess ? (
                  <span className="text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> File Saved to Local Database!
                  </span>
                ) : (
                  <span>Edit code above and click Save to write updates to local disk storage.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {viewingFile.name.includes('client_secret') && (
                  <button
                    onClick={() => {
                      const parsed = parseClientSecretsJson(fileEditBuffer);
                      if (parsed.valid) {
                        handleApplyClientSecrets(parsed);
                      } else {
                        setSecretsError(parsed.errorMessage || 'Invalid JSON format');
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Auto-Detect Credentials</span>
                  </button>
                )}
                <button
                  onClick={() => setViewingFile(null)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveEditedFile}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
