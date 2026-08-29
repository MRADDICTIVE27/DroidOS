export type UserRole = 'owner' | 'moderator' | 'vip' | 'subscriber' | 'viewer';

export interface ViewerMemoryItem {
  id: string;
  timestamp: string;
  fact: string;
  addedBy: 'auto' | 'manual';
}

export interface ViewerBadge {
  id: string;
  name: string;
  type: 'badge' | 'title' | 'perk';
  icon: string;
  description: string;
  acquiredAt: string;
}

export interface ViewerProfile {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  moderationLevel: number;
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
  inventory: ViewerBadge[];
  achievements: { achievementId: string; unlockedAt: string; progress: number }[];
  avatarColor: string;
  channelUrl?: string;
  profilePictureUrl?: string;
  autoShoutout?: boolean;
  responseType?: string;
  // Bot Response Configuration per Viewer
  personalityOverrideId?: string;
  responseBehavior?: 'personality_default' | 'always_roast' | 'always_praise' | 'custom_reply_template' | 'silent' | 'vip_fanfare';
  customBotReplyTemplate?: string;
  customGreeting?: string;
  customRoastPrompt?: string;
  linkedAutoResponseIds?: string[];
  vipShoutoutEffect?: string;
}

export interface MoodQuestionTrigger {
  id: string;
  question: string;
  keywords: string[];
  answer: string;
  category?: 'gaming' | 'channel' | 'economy' | 'advice' | 'banter' | 'general' | 'lore';
}

export interface BotPersonality {
  id: string;
  label: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
  description: string;
  systemPromptInstruction: string;
  greetingResponses: string[];
  chatResponses: string[]; // 22+ responses per mood
  questionTriggers: MoodQuestionTrigger[]; // 22+ questions per mood
  memoryInfusedResponses: string[]; // 12+ memory responses per mood
  commandResponses?: { trigger: string; response: string }[];
}

export interface ChatMessage {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  content: string;
  timestamp: string;
  isBot?: boolean;
  avatarColor?: string;
  points?: number;
  customFact?: string;
  highlight?: boolean;
  isAction?: boolean;
  isSuperChat?: boolean;
  superChatAmount?: string;
  isNewMember?: boolean;
}

export interface RedeemItem {
  id: string;
  name: string;
  cost: number;
  type: 'sound' | 'overlay' | 'obs_scene' | 'role_perk' | 'custom' | 'media_video' | 'media_gif';
  description: string;
  icon: string;
  soundPreset?: string;
  obsScene?: string;
  overlayDuration?: number;
  enabled: boolean;
  cooldownSeconds?: number;
  // Custom Media Extensions (MP4 / WebM / GIF / Images)
  mediaType?: 'video' | 'gif' | 'image';
  mediaUrl?: string;
  mediaSourceType?: 'url' | 'upload' | 'preset';
  mediaFit?: 'contain' | 'cover' | 'original';
  mediaPosition?: 'center' | 'fullscreen' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  mediaVolume?: number; // 0 to 1
  mediaLoop?: boolean;
  chromaKey?: 'none' | 'green' | 'blue' | 'magenta' | 'black';
  customAudioUrl?: string;
  caption?: string;
  userPromptRequired?: boolean;
}

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  rewardPoints: number;
  bannerPreset: 'generic' | 'xbox' | 'playstation' | 'steam';
  trophyTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  gamerscore?: number;
  icon: string;
  requirementType: 'messages' | 'points' | 'watchtime' | 'games_won' | 'boss_damage' | 'custom' | 'heist_win';
  requirementCount: number;
  unlockedCount?: number;
}

export type BossFailureEffect = 'fireball' | 'cyber_glitch' | 'freeze_screen' | 'void_collapse';

export interface BossItem {
  id: string;
  name: string;
  title: string;
  theme: string;
  icon: string;
  maxHp: number;
  currentHp: number;
  timerSeconds: number;
  attacks: { name: string; damage: string; quote: string }[];
  failureEffect: BossFailureEffect;
  failureTitle: string;
  failureSubtitle: string;
  achievementId: string;
  rewardPoints: number;
  rewardCurrency: number;
  colorGradient: string;
}

export interface BossRaidState {
  active: boolean;
  boss: BossItem;
  currentHp: number;
  remainingSeconds: number;
  totalTimeSeconds: number;
  contributors: { username: string; damage: number }[];
  status: 'active' | 'defeated' | 'failed';
  failureAnimationActive?: boolean;
}

export interface ChatGamesSettings {
  slotsWinMultiplier: number;
  slotsJackpotMultiplier: number;
  slotsWinChance: number;
  heistSuccessRate: number;
  heistVaultMultiplier: number;
  duelPurseMultiplier: number;
  coinPusherJackpotMultiplier: number;
  previewDurationSeconds: number;
}

