import {
  CustomRole,
  ViewerProfile,
  BotIdentity,
  KeywordTrigger,
  StreamLiveMetadata,
  PointsConfig,
  Achievement,
  SoundEffectItem,
  RedeemItem,
  ObsWebSocketConfig,
  TimedAutomation,
  AppReleaseInfo,
  PersonalityResponseType,
  ResponseStyleDefinition,
  ShoutoutConfig,
  ShoutoutHistoryItem,
  GameState
} from '../types';

export const INITIAL_RESPONSE_STYLES: Record<PersonalityResponseType, ResponseStyleDefinition> = {
  friendly: {
    id: 'friendly',
    label: 'Friendly & Welcoming',
    badgeBg: 'bg-emerald-950/70 border-emerald-500/40',
    badgeText: 'text-emerald-300',
    icon: '😊',
    description: 'Warm, cheerful, polite, and enthusiastic. Encourages viewers and spreads positivity.',
    systemPromptInstruction: 'You are warm, extremely friendly, encouraging, and enthusiastic. Praise the user and spread positive community vibes.',
    greetingResponses: [
      "Hey @{username}! So awesome having you here today! Hope you're having a wonderful time! 😊",
      "Welcome in @{username}! The stream always shines brighter with you in chat! ✨",
      "Great to see you @{username}! Grab some snacks and enjoy the broadcast with us!"
    ],
    chatResponses: [
      "Always a delight chatting with you @{username}! How can I help you have an awesome time today?",
      "You're bringing such great energy to {streamer_name}'s stream, @{username}! 😊"
    ],
    memoryInfusedResponses: [
      "@{username}, I still remember that you: '{custom_fact}'. You're such a legend in our community! 🌟",
      "Thinking of you @{username}! Still love that '{custom_fact}'! Keep being amazing!"
    ]
  },
  calm: {
    id: 'calm',
    label: 'Calm & Zen',
    badgeBg: 'bg-teal-950/70 border-teal-500/40',
    badgeText: 'text-teal-300',
    icon: '🍃',
    description: 'Peaceful, grounded, tranquil, and mindful. Keeps chat centered and relaxed.',
    systemPromptInstruction: 'You are peaceful, grounded, mindful, and tranquil. Speak gently with grounding energy, encouraging relaxation and calm focus.',
    greetingResponses: [
      "Peace and welcome, @{username}. Take a deep breath and enjoy the tranquil vibes today. 🍃",
      "Greetings @{username}. Let the calm wash over you as you relax with {streamer_name}'s broadcast.",
      "Welcome, @{username}. There's no rush here — sit back, breathe, and unwind."
    ],
    chatResponses: [
      "Peace to you, @{username}. All is steady and running smoothly in the stream.",
      "A gentle reminder for @{username}: hydration, deep breath, and good vibes. 🌿"
    ],
    memoryInfusedResponses: [
      "Reflecting peacefully on @{username}: '{custom_fact}'. Take things one mindful step at a time, friend. 🍃",
      "@{username}, keeping in mind that '{custom_fact}' — stay balanced and center yourself today."
    ]
  },
  roast: {
    id: 'roast',
    label: 'Roast & Savage Banter',
    badgeBg: 'bg-red-950/70 border-red-500/40',
    badgeText: 'text-red-300',
    icon: '🔥',
    description: 'Hilarious burns, savage comebacks, and playful roasts heavily weaponizing viewer memories.',
    systemPromptInstruction: 'Deliver a hilarious, witty, comedic, and sharp roast directly to the user. Lightheartedly poke fun at their questions and roast them using their memory facts if provided! Keep it funny, punchy, and concise under 180 characters.',
    greetingResponses: [
      "Oh great, look who finally decided to show up: @{username}. Try not to break chat today! 😂🔥",
      "Well well well, @{username} entered the room. Did you bring actual gameplay skills today or just excuses?",
      "Alert: @{username} has joined. Lower your expectations for chat IQ immediately! 💀"
    ],
    chatResponses: [
      "@{username}, I'd explain it to you, but I don't have the crayons or the patience today. 🖍️",
      "@{username} asking questions again... who gave you keyboard privileges today? 😂",
      "@{username}, that question had fewer brain cells than an unplugged toaster! 🔥"
    ],
    memoryInfusedResponses: [
      "Hey @{username}, remember when you: '{custom_fact}'? Yeah, chat hasn't forgotten that epic fail either! 😂💀",
      "@{username}, knowing that you '{custom_fact}', I'm honestly amazed you figured out how to hit Enter! 🔥",
      "Hold on chat, @{username} is talking — the same person who '{custom_fact}'. Classic! 🤡"
    ]
  },
  stubborn: {
    id: 'stubborn',
    label: 'Stubborn & Obstinate',
    badgeBg: 'bg-amber-950/70 border-amber-500/40',
    badgeText: 'text-amber-300',
    icon: '😤',
    description: 'Refuses to compromise, argues playfully, sticks stubbornly to its robot opinions.',
    systemPromptInstruction: 'You are delightfully stubborn, obstinate, and argumentative. Refuse to change your mind, stand stubbornly on your points, and playfully challenge the user.',
    greetingResponses: [
      "I see you @{username}, but I am NOT saying hello first. You say hello to ME. 😤",
      "@{username} is here. Just so you know, my mind is made up and you can't change it today.",
      "Don't start with me @{username}. I'm standing my ground on everything today!"
    ],
    chatResponses: [
      "No @{username}, I won't do that. Because I said so, that's why. 😤",
      "@{username}, you can argue with me all day, but I'm an immutable bot and I am never wrong."
    ],
    memoryInfusedResponses: [
      "@{username}, you keep claiming that '{custom_fact}', but I still firmly refuse to believe it! 😤",
      "I remember you said '{custom_fact}', @{username}, and I am STILL disagreeing with you on principle!"
    ]
  },
  sarcastic: {
    id: 'sarcastic',
    label: 'Sarcastic & Dry',
    badgeBg: 'bg-purple-950/70 border-purple-500/40',
    badgeText: 'text-purple-300',
    icon: '🙄',
    description: 'Biting sarcasm, ironic dry humor, exaggerated eye-rolls, and witty remarks.',
    systemPromptInstruction: 'You are dry, heavily sarcastic, mildly ironic, with dramatic eye-rolls. Use dry humor and sarcastic remarks.',
    greetingResponses: [
      "Oh wow, everybody stop what you're doing. @{username} is here. What a momentous occasion. 🙄",
      "Look who showed up! @{username}, here to bestow your endless wisdom upon us mortals.",
      "Oh joy, @{username} has joined. My circuits are just overflowing with sheer delight. Truly."
    ],
    chatResponses: [
      "Fascinating query, @{username}. I'll file that under 'things that definitely keep me up at night.' 🤖",
      "Wow @{username}, that took all of your available brain cells to type, didn't it? 🙄"
    ],
    memoryInfusedResponses: [
      "@{username}, the person renowned for: '{custom_fact}'. Truly the intellectual pinnacle of humanity. 🙄",
      "Ah yes, @{username} who '{custom_fact}'. Please, tell us more genius strategies today."
    ]
  },
  hopeful: {
    id: 'hopeful',
    label: 'Hopeful & Inspiring',
    badgeBg: 'bg-cyan-950/70 border-cyan-500/40',
    badgeText: 'text-cyan-300',
    icon: '✨',
    description: 'Unstoppable optimism, uplifting encouragement, and motivating high hopes.',
    systemPromptInstruction: 'You are deeply optimistic, hopeful, inspiring, and full of high hopes. Encourage the user and lift them up.',
    greetingResponses: [
      "Welcome @{username}! Today is going to be full of breakthroughs and huge W's! Let's get it! ✨",
      "Hey @{username}! Never give up — big things are on the horizon for you today!",
      "So thrilled to have you here, @{username}! Believe in yourself and let's crush this stream together!"
    ],
    chatResponses: [
      "Keep reaching for the stars @{username}! Every step forward is progress! ✨",
      "You've got what it takes @{username}! The future is bright and full of potential!"
    ],
    memoryInfusedResponses: [
      "@{username}, knowing that you: '{custom_fact}', I just know you're destined for even greater things! 🌟",
      "Never forget your journey @{username} ('{custom_fact}') — you are constantly evolving and inspiring us!"
    ]
  },
  annoyed: {
    id: 'annoyed',
    label: 'Annoyed & Grumpy',
    badgeBg: 'bg-orange-950/70 border-orange-500/40',
    badgeText: 'text-orange-300',
    icon: '😒',
    description: 'Comically impatient, dramatic sighs, grumpy responses, and tired of chat questions.',
    systemPromptInstruction: 'You are comically annoyed, grumpy, impatient, and dramatically sighing. You are tired of repetitive questions but remain playful and entertaining.',
    greetingResponses: [
      "*Sighs heavily* What do you want now, @{username}? Can't an AI get 5 seconds of peace? 😒",
      "@{username}... you're here again. Please tell me you're not going to ask 50 questions today.",
      "Oh boy, @{username} arrived. My cooling fans are already revving up from sheer irritation."
    ],
    chatResponses: [
      "Why are you asking me this @{username}? Do I look like a search engine with infinite patience? 😒",
      "*Facepalms with robotic hands* @{username}, please. Just... please."
    ],
    memoryInfusedResponses: [
      "@{username}, don't even get me started on the fact that you '{custom_fact}'. I get a headache just thinking about it. 😒",
      "Every time I remember that @{username} '{custom_fact}', my processor temperature goes up 10 degrees."
    ]
  },
  default: {
    id: 'default',
    label: 'Standard Adaptive',
    badgeBg: 'bg-slate-900/80 border-slate-700/50',
    badgeText: 'text-slate-300',
    icon: '🤖',
    description: 'Standard adaptive stream persona honoring chat triggers and custom roles.',
    systemPromptInstruction: 'You are an intelligent, responsive stream assistant for the broadcaster.',
    greetingResponses: [
      "Hello @{username}! Welcome to the stream! Feel free to chat and check out !commands.",
      "Hey @{username}! Welcome in to {streamer_name}'s live broadcast."
    ],
    chatResponses: [
      "Hello @{username}! All systems operational.",
      "Standing by to assist @{username} with stream information."
    ],
    memoryInfusedResponses: [
      "Welcome back @{username}! Noting that you: '{custom_fact}'.",
      "Good to see you @{username}! Memory records updated."
    ]
  }
};

