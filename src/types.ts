export type BuiltInRole = 'owner' | 'moderator' | 'vip' | 'subscriber' | 'viewer';

export type ModerationLevel = 0 | 1 | 2 | 3 | 4; 
// 0: Regular Viewer, 1: Trusted Viewer, 2: VIP, 3: Moderator, 4: Broadcaster Admin

export type AppTheme = 'dark' | 'light' | 'cyberpunk' | 'emerald' | 'purple' | 'sunset';

export type PersonalityResponseType =
  | 'friendly'
  | 'calm'
  | 'roast'
  | 'stubborn'
  | 'sarcastic'
  | 'hopeful'
  | 'annoyed'
  | 'default';

export interface ResponseStyleDefinition {
  id: PersonalityResponseType;
  label: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  description: string;
  systemPromptInstruction: string;
  greetingResponses: string[];
  chatResponses: string[];
  memoryInfusedResponses: string[];
}

export interface CustomRole {
  id: string;
  name: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
  priority: number;
  greetingResponses: string[];
  questionResponses: string[];
  isBuiltIn?: boolean;
}

export interface ViewerMemoryItem {
  id: string;
  timestamp: string;
  fact: string;
  addedBy: 'auto' | 'manual';
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'badge' | 'sound' | 'gif' | 'perk' | 'custom';
  description: string;
  acquiredAt: string;
  icon?: string;
}

export interface ViewerAchievement {
  achievementId: string;
  unlockedAt: string;
  progress: number;
}

export interface ViewerProfile {
  id: string;
  username: string;
  displayName: string;
  role: string;
  moderationLevel: ModerationLevel;
  responseType: PersonalityResponseType;
  points: number;
  totalPointsEarned: number;
  watchTimeMinutes: number;
  customFacts: string[];
  notes: string;
  firstSeen: string;
  lastSeen: string;
  messageCount: number;
  visitStreak: number;
  memoryItems: ViewerMemoryItem[];
  inventory: InventoryItem[];
  achievements: ViewerAchievement[];
  avatarColor: string;
  avatarUrl?: string;
  channelUrl?: string;
  customShoutoutMessage?: string;
  autoShoutout?: boolean;
}

export interface YoutubeAuthAccount {
  authenticated: boolean;
  accountName: string;
  channelId: string;
  tokenExpiry?: string;
  isFallback?: boolean;
  apiV3AutoIncluded?: boolean;
}

export interface StreamLiveMetadata {
  isLive: boolean;
  streamTitle: string;
  streamUrl: string;
  thumbnailUrl: string;
  viewerCount: number;
  subscriberCount: number;
  category: string;
  streamerAuth: YoutubeAuthAccount;
  botAuth: YoutubeAuthAccount;
  youtubeApiV3: {
    autoDetected: boolean;
    apiVersion: string;
    quotaStatus: string;
    liveChatPolling: boolean;
    serviceState: 'active' | 'syncing' | 'offline';
  };
}

export interface AudioQueueItem {
  id: string;
  type: 'sound' | 'synth' | 'gif';
  title: string;
  url?: string;
  preset?: string;
  volume: number;
  username: string;
  durationMs?: number;
}

export interface GameConfig {
  gambleWinChance: number;
  heistSuccessChance: number;
  heistMinMultiplier: number;
  heistMaxMultiplier: number;
  bossKillReward: number;
  duelHouseCut: number; // percentage taken by the house
  coinPushTipChance: number; // percentage chance for the pusher to tip on any given drop
}

export interface GameState {
  isBossActive: boolean;
  bossHealth: number;
  bossMaxHealth: number;
  bossName: string;
  isHeistActive: boolean;
  heistParticipants: { username: string; bid: number }[];
  heistStartTime?: string;
  heistDurationSeconds: number;
  pusherPool: number;
  config: GameConfig;
}
export interface BotIdentity {
  botName: string;
  streamerName: string;
  channelName: string;
  channelId: string;
  personalityTone: 'friendly' | 'witty' | 'cyberpunk' | 'helpful' | 'sarcastic';
  customSystemPrompt: string;
  aiCommandPrefix: string;
  autoGreeting: boolean;
  autoQuestions: boolean;
  autoAiFallback: boolean;
  geminiEnabled: boolean;
  audioDeviceId?: string;
  responseCooldownMs: number;
  typingDelayMs: number;
  status: 'active' | 'paused' | 'standby';
  isAdminLocked: boolean;
  adminPin: string;
  aiBrainMode: 'cloud' | 'local';
}

