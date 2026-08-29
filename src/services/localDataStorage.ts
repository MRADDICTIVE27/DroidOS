import {
  ViewerProfile, BotPersonality, CustomCommand, AutoResponse, AutomationTimer,
  AppSettings, StreamMetadata, OBSConfig, ShoutoutConfig, EconomySettings,
  AchievementItem, RedeemItem, BossItem, ChatGamesSettings, BlacklistSettings, ScriptPlugin
} from '../types';
import {
  DEFAULT_PERSONALITIES, DEFAULT_VIEWERS, DEFAULT_OBS_CONFIG, DEFAULT_STREAM_METADATA,
  DEFAULT_SHOUTOUT_CONFIG, DEFAULT_ECONOMY_SETTINGS, DEFAULT_REDEEMS, DEFAULT_ACHIEVEMENTS,
  DEFAULT_CUSTOM_COMMANDS, DEFAULT_AUTO_RESPONSES, DEFAULT_AUTOMATION_TIMERS, DEFAULT_APP_SETTINGS,
  DEFAULT_BOSSES, DEFAULT_CHAT_GAMES_SETTINGS
} from '../data/defaultData';
import { DEFAULT_BLACKLIST_SETTINGS } from './botBlacklistService';
import { BUILTIN_PLUGINS } from './pluginEngine';

export interface StorageNamespaceData {
  profiles: ViewerProfile[];
  viewers: ViewerProfile[];
  commands: CustomCommand[];
  customCommands: CustomCommand[];
  responses: AutoResponse[];
  autoResponses: AutoResponse[];
  automations: AutomationTimer[];
  automationTimers: AutomationTimer[];
  personalities: BotPersonality[];
  settings: AppSettings;
  appSettings: AppSettings;
  streamMetadata: StreamMetadata;
  obsConfig: OBSConfig;
  shoutoutConfig: ShoutoutConfig;
  economy: EconomySettings;
  achievements: AchievementItem[];
  redeems: RedeemItem[];
  bosses: BossItem[];
  chatGamesSettings: ChatGamesSettings;
  blacklistSettings: BlacklistSettings;
  plugins: ScriptPlugin[];
}

function tryParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try { return JSON.parse(json); } catch (err) { return fallback; }
}

// Synchronous default return for initial state before async load
export function loadAllLocalData(): StorageNamespaceData {
  return {
    profiles: DEFAULT_VIEWERS, viewers: DEFAULT_VIEWERS,
    commands: DEFAULT_CUSTOM_COMMANDS, customCommands: DEFAULT_CUSTOM_COMMANDS,
    responses: DEFAULT_AUTO_RESPONSES, autoResponses: DEFAULT_AUTO_RESPONSES,
    automations: DEFAULT_AUTOMATION_TIMERS, automationTimers: DEFAULT_AUTOMATION_TIMERS,
    personalities: DEFAULT_PERSONALITIES,
    settings: DEFAULT_APP_SETTINGS, appSettings: DEFAULT_APP_SETTINGS,
    streamMetadata: DEFAULT_STREAM_METADATA,
    obsConfig: DEFAULT_OBS_CONFIG,
    shoutoutConfig: DEFAULT_SHOUTOUT_CONFIG,
    economy: DEFAULT_ECONOMY_SETTINGS,
    achievements: DEFAULT_ACHIEVEMENTS,
    redeems: DEFAULT_REDEEMS,
    bosses: DEFAULT_BOSSES,
    chatGamesSettings: DEFAULT_CHAT_GAMES_SETTINGS,
    blacklistSettings: DEFAULT_BLACKLIST_SETTINGS,
    plugins: BUILTIN_PLUGINS
  };
}

async function fetchFromApi<T>(collection: string, fallback: T): Promise<T> {
  try {
    const res = await fetch('/api/data/' + collection);
    if (res.ok) {
      const { data } = await res.json();
      if (data) return data as T;
    }
  } catch (err) {
    console.warn(`[DroidOS] Failed to fetch data for ${collection}`, err);
  }
  return fallback;
}

function saveToApi(collection: string, data: any): void {
  fetch('/api/data/' + collection, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => console.warn(`[DroidOS] Failed to save data for ${collection}`, err));
}