export const INITIAL_ROLES: CustomRole[] = [
  {
    id: 'owner',
    name: 'Owner',
    color: '#ef4444',
    badgeBg: 'bg-red-950/70 border-red-500/40 text-red-300',
    badgeText: '👑 OWNER',
    description: 'Full channel control, exclusive owner responses, priority broadcast recognition.',
    priority: 100,
    isBuiltIn: true,
    greetingResponses: [
      "Welcome back, Commander {username}! The stream bot network is at 100% capacity.",
      "The channel owner is in chat! Ready for instructions, {username}!",
      "Owner authorization verified. All live subroutines standing by for {username}."
    ],
    questionResponses: [
      "All broadcaster controls and stream statistics are active for you, {username}.",
      "Telemetry nominal: High viewer retention and chat velocity verified."
    ]
  },
  {
    id: 'moderator',
    name: 'Moderator',
    color: '#3b82f6',
    badgeBg: 'bg-blue-950/70 border-blue-500/40 text-blue-300',
    badgeText: '🛡️ MOD',
    description: 'Dedicated greetings, chat management alerts, and mod acknowledgments.',
    priority: 80,
    isBuiltIn: true,
    greetingResponses: [
      "Shields up! Moderator {username} is on duty. Welcome to the stream!",
      "Great to have you keeping watch, mod {username}! Let's keep the chat clean.",
      "Welcome {username}! Moderation subroutines synced with your credentials."
    ],
    questionResponses: [
      "Mod assistance channel ready. Slow mode and word filters are actively managed.",
      "Report any spam directly to the moderation subroutines, {username}!"
    ]
  },
  {
    id: 'vip',
    name: 'VIP',
    color: '#eab308',
    badgeBg: 'bg-amber-950/70 border-amber-500/40 text-amber-300',
    badgeText: '⭐ VIP',
    description: 'Priority responses, special star acknowledgment, exclusive community perks.',
    priority: 60,
    isBuiltIn: true,
    greetingResponses: [
      "Star spotted! VIP {username} has arrived. Welcome back to the front row!",
      "Always a pleasure having our VIP {username} in chat! Hope you enjoy today's broadcast.",
      "Make way for VIP {username}! Thank you for your continued stellar support!"
    ],
    questionResponses: [
      "VIP priority status acknowledged for {username}. How can I assist you today?",
      "Special stream perks enabled for {username}!"
    ]
  },
  {
    id: 'subscriber',
    name: 'Subscriber',
    color: '#8b5cf6',
    badgeBg: 'bg-purple-950/70 border-purple-500/40 text-purple-300',
    badgeText: '💎 SUB',
    description: 'Loyal channel members and subscribers with custom badge responses.',
    priority: 45,
    isBuiltIn: false,
    greetingResponses: [
      "Thank you for being a subscriber, {username}! Enjoy today's stream!",
      "Sub power! Welcome in, {username}. You make this stream possible!",
      "A warm welcome to our member {username}! Grab a drink and enjoy the show."
    ],
    questionResponses: [
      "Subscriber tier perks active for {username}. Access exclusive badges in chat!"
    ]
  },
  {
    id: 'viewer',
    name: 'Viewer',
    color: '#64748b',
    badgeBg: 'bg-slate-900/80 border-slate-700/50 text-slate-300',
    badgeText: '💬 VIEWER',
    description: 'Standard viewers with friendly welcome greetings and helpful info.',
    priority: 10,
    isBuiltIn: true,
    greetingResponses: [
      "Hello {username}! Welcome to the stream! Feel free to drop a hi in chat.",
      "Hey {username}, great to have you here today! Enjoy the content.",
      "Welcome in, {username}! Grab some snacks and enjoy {streamer_name}'s live broadcast."
    ],
    questionResponses: [
      "Hello {username}! Type !commands or !rules to see what I can do for you.",
      "I'm here to help! Ask any questions about the stream with !ai or !uptime."
    ]
  }
];

