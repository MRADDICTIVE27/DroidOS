import React, { useState, useEffect, useCallback, useRef } from 'react';
import defaultFirebaseConfig from '../firebase-applet-config.json';
import { Header, ALL_WORKSPACE_TABS } from './components/Header';
import { DashboardTab } from './components/DashboardTab';
import { BotIdentityTab } from './components/BotIdentityTab';
import { AuthenticatorTab } from './components/AuthenticatorTab';
import { LiveViewerTab } from './components/LiveViewerTab';
import { MemoryTab } from './components/MemoryTab';
import { RolesResponsesTab } from './components/RolesResponsesTab';
import { ProfilesTab } from './components/ProfilesTab';
import { ResponseStylesTab } from './components/ResponseStylesTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { AutomationsTab } from './components/AutomationsTab';
import { PointsTab } from './components/PointsTab';
import { SoundEffectsTab } from './components/SoundEffectsTab';
import { AchievementsTab } from './components/AchievementsTab';
import { ObsControlTab } from './components/ObsControlTab';
import { ObsOverlayTab } from './components/ObsOverlayTab';
import { RedeemsTab } from './components/RedeemsTab';
import { GamesTab } from './components/GamesTab';
import { GeneralCommandsTab } from './components/GeneralCommandsTab';
import { CustomCommandsTab } from './components/CustomCommandsTab';
import { TelemetryTab } from './components/TelemetryTab';
import { UpdatesTab } from './components/UpdatesTab';
import { SettingsTab } from './components/SettingsTab';
import { ShoutoutsTab } from './components/ShoutoutsTab';
import { ShoutoutOverlayWidget } from './components/ShoutoutOverlayWidget';
import { Overlay } from './components/Overlay';
import { dispatchOverlayAlert } from './services/alertDispatcher';
import { initAuth, getAccessToken } from './lib/googleAuth';
import { saveStateToCloud, loadStateFromCloud } from './lib/cloudSync';
import { User } from 'firebase/auth';
import { CloudBackupTab } from './components/CloudBackupTab';
import { SupportModal } from './components/SupportModal';
import { ConfigModal } from './components/ConfigModal';
import { CleanSetupModal } from './components/CleanSetupModal';
import { AgreementModal } from './components/AgreementModal';
import { FirebaseSetup } from './components/FirebaseSetup';

import {
  INITIAL_BOT_IDENTITY,
  INITIAL_ROLES,
  INITIAL_PROFILES,
  INITIAL_TRIGGERS,
  INITIAL_STREAM_METADATA,
  INITIAL_POINTS_CONFIG,
  INITIAL_ACHIEVEMENTS,
  INITIAL_SOUND_EFFECTS,
  INITIAL_REDEEMS,
  INITIAL_OBS_CONFIG,
  INITIAL_AUTOMATIONS,
  INITIAL_RESPONSE_STYLES,
  INITIAL_GAME_STATE,
  INITIAL_RELEASE_INFO,
  INITIAL_SHOUTOUT_CONFIG,
  INITIAL_SHOUTOUT_HISTORY
} from './data/initialData';

import {
  ChatMessage,
  SystemLog,
  StreamLiveMetadata,
  AppTheme,
  RedeemItem,
  PersonalityResponseType,
  ResponseStyleDefinition,
  ShoutoutConfig,
  ShoutoutHistoryItem,
  ActiveShoutoutOverlay,
  ViewerProfile,
  BotIdentity,
  ViewerRoleConfig,
  TriggerRule,
  PointsSystemConfig,
  AchievementDefinition,
  GameState,
  SoundEffectItem,
  ObsWebSocketConfig,
  AutomationTask,
  AudioQueueItem
} from './types';
import { processIncomingMessage, queryAiEngine, checkAchievementProgress } from './services/botEngine';
import { playSynthesizedSound, playCustomAudioUrl } from './services/soundService';

const getInitialSavedState = (uid?: string | null) => {
  try {
    const storageKey = uid ? `droidos_state_${uid}` : 'droidos_state_guest';
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('[DroidOS State Load]', e);
  }
  return null;
};