export async function loadAllDataAsync(): Promise<StorageNamespaceData> {
  const p = await fetchFromApi('profiles', DEFAULT_VIEWERS);
  const c = await fetchFromApi('commands', DEFAULT_CUSTOM_COMMANDS);
  const r = await fetchFromApi('responses', DEFAULT_AUTO_RESPONSES);
  const a = await fetchFromApi('automations', DEFAULT_AUTOMATION_TIMERS);
  
  const fetchedPers = await fetchFromApi('personalities', null);
  let pers = DEFAULT_PERSONALITIES;
  if (fetchedPers && Array.isArray(fetchedPers)) {
    pers = DEFAULT_PERSONALITIES.map(def => {
      const found = fetchedPers.find(i => i.id === def.id);
      return found ? { ...def, ...found } : def;
    });
    const custom = fetchedPers.filter(item => !DEFAULT_PERSONALITIES.some(def => def.id === item.id));
    pers = [...pers, ...custom];
  }

  const s = { ...DEFAULT_APP_SETTINGS, ...(await fetchFromApi('settings', {})) };
  const meta = { ...DEFAULT_STREAM_METADATA, ...(await fetchFromApi('streamMetadata', {})) };
  const obs = { ...DEFAULT_OBS_CONFIG, ...(await fetchFromApi('obsConfig', {})) };
  const sc = { ...DEFAULT_SHOUTOUT_CONFIG, ...(await fetchFromApi('shoutoutConfig', {})) };
  const eco = { ...DEFAULT_ECONOMY_SETTINGS, ...(await fetchFromApi('economy', {})) };
  const ach = await fetchFromApi('achievements', DEFAULT_ACHIEVEMENTS);
  const red = await fetchFromApi('redeems', DEFAULT_REDEEMS);
  const bss = await fetchFromApi('bosses', DEFAULT_BOSSES);
  const cgs = { ...DEFAULT_CHAT_GAMES_SETTINGS, ...(await fetchFromApi('chatGamesSettings', {})) };
  const bl = { ...DEFAULT_BLACKLIST_SETTINGS, ...(await fetchFromApi('blacklistSettings', {})) };
  const plg = await fetchFromApi('plugins', BUILTIN_PLUGINS);

  return {
    profiles: p, viewers: p,
    commands: c, customCommands: c,
    responses: r, autoResponses: r,
    automations: a, automationTimers: a,
    personalities: pers,
    settings: s, appSettings: s,
    streamMetadata: meta,
    obsConfig: obs,
    shoutoutConfig: sc,
    economy: eco,
    achievements: ach,
    redeems: red,
    bosses: bss,
    chatGamesSettings: cgs,
    blacklistSettings: bl,
    plugins: plg
  };
}

export const saveBlacklistLocal = (d: BlacklistSettings) => saveToApi('blacklistSettings', d);
export const savePluginsLocal = (d: ScriptPlugin[]) => saveToApi('plugins', d);
export const saveProfilesLocal = (d: ViewerProfile[]) => saveToApi('profiles', d);
export const saveViewersLocal = saveProfilesLocal;
export const saveCommandsLocal = (d: CustomCommand[]) => saveToApi('commands', d);
export const saveResponsesLocal = (d: AutoResponse[]) => saveToApi('responses', d);
export const saveAutomationsLocal = (d: AutomationTimer[]) => saveToApi('automations', d);
export const saveTimersLocal = saveAutomationsLocal;
export const savePersonalitiesLocal = (d: BotPersonality[]) => saveToApi('personalities', d);
export const saveSettingsLocal = (d: AppSettings) => saveToApi('settings', d);
export const saveStreamMetadataLocal = (d: StreamMetadata) => saveToApi('streamMetadata', d);
export const saveMetadataLocal = saveStreamMetadataLocal;
export const saveObsConfigLocal = (d: OBSConfig) => saveToApi('obsConfig', d);
export const saveShoutoutConfigLocal = (d: ShoutoutConfig) => saveToApi('shoutoutConfig', d);
export const saveEconomyLocal = (d: EconomySettings) => saveToApi('economy', d);
export const saveAchievementsLocal = (d: AchievementItem[]) => saveToApi('achievements', d);
export const saveRedeemsLocal = (d: RedeemItem[]) => saveToApi('redeems', d);
export const saveBossesLocal = (d: BossItem[]) => saveToApi('bosses', d);
export const saveChatGamesSettingsLocal = (d: ChatGamesSettings) => saveToApi('chatGamesSettings', d);