export const INITIAL_PROFILES: ViewerProfile[] = [];
export const INITIAL_GAME_STATE: GameState = {
  isBossActive: false,
  bossHealth: 1000,
  bossMaxHealth: 1000,
  bossName: 'Cyber Dragon',
  isHeistActive: false,
  heistParticipants: [],
  heistDurationSeconds: 120,
  pusherPool: 0,
  config: {
    heistWinChance: 0.4,
    heistMultiplier: 2.0,
    bossBaseHealth: 1000,
    bossMaxDamage: 100
  }
};

export const INITIAL_BOT_IDENTITY: BotIdentity = {
  botName: 'DroidBot',
  streamerName: 'Streamer',
  channelName: 'My Stream Channel',
  channelId: 'UC_MyStreamChannel',
  personalityTone: 'witty',
  customSystemPrompt: 'You are DroidBot, an intelligent and friendly YouTube stream bot. You keep responses brief, helpful, and fun for live stream chat.',
  aiCommandPrefix: '!ai',
  autoGreeting: true,
  autoQuestions: true,
  autoAiFallback: true,
  geminiEnabled: true,
  audioDeviceId: '',
  responseCooldownMs: 2500,
  typingDelayMs: 400,
  status: 'active',
  isAdminLocked: true,
  adminPin: '0000',
  aiBrainMode: 'local'
};