export interface OBSConfig {
  connected: boolean;
  host: string;
  port: number;
  password: string;
  currentScene: string;
  autoSwitchOnRedeem: boolean;
  scenes: string[];
}

export interface GoogleOAuthAccount {
  authenticated: boolean;
  accountName: string;
  email?: string;
  channelId: string;
  channelHandle: string;
  channelTitle?: string;
  avatarUrl?: string;
  picture?: string;
  role?: 'host' | 'bot';
  accessToken?: string;
  expiresAt?: number;
  autoDetected?: boolean;
  subscriberCount?: number;
  scopes?: string[];
  connectedAt?: string;
  tokenExpiresIn?: string;
  clientId?: string;
}

export interface StreamMetadata {
  isLive: boolean;
  streamTitle: string;
  streamUrl: string;
  thumbnailUrl: string;
  viewerCount: number;
  subscriberCount: number;
  category: string;
  channelName: string;
  activeLiveChatId: string | null;
  videoId: string;
  streamerAuth: GoogleOAuthAccount & {
    autoDetectedFromLogin?: boolean;
    apiV3AutoIncluded?: boolean;
    loginEmail?: string;
  };
  botAuth: GoogleOAuthAccount & {
    botChannelHandle?: string;
    isSeparateAccount: boolean;
    sendChatAsBot: boolean;
    isFallback?: boolean;
    moderatorStatus?: 'verified_mod' | 'pending_mod' | 'not_mod';
    apiV3AutoIncluded?: boolean;
    botApiKey?: string;
  };
  youtubeApiV3: {
    autoDetected: boolean;
    apiVersion: string;
    quotaStatus: string;
    liveChatPolling: boolean;
    serviceState: string;
  };
}

export interface ShoutoutConfig {
  enabled: boolean;
  autoShoutoutOnFirstMessage: boolean;
  autoShoutoutOnlyOncePerStream: boolean;
  autoShoutoutLifetimeNewViewers: boolean;
  chatMessageTemplate: string;
  soundEffectPreset: string;
  soundVolume: number;
  obsOverlayEnabled: boolean;
  overlayDurationSeconds: number;
  overlayPosition: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'center';
  overlayTheme: 'neon-cyber' | 'retro-synth' | 'clean-dark' | 'gold-royal';
  overlayTemplate: 'cyber' | 'minimal' | 'bold' | 'card';
  overlayHeading: string;
  overlaySubheadingTemplate: string;
  showProfilePicture: boolean;
  showChannelLink: boolean;
  showCustomBadge: boolean;
  animationType: 'slide' | 'pop' | 'glow';
  rolesEligible: UserRole[];
  overlayBorderEnabled: boolean;
  overlayBorderWidth: number;
  overlayBorderColor: string;
  overlayAccentColor: string;
  overlayBackgroundColor: string;
  overlayBackgroundOpacity: number;
  overlayCornerRadius: number;
  overlayWidth: 'compact' | 'standard' | 'wide';
  enableWebcamFrame: boolean;
  webcamPosition: 'left' | 'right';
  webcamUrl: string;
}

export interface ShoutoutHistoryItem {
  id: string;
  username: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  timestamp: string;
  chatMessage: string;
  triggeredBy: 'auto' | 'manual';
}

export interface OverlayAlert {
  id: string;
  type: 'achievement' | 'shoutout' | 'redeem' | 'sound' | 'game' | 'duel' | 'boss_attack' | 'boss_failure' | 'boss_defeat' | 'heist' | 'slots' | 'coinpush' | 'mass_drop' | 'effect_confetti' | 'effect_cookies' | 'effect_fireworks' | 'effect_sparkles' | 'video' | 'gif' | 'media_video' | 'media_gif';
  title?: string;
  subtitle?: string;
  description?: string;
  customMessage?: string;
  bannerPreset?: 'generic' | 'xbox' | 'playstation' | 'steam';
  trophyTier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  gamerscore?: number;
  bannerUrl?: string;
  bannerType?: 'image' | 'video';
  gifUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaUrl?: string;
  mediaType?: 'video' | 'gif' | 'image';
  mediaFit?: 'contain' | 'cover' | 'original';
  mediaPosition?: 'center' | 'fullscreen' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  mediaVolume?: number;
  chromaKey?: 'none' | 'green' | 'blue' | 'magenta' | 'black';
  soundPreset?: string;
  caption?: string;
  username?: string;
  icon?: string;
  points?: number;
  effect?: 'confetti' | 'cookies' | 'fireworks' | 'sparkles' | 'video' | 'gif';
  dropPreset?: 'cookies' | 'coins' | 'bills' | 'cats' | 'dogs' | 'gems' | 'tacos' | 'stars' | 'gifts' | 'rockets' | 'custom';
  customDropImageUrl?: string;
  dropParticleCount?: number;
  gameId?: string;
  gameType?: 'slots' | 'heist' | 'duel' | 'coinpush' | 'boss';
  outcome?: string;
  durationMs?: number;
  timestamp: number;
  bossFailureEffect?: BossFailureEffect;
  bossName?: string;
  damageDealt?: number;
  payoutAmount?: number;
}