export function exportFullBackup(): void {}
export function importBackupFile(f: File, cb: (r: StorageNamespaceData) => void): void {}
export function resetAllToDefaults(): void {}
export function openDataFolder(): void { fetch('/api/data/open').catch(()=>{}); }
export function isBrowserPrivateMode(): boolean { return false; }
export interface VirtualFileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified: string;
  folderCategory?: string;
  content?: string;
  icon?: string;
  itemCount?: number;
}
export function buildVirtualFileSystem(data: StorageNamespaceData): {
  rootItems: VirtualFileItem[];
  folderContents: Record<string, VirtualFileItem[]>;
} {
  const rootItems: VirtualFileItem[] = [];
  const folderContents: Record<string, VirtualFileItem[]> = {};

  const folders = [
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
  ];

  const nowStr = new Date().toLocaleDateString();

  // Create root folders
  folders.forEach((folder) => {
    rootItems.push({
      id: `folder-${folder.toLowerCase()}`,
      name: folder,
      type: 'folder',
      modified: nowStr,
      itemCount: 0
    });
    folderContents[folder] = [];
  });

  // Helper to add files to folders
  const addFile = (folderName: string, fileName: string, contentObj: any) => {
    const content = JSON.stringify(contentObj, null, 2);
    const size = `${(content.length / 1024).toFixed(2)} KB`;
    const item: VirtualFileItem = {
      id: `file-${folderName.toLowerCase()}-${fileName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      name: fileName,
      type: 'file',
      size,
      modified: nowStr,
      content
    };
    if (folderContents[folderName]) {
      folderContents[folderName].push(item);
    }
  };

  // Populate virtual files
  addFile('Profiles', 'viewers.json', data.profiles || data.viewers || []);
  addFile('Commands', 'commands.json', data.commands || data.customCommands || []);
  addFile('Responses', 'responses.json', data.responses || data.autoResponses || []);
  addFile('Automations', 'timers.json', data.automations || data.automationTimers || []);
  addFile('Profiles', 'personalities.json', data.personalities || []);
  addFile('Settings', 'settings.json', data.settings || data.appSettings || {});
  addFile('Settings', 'metadata.json', data.streamMetadata || {});
  addFile('Settings', 'economy.json', data.economy || {});
  addFile('Redeems', 'redeems.json', data.redeems || []);
  addFile('Achievements', 'achievements.json', data.achievements || []);

  // Update folder item counts
  rootItems.forEach((folderItem) => {
    if (folderItem.type === 'folder' && folderContents[folderItem.name]) {
      folderItem.itemCount = folderContents[folderItem.name].length;
    }
  });

  // Add a root readme file
  const readmeContent = `Welcome to DroidOS Local File Sandbox!

Here you can inspect, export, and modify settings directly.
Changes made in the JSON files will synchronize immediately with the DroidOS running engine.

Client Secret Configuration:
Upload your 'client_secret.json' file using the button at the top to automatically configure Google OAuth and YouTube Live API connections.`;

  rootItems.push({
    id: 'file-readme',
    name: 'readme.txt',
    type: 'file',
    size: `${(readmeContent.length / 1024).toFixed(2)} KB`,
    modified: nowStr,
    content: readmeContent
  });

  // Client Secrets template if not uploaded yet
  const clientSecretContent = JSON.stringify({
    web: {
      client_id: "your-google-client-id.apps.googleusercontent.com",
      project_id: "droidos-stream-automation",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_secret: "your-google-client-secret"
    }
  }, null, 2);

  rootItems.push({
    id: 'file-client-secret',
    name: 'client_secret.json',
    type: 'file',
    size: `${(clientSecretContent.length / 1024).toFixed(2)} KB`,
    modified: nowStr,
    content: clientSecretContent
  });

  return { rootItems, folderContents };
}