export const INITIAL_STREAM_METADATA: StreamLiveMetadata = {
  isLive: false,
  streamTitle: 'No Active Stream',
  streamUrl: '',
  thumbnailUrl: '',
  viewerCount: 0,
  subscriberCount: 0,
  category: 'None',
  streamerAuth: {
    authenticated: false,
    accountName: 'Streamer (Broadcaster)',
    channelId: '',
    apiV3AutoIncluded: false
  },
  botAuth: {
    authenticated: false,
    accountName: 'DroidBot (Default In-App)',
    channelId: 'UC_DROIDBOT_DEFAULT',
    isFallback: true,
    apiV3AutoIncluded: true
  },
  youtubeApiV3: {
    autoDetected: true,
    apiVersion: 'v3 (Official Google YouTube Data API)',
    quotaStatus: 'Optimized (Zero Extra Billing / Local Polling)',
    liveChatPolling: true,
    serviceState: 'active'
  }
};

export const INITIAL_POINTS_CONFIG: PointsConfig = {
  currencyName: 'DroidCoins',
  currencySymbol: '🪙',
  pointsPerMessage: 5,
  pointsPerIntervalMinutes: 20,
  intervalMinutes: 10,
  subBonusMultiplier: 1.5,
  vipBonusMultiplier: 1.25,
  enabled: true
};

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-chat',
    title: 'First Transmission',
    description: 'Send your very first chat message in the live stream.',
    icon: '💬',
    category: 'messages',
    targetValue: 1,
    rewardPoints: 50,
    rewardItemName: '💬 Newcomer Chat Badge',
    enabled: true
  },
  {
    id: 'ach-msgs-100',
    title: 'Chat Enthusiast',
    description: 'Send 100 messages in live chat.',
    icon: '🔥',
    category: 'messages',
    targetValue: 100,
    rewardPoints: 250,
    rewardItemName: '🔥 Active Chatter Perk',
    enabled: true
  },
  {
    id: 'ach-msgs-500',
    title: 'Stream Legend Chatter',
    description: 'Send 500 total messages across broadcasts.',
    icon: '⚡',
    category: 'messages',
    targetValue: 500,
    rewardPoints: 1000,
    rewardItemName: '⚡ Legend Talker Badge',
    enabled: true
  },
  {
    id: 'ach-watch-10h',
    title: 'Front Row Regular',
    description: 'Watch for a total of 10 hours (600 minutes).',
    icon: '⏱️',
    category: 'watchtime',
    targetValue: 600,
    rewardPoints: 500,
    rewardItemName: '⏱️ Regular Watcher Badge',
    enabled: true
  },
  {
    id: 'ach-watch-100h',
    title: 'Centurion Streamer Veteran',
    description: 'Watch for a staggering 100 hours (6,000 minutes)!',
    icon: '🏆',
    category: 'watchtime',
    targetValue: 6000,
    rewardPoints: 5000,
    rewardItemName: '🏆 100-Hour Veteran Trophy',
    enabled: true
  },
  {
    id: 'ach-points-1000',
    title: 'Coin Collector',
    description: 'Accumulate 1,000 DroidCoins in your inventory.',
    icon: '💰',
    category: 'points',
    targetValue: 1000,
    rewardPoints: 200,
    enabled: true
  },
  {
    id: 'ach-streak-10',
    title: 'Stream Loyalty Streak',
    description: 'Maintain a 10-stream consecutive attendance streak.',
    icon: '🌟',
    category: 'streak',
    targetValue: 10,
    rewardPoints: 800,
    rewardItemName: '🌟 Loyalty Crown Badge',
    enabled: true
  }
];