export const App: React.FC = () => {
  if (window.location.pathname === '/overlay') {
    return <Overlay />;
  }

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const savedState = getInitialSavedState(currentUserId);

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<AppTheme>(() => savedState?.theme || 'dark');
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState<boolean>(false);

  useEffect(() => {
    const ensureLocalPreconfiguredState = () => {
      const bundledConfig = defaultFirebaseConfig as { apiKey?: string; projectId?: string } | null;
      const resolvedConfig = bundledConfig && bundledConfig.apiKey && bundledConfig.projectId ? bundledConfig : null;

      if (resolvedConfig) {
        try {
          localStorage.setItem('droidos_firebase_config', JSON.stringify(resolvedConfig));
        } catch {
          // ignore storage failures
        }
      }

      const storedConfig = localStorage.getItem('droidos_firebase_config');
      if (storedConfig) {
        try {
          const config = JSON.parse(storedConfig);
          if (config && config.apiKey && config.projectId) {
            setIsFirebaseConfigured(true);
            return;
          }
        } catch {
          setIsFirebaseConfigured(false);
        }
      }

      if (resolvedConfig) {
        setIsFirebaseConfigured(true);
      }
    };

    ensureLocalPreconfiguredState();
  }, []);

  const [tabOrder, setTabOrder] = useState<string[]>(() => savedState?.tabOrder || [
    'dashboard',
    'liveviewer',
    'personalities',
    'points',
    'redeems',
    'achievements',
    'games',
    'soundeffects',
    'obs',
    'identity',
    'authenticator',
    'memory',
    'roles',
    'profiles',
    'cloudbackup',
    'general',
    'custom',
    'automations',
    'analytics',
    'telemetry',
    'updates',
    'settings'
  ]);

  // Core Data States - Hydrated eagerly on render #1 from localStorage to prevent data loss
  const [botIdentity, setBotIdentity] = useState<BotIdentity>(() =>
    savedState?.botIdentity ? { ...INITIAL_BOT_IDENTITY, ...savedState.botIdentity } : INITIAL_BOT_IDENTITY
  );
  const [roles, setRoles] = useState<ViewerRoleConfig[]>(() => savedState?.roles || INITIAL_ROLES);
  const [profiles, setProfiles] = useState<ViewerProfile[]>(() => savedState?.profiles || INITIAL_PROFILES);
  const [responseStyles, setResponseStyles] = useState<
    Record<PersonalityResponseType, ResponseStyleDefinition>
  >(() => savedState?.responseStyles || INITIAL_RESPONSE_STYLES);
  const [triggers, setTriggers] = useState<TriggerRule[]>(() => savedState?.triggers || INITIAL_TRIGGERS);
  const [pointsConfig, setPointsConfig] = useState<PointsSystemConfig>(() =>
    savedState?.pointsConfig ? { ...INITIAL_POINTS_CONFIG, ...savedState.pointsConfig } : INITIAL_POINTS_CONFIG
  );
  const [achievements, setAchievements] = useState<AchievementDefinition[]>(() => savedState?.achievements || INITIAL_ACHIEVEMENTS);
  const [gameState, setGameState] = useState<GameState>(() =>
    savedState?.gameState ? { ...INITIAL_GAME_STATE, ...savedState.gameState } : INITIAL_GAME_STATE
  );
  const [activeDuel, setActiveDuel] = useState<{ challenger: string; target: string; amount: number } | null>(null);
  const [soundEffects, setSoundEffects] = useState<SoundEffectItem[]>(() => savedState?.soundEffects || INITIAL_SOUND_EFFECTS);
  const [redeems, setRedeems] = useState<RedeemItem[]>(() => savedState?.redeems || INITIAL_REDEEMS);
  const [obsConfig, setObsConfig] = useState<ObsWebSocketConfig>(() =>
    savedState?.obsConfig ? { ...INITIAL_OBS_CONFIG, ...savedState.obsConfig } : INITIAL_OBS_CONFIG
  );
  const [automations, setAutomations] = useState<AutomationTask[]>(() => savedState?.automations || INITIAL_AUTOMATIONS);
  const [streamMetadata, setStreamMetadata] = useState<StreamLiveMetadata>(() => {
    if (!savedState?.streamMetadata) return INITIAL_STREAM_METADATA;
    return {
      ...INITIAL_STREAM_METADATA,
      ...savedState.streamMetadata,
      streamerAuth: {
        ...INITIAL_STREAM_METADATA.streamerAuth,
        ...(savedState.streamMetadata.streamerAuth || {})
      },
      botAuth: {
        ...INITIAL_STREAM_METADATA.botAuth,
        ...(savedState.streamMetadata.botAuth || {})
      },
      youtubeApiV3: {
        ...INITIAL_STREAM_METADATA.youtubeApiV3,
        ...(savedState.streamMetadata.youtubeApiV3 || {})
      }
    };
  });
  const [releaseInfo, setReleaseInfo] = useState(INITIAL_RELEASE_INFO);
  const [shoutoutConfig, setShoutoutConfig] = useState<ShoutoutConfig>(() =>
    savedState?.shoutoutConfig ? { ...INITIAL_SHOUTOUT_CONFIG, ...savedState.shoutoutConfig } : INITIAL_SHOUTOUT_CONFIG
  );
  const [shoutoutHistory, setShoutoutHistory] = useState<ShoutoutHistoryItem[]>(() => savedState?.shoutoutHistory || INITIAL_SHOUTOUT_HISTORY);
  const [activeShoutout, setActiveShoutout] = useState<ActiveShoutoutOverlay | null>(null);
  const [audioQueue, setAudioQueue] = useState<AudioQueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState<boolean>(false);

  // Runtime Controls
  const [isListening, setIsListening] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(3600);
  const [simulatedTraffic, setSimulatedTraffic] = useState<boolean>(false);

  // Modals
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showCleanSetup, setShowCleanSetup] = useState<boolean>(false);
  const [showSupport, setShowSupport] = useState<boolean>(false);
  const [agreementAccepted, setAgreementAccepted] = useState<boolean>(() => {
    try {
      const storedValue = localStorage.getItem('droidos_eula_accepted');
      if (storedValue === 'true') return true;

      const bundledConfig = defaultFirebaseConfig as { apiKey?: string; projectId?: string } | null;
      if (bundledConfig?.apiKey && bundledConfig?.projectId) {
        localStorage.setItem('droidos_eula_accepted', 'true');
        return true;
      }

      return false;
    } catch {
      return false;
    }
  });
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const isHydratedRef = useRef(false);

  useEffect(() => {
    isHydratedRef.current = true;
  }, []);

  useEffect(() => {
    const unsubscribe = initAuth((user) => {
      setCurrentUser(user);
      setCurrentUserId(user.uid);
      if (user) {
        setIsCloudSyncing(true);
        loadStateFromCloud().then((parsed) => {
          if (parsed) {
            if (parsed.botIdentity) setBotIdentity(prev => ({ ...prev, ...parsed.botIdentity }));
            if (parsed.roles) setRoles(parsed.roles);
            if (parsed.profiles) setProfiles(parsed.profiles);
            if (parsed.responseStyles) setResponseStyles(parsed.responseStyles);
            if (parsed.triggers) setTriggers(parsed.triggers);
            if (parsed.pointsConfig) setPointsConfig(parsed.pointsConfig);
            if (parsed.achievements) setAchievements(parsed.achievements);
            if (parsed.soundEffects) setSoundEffects(parsed.soundEffects);
            if (parsed.redeems) setRedeems(parsed.redeems);
            if (parsed.obsConfig) setObsConfig(parsed.obsConfig);
            if (parsed.automations) setAutomations(parsed.automations);
            if (parsed.streamMetadata) setStreamMetadata(prev => ({
              ...prev,
              ...parsed.streamMetadata,
              streamerAuth: { ...prev.streamerAuth, ...(parsed.streamMetadata.streamerAuth || {}) },
              botAuth: { ...prev.botAuth, ...(parsed.streamMetadata.botAuth || {}) },
              youtubeApiV3: { ...prev.youtubeApiV3, ...(parsed.streamMetadata.youtubeApiV3 || {}) }
            }));
            if (parsed.tabOrder) {
              setTabOrder(Array.from(new Set([...parsed.tabOrder, 'obs-overlay'])));
            }
            if (parsed.theme) setTheme(parsed.theme);
            if (parsed.shoutoutConfig) setShoutoutConfig(parsed.shoutoutConfig);
            if (parsed.shoutoutHistory) setShoutoutHistory(parsed.shoutoutHistory);
            if (parsed.gameState) setGameState(parsed.gameState);
            showToast('Settings synced from cloud workspace');
          }
          setIsCloudSyncing(false);
        });
      }
    }, () => {
      setCurrentUser(null);
      setCurrentUserId(null);
      setBotIdentity(INITIAL_BOT_IDENTITY);
      setRoles(INITIAL_ROLES);
      setProfiles(INITIAL_PROFILES);
      setResponseStyles(INITIAL_RESPONSE_STYLES);
      setTriggers(INITIAL_TRIGGERS);
      setPointsConfig(INITIAL_POINTS_CONFIG);
      setAchievements(INITIAL_ACHIEVEMENTS);
      setSoundEffects(INITIAL_SOUND_EFFECTS);
      setRedeems(INITIAL_REDEEMS);
      setObsConfig(INITIAL_OBS_CONFIG);
      setAutomations(INITIAL_AUTOMATIONS);
      setStreamMetadata(INITIAL_STREAM_METADATA);
      setTabOrder([
        'dashboard',
        'liveviewer',
        'personalities',
        'points',
        'redeems',
        'achievements',
        'games',
        'soundeffects',
        'obs',
        'identity',
        'authenticator',
        'memory',
        'roles',
        'profiles',
        'cloudbackup',
        'general',
        'custom',
        'automations',
        'analytics',
        'telemetry',
        'updates',
        'settings'
      ]);
      setTheme('dark');
      setShoutoutConfig(INITIAL_SHOUTOUT_CONFIG);
      setShoutoutHistory(INITIAL_SHOUTOUT_HISTORY);
      setGameState(INITIAL_GAME_STATE);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const seededState = getInitialSavedState(currentUserId);
    if (!seededState) return;

    if (seededState.botIdentity) setBotIdentity(prev => ({ ...prev, ...seededState.botIdentity }));
    if (seededState.roles) setRoles(seededState.roles);
    if (seededState.profiles) setProfiles(seededState.profiles);
    if (seededState.responseStyles) setResponseStyles(seededState.responseStyles);
    if (seededState.triggers) setTriggers(seededState.triggers);
    if (seededState.pointsConfig) setPointsConfig(seededState.pointsConfig);
    if (seededState.achievements) setAchievements(seededState.achievements);
    if (seededState.soundEffects) setSoundEffects(seededState.soundEffects);
    if (seededState.redeems) setRedeems(seededState.redeems);
    if (seededState.obsConfig) setObsConfig(seededState.obsConfig);
    if (seededState.automations) setAutomations(seededState.automations);
    if (seededState.streamMetadata) setStreamMetadata(prev => ({
      ...prev,
      ...seededState.streamMetadata,
      streamerAuth: { ...prev.streamerAuth, ...(seededState.streamMetadata.streamerAuth || {}) },
      botAuth: { ...prev.botAuth, ...(seededState.streamMetadata.botAuth || {}) },
      youtubeApiV3: { ...prev.youtubeApiV3, ...(seededState.streamMetadata.youtubeApiV3 || {}) }
    }));
    if (seededState.tabOrder) setTabOrder(Array.from(new Set([...seededState.tabOrder, 'obs-overlay'])));
    if (seededState.theme) setTheme(seededState.theme);
    if (seededState.shoutoutConfig) setShoutoutConfig(seededState.shoutoutConfig);
    if (seededState.shoutoutHistory) setShoutoutHistory(seededState.shoutoutHistory);
    if (seededState.gameState) setGameState(seededState.gameState);
  }, [currentUserId]);
  const [aiEngineStatus, setAiEngineStatus] = useState<{ status: 'online' | 'degraded' | 'offline', error?: string }>({ status: 'online' });

  // Chat Feed
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init-1',
      sender: 'ChannelOwner',
      senderRole: 'owner',
      content: 'DroidOS v1.2.0 online. Stream chat listener & economy subroutines initialized!',
      timestamp: '15:10:02'
    },
    {
      id: 'msg-init-2',
      sender: 'DroidBot',
      senderRole: 'bot',
      isBot: true,
      content: 'Welcome back, Commander ChannelOwner! All stream economy & chat subroutines standing by.',
      timestamp: '15:10:03',
      matchedRule: 'Owner Greetings: owner_greetings'
    }
  ]);

  // System Logs
  const [logs, setLogs] = useState<SystemLog[]>([
    {
      id: 'l-1',
      timestamp: new Date().toLocaleTimeString(),
      level: 'success',
      module: 'SYSTEM',
      message: 'DroidOS v1.2.0 Workstation booted with Points, Achievements & OBS Engine.'
    },
    {
      id: 'l-2',
      timestamp: new Date().toLocaleTimeString(),
      level: 'info',
      module: 'AUTH',
      message: 'YouTube Streamer Listener synced. Bot fallback active for [DroidBot].'
    },
    {
      id: 'l-3',
      timestamp: new Date().toLocaleTimeString(),
      level: 'bot',
      module: 'AI_ENGINE',
      message: 'Gemini AI intelligence routing enabled for !ai queries.'
    }
  ]);

  // --- Persistence Layer (Safely saves changes to localStorage and Cloud) ---
  useEffect(() => {
    if (!isHydratedRef.current || isCloudSyncing) return;
    const stateToSave = {
      botIdentity,
      roles,
      profiles,
      responseStyles,
      triggers,
      pointsConfig,
      achievements,
      soundEffects,
      redeems,
      obsConfig,
      automations,
      streamMetadata,
      tabOrder,
      theme,
      shoutoutConfig,
      shoutoutHistory,
      gameState
    };

    const storageKey = currentUser?.uid ? `droidos_state_${currentUser.uid}` : 'droidos_state_guest';
    try {
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('[DroidOS Persistence] Failed to save state:', e);
    }

    if (currentUser) {
      saveStateToCloud(stateToSave);
    }
  }, [botIdentity, roles, profiles, responseStyles, triggers, pointsConfig, achievements, soundEffects, redeems, obsConfig, automations, streamMetadata, tabOrder, theme, shoutoutConfig, shoutoutHistory, gameState, currentUser, isCloudSyncing]);


  const greetedUsersRef = useRef<Set<string>>(new Set(['channelowner']));
  const processedChatMsgIdsRef = useRef<Set<string>>(new Set());
  const lastFetchedChatIdRef = useRef<string | null>(null);

  const addLog = useCallback(
    (level: SystemLog['level'], module: SystemLog['module'], message: string) => {
      setLogs((prev) => [
        {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toLocaleTimeString(),
          level,
          module,
          message
        },
        ...prev.slice(0, 100)
      ]);
    },
    []
  );

  const showToast = (text: string) => {
    setSaveNotification(text);
    setTimeout(() => setSaveNotification(null), 3000);
  };

  // --- Background YouTube Stream Poller ---
  useEffect(() => {
    const channelHandle = streamMetadata.streamerAuth.channelId || botIdentity.channelName;
    if (!channelHandle || channelHandle.includes('UC_STREAMER')) return;

    const pollStreamStatus = async () => {
      try {
        const res = await fetch(`/api/youtube/detect/${encodeURIComponent(channelHandle)}`);
        const data = await res.json();
        if (!data.error) {
          setStreamMetadata(prev => ({
            ...prev,
            ...data
          }));
          setIsLive(data.isLive);
          if (data.isLive) {
             addLog('success', 'LISTENER', `Live stream detected: "${data.streamTitle}"`);
          }
        }
      } catch (err) {
        console.warn('[DroidOS Poller] Detection failed:', err);
      }
    };

    // Poll every 60 seconds (faster detection)
    const interval = setInterval(pollStreamStatus, 60000);
    pollStreamStatus(); // Initial check

    return () => clearInterval(interval);
  }, [botIdentity.channelName, streamMetadata.streamerAuth.channelId, addLog]);

  // Uptime Ticker
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  // Periodic Points & Watch Time Ticker (every intervalMinutes)
  useEffect(() => {
    if (!isLive || !pointsConfig.enabled) return;

    const intervalMs = Math.max(1, pointsConfig.intervalMinutes) * 60 * 1000;
    const timer = setInterval(() => {
      setProfiles((prevProfiles) => {
        return prevProfiles.map((p) => {
          let multiplier = 1.0;
          if (p.role === 'subscriber') multiplier = pointsConfig.subBonusMultiplier;
          if (p.role === 'vip') multiplier = pointsConfig.vipBonusMultiplier;
          if (p.role === 'owner' || p.role === 'moderator') multiplier = 1.5;

          const pointsToAdd = Math.round(pointsConfig.pointsPerIntervalMinutes * multiplier);
          const updated = {
            ...p,
            points: p.points + pointsToAdd,
            totalPointsEarned: p.totalPointsEarned + pointsToAdd,
            watchTimeMinutes: p.watchTimeMinutes + pointsConfig.intervalMinutes
          };

          const { updatedProfile, newUnlocked } = checkAchievementProgress(updated, achievements);
          if (newUnlocked.length > 0) {
            newUnlocked.forEach((ach) => {
              addLog('success', 'ACHIEVEMENTS', `Viewer @${p.username} unlocked achievement: "${ach.title}"!`);
            });
          }
          return updatedProfile;
        });
      });
      addLog('info', 'POINTS', `Distributed watch-time ${pointsConfig.currencyName} to active viewers.`);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isLive, pointsConfig, achievements, addLog]);

  // Automations Periodic Broadcast Ticker
  useEffect(() => {
    if (!isLive || !isListening) return;

    const interval = setInterval(() => {
      automations.forEach((auto, idx) => {
        if (!auto.enabled) return;
        // Trigger automated broadcast
        const text = auto.messageTemplate.replace(/\{points_name\}/gi, pointsConfig.currencyName);
        const botMsg: ChatMessage = {
          id: `msg-auto-${Date.now()}-${auto.id}-${idx}-${Math.random().toString(36).substring(2, 9)}`,
          sender: botIdentity.botName,
          senderRole: 'bot',
          isBot: true,
          content: text,
          timestamp: new Date().toLocaleTimeString(),
          matchedRule: `Automation [${auto.name}]`
        };
        setMessages((prev) => [...prev, botMsg]);
        addLog('bot', 'SYSTEM', `Sent timed announcement: "${auto.name}"`);
      });
    }, 45000); // lightweight check interval

    return () => clearInterval(interval);
  }, [isLive, isListening, automations, botIdentity, pointsConfig, addLog]);

  // Audio Queue Processor
  useEffect(() => {
    const processQueue = async () => {
      if (audioQueue.length === 0 || isProcessingQueue) return;
      
      setIsProcessingQueue(true);
      const nextItem = audioQueue[0];
      
      try {
        if (nextItem.type === 'synth') {
          playSynthesizedSound(nextItem.preset || 'coin', nextItem.volume, botIdentity.audioDeviceId);
          // Synth sounds are short, wait 1s
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else if (nextItem.type === 'sound' && nextItem.url) {
          await playCustomAudioUrl(nextItem.url, nextItem.volume, botIdentity.audioDeviceId);
        } else if (nextItem.type === 'gif') {
          // Gifs might be handled by OBS or overlay, for now just a delay
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      } catch (err) {
        console.error('[DroidOS Queue] Error processing item:', err);
      } finally {
        setAudioQueue(prev => prev.slice(1));
        setIsProcessingQueue(false);
      }
    };

    processQueue();
  }, [audioQueue, isProcessingQueue, botIdentity.audioDeviceId]);

  // Heist Conclusion Logic
  useEffect(() => {
    if (gameState.isHeistActive) {
      const timer = setTimeout(() => {
        setGameState(prev => {
          const participants = prev.heistParticipants;
          const config = prev.config;
          
          if (participants.length === 0) {
            return { ...prev, isHeistActive: false };
          }

          const successChance = config.heistSuccessChance / 100;
          const success = Math.random() < successChance;
          
          if (success) {
            const multiplier = config.heistMinMultiplier + (Math.random() * (config.heistMaxMultiplier - config.heistMinMultiplier));
            setProfiles(profiles => profiles.map(profile => {
              const part = participants.find(p => p.username.toLowerCase() === profile.username.toLowerCase());
              if (part) {
                const winAmount = Math.floor(part.bid * multiplier);
                return { ...profile, points: profile.points + winAmount };
              }
              return profile;
            }));

            setMessages(messages => [...messages, {
              id: `msg-game-${Date.now()}`,
              sender: botIdentity.botName,
              senderRole: 'bot',
              content: `💰 THE HEIST WAS A SUCCESS! The crew got away with the vault! Survivors shared the loot and earned ${Math.round(multiplier * 100)}% of their bid! 🚀`,
              timestamp: new Date().toLocaleTimeString(),
              isBot: true
            }]);
          } else {
            setMessages(messages => [...messages, {
              id: `msg-game-${Date.now()}`,
              sender: botIdentity.botName,
              senderRole: 'bot',
              content: `🚔 BUSTED! The heist went wrong and the crew was caught! All points were seized by the authorities. 💀`,
              timestamp: new Date().toLocaleTimeString(),
              isBot: true
            }]);
          }

          return { ...prev, isHeistActive: false, heistParticipants: [] };
        });
      }, 120000); // 2 minutes

      return () => clearTimeout(timer);
    }
  }, [gameState.isHeistActive, botIdentity.botName]);

  // Handle Manual/Automated Store Redeem
  const handleRedeemItem = useCallback(
    async (redeem: RedeemItem, username: string) => {
      setProfiles((prev) => {
        return prev.map((p) => {
          if (p.username.toLowerCase() === username.toLowerCase()) {
            if (p.points < redeem.cost) return p;
            const newBal = p.points - redeem.cost;
            const newItem = {
              id: `item-${Date.now()}-${redeem.id}-${Math.random().toString(36).substring(2, 8)}`,
              name: redeem.title,
              type: (redeem.type as any) || 'perk',
              description: redeem.description,
              acquiredAt: new Date().toISOString().split('T')[0]
            };
            return {
              ...p,
              points: newBal,
              inventory: [...p.inventory, newItem]
            };
          }
          return p;
        });
      });

      // Add to Audio Queue instead of playing immediately
      if (redeem.type === 'sound' && redeem.linkedSoundId) {
        const foundSound = soundEffects.find((s) => s.id === redeem.linkedSoundId);
        if (foundSound) {
          const queueItem: AudioQueueItem = {
            id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: foundSound.type === 'synth' ? 'synth' : 'sound',
            title: redeem.title,
            url: foundSound.customAudioUrl,
            preset: foundSound.synthPreset,
            volume: foundSound.volume,
            username
          };
          setAudioQueue(prev => [...prev, queueItem]);
          addLog('info', 'SYSTEM', `Redeem "${redeem.title}" added to audio queue (#${audioQueue.length + 1})`);
        }
      } else {
        // Just a coin sound for perks etc
        setAudioQueue(prev => [...prev, {
          id: `q-coin-${Date.now()}`,
          type: 'synth',
          title: 'Redeem Confirmation',
          preset: 'coin',
          volume: 0.6,
          username
        }]);
      }

      setRedeems((prev) =>
        prev.map((r) => (r.id === redeem.id ? { ...r, timesRedeemed: r.timesRedeemed + 1 } : r))
      );

      // Trigger Multi-Channel OBS Overlay Alert (BroadcastChannel + LocalStorage + Server Queue)
      const linkedSound = redeem.linkedSoundId ? soundEffects.find(s => s.id === redeem.linkedSoundId) : undefined;
      dispatchOverlayAlert({
        id: `redeem-${Date.now()}-${redeem.id}`,
        type: 'redeem',
        title: `🎉 @${username} redeemed "${redeem.title}"!`,
        subtitle: 'CHANNEL REDEMPTION',
        username,
        customMessage: redeem.description,
        gifUrl: redeem.gifUrl,
        audioUrl: linkedSound?.customAudioUrl,
        synthPreset: linkedSound?.synthPreset || 'coin',
        pointsCost: redeem.cost,
        durationMs: 5500
      });

      // Also persist to Firebase if connected
      if (redeem.gifUrl) {
        try {
          const { initFirebase } = await import('./lib/firebase');
          const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
          const firebase = await initFirebase();
          if (firebase?.db) {
            await addDoc(collection(firebase.db, 'alerts'), {
              gifUrl: redeem.gifUrl,
              audioUrl: linkedSound?.customAudioUrl,
              timestamp: serverTimestamp(),
              durationMs: 5500
            });
          }
        } catch (e) {
          // Non-blocking
        }
      }

      const botMsg: ChatMessage = {
        id: `msg-redeem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: botIdentity.botName,
        senderRole: 'bot',
        isBot: true,
        content: `🎉 @${username} redeemed "${redeem.title}" for ${redeem.cost} ${pointsConfig.currencyName}!`,
        timestamp: new Date().toLocaleTimeString(),
        matchedRule: `Store Redeem [${redeem.title}]`
      };
      setMessages((prev) => [...prev, botMsg]);
      addLog('success', 'REDEEMS', `Viewer @${username} redeemed "${redeem.title}" for ${redeem.cost} ${pointsConfig.currencyName}`);
      showToast(`Redeemed "${redeem.title}"! Added to queue.`);
    },
    [soundEffects, botIdentity, pointsConfig, addLog, audioQueue.length]
  );

  // Trigger Shoutout Logic (Manual or Auto)
  const handleTriggerShoutout = useCallback(
    (profileOrUsername: ViewerProfile | string, customMsg?: string, triggerSource: 'first_message' | 'command' | 'manual' = 'manual') => {
      if (!shoutoutConfig.enabled) return;

      let profile: ViewerProfile | undefined;
      let username: string;

      if (typeof profileOrUsername === 'string') {
        const safeString = profileOrUsername || 'Anonymous';
        username = safeString.replace('@', '').trim();
        profile = profiles.find(p => p.username.toLowerCase() === username.toLowerCase());
      } else {
        profile = profileOrUsername;
        username = profile.username;
      }

      // Check roles eligibility if auto
      if (triggerSource !== 'manual' && profile) {
        if (!shoutoutConfig.rolesEligible.includes(profile.role)) return;
      }

      const displayName = profile?.displayName || username;
      const avatarUrl = profile?.avatarUrl || '';
      const channelUrl = profile?.channelUrl || `https://youtube.com/@${username}`;
      const role = profile?.role || 'viewer';

      // 1. Construct Chat Message
      let message = customMsg || profile?.customShoutoutMessage || shoutoutConfig.chatMessageTemplate;
      message = message
        .replace(/\{username\}/gi, username)
        .replace(/\{display_name\}/gi, displayName)
        .replace(/\{channel_url\}/gi, channelUrl)
        .replace(/\{role\}/gi, role);

      // 2. Dispatch Bot Message
      const botMsg: ChatMessage = {
        id: `msg-shoutout-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: botIdentity.botName,
        senderRole: 'bot',
        isBot: true,
        content: message,
        timestamp: new Date().toLocaleTimeString(),
        matchedRule: `Shoutout [${triggerSource}]`
      };
      setMessages(prev => [...prev, botMsg]);

      // 3. Play Sound Effect
      if (shoutoutConfig.soundEffectPreset) {
        playSynthesizedSound(shoutoutConfig.soundEffectPreset, shoutoutConfig.soundVolume);
      }

      // 4. Trigger OBS Overlay
      if (shoutoutConfig.obsOverlayEnabled) {
        setActiveShoutout({
          id: `so-${Date.now()}`,
          username,
          displayName,
          avatarUrl,
          avatarColor: profile?.avatarColor || 'from-blue-600 to-indigo-600',
          channelUrl,
          role: role.toUpperCase(),
          customMessage: customMsg || profile?.customShoutoutMessage || '',
          subheading: shoutoutConfig.overlaySubheadingTemplate.replace(/\{username\}/gi, username),
          theme: shoutoutConfig.overlayTheme,
          position: shoutoutConfig.overlayPosition,
          heading: shoutoutConfig.overlayHeading,
          durationMs: shoutoutConfig.overlayDurationSeconds * 1000
        });

        dispatchOverlayAlert({
          id: `so-${Date.now()}`,
          type: 'shoutout',
          title: `🌟 SHOUTOUT: ${displayName}`,
          subtitle: `${role.toUpperCase()} • @${username}`,
          username,
          customMessage: message,
          avatarUrl,
          synthPreset: shoutoutConfig.soundEffectPreset || 'fanfare',
          durationMs: shoutoutConfig.overlayDurationSeconds * 1000
        });
      }

      // 5. Update History
      const historyItem: ShoutoutHistoryItem = {
        id: `so-hist-${Date.now()}`,
        username,
        displayName,
        role,
        avatarUrl,
        timestamp: 'Just now',
        chatMessage: message,
        triggeredBy: triggerSource
      };
      setShoutoutHistory(prev => [historyItem, ...prev.slice(0, 19)]);
      addLog('bot', 'SYSTEM', `Shoutout triggered for @${username} via ${triggerSource}`);
    },
    [shoutoutConfig, profiles, botIdentity, addLog]
  );

  // Centralized Bot Reply Dispatcher (Local chat feed + Live YouTube chat broadcasting)
  const dispatchBotReply = useCallback(
    (replyText: string, matchedRule?: string, isAi?: boolean) => {
      const botMsgId = `msg-bot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      processedChatMsgIdsRef.current.add(botMsgId);

      const botMsg: ChatMessage = {
        id: botMsgId,
        sender: botIdentity.botName,
        senderRole: 'bot',
        isBot: true,
        isAiResponse: !!isAi,
        content: replyText,
        timestamp: new Date().toLocaleTimeString(),
        matchedRule
      };
      setMessages((prev) => [...prev, botMsg]);
      addLog('bot', isAi ? 'AI_ENGINE' : 'ROLES', `Dispatched reply [${matchedRule || 'bot'}]: "${replyText}"`);

      // Relay reply to YouTube Live Chat
      const token = getAccessToken();
      fetch('/api/youtube/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          uid: currentUser?.uid || 'guest',
          message: replyText,
          sender: botIdentity.botName,
          senderRole: 'bot',
          liveChatId: streamMetadata.activeLiveChatId,
          videoId: streamMetadata.videoId,
          accessToken: token
        })
      })
        .then(async (res) => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            addLog('warn', 'YouTube API', `Broadcast failed: ${errData.error || 'HTTP ' + res.status}`);
            return;
          }
          const data = await res.json().catch(() => ({}));
          if (data?.success && !data?.localOnly) {
            addLog('info', 'YouTube API', `✓ Posted to YouTube Live Chat (ID: ${data.item?.id || 'OK'})`);
          } else if (data?.error) {
            addLog('warn', 'YouTube API', `YouTube Outbound notice: ${data.error}`);
          }
        })
        .catch((e) => {
          addLog('warn', 'YouTube API', `Broadcast network error: ${e.message}`);
        });
    },
    [botIdentity.botName, streamMetadata.activeLiveChatId, streamMetadata.videoId, addLog]
  );

  // Incoming Message Handler
  const handleIncomingMessage = useCallback(
    async (sender: string, content: string, explicitRole?: string, customId?: string) => {
      const now = new Date().toLocaleTimeString();
      const safeSender = typeof sender === 'string' ? sender : 'Anonymous';
      const cleanSender = safeSender.startsWith('@') ? safeSender.substring(1) : safeSender;
      const senderKey = cleanSender.trim().toLowerCase();
      const messageId = customId || `msg-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      processedChatMsgIdsRef.current.add(messageId);

      // Detect if chatter is the streamer / channel owner
      const isStreamer =
        explicitRole === 'owner' ||
        senderKey === botIdentity.streamerName.replace('@', '').trim().toLowerCase() ||
        senderKey === botIdentity.channelName.replace('@', '').trim().toLowerCase() ||
        senderKey === (streamMetadata.streamerAuth?.accountName || '').replace('@', '').trim().toLowerCase() ||
        senderKey === (currentUser?.displayName || '').replace('@', '').trim().toLowerCase();

      let role = isStreamer ? 'owner' : (explicitRole || 'viewer');
      const foundProfile = profiles.find((p) => p.username.replace('@', '').toLowerCase() === senderKey);
      if (foundProfile) {
        role = isStreamer ? 'owner' : (explicitRole || foundProfile.role);
      }

      const userMsg: ChatMessage = {
        id: messageId,
        sender: cleanSender.trim(),
        senderRole: role,
        content: content.trim(),
        timestamp: now
      };

      setMessages((prev) => {
        if (prev.some((m) => m.id === messageId)) return prev;
        return [...prev, userMsg];
      });

      // Award points per chat message & update viewer stats
      setProfiles((prev) => {
        const pointsEarned = pointsConfig.enabled ? pointsConfig.pointsPerMessage : 0;
        const exists = prev.find((p) => p.username.toLowerCase() === senderKey);
        if (exists) {
          return prev.map((p) => {
            if (p.username.toLowerCase() === senderKey) {
              const updated = {
                ...p,
                messageCount: p.messageCount + 1,
                points: p.points + pointsEarned,
                totalPointsEarned: p.totalPointsEarned + pointsEarned,
                lastSeen: 'Just now',
                role
              };
              const { updatedProfile, newUnlocked } = checkAchievementProgress(updated, achievements);
              if (newUnlocked.length > 0) {
                newUnlocked.forEach((ach) => {
                  addLog('success', 'ACHIEVEMENTS', `Viewer @${p.username} unlocked achievement: "${ach.title}"!`);
                });
              }
              return updatedProfile;
            }
            return p;
          });
        } else {
          const starterPoints = pointsConfig.enabled ? Math.max(pointsEarned, 25) : 25;
          const newViewer: ViewerProfile = {
            id: `prof-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
            username: safeSender.trim(),
            displayName: safeSender.trim(),
            role,
            moderationLevel: isStreamer ? 4 : 0,
            points: starterPoints,
            totalPointsEarned: starterPoints,
            watchTimeMinutes: 1,
            customFacts: isStreamer ? ['Streamer & Broadcaster of this channel'] : ['New community chatter in live stream'],
            notes: isStreamer ? 'Verified Broadcaster Account.' : 'Auto-registered profile with active inventory system.',
            firstSeen: new Date().toISOString().split('T')[0],
            lastSeen: 'Just now',
            messageCount: 1,
            visitStreak: 1,
            memoryItems: [
              {
                id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
                timestamp: new Date().toISOString().split('T')[0],
                fact: isStreamer ? 'Started streaming on channel.' : 'Joined live stream and initialized personal inventory.',
                addedBy: 'auto'
              }
            ],
            inventory: [
              {
                id: `inv-${Date.now()}-starter-${Math.random().toString(36).substring(2, 8)}`,
                name: isStreamer ? '👑 Broadcaster Crown' : '🌱 Welcome Explorer Badge',
                type: 'badge',
                description: isStreamer ? 'Awarded to the live stream creator' : 'Awarded automatically upon entering chat for the first time',
                icon: isStreamer ? '👑' : '🌱',
                acquiredAt: new Date().toISOString().split('T')[0]
              }
            ],
            achievements: [
              {
                achievementId: 'ach-first-chat',
                unlockedAt: new Date().toISOString().split('T')[0],
                progress: 1
              }
            ],
            avatarColor: isStreamer ? 'from-amber-500 to-rose-600' : 'from-blue-600 to-indigo-600'
          };
          addLog('success', 'SYSTEM', `Created new viewer profile & inventory for @${safeSender.trim()} (${role})`);
          return [...prev, newViewer];
        }
      });

      addLog('info', 'LISTENER', `Received message from [${safeSender.trim()}] (${role}): "${content}"`);

      // Check Bot Dispatch
      if (isListening && botIdentity.status === 'active') {
        const hasGreeted = greetedUsersRef.current.has(senderKey);
        const result = processIncomingMessage(
          { sender: safeSender.trim(), content, role },
          {
            botIdentity,
            roles,
            profiles,
            triggers,
            pointsConfig,
            achievements,
            redeems,
            responseStyles,
            uptimeSeconds,
            hasGreetedUser: hasGreeted
          }
        );

        if (result.shouldRespond) {
          // Check for auto-shoutout on first message
          if (!hasGreeted && shoutoutConfig.enabled && shoutoutConfig.autoShoutoutOnFirstMessage) {
            const userProfile = profiles.find((p) => p.username.toLowerCase() === senderKey);
            if (userProfile && userProfile.autoShoutout !== false) {
              handleTriggerShoutout(userProfile, undefined, 'first_message');
            }
          }

          greetedUsersRef.current.add(senderKey);

          // Handle Game Commands (!gamble, !heist, etc)
          if (result.gameCommand) {
            const { type, amount, target } = result.gameCommand;
            const profile = profiles.find(p => p.username.toLowerCase() === safeSender.toLowerCase());
            const userPoints = profile?.points || 0;

            if (type === 'coinpush') {
              if (!amount || userPoints < amount) {
                dispatchBotReply(`⚠️ @${safeSender}, you don't have enough ${pointsConfig.currencyName} to drop into the pusher!`, 'Game Error');
                return;
              }

              const tipChance = gameState.config.coinPushTipChance / 100;
              const willTip = Math.random() < tipChance;
              
              setProfiles(prev => prev.map(p => p.username.toLowerCase() === safeSender.toLowerCase() ? { ...p, points: p.points - amount } : p));
              
              if (willTip) {
                const totalWin = gameState.pusherPool + amount;
                setProfiles(prev => prev.map(p => p.username.toLowerCase() === safeSender.toLowerCase() ? { ...p, points: p.points + totalWin } : p));
                setGameState(prev => ({ ...prev, pusherPool: 0 }));
                dispatchBotReply(`🎰 CLINK! @${safeSender} dropped ${amount} into the pusher and IT TIPPED! 🏆 They won the entire pool of ${totalWin} ${pointsConfig.currencyName}!`, 'Game [CoinPusher]');
              } else {
                setGameState(prev => ({ ...prev, pusherPool: prev.pusherPool + amount }));
                dispatchBotReply(`🪙 @${safeSender} dropped ${amount} into the pusher... it creaks, but doesn't tip yet! Pool is now: ${gameState.pusherPool + amount}`, 'Game [CoinPusher]');
              }
              return;
            }

            if (type === 'gamble') {
              if (!amount || userPoints < amount) {
                dispatchBotReply(`⚠️ @${safeSender}, you don't have enough ${pointsConfig.currencyName} to gamble that much!`, 'Game Error');
                return;
              }

              const winChance = gameState.config.gambleWinChance / 100;
              const win = Math.random() < winChance;
              const winAmount = amount; 
              const newBal = win ? userPoints + winAmount : userPoints - amount;

              setProfiles(prev => prev.map(p => p.username.toLowerCase() === safeSender.toLowerCase() ? { ...p, points: newBal } : p));
              
              const text = win 
                ? `🎰 @${safeSender} rolled a 100! YOU WIN ${winAmount} ${pointsConfig.currencyName}! New balance: ${newBal}`
                : `🎰 @${safeSender} rolled a 1... You lost ${amount} ${pointsConfig.currencyName}. Better luck next time!`;
              dispatchBotReply(text, 'Game [Gamble]');
              addLog('info', 'SYSTEM', `User @${safeSender} gambled ${amount} and ${win ? 'WON' : 'LOST'}`);
              return;
            }

            if (type === 'heist') {
              if (!gameState.isHeistActive) {
                dispatchBotReply(`⚠️ @${safeSender}, there is no heist currently active. Wait for the streamer to start one!`, 'Game Error');
                return;
              }

              if (!amount || userPoints < amount) {
                dispatchBotReply(`⚠️ @${safeSender}, you can't join the heist without enough ${pointsConfig.currencyName}!`, 'Game Error');
                return;
              }

              const alreadyIn = gameState.heistParticipants.some(p => p.username.toLowerCase() === safeSender.toLowerCase());
              if (alreadyIn) return;

              setGameState(prev => ({
                ...prev,
                heistParticipants: [...prev.heistParticipants, { username: safeSender, bid: amount }]
              }));
              
              setProfiles(prev => prev.map(p => p.username.toLowerCase() === safeSender.toLowerCase() ? { ...p, points: p.points - amount } : p));

              dispatchBotReply(`💰 @${safeSender} joined the heist crew with ${amount} ${pointsConfig.currencyName}! Current crew: ${gameState.heistParticipants.length + 1}`, 'Game [Heist]');
              return;
            }

            if (type === 'attack') {
              if (!gameState.isBossActive) return;

              const dmg = Math.floor(Math.random() * 50) + 10;
              const newHP = Math.max(0, gameState.bossHealth - dmg);
              
              setGameState(prev => ({ ...prev, bossHealth: newHP }));

              if (newHP <= 0) {
                setGameState(prev => ({ ...prev, isBossActive: false }));
                dispatchBotReply(`🏆 BOOM! @${safeSender} landed the killing blow on [${gameState.bossName}]! The community is safe once more! Rewards granted.`, 'Game [Boss]');
                const reward = gameState.config.bossKillReward;
                setProfiles(prev => prev.map(p => p.username.toLowerCase() === safeSender.toLowerCase() ? { ...p, points: p.points + reward } : p));
                dispatchOverlayAlert({
                  id: `boss-kill-${Date.now()}`,
                  type: 'game',
                  title: '🏆 BOSS DEFEATED!',
                  subtitle: `${gameState.bossName} slain by @${safeSender}`,
                  username: safeSender,
                  customMessage: `Earned +${reward} ${pointsConfig.currencyName}!`,
                  synthPreset: 'victory',
                  durationMs: 6000
                });
              } else {
                if (Math.random() > 0.8) {
                  dispatchBotReply(`⚔️ @${safeSender} dealt ${dmg} DMG to ${gameState.bossName}! (${newHP} HP left)`, 'Game [Boss]');
                }
              }
              return;
            }

            if (type === 'duel') {
              if (!target || !amount || userPoints < amount) return;
              
              setActiveDuel({ challenger: safeSender, target, amount });
              dispatchBotReply(`⚔️ @${safeSender} has challenged @${target} to a DUEL for ${amount} ${pointsConfig.currencyName}! Type "!accept" to fight!`, 'Game [Duel]');
              return;
            }

            if (type === 'accept_duel') {
              if (!activeDuel || activeDuel.target.toLowerCase() !== safeSender.toLowerCase()) return;
              
              const challengerProfile = profiles.find(p => p.username.toLowerCase() === activeDuel.challenger.toLowerCase());
              if (!challengerProfile || challengerProfile.points < activeDuel.amount || userPoints < activeDuel.amount) {
                dispatchBotReply(`⚠️ Duel cancelled: Someone ran out of ${pointsConfig.currencyName}!`, 'Game [Duel]');
                setActiveDuel(null);
                return;
              }

              const winner = Math.random() > 0.5 ? activeDuel.challenger : activeDuel.target;
              const loser = winner === activeDuel.challenger ? activeDuel.target : activeDuel.challenger;
              
              const houseCut = gameState.config.duelHouseCut / 100;
              const prize = Math.floor(activeDuel.amount * (1 - houseCut));

              setProfiles(prev => prev.map(p => {
                if (p.username.toLowerCase() === winner.toLowerCase()) return { ...p, points: p.points + prize };
                if (p.username.toLowerCase() === loser.toLowerCase()) return { ...p, points: p.points - activeDuel.amount };
                return p;
              }));

              dispatchBotReply(`⚔️ THE DUEL IS OVER! @${winner} defeated @${loser} and won ${prize} ${pointsConfig.currencyName}! ${houseCut > 0 ? `(House took ${activeDuel.amount - prize} cut)` : ''}`, 'Game [Duel]');
              setActiveDuel(null);
              return;
            }
          }

          // Handle AI Query (!ai how are you)
          if (result.isAiQuery && result.aiPrompt) {
            addLog('bot', 'AI_ENGINE', `Routing AI prompt for @${safeSender} [${result.responseType || 'default'}]: "${result.aiPrompt}"`);
            const aiResponse = await queryAiEngine(
              result.aiPrompt,
              safeSender,
              botIdentity,
              result.responseType,
              result.memoryFacts
            );

            setAiEngineStatus({ status: aiResponse.status, error: aiResponse.error });

            setTimeout(() => {
              dispatchBotReply(aiResponse.reply, result.matchedRule || `AI Command [${botIdentity.aiCommandPrefix}]`, true);
            }, botIdentity.typingDelayMs || 400);
            return;
          }

          // Handle Redeem Trigger
          if (result.redeemedItem) {
            handleRedeemItem(result.redeemedItem, safeSender);
            return;
          }

          // Handle Trigger SFX or Usage
          if (result.matchedRule?.includes('Command Trigger')) {
            const matchedTriggerName = result.matchedRule.split('[')[1]?.replace(']', '');
            if (matchedTriggerName) {
              setTriggers((prev) =>
                prev.map((t) =>
                  t.trigger.toLowerCase() === matchedTriggerName.toLowerCase()
                    ? { ...t, usageCount: t.usageCount + 1 }
                    : t
                )
              );

              // Check if matched sound effect command
              const foundSfx = soundEffects.find(
                (s) => s.triggerCommand && s.triggerCommand.toLowerCase() === matchedTriggerName.toLowerCase()
              );
              if (foundSfx && foundSfx.enabled) {
                if (foundSfx.type === 'synth') {
                  playSynthesizedSound(foundSfx.synthPreset, foundSfx.volume);
                } else if (foundSfx.customAudioUrl) {
                  playCustomAudioUrl(foundSfx.customAudioUrl, foundSfx.volume);
                }
                dispatchOverlayAlert({
                  id: `sfx-${Date.now()}`,
                  type: 'sound',
                  title: `🔊 SFX: ${foundSfx.name}`,
                  subtitle: `TRIGGERED BY @${safeSender}`,
                  username: safeSender,
                  synthPreset: foundSfx.synthPreset,
                  audioUrl: foundSfx.customAudioUrl,
                  volume: foundSfx.volume,
                  durationMs: 4000
                });
              }
            }
          }

          // Standard Bot Reply
          if (result.replyText) {
            setTimeout(() => {
              dispatchBotReply(result.replyText!, result.matchedRule);
            }, botIdentity.typingDelayMs || 400);
          }
        }
      }
    },
    [profiles, isListening, botIdentity, roles, triggers, pointsConfig, achievements, redeems, soundEffects, uptimeSeconds, handleRedeemItem, addLog, shoutoutConfig, handleTriggerShoutout, dispatchBotReply, gameState, activeDuel, currentUser, streamMetadata]
  );


  const handleIncomingMessageRef = useRef(handleIncomingMessage);
  useEffect(() => {
    handleIncomingMessageRef.current = handleIncomingMessage;
  });

  // --- Real-time Chat Sync Poller ---
  useEffect(() => {
    if (!isLive || !isListening) return;

    const pollInterval = 2500; // 2.5 seconds snappy update

    const syncChat = async () => {
      try {
        const token = getAccessToken();
        const queryParams = new URLSearchParams();
        if (lastFetchedChatIdRef.current) queryParams.set('lastId', lastFetchedChatIdRef.current);
        if (token) queryParams.set('token', token);
        if (streamMetadata.videoId) queryParams.set('videoId', streamMetadata.videoId);
        queryParams.set('uid', currentUser?.uid || 'guest');

        const url = `/api/youtube/chat${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const newMsgs = await res.json();

        if (Array.isArray(newMsgs) && newMsgs.length > 0) {
          lastFetchedChatIdRef.current = newMsgs[newMsgs.length - 1].id;
          
          // Inject into local processing engine
          newMsgs.forEach((msg: any) => {
            if (!msg || !msg.id) return;
            if (processedChatMsgIdsRef.current.has(msg.id)) return;
            processedChatMsgIdsRef.current.add(msg.id);

            if (msg.isBot) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === msg.id)) return prev;
                return [
                  ...prev,
                  {
                    id: msg.id,
                    sender: msg.sender || botIdentity.botName,
                    senderRole: msg.senderRole || 'bot',
                    isBot: true,
                    content: msg.content,
                    timestamp: msg.timestamp || new Date().toLocaleTimeString()
                  }
                ];
              });
              return;
            }

            // Normal chatter -> process triggers, roles, points, ai responses
            handleIncomingMessageRef.current(msg.sender, msg.content, msg.senderRole, msg.id);
          });
        }
      } catch (err) {
        console.warn('[DroidOS Chat Sync] Polling failed:', err);
      }
    };

    const interval = setInterval(syncChat, pollInterval);
    syncChat();

    return () => clearInterval(interval);
  }, [isLive, isListening, botIdentity.botName, streamMetadata.videoId]);

  const handleSendBotMessage = (content: string) => {
    dispatchBotReply(content, 'Manual Broadcaster Dispatch');
  };


  // Simulated traffic generator (Lightweight interval)
  useEffect(() => {
    if (!isListening || !isLive || !simulatedTraffic) return;

    const sampleChatters = [
      { name: 'StarVIP', role: 'vip', text: '!ai how is the stream going today?' },
      { name: 'LoyalSub', role: 'subscriber', text: '!points' },
      { name: 'LeadMod', role: 'moderator', text: '!rules' },
      { name: 'SampleViewer', role: 'viewer', text: '!hi' },
      { name: 'GamerAlex', role: 'viewer', text: '!howareyou' },
      { name: 'TechViewer', role: 'viewer', text: '!sfx airhorn' },
      { name: 'StreamFan', role: 'viewer', text: '!mood' },
      { name: 'CoinMaster', role: 'subscriber', text: '!redeem levelup' }
    ];

    const interval = setInterval(() => {
      const sample = sampleChatters[Math.floor(Math.random() * sampleChatters.length)];
      handleIncomingMessage(sample.name, sample.text, sample.role);
    }, 12000);

    return () => clearInterval(interval);
  }, [isListening, isLive, simulatedTraffic, handleIncomingMessage]);

  // Export JSON Backup Logic
  const getAppBackupData = useCallback(() => {
    return {
      version: releaseInfo.currentVersion,
      exportedAt: new Date().toISOString(),
      botIdentity,
      roles,
      profiles,
      responseStyles,
      triggers,
      pointsConfig,
      achievements,
      soundEffects,
      redeems,
      obsConfig,
      automations,
      streamMetadata,
      shoutoutConfig
    };
  }, [releaseInfo, botIdentity, roles, profiles, responseStyles, triggers, pointsConfig, achievements, soundEffects, redeems, obsConfig, automations, streamMetadata, shoutoutConfig]);

  const handleExportBackup = () => {
    const backup = getAppBackupData();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `droidos_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    addLog('success', 'SYSTEM', 'Local JSON backup exported successfully.');
    showToast('Configuration backup JSON exported!');
  };

  // Import JSON Backup
  const handleImportBackup = (data: any) => {
    try {
      if (data.botIdentity) setBotIdentity(data.botIdentity);
      if (data.roles) setRoles(data.roles);
      if (data.profiles) setProfiles(data.profiles);
      if (data.responseStyles) setResponseStyles(data.responseStyles);
      if (data.triggers) setTriggers(data.triggers);
      if (data.pointsConfig) setPointsConfig(data.pointsConfig);
      if (data.achievements) setAchievements(data.achievements);
      if (data.soundEffects) setSoundEffects(data.soundEffects);
      if (data.redeems) setRedeems(data.redeems);
      if (data.obsConfig) setObsConfig(data.obsConfig);
      if (data.automations) setAutomations(data.automations);
      if (data.shoutoutConfig) setShoutoutConfig(data.shoutoutConfig);
      showToast('Backup restored successfully!');
      addLog('success', 'SYSTEM', 'System state restored from backup.');
    } catch (e) {
      alert('Invalid backup data.');
    }
  };

  // Factory Reset
  const handleResetAllData = () => {
    setBotIdentity(INITIAL_BOT_IDENTITY);
    setRoles(INITIAL_ROLES);
    setProfiles(INITIAL_PROFILES);
    setResponseStyles(INITIAL_RESPONSE_STYLES);
    setTriggers(INITIAL_TRIGGERS);
    setPointsConfig(INITIAL_POINTS_CONFIG);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setSoundEffects(INITIAL_SOUND_EFFECTS);
    setRedeems(INITIAL_REDEEMS);
    setObsConfig(INITIAL_OBS_CONFIG);
    setAutomations(INITIAL_AUTOMATIONS);
    setStreamMetadata(INITIAL_STREAM_METADATA);
    setShoutoutConfig(INITIAL_SHOUTOUT_CONFIG);
    setShoutoutHistory(INITIAL_SHOUTOUT_HISTORY);
    setActiveShoutout(null);
    setMessages([]);
    setAiEngineStatus({ status: 'online' });
    greetedUsersRef.current.clear();
    addLog('success', 'SYSTEM', 'Factory reset completed: clean package restored.');
    showToast('Clean package restored successfully!');
  };

  // Theme Class Resolver
  const getThemeWrapperClass = () => {
    switch (theme) {
      case 'light':
        return 'bg-slate-100 text-slate-900';
      case 'cyberpunk':
        return 'bg-zinc-950 text-pink-50 selection:bg-pink-600 selection:text-white';
      case 'emerald':
        return 'bg-[#03140c] text-emerald-50 selection:bg-emerald-600 selection:text-white';
      case 'purple':
        return 'bg-[#0f0728] text-purple-50 selection:bg-purple-600 selection:text-white';
      case 'sunset':
        return 'bg-[#180a06] text-amber-50 selection:bg-amber-600 selection:text-white';
      case 'dark':
      default:
        return 'bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white';
    }
  };

  // Check for Overlay Mode (used for OBS browser sources)
  const isOverlayMode =
    typeof window !== 'undefined' &&
    (window.location.pathname.toLowerCase().startsWith('/overlay') ||
      window.location.hash.toLowerCase().includes('overlay') ||
      new URLSearchParams(window.location.search).get('mode') === 'overlay');

  if (isOverlayMode) {
    return <Overlay />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${getThemeWrapperClass()}`}>
      {/* Toast */}
      {saveNotification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xl border border-emerald-400/40 flex items-center gap-2 animate-bounce">
          <span>✓</span>
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabOrder={tabOrder}
        botIdentity={botIdentity}
        setBotIdentity={setBotIdentity}
        streamMetadata={streamMetadata}
        isListening={isListening}
        setIsListening={setIsListening}
        isLive={isLive}
        setIsLive={setIsLive}
        uptimeSeconds={uptimeSeconds}
        releaseInfo={releaseInfo}
        theme={theme}
        openConfig={() => setShowConfig(true)}
        openCleanSetup={() => setShowCleanSetup(true)}
        openSupport={() => setShowSupport(true)}
      />

      {/* Main Tab Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {!isFirebaseConfigured && (
          <FirebaseSetup onComplete={() => setIsFirebaseConfigured(true)} />
        )}
        
        {isFirebaseConfigured && (
          <>
            {activeTab === 'dashboard' && (
              <DashboardTab
                botIdentity={botIdentity}
                streamMetadata={streamMetadata}
                pointsConfig={pointsConfig}
                messages={messages}
                profiles={profiles}
                obsConfig={obsConfig}
                uptimeSeconds={uptimeSeconds}
                audioQueue={audioQueue}
                isProcessingQueue={isProcessingQueue}
                aiEngineStatus={aiEngineStatus}
                onClearQueue={() => setAudioQueue([])}
                onRemoveQueueItem={(id) => setAudioQueue(prev => prev.filter(item => item.id !== id))}
                onNavigateTab={setActiveTab}
                onTriggerQuickChat={(txt) => handleIncomingMessage({ sender: 'Streamer', content: txt, role: 'owner' })}
              />
            )}

            {activeTab === 'liveviewer' && (
              <LiveViewerTab
                messages={messages}
                onSendMessage={handleIncomingMessage}
                onSendBotMessage={handleSendBotMessage}
                onClearMessages={() => setMessages([])}
                isListening={isListening}
                setIsListening={setIsListening}
                isLive={isLive}
                botIdentity={botIdentity}
                roles={roles}
                profiles={profiles}
                simulatedTraffic={simulatedTraffic}
                setSimulatedTraffic={setSimulatedTraffic}
                streamMetadata={streamMetadata}
                setStreamMetadata={setStreamMetadata}
              />
            )}

            {activeTab === 'points' && (
              <PointsTab
                pointsConfig={pointsConfig}
                setPointsConfig={setPointsConfig}
                profiles={profiles}
                setProfiles={setProfiles}
                onSaveNotice={() => showToast('Points economy configuration saved.')}
              />
            )}

            {activeTab === 'soundeffects' && (
              <SoundEffectsTab
                soundEffects={soundEffects}
                setSoundEffects={setSoundEffects}
                onSaveNotice={() => showToast('Sound effects updated.')}
              />
            )}

            {activeTab === 'achievements' && (
              <AchievementsTab
                achievements={achievements}
                setAchievements={setAchievements}
                profiles={profiles}
                onSaveNotice={() => showToast('Achievements updated.')}
              />
            )}

            {activeTab === 'games' && (
              <GamesTab
                gameState={gameState}
                setGameState={setGameState}
                profiles={profiles}
                pointsConfig={pointsConfig}
                onTriggerBotMessage={(txt) => handleIncomingMessage(botIdentity.botName, txt, 'bot')}
                onSaveNotice={() => showToast('Game configurations updated.')}
              />
            )}

            {activeTab === 'obs' && (
              <ObsControlTab
                obsConfig={obsConfig}
                setObsConfig={setObsConfig}
                onSaveNotice={() => showToast('OBS Studio configurations saved.')}
                onSendLog={(lvl, mod, msg) => addLog(lvl, mod, msg)}
              />
            )}

            {activeTab === 'obs-overlay' && (
              <ObsOverlayTab />
            )}

            {activeTab === 'redeems' && (
              <RedeemsTab
                redeems={redeems}
                setRedeems={setRedeems}
                soundEffects={soundEffects}
                pointsConfig={pointsConfig}
                profiles={profiles}
                audioQueue={audioQueue}
                isProcessingQueue={isProcessingQueue}
                onClearQueue={() => setAudioQueue([])}
                onRemoveQueueItem={(id) => setAudioQueue(prev => prev.filter(item => item.id !== id))}
                onSaveNotice={() => showToast('Redeems store updated.')}
                onSimulateRedeem={handleRedeemItem}
              />
            )}

            {activeTab === 'general' && (
              <GeneralCommandsTab
                triggers={triggers}
                setTriggers={setTriggers}
                onSaveNotice={() => showToast('General commands updated.')}
              />
            )}

            {activeTab === 'custom' && (
              <CustomCommandsTab
                triggers={triggers}
                setTriggers={setTriggers}
                roles={roles}
                onSaveNotice={() => showToast('Custom commands updated.')}
              />
            )}

            {activeTab === 'identity' && (
              <BotIdentityTab
                botIdentity={botIdentity}
                setBotIdentity={setBotIdentity}
                onSaveNotice={() => showToast('Bot Identity settings saved successfully!')}
              />
            )}

            {activeTab === 'authenticator' && (
              <AuthenticatorTab
                streamMetadata={streamMetadata}
                setStreamMetadata={setStreamMetadata}
                setProfiles={setProfiles}
                botIdentity={botIdentity}
                onSaveNotice={() => showToast('Authenticator tokens synchronized.')}
              />
            )}

            {activeTab === 'memory' && (
              <MemoryTab
                profiles={profiles}
                setProfiles={setProfiles}
                onSaveNotice={() => showToast('Viewer memory knowledge base saved.')}
              />
            )}

            {activeTab === 'roles' && (
              <RolesResponsesTab
                roles={roles}
                setRoles={setRoles}
                botIdentity={botIdentity}
                setBotIdentity={setBotIdentity}
                onSaveNotice={() => showToast('Role response hierarchy saved.')}
              />
            )}

            {activeTab === 'personalities' && (
              <ResponseStylesTab
                responseStyles={responseStyles}
                setResponseStyles={setResponseStyles}
                onSaveNotice={() => showToast('Personality response styles updated.')}
              />
            )}

            {activeTab === 'shoutouts' && (
              <ShoutoutsTab
                shoutoutConfig={shoutoutConfig}
                setShoutoutConfig={setShoutoutConfig}
                profiles={profiles}
                setProfiles={setProfiles}
                shoutoutHistory={shoutoutHistory}
                onTriggerShoutout={handleTriggerShoutout}
                onPlaySound={playSynthesizedSound}
                activeShoutout={activeShoutout}
                onDismissOverlay={() => setActiveShoutout(null)}
              />
            )}

            {activeTab === 'profiles' && (
              <ProfilesTab
                profiles={profiles}
                setProfiles={setProfiles}
                roles={roles}
                responseStyles={responseStyles}
                onSaveNotice={() => showToast('Viewer profiles & moderation levels updated.')}
              />
            )}

            {activeTab === 'cloudbackup' && (
              <CloudBackupTab
                onRestore={handleImportBackup}
                getCurrentData={getAppBackupData}
                onSaveNotice={() => showToast('Cloud data synced.')}
              />
            )}

            {/* Global Shoutout Overlay (Renders when active) */}
            <ShoutoutOverlayWidget 
              activeShoutout={activeShoutout} 
              onDismiss={() => setActiveShoutout(null)}
            />

            {activeTab === 'automations' && (
              <AutomationsTab
                automations={automations}
                setAutomations={setAutomations}
                onSaveNotice={() => showToast('Stream automations updated.')}
                onBroadcastNow={handleSendBotMessage}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab
                messages={messages}
                profiles={profiles}
                roles={roles}
              />
            )}

            {activeTab === 'telemetry' && (
              <TelemetryTab
                messages={messages}
                profiles={profiles}
                roles={roles}
                logs={logs}
                onClearLogs={() => setLogs([])}
              />
            )}

            {activeTab === 'updates' && (
              <UpdatesTab
                releaseInfo={releaseInfo}
                setReleaseInfo={setReleaseInfo}
                onPerformUpdate={() => {
                  addLog('success', 'SYSTEM', `Upgraded to DroidOS v${releaseInfo.latestVersion}.`);
                  showToast(`Upgraded to DroidOS v${releaseInfo.latestVersion}!`);
                }}
              />
            )}
            
            {activeTab === 'settings' && (
              <SettingsTab
                theme={theme}
                setTheme={setTheme}
                botIdentity={botIdentity}
                setBotIdentity={setBotIdentity}
                tabOrder={tabOrder}
                setTabOrder={setTabOrder}
                availableTabs={ALL_WORKSPACE_TABS}
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
                onResetFactory={handleResetAllData}
                onSaveNotice={() => showToast('Settings applied.')}
              />
            )}

            {activeTab === 'obs-overlay' && (
              <ObsOverlayTab />
            )}
          </>
        )}
      </main>

      {/* Footer with Attribution & Ko-fi & GitHub Link */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-200">DroidOS is Created by MRADDICTIVE.</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-500">v{releaseInfo.currentVersion} (All rights reserved)</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowSupport(true)}
            className="text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
          >
            💖 Support MRADDICTIVE (Ko-fi)
          </button>
          <a
            href={releaseInfo.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-slate-200"
          >
            GitHub: MRADDICTIVE27/DroidOS
          </a>
        </div>
      </footer>

      {/* Support Ko-fi Modal */}
      <SupportModal
        isOpen={showSupport}
        onClose={() => setShowSupport(false)}
      />

      {/* Credentials & Dual Auth Modal */}
      <ConfigModal
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        streamMetadata={streamMetadata}
        setStreamMetadata={setStreamMetadata}
        botIdentity={botIdentity}
      />

      {/* Clean Setup Wizard */}
      <CleanSetupModal
        isOpen={showCleanSetup}
        onClose={() => setShowCleanSetup(false)}
        botIdentity={botIdentity}
        setBotIdentity={setBotIdentity}
        streamMetadata={streamMetadata}
        setStreamMetadata={setStreamMetadata}
        onResetAllData={handleResetAllData}
      />

      {/* Startup Agreement Modal */}
      <AgreementModal
        isOpen={!agreementAccepted}
        onAccept={() => {
          try {
            localStorage.setItem('droidos_eula_accepted', 'true');
          } catch {}
          setAgreementAccepted(true);
        }}
      />
    </div>
  );
};