export interface ChatQuestionTrigger {
  id: string;
  keywords: string[];
  response: string;
  cooldownSeconds: number;
  matchType: 'exact' | 'contains' | 'regex';
}

export interface CustomCommand {
  id: string;
  command: string;
  aliases: string[];
  response: string;
  userLevel: 'everyone' | 'subscriber' | 'vip' | 'moderator' | 'owner';
  cooldownSeconds: number;
  enabled: boolean;
  soundEffect?: string;
  useCount: number;
  category: 'general' | 'socials' | 'stream' | 'fun' | 'info';
  description?: string;
  // Overlay & OBS Broadcast Triggers
  triggerOverlay?: boolean;
  overlayType?: 'confetti' | 'fireworks' | 'sparkles' | 'mass_drop' | 'banner' | 'shoutout' | 'media_video' | 'media_gif' | 'obs_scene';
  overlayTitle?: string;
  overlaySubtitle?: string;
  overlayDurationSeconds?: number;
  overlayTheme?: 'neon-cyber' | 'retro-synth' | 'clean-dark' | 'gold-royal';
  overlayBannerPreset?: 'xbox' | 'playstation' | 'steam' | 'generic';
  overlayIcon?: string;
  overlayDropPreset?: MassDropPreset;
  customDropImageUrl?: string;
  dropParticleCount?: number;
  mediaType?: 'video' | 'gif' | 'image';
  mediaUrl?: string;
  mediaPosition?: 'center' | 'fullscreen' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  mediaFit?: 'contain' | 'cover' | 'original';
  mediaVolume?: number;
  chromaKey?: 'none' | 'green' | 'blue' | 'magenta' | 'black';
  obsSceneToSwitch?: string;
  pointsRewardOrCost?: number;
}

export type MassDropPreset = 'cookies' | 'coins' | 'bills' | 'cats' | 'dogs' | 'gems' | 'tacos' | 'stars' | 'gifts' | 'rockets' | 'custom';

export interface AutoResponse {
  id: string;
  name: string;
  triggerType: 'contains' | 'exact' | 'regex' | 'starts_with';
  patterns: string[];
  response: string;
  responseMode?: 'single' | 'random_pool' | 'personality_pool' | 'preset_profile';
  responsePool?: string[];
  personalityId?: string;
  personalitySourceId?: string;
  profilePresetId?: string;
  enabled: boolean;
  cooldownSeconds: number;
  matchCount: number;
  caseSensitive?: boolean;
  requiredRole?: UserRole;
  triggerOverlay?: boolean;
  overlayBannerPreset?: string;
  overlayTitle?: string;
  overlaySubtitle?: string;
}

export interface AutomationTimer {
  id: string;
  name: string;
  message: string;
  intervalMinutes: number;
  minChatLines: number;
  enabled: boolean;
  lastTriggered?: string;
  soundEffect?: string;
  linesSinceLastPost?: number;
  sendAs?: 'bot' | 'host';
}

export interface AppSettings {
  streamerName: string;
  channelHandle: string;
  hostLoginEmail?: string;
  hostChannelId?: string;
  hostOAuthClientId?: string;
  autoDetectHostOnLogin?: boolean;
  googleOAuthClientId?: string;
  googleOAuthClientSecret?: string;
  googleCloudProjectId?: string;
  hostGoogleAccount?: GoogleOAuthAccount;
  botGoogleAccount?: GoogleOAuthAccount;
  botAccountName?: string;
  botChannelHandle?: string;
  botChannelId?: string;
  botOAuthClientId?: string;
  botApiKey?: string;
  botIsSeparateAccount?: boolean;
  sendChatAsBot?: boolean;
  botModStatus?: 'verified_mod' | 'pending_mod' | 'not_mod';
  youtubeApiKey: string;
  streamKey: string;
  masterVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  theme: 'neon-cyber' | 'synthwave' | 'dark-slate' | 'obsidian';
  overlayResolution: '1080p' | '720p' | '4k';
  enableAutoSave: boolean;
  enableAudioFeedback: boolean;
  desktopNotifications: boolean;
  enableDevLogs?: boolean;
  showDevLogs: boolean;
  kofiUrl: string;
  // YouTube API Quota & Friendly Polling Settings
  apiDailyQuotaLimit?: number; // default: 10000
  adaptivePollingEnabled?: boolean; // default: true
  autoWelcomeViewers?: boolean; // default: true
  autoWelcomeMode?: 'all' | 'new_only' | 'returning_memory'; // default: 'all'
  memoryResponseChance?: number; // default: 0.85
  autoWelcomeCooldownMinutes?: number; // default: 60
  targetStreamType?: 'live' | 'upcoming' | 'unlisted_private'; // default: 'live'
  targetStreamIdOrUrl?: string;
  // Blacklist & Bot Ignored List
  blacklistSettings?: BlacklistSettings;
}