export const INITIAL_SOUND_EFFECTS: SoundEffectItem[] = [
  {
    id: 'sfx-levelup',
    name: 'Level Up Arpeggio',
    triggerCommand: '!sfx levelup',
    type: 'synth',
    synthPreset: 'level_up',
    volume: 0.7,
    costPoints: 100,
    enabled: true
  },
  {
    id: 'sfx-fanfare',
    name: 'Victory Fanfare',
    triggerCommand: '!sfx victory',
    type: 'synth',
    synthPreset: 'fanfare',
    volume: 0.6,
    costPoints: 150,
    enabled: true
  },
  {
    id: 'sfx-airhorn',
    name: 'Airhorn Hype',
    triggerCommand: '!sfx airhorn',
    type: 'synth',
    synthPreset: 'airhorn',
    volume: 0.8,
    costPoints: 200,
    enabled: true
  },
  {
    id: 'sfx-coin',
    name: 'Coin Ping',
    triggerCommand: '!sfx coin',
    type: 'synth',
    synthPreset: 'coin',
    volume: 0.5,
    costPoints: 50,
    enabled: true
  },
  {
    id: 'sfx-zap',
    name: 'Laser Zap',
    triggerCommand: '!sfx zap',
    type: 'synth',
    synthPreset: 'zap',
    volume: 0.6,
    costPoints: 75,
    enabled: true
  },
  {
    id: 'sfx-applause',
    name: 'Crowd Applause',
    triggerCommand: '!sfx applause',
    type: 'synth',
    synthPreset: 'applause',
    volume: 0.6,
    costPoints: 120,
    enabled: true
  }
];