export interface KeywordTrigger {
  id: string;
  trigger: string;
  matchType: 'exact' | 'contains' | 'starts_with';
  response: string;
  roleRestriction?: string;
  cooldownSeconds: number;
  enabled: boolean;
  usageCount: number;
  category?: 'general' | 'custom';
}

export interface PointsConfig {
  currencyName: string;
  currencySymbol: string;
  pointsPerMessage: number;
  pointsPerIntervalMinutes: number;
  intervalMinutes: number;
  subBonusMultiplier: number;
  vipBonusMultiplier: number;
  enabled: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'watchtime' | 'messages' | 'points' | 'streak' | 'custom';
  targetValue: number;
  rewardPoints: number;
  rewardItemName?: string;
  enabled: boolean;
}

export interface SoundEffectItem {
  id: string;
  name: string;
  triggerCommand?: string;
  type: 'synth' | 'custom_url';
  synthPreset: 'fanfare' | 'airhorn' | 'level_up' | 'zap' | 'bell' | 'laser' | 'applause' | 'coin';
  customAudioUrl?: string;
  volume: number;
  costPoints?: number;
  enabled: boolean;
}

export interface RedeemItem {
  id: string;
  title: string;
  description: string;
  cost: number;
  type: 'sound' | 'gif' | 'highlight' | 'vip' | 'custom';
  linkedSoundId?: string;
  gifUrl?: string;
  cooldownSeconds: number;
  requireApproval: boolean;
  enabled: boolean;
  timesRedeemed: number;
}

export interface PendingRedemption {
  id: string;
  redeemId: string;
  redeemTitle: string;
  username: string;
  userRole: string;
  timestamp: string;
  cost: number;
  status: 'pending' | 'approved' | 'rejected' | 'auto_fulfilled';
}

export interface ObsWebSocketConfig {
  connected: boolean;
  host: string;
  port: number;
  password?: string;
  currentScene: string;
  autoSwitchOnRedeem: boolean;
  scenes: string[];
}

export interface TimedAutomation {
  id: string;
  name: string;
  intervalMinutes: number;
  messageTemplate: string;
  enabled: boolean;
  lastRunTimestamp?: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderRole: string;
  content: string;
  timestamp: string;
  isBot?: boolean;
  isSystem?: boolean;
  matchedRule?: string;
  isAiResponse?: boolean;
  dispatchAccount?: string;
  pointsEarned?: number;
  redeemedItem?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'success' | 'bot';
  module: 'AUTH' | 'ROLES' | 'LISTENER' | 'IDENTITY' | 'SYSTEM' | 'AI_ENGINE' | 'POINTS' | 'OBS' | 'ACHIEVEMENTS' | 'REDEEMS' | 'SHOUTOUTS';
  message: string;
}

export interface ShoutoutConfig {
  enabled: boolean;
  autoShoutoutOnFirstMessage: boolean;
  autoShoutoutOnlyOncePerStream: boolean;
  autoShoutoutLifetimeNewViewers: boolean;
  chatMessageTemplate: string;
  soundEffectPreset: 'fanfare' | 'applause' | 'level_up' | 'bell' | 'coin' | 'airhorn' | 'none';
  soundVolume: number;
  
  // OBS Screen Overlay / Browser Source
  obsOverlayEnabled: boolean;
  overlayDurationSeconds: number;
  overlayPosition: 'bottom-left' | 'bottom-right' | 'top-right' | 'top-left' | 'center';
  overlayTheme: 'neon-cyber' | 'glass-modern' | 'minimal-card' | 'gold-vip' | 'gradient-stream';
  overlayHeading: string;
  overlaySubheadingTemplate: string;
  showProfilePicture: boolean;
  showChannelLink: boolean;
  showCustomBadge: boolean;
  animationType: 'slide' | 'pop' | 'fade' | 'bounce';
  
  // Role eligibility
  rolesEligible: string[];
}

export interface ActiveShoutoutOverlay {
  id: string;
  username: string;
  displayName: string;
  role: string;
  avatarUrl?: string;
  avatarColor?: string;
  channelUrl?: string;
  heading: string;
  subheading: string;
  customMessage?: string;
  timestamp: string;
  durationMs: number;
  theme: string;
  position: string;
  animation: string;
}

export interface ShoutoutHistoryItem {
  id: string;
  username: string;
  displayName: string;
  role: string;
  avatarUrl?: string;
  timestamp: string;
  chatMessage: string;
  triggeredBy: 'first_message' | 'command' | 'manual';
}

export interface AppReleaseInfo {
  currentVersion: string;
  latestVersion: string;
  releaseDate: string;
  hasUpdate: boolean;
  githubUrl: string;
  releaseNotes: string[];
}