export interface IgnoredUserEntry {
  id: string;
  username: string;
  reason?: string;
  addedAt: string;
  isBot?: boolean;
}

export interface BlacklistSettings {
  ignoreSelf: boolean;
  ignoreKnownBots: boolean;
  knownBotsList: string[];
  ignoredUsers: IgnoredUserEntry[];
  ignoreCommandPrefixesFromBots: boolean;
}

export type ScriptLanguage = 'python' | 'csharp' | 'javascript' | 'typescript';

export interface ScriptPlugin {
  id: string;
  name: string;
  filename: string;
  language: ScriptLanguage;
  version: string;
  author: string;
  description: string;
  code: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  registeredCommands: string[];
  registeredMinigames: string[];
  registeredHooks: Array<'onChatMessage' | 'onPointsRedeem' | 'onCommand' | 'onOverlayEvent' | 'onGameStart'>;
  executionLogs: Array<{ id: string; timestamp: string; level: 'info' | 'warn' | 'error' | 'game'; message: string }>;
  isBuiltIn?: boolean;
}

export type SupportedBotSource = 'streamlabs' | 'nightbot' | 'mixitup' | 'streamelements' | 'moobot' | 'firebot' | 'wizebot' | 'generic';

export interface ImportTransferResult {
  sourceBot: SupportedBotSource;
  totalFound: number;
  transferredCount: number;
  failedCount: number;
  transferredCommands: CustomCommand[];
  transferredTimers: AutomationTimer[];
  transferredResponses: AutoResponse[];
  errors: Array<{ item: string; reason: string; lineNumber?: number }>;
}

export interface CustomMinigameConfig {
  id: string;
  name: string;
  command: string;
  description: string;
  cost: number;
  minBet: number;
  maxBet: number;
  winChancePercent: number;
  payoutMultiplier: number;
  cooldownSeconds: number;
  enabled: boolean;
  winMessageTemplate: string;
  loseMessageTemplate: string;
  overlayEffect: 'confetti' | 'fireworks' | 'sparkles' | 'mass_drop' | 'none';
  customDropPreset?: MassDropPreset;
  gameType: 'custom_chance' | 'word_scramble' | 'roulette_chamber' | 'trivia_royale' | 'dice_duel' | 'dungeon_quest';
}

export interface WordScrambleState {
  active: boolean;
  originalWord: string;
  scrambledWord: string;
  hint: string;
  rewardPoints: number;
  startedAt: number;
  timeoutSeconds: number;
}

export interface RouletteState {
  currentChamber: number;
  bulletChamber: number;
  streakCount: number;
  lastPlayer?: string;
}

export interface TriviaState {
  active: boolean;
  question: string;
  options?: string[];
  correctAnswer: string;
  category: string;
  rewardPoints: number;
  startedAt: number;
  timeoutSeconds: number;
}

export type StreamConnectionType = 'live' | 'upcoming' | 'unlisted_private';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'quota_exhausted' | 'stream_ended';

export interface ApiQuotaUsage {
  dailyLimit: number;
  unitsUsedToday: number;
  lastResetDate: string; // YYYY-MM-DD
  liveChatPollsCount: number; // 1 unit each
  messagesSentCount: number; // 50 units each
  broadcastLookupsCount: number; // 1 unit each
  otherCallsCount: number;
  status: 'ok' | 'warning' | 'exhausted';
  lastCallTimestamp?: string;
  pollingIntervalSeconds: number;
  estimatedHoursRemaining: number;
  activeStreamType: StreamConnectionType;
  connectionStatus: ConnectionStatus;
  lastError?: string;
  connectedStreamTitle?: string;
  connectedLiveChatId?: string;
}

export interface EconomySettings {
  currencyName: string;
  currencySymbol: string;
  pointsPerMinute: number;
  pointsPerMessage: number;
  subBonusMultiplier: number;
  raidBonusMultiplier: number;
  dailyStreakBonus: number;
  minGambleBet: number;
  maxGambleBet: number;
  heistCooldownMinutes: number;
  massDropOverlayEnabled?: boolean;
  massDropPreset?: MassDropPreset;
  massDropCustomImageUrl?: string;
  massDropParticleCount?: number;
}