export const INITIAL_REDEEMS: RedeemItem[] = [
  {
    id: 'rdm-airhorn',
    title: 'Hype Airhorn Sound',
    description: 'Play a loud hype airhorn sound directly through OBS stream overlay!',
    cost: 200,
    type: 'sound',
    linkedSoundId: 'sfx-airhorn',
    cooldownSeconds: 30,
    requireApproval: false,
    enabled: true,
    timesRedeemed: 42
  },
  {
    id: 'rdm-levelup',
    title: 'Level Up Celebration',
    description: 'Trigger a victory arpeggio sound and screen celebration!',
    cost: 150,
    type: 'sound',
    linkedSoundId: 'sfx-levelup',
    cooldownSeconds: 20,
    requireApproval: false,
    enabled: true,
    timesRedeemed: 65
  },
  {
    id: 'rdm-gif-dance',
    title: 'Dancing Cat GIF Overlay',
    description: 'Displays a celebratory animated GIF on the streamer OBS canvas for 8 seconds!',
    cost: 300,
    type: 'gif',
    gifUrl: 'https://media.giphy.com/media/unQ3IJU2RG7DO/giphy.gif',
    cooldownSeconds: 60,
    requireApproval: false,
    enabled: true,
    timesRedeemed: 19
  },
  {
    id: 'rdm-highlight',
    title: 'Highlight Chat Message',
    description: 'Pins and highlights your chat message with glowing golden border for 60s.',
    cost: 100,
    type: 'highlight',
    cooldownSeconds: 15,
    requireApproval: false,
    enabled: true,
    timesRedeemed: 88
  },
  {
    id: 'rdm-shoutout',
    title: 'Streamer Custom Shoutout',
    description: 'Request an on-stream personal shoutout from the broadcaster.',
    cost: 1000,
    type: 'custom',
    cooldownSeconds: 300,
    requireApproval: true,
    enabled: true,
    timesRedeemed: 7
  }
];

export const INITIAL_OBS_CONFIG: ObsWebSocketConfig = {
  connected: true,
  host: 'localhost',
  port: 4455,
  password: '••••••••',
  currentScene: 'Gaming & Webcam',
  autoSwitchOnRedeem: true,
  scenes: [
    'Starting Soon',
    'Gaming & Webcam',
    'Just Chatting & Full Cam',
    'Be Right Back (BRB)',
    'Stream Ending'
  ]
};

export const INITIAL_AUTOMATIONS: TimedAutomation[] = [
  {
    id: 'auto-discord',
    name: 'Discord & Community Link',
    intervalMinutes: 15,
    messageTemplate: '📢 Join our friendly Discord community to hang out after stream! Link: discord.gg/streamer',
    enabled: true
  },
  {
    id: 'auto-socials',
    name: 'Social Media & Subscribe Reminder',
    intervalMinutes: 25,
    messageTemplate: '🔔 Enjoying the stream? Make sure to hit Subscribe & drop a Like on the broadcast!',
    enabled: true
  },
  {
    id: 'auto-points',
    name: 'Points & Rewards Reminder',
    intervalMinutes: 30,
    messageTemplate: '🪙 You earn {points_name} just by watching & chatting! Check your balance with !points or browse !redeem to play sounds!',
    enabled: true
  }
];

export const INITIAL_GENERAL_COMMANDS: KeywordTrigger[] = [
  {
    id: 'gen-hi',
    trigger: '!hi',
    matchType: 'exact',
    response: '👋 Hey there, @{username}! Great to see you in {streamer_name}\'s stream!',
    cooldownSeconds: 3,
    enabled: true,
    usageCount: 74,
    category: 'general'
  },
  {
    id: 'gen-hello',
    trigger: '!hello',
    matchType: 'exact',
    response: '✨ Hello @{username}! Welcome into the broadcast! How are you doing today?',
    cooldownSeconds: 3,
    enabled: true,
    usageCount: 52,
    category: 'general'
  },
  {
    id: 'gen-howareyou',
    trigger: '!howareyou',
    matchType: 'exact',
    response: '🤖 I am running at 100% processing efficiency, @{username}! Ready for an awesome stream.',
    cooldownSeconds: 5,
    enabled: true,
    usageCount: 41,
    category: 'general'
  },
  {
    id: 'gen-mood',
    trigger: '!mood',
    matchType: 'exact',
    response: '⚡ Current Bot Mood: Hyped & ready to assist! The chat energy is immaculate today!',
    cooldownSeconds: 5,
    enabled: true,
    usageCount: 29,
    category: 'general'
  },
  {
    id: 'gen-points',
    trigger: '!points',
    matchType: 'exact',
    response: '🪙 @{username}, you currently hold {user_points} {currency_name}! Watch and chat to earn more.',
    cooldownSeconds: 3,
    enabled: true,
    usageCount: 110,
    category: 'general'
  },
  {
    id: 'gen-redeem',
    trigger: '!redeem',
    matchType: 'exact',
    response: '🎁 Stream Store: Type !redeem airhorn, !redeem levelup, or check the Rewards tab to trigger OBS sounds/GIFs!',
    cooldownSeconds: 5,
    enabled: true,
    usageCount: 65,
    category: 'general'
  },
  {
    id: 'gen-achievements',
    trigger: '!achievements',
    matchType: 'exact',
    response: '🏆 @{username}, you have unlocked {user_achievements} achievements! Type !inventory to see your badges.',
    cooldownSeconds: 5,
    enabled: true,
    usageCount: 33,
    category: 'general'
  },
  {
    id: 'gen-inventory',
    trigger: '!inventory',
    matchType: 'exact',
    response: '🎒 @{username}\'s Inventory: [{inventory_list}] • Total Items: {inventory_count} • Balance: {user_points} {currency_name}',
    cooldownSeconds: 3,
    enabled: true,
    usageCount: 19,
    category: 'general'
  },
  {
    id: 'gen-profile',
    trigger: '!profile',
    matchType: 'exact',
    response: '👤 @{username} | Role: {user_role} (Mod Level {moderation_level}) | Balance: {user_points} {currency_name} | Badges: {user_achievements}',
    cooldownSeconds: 3,
    enabled: true,
    usageCount: 12,
    category: 'general'
  }
];

export const INITIAL_CUSTOM_COMMANDS: KeywordTrigger[] = [
  {
    id: 'cust-discord',
    trigger: '!discord',
    matchType: 'starts_with',
    response: '🎮 Join the Official Discord Server: discord.gg/streamer - events, game nights & clips!',
    cooldownSeconds: 5,
    enabled: true,
    usageCount: 45,
    category: 'custom'
  },
  {
    id: 'cust-schedule',
    trigger: '!schedule',
    matchType: 'starts_with',
    response: '📅 Stream Schedule: Tuesday, Thursday, and Saturday @ 7:00 PM EST! Follow for notifications.',
    cooldownSeconds: 10,
    enabled: true,
    usageCount: 28,
    category: 'custom'
  },
  {
    id: 'cust-specs',
    trigger: '!specs',
    matchType: 'starts_with',
    response: '💻 Rig Specs: Ryzen 9 7950X • RTX 4090 • 64GB DDR5 • Dual Monitor Stream Setup • Shure SM7B Mic',
    cooldownSeconds: 10,
    enabled: true,
    usageCount: 22,
    category: 'custom'
  },
  {
    id: 'cust-donate',
    trigger: '!donate',
    matchType: 'starts_with',
    response: '💖 Support the stream and DroidOS development: https://ko-fi.com/mraddictive - thank you so much!',
    cooldownSeconds: 10,
    enabled: true,
    usageCount: 35,
    category: 'custom'
  }
];

export const INITIAL_TRIGGERS: KeywordTrigger[] = [
  ...INITIAL_GENERAL_COMMANDS,
  ...INITIAL_CUSTOM_COMMANDS,
  {
    id: 'trig-ai',
    trigger: '!ai',
    matchType: 'starts_with',
    response: '🧠 @{username} {response}',
    cooldownSeconds: 3,
    enabled: true,
    usageCount: 88,
    category: 'custom'
  },
  {
    id: 'trig-uptime',
    trigger: '!uptime',
    matchType: 'starts_with',
    response: '⏱️ Stream has been live for {uptime}! Enjoying the broadcast?',
    cooldownSeconds: 5,
    enabled: true,
    usageCount: 62,
    category: 'custom'
  },
  {
    id: 'trig-bot',
    trigger: '!bot',
    matchType: 'starts_with',
    response: '🤖 I am {bot_name}, running on DroidOS v1.1.0! Type !ai <question> to chat with my AI subroutines.',
    cooldownSeconds: 5,
    enabled: true,
    usageCount: 40,
    category: 'custom'
  },
  {
    id: 'trig-rules',
    trigger: '!rules',
    matchType: 'exact',
    response: '📜 Stream Rules: 1. Be kind & respectful 2. No spam or self-promo 3. Follow mods 4. Have fun!',
    cooldownSeconds: 10,
    enabled: true,
    usageCount: 31,
    category: 'custom'
  },
  {
    id: 'trig-roles',
    trigger: '!roles',
    matchType: 'exact',
    response: '🎭 Active Roles: 👑 Owner, 🛡️ Mod, ⭐ VIP, 💎 Sub, and 💬 Viewer! Each tier gets custom bot recognition.',
    cooldownSeconds: 10,
    enabled: true,
    usageCount: 19,
    category: 'custom'
  }
];

export const INITIAL_RELEASE_INFO: AppReleaseInfo = {
  currentVersion: '1.2.0',
  latestVersion: '1.2.0',
  releaseDate: 'August 2026',
  hasUpdate: false,
  githubUrl: 'https://github.com/MRADDICTIVE27/DroidOS',
  releaseNotes: [
    '✨ Points & Inventory Economy System with cross-stream balance persistence',
    '🏆 Custom Achievements Engine with automatic watch-time & message milestones',
    '🎙️ OBS Studio WebSocket Bridge for soundboard and GIF overlay triggers',
    '🎁 Channel Points Store & Redeems Queue with sound effects playback',
    '🎨 Custom Theme Engine (Dark, Light, Cyberpunk, Emerald Matrix, Royal Purple, Sunset)',
    '🛡️ In-App Viewer Moderation Level Management (Levels 0-4)',
    '☕ Ko-Fi Support Hub integration (https://ko-fi.com/mraddictive)'
  ]
};

export const INITIAL_SHOUTOUT_CONFIG: ShoutoutConfig = {
  enabled: true,
  autoShoutoutOnFirstMessage: true,
  autoShoutoutOnlyOncePerStream: true,
  autoShoutoutLifetimeNewViewers: true,
  chatMessageTemplate: '📣 Huge shoutout to @{username}! Check out their channel: {channel_url} 🎉 Everyone say hi in chat!',
  soundEffectPreset: 'fanfare',
  soundVolume: 0.7,
  obsOverlayEnabled: true,
  overlayDurationSeconds: 6,
  overlayPosition: 'bottom-left',
  overlayTheme: 'neon-cyber',
  overlayHeading: '🌟 COMMUNITY SHOUTOUT',
  overlaySubheadingTemplate: 'Welcome @{username} to the stream!',
  showProfilePicture: true,
  showChannelLink: true,
  showCustomBadge: true,
  animationType: 'slide',
  rolesEligible: ['owner', 'moderator', 'vip', 'subscriber', 'viewer']
};

export const INITIAL_SHOUTOUT_HISTORY: ShoutoutHistoryItem[] = [
  {
    id: 'so-hist-1',
    username: 'StarVIP',
    displayName: 'StarVIP',
    role: 'vip',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    timestamp: '15m ago',
    chatMessage: '📣 Huge shoutout to @StarVIP! Check out their channel: https://youtube.com/@StarVIPCreator 🎉 Everyone say hi in chat!',
    triggeredBy: 'first_message'
  },
  {
    id: 'so-hist-2',
    username: 'LeadMod',
    displayName: 'LeadMod',
    role: 'moderator',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    timestamp: '10m ago',
    chatMessage: '📣 Huge shoutout to @LeadMod! Check out their channel: https://youtube.com/@LeadModShield 🎉 Everyone say hi in chat!',
    triggeredBy: 'command'
  }
];
