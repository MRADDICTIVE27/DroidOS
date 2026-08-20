import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { initAuth } from './lib/googleAuth';
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
  ViewerProfile
} from './types';
import { processIncomingMessage, queryAiEngine, checkAchievementProgress } from './services/botEngine';
import { playSynthesizedSound, playCustomAudioUrl } from './services/soundService';

export const App: React.FC = () => {
  if (window.location.pathname === '/overlay') {
    return <Overlay />;
  }

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<AppTheme>('dark');
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState<boolean>(false);

  useEffect(() => {
    const storedConfig = localStorage.getItem('droidos_firebase_config');
    if (storedConfig) {
      setIsFirebaseConfigured(true);
    }
  }, []);

  const [tabOrder, setTabOrder] = useState<string[]>([
    'dashboard',
    'liveviewer',
    'personalities',
    'points',
    'redeems',
    'achievements',
    'games',
    'soundeffects',
    'obs',
    'obs-overlay',
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

  // Core Data States
  const [botIdentity, setBotIdentity] = useState(INITIAL_BOT_IDENTITY);
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [profiles, setProfiles] = useState(INITIAL_PROFILES);
  const [responseStyles, setResponseStyles] = useState<
    Record<PersonalityResponseType, ResponseStyleDefinition>
  >(INITIAL_RESPONSE_STYLES);
  const [triggers, setTriggers] = useState(INITIAL_TRIGGERS);
  const [pointsConfig, setPointsConfig] = useState(INITIAL_POINTS_CONFIG);
  const [achievements, setAchievements] = useState(INITIAL_ACHIEVEMENTS);
  const [gameState, setGameState] = useState(INITIAL_GAME_STATE);
  const [activeDuel, setActiveDuel] = useState<{ challenger: string; target: string; amount: number } | null>(null);
  const [soundEffects, setSoundEffects] = useState(INITIAL_SOUND_EFFECTS);
  const [redeems, setRedeems] = useState(INITIAL_REDEEMS);
  const [obsConfig, setObsConfig] = useState(INITIAL_OBS_CONFIG);
  const [automations, setAutomations] = useState(INITIAL_AUTOMATIONS);
  const [streamMetadata, setStreamMetadata] = useState<StreamLiveMetadata>(INITIAL_STREAM_METADATA);
  const [releaseInfo, setReleaseInfo] = useState(INITIAL_RELEASE_INFO);
  const [shoutoutConfig, setShoutoutConfig] = useState<ShoutoutConfig>(INITIAL_SHOUTOUT_CONFIG);
  const [shoutoutHistory, setShoutoutHistory] = useState<ShoutoutHistoryItem[]>(INITIAL_SHOUTOUT_HISTORY);
  const [activeShoutout, setActiveShoutout] = useState<ActiveShoutoutOverlay | null>(null);
  const [audioQueue, setAudioQueue] = useState<AudioQueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState<boolean>(false);

  // Runtime Controls
  const [isListening, setIsListening] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(3600);
  const [simulatedTraffic, setSimulatedTraffic] = useState<boolean>(true);

  // Modals
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [showCleanSetup, setShowCleanSetup] = useState<boolean>(false);
  const [showSupport, setShowSupport] = useState<boolean>(false);
  const [agreementAccepted, setAgreementAccepted] = useState<boolean>(() => {
    try {
      return localStorage.getItem('droidos_eula_accepted') === 'true';
    } catch {
      return false;
    }
  });
  const [saveNotification, setSaveNotification] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  
  useEffect(() => {
    const unsubscribe = initAuth((user) => {
      setCurrentUser(user);
      // Load cloud state on login
      setIsCloudSyncing(true);
      loadStateFromCloud().then((parsed) => {
        if (parsed) {
          if (parsed.botIdentity) setBotIdentity(prev => ({ ...prev, ...parsed.botIdentity }));
          if (parsed.roles) setRoles(parsed.roles);
          if (parsed.profiles) setProfiles(parsed.profiles);
          if (parsed.triggers) setTriggers(parsed.triggers);
          if (parsed.pointsConfig) setPointsConfig(parsed.pointsConfig);
          if (parsed.achievements) setAchievements(parsed.achievements);
          if (parsed.soundEffects) setSoundEffects(parsed.soundEffects);
          if (parsed.redeems) setRedeems(parsed.redeems);
          if (parsed.obsConfig) setObsConfig(parsed.obsConfig);
          if (parsed.tabOrder) {
            setTabOrder(Array.from(new Set([...parsed.tabOrder, 'obs-overlay'])));
          }
          if (parsed.theme) setTheme(parsed.theme);
          if (parsed.shoutoutConfig) setShoutoutConfig(parsed.shoutoutConfig);
          if (parsed.gameState) setGameState(parsed.gameState);
          showToast('State Synced from Cloud');
        }
        setIsCloudSyncing(false);
      });
    }, () => {
      setCurrentUser(null);
    });
    return () => unsubscribe();
  }, []);
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

  // --- Persistence Layer ---
  useEffect(() => {
    const saved = localStorage.getItem('droidos_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.botIdentity) setBotIdentity(prev => ({ ...prev, ...parsed.botIdentity }));
        if (parsed.roles) setRoles(parsed.roles);
        if (parsed.profiles) setProfiles(parsed.profiles);
        if (parsed.triggers) setTriggers(parsed.triggers);
        if (parsed.pointsConfig) setPointsConfig(parsed.pointsConfig);
        if (parsed.achievements) setAchievements(parsed.achievements);
        if (parsed.soundEffects) setSoundEffects(parsed.soundEffects);
        if (parsed.redeems) setRedeems(parsed.redeems);
        if (parsed.obsConfig) setObsConfig(parsed.obsConfig);
        if (parsed.tabOrder) setTabOrder(Array.from(new Set([...parsed.tabOrder, 'obs-overlay'])));
        if (parsed.theme) setTheme(parsed.theme);
        if (parsed.shoutoutConfig) setShoutoutConfig(parsed.shoutoutConfig);
        if (parsed.gameState) setGameState(parsed.gameState);
      } catch (e) {
        console.warn('[DroidOS Persistence] Failed to restore state:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (isCloudSyncing) return;
    const stateToSave = {
      botIdentity,
      roles,
      profiles,
      triggers,
      pointsConfig,
      achievements,
      soundEffects,
      redeems,
      obsConfig,
      tabOrder,
      theme,
      shoutoutConfig,
      gameState
    };
    try {
      localStorage.setItem('droidos_state', JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('[DroidOS Persistence] Failed to save state:', e);
    }
    
    // Save to cloud if user is logged in
    if (currentUser) {
      saveStateToCloud(stateToSave);
    }
  }, [botIdentity, roles, profiles, triggers, pointsConfig, achievements, soundEffects, redeems, obsConfig, tabOrder, theme, shoutoutConfig, gameState, currentUser, isCloudSyncing]);

  const greetedUsersRef = useRef<Set<string>>(new Set(['channelowner']));

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

      // Trigger OBS Overlay
      if (redeem.gifUrl) {
        try {
          const { initFirebase } = await import('./lib/firebase');
          const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
          const firebase = await initFirebase();
          if (firebase?.db) {
            await addDoc(collection(firebase.db, 'alerts'), {
              gifUrl: redeem.gifUrl,
              audioUrl: redeem.linkedSoundId ? soundEffects.find(s => s.id === redeem.linkedSoundId)?.customAudioUrl : undefined,
              timestamp: serverTimestamp(),
              durationMs: 5000
            });
          }
        } catch (e) {
          console.error("Failed to trigger OBS overlay alert", e);
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

  // Incoming Message Handler
  const handleIncomingMessage = useCallback(
    async (sender: string, content: string, explicitRole?: string) => {
      const now = new Date().toLocaleTimeString();
      const safeSender = (typeof sender === 'string') ? sender : 'Anonymous';
      const senderKey = safeSender.trim().toLowerCase();

      let role = explicitRole || 'viewer';
      const foundProfile = profiles.find((p) => p.username.toLowerCase() === senderKey);
      if (foundProfile) {
        role = explicitRole || foundProfile.role;
      }

      const userMsg: ChatMessage = {
        id: `msg-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: safeSender.trim(),
        senderRole: role,
        content: content.trim(),
        timestamp: now
      };

      setMessages((prev) => [...prev, userMsg]);

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
            moderationLevel: 0 as const,
            points: starterPoints,
            totalPointsEarned: starterPoints,
            watchTimeMinutes: 1,
            customFacts: ['New community chatter in live stream'],
            notes: 'Auto-registered profile with active inventory system.',
            firstSeen: new Date().toISOString().split('T')[0],
            lastSeen: 'Just now',
            messageCount: 1,
            visitStreak: 1,
            memoryItems: [
              {
                id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
                timestamp: new Date().toISOString().split('T')[0],
                fact: 'Joined live stream and initialized personal inventory.',
                addedBy: 'auto'
              }
            ],
            inventory: [
              {
                id: `inv-${Date.now()}-starter-${Math.random().toString(36).substring(2, 8)}`,
                name: '🌱 Welcome Explorer Badge',
                type: 'badge',
                description: 'Awarded automatically upon entering chat for the first time',
                icon: '🌱',
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
            avatarColor: 'from-blue-600 to-indigo-600'
          };
          addLog('success', 'SYSTEM', `Created new viewer profile & inventory for @${safeSender.trim()}`);
          return [...prev, newViewer];
        }
      });

      addLog('info', 'LISTENER', `Received message from [${sender}] (${role}): "${content}"`);

      // Check Bot Dispatch
      if (isListening && botIdentity.status === 'active') {
        const hasGreeted = greetedUsersRef.current.has(senderKey);
        const result = processIncomingMessage(
          { sender, content, role },
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
            const profile = profiles.find(p => p.username.toLowerCase() === sender.toLowerCase());
            const userPoints = profile?.points || 0;

            if (type === 'coinpush') {
              if (!amount || userPoints < amount) {
                setMessages(prev => [...prev, {
                  id: `msg-game-${Date.now()}`,
                  sender: botIdentity.botName,
                  senderRole: 'bot',
                  content: `⚠️ @${sender}, you don't have enough ${pointsConfig.currencyName} to drop into the pusher!`,
                  timestamp: new Date().toLocaleTimeString(),
                  isBot: true
                }]);
                return;
              }

              const tipChance = gameState.config.coinPushTipChance / 100;
              const willTip = Math.random() < tipChance;
              
              setProfiles(prev => prev.map(p => p.username.toLowerCase() === sender.toLowerCase() ? { ...p, points: p.points - amount } : p));
              
              if (willTip) {
                const totalWin = gameState.pusherPool + amount;
                setProfiles(prev => prev.map(p => p.username.toLowerCase() === sender.toLowerCase() ? { ...p, points: p.points + totalWin } : p));
                setGameState(prev => ({ ...prev, pusherPool: 0 }));
                
                setMessages(prev => [...prev, {
                  id: `msg-game-${Date.now()}`,
                  sender: botIdentity.botName,
                  senderRole: 'bot',
                  content: `🎰 CLINK! @${sender} dropped ${amount} into the pusher and IT TIPPED! 🏆 They won the entire pool of ${totalWin} ${pointsConfig.currencyName}!`,
                  timestamp: new Date().toLocaleTimeString(),
                  isBot: true
                }]);
              } else {
                setGameState(prev => ({ ...prev, pusherPool: prev.pusherPool + amount }));
                setMessages(prev => [...prev, {
                  id: `msg-game-${Date.now()}`,
                  sender: botIdentity.botName,
                  senderRole: 'bot',
                  content: `🪙 @${sender} dropped ${amount} into the pusher... it creaks, but doesn't tip yet! Pool is now: ${gameState.pusherPool + amount}`,
                  timestamp: new Date().toLocaleTimeString(),
                  isBot: true
                }]);
              }
              return;
            }

            if (type === 'gamble') {
              if (!amount || userPoints < amount) {
                setMessages(prev => [...prev, {
                  id: `msg-game-${Date.now()}`,
                  sender: botIdentity.botName,
                  senderRole: 'bot',
                  content: `⚠️ @${sender}, you don't have enough ${pointsConfig.currencyName} to gamble that much!`,
                  timestamp: new Date().toLocaleTimeString(),
                  isBot: true
                }]);
                return;
              }

              const winChance = gameState.config.gambleWinChance / 100;
              const win = Math.random() < winChance;
              const winAmount = amount; 
              const newBal = win ? userPoints + winAmount : userPoints - amount;

              setProfiles(prev => prev.map(p => p.username.toLowerCase() === sender.toLowerCase() ? { ...p, points: newBal } : p));
              
              setMessages(prev => [...prev, {
                id: `msg-game-${Date.now()}`,
                sender: botIdentity.botName,
                senderRole: 'bot',
                content: win 
                  ? `🎰 @${sender} rolled a 100! YOU WIN ${winAmount} ${pointsConfig.currencyName}! New balance: ${newBal}`
                  : `🎰 @${sender} rolled a 1... You lost ${amount} ${pointsConfig.currencyName}. Better luck next time!`,
                timestamp: new Date().toLocaleTimeString(),
                isBot: true
              }]);
              addLog('info', 'SYSTEM', `User @${sender} gambled ${amount} and ${win ? 'WON' : 'LOST'}`);
              return;
            }

            if (type === 'heist') {
              if (!gameState.isHeistActive) {
                setMessages(prev => [...prev, {
                  id: `msg-game-${Date.now()}`,
                  sender: botIdentity.botName,
                  senderRole: 'bot',
                  content: `⚠️ @${sender}, there is no heist currently active. Wait for the streamer to start one!`,
                  timestamp: new Date().toLocaleTimeString(),
                  isBot: true
                }]);
                return;
              }

              if (!amount || userPoints < amount) {
                setMessages(prev => [...prev, {
                  id: `msg-game-${Date.now()}`,
                  sender: botIdentity.botName,
                  senderRole: 'bot',
                  content: `⚠️ @${sender}, you can't join the heist without enough ${pointsConfig.currencyName}!`,
                  timestamp: new Date().toLocaleTimeString(),
                  isBot: true
                }]);
                return;
              }

              const alreadyIn = gameState.heistParticipants.some(p => p.username.toLowerCase() === sender.toLowerCase());
              if (alreadyIn) return;

              setGameState(prev => ({
                ...prev,
                heistParticipants: [...prev.heistParticipants, { username: sender, bid: amount }]
              }));
              
              setProfiles(prev => prev.map(p => p.username.toLowerCase() === sender.toLowerCase() ? { ...p, points: p.points - amount } : p));

              setMessages(prev => [...prev, {
                id: `msg-game-${Date.now()}`,
                sender: botIdentity.botName,
                senderRole: 'bot',
                content: `💰 @${sender} joined the heist crew with ${amount} ${pointsConfig.currencyName}! Current crew: ${gameState.heistParticipants.length + 1}`,
                timestamp: new Date().toLocaleTimeString(),
                isBot: true
              }]);
              return;
            }

            if (type === 'attack') {
              if (!gameState.isBossActive) return;

              const dmg = Math.floor(Math.random() * 50) + 10;
              const newHP = Math.max(0, gameState.bossHealth - dmg);
              
              setGameState(prev => ({ ...prev, bossHealth: newHP }));

              if (newHP <= 0) {
                setGameState(prev => ({ ...prev, isBossActive: false }));
                setMessages(prev => [...prev, {
                  id: `msg-game-${Date.now()}`,
                  sender: botIdentity.botName,
                  senderRole: 'bot',
                  content: `🏆 BOOM! @${sender} landed the killing blow on [${gameState.bossName}]! The community is safe once more! Rewards granted.`,
                  timestamp: new Date().toLocaleTimeString(),
                  isBot: true
                }]);
                // Grant points to everyone who participated
                const reward = gameState.config.bossKillReward;
                setProfiles(prev => prev.map(p => p.username.toLowerCase() === sender.toLowerCase() ? { ...p, points: p.points + reward } : p));
              } else {
                // Only respond sometimes to avoid spam
                if (Math.random() > 0.8) {
                  setMessages(prev => [...prev, {
                    id: `msg-game-${Date.now()}`,
                    sender: botIdentity.botName,
                    senderRole: 'bot',
                    content: `⚔️ @${sender} dealt ${dmg} DMG to ${gameState.bossName}! (${newHP} HP left)`,
                    timestamp: new Date().toLocaleTimeString(),
                    isBot: true
                  }]);
                }
              }
              return;
            }

            if (type === 'duel') {
              if (!target || !amount || userPoints < amount) return;
              
              setActiveDuel({ challenger: sender, target, amount });
              setMessages(prev => [...prev, {
                id: `msg-game-${Date.now()}`,
                sender: botIdentity.botName,
                senderRole: 'bot',
                content: `⚔️ @${sender} has challenged @${target} to a DUEL for ${amount} ${pointsConfig.currencyName}! Type "!accept" to fight!`,
                timestamp: new Date().toLocaleTimeString(),
                isBot: true
              }]);
              return;
            }

            if (type === 'accept_duel') {
              if (!activeDuel || activeDuel.target.toLowerCase() !== sender.toLowerCase()) return;
              
              const challengerProfile = profiles.find(p => p.username.toLowerCase() === activeDuel.challenger.toLowerCase());
              if (!challengerProfile || challengerProfile.points < activeDuel.amount || userPoints < activeDuel.amount) {
                setMessages(prev => [...prev, {
                  id: `msg-game-${Date.now()}`,
                  sender: botIdentity.botName,
                  senderRole: 'bot',
                  content: `⚠️ Duel cancelled: Someone ran out of ${pointsConfig.currencyName}!`,
                  timestamp: new Date().toLocaleTimeString(),
                  isBot: true
                }]);
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

              setMessages(messages => [...messages, {
                id: `msg-game-${Date.now()}`,
                sender: botIdentity.botName,
                senderRole: 'bot',
                content: `⚔️ THE DUEL IS OVER! @${winner} defeated @${loser} and won ${prize} ${pointsConfig.currencyName}! ${houseCut > 0 ? `(House took ${activeDuel.amount - prize} cut)` : ''}`,
                timestamp: new Date().toLocaleTimeString(),
                isBot: true
              }]);
              setActiveDuel(null);
              return;
            }
          }

          // Handle AI Query (!ai how are you)
          if (result.isAiQuery && result.aiPrompt) {
            addLog('bot', 'AI_ENGINE', `Routing AI prompt for @${sender} [${result.responseType || 'default'}]: "${result.aiPrompt}"`);
            const aiResponse = await queryAiEngine(
              result.aiPrompt,
              sender,
              botIdentity,
              result.responseType,
              result.memoryFacts
            );

            setAiEngineStatus({ status: aiResponse.status, error: aiResponse.error });

            setTimeout(() => {
              const botMsg: ChatMessage = {
                id: `msg-bot-ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                sender: botIdentity.botName,
                senderRole: 'bot',
                isBot: true,
                isAiResponse: true,
                content: aiResponse.reply,
                timestamp: new Date().toLocaleTimeString(),
                matchedRule: result.matchedRule || `AI Command [${botIdentity.aiCommandPrefix}]`
              };
              setMessages((prev) => [...prev, botMsg]);
              addLog('bot', 'AI_ENGINE', `Dispatched AI reply: "${aiResponse.reply}"`);
            }, botIdentity.typingDelayMs || 400);
            return;
          }

          // Handle Redeem Trigger
          if (result.redeemedItem) {
            handleRedeemItem(result.redeemedItem, sender);
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
              }
            }
          }

          // Standard Bot Reply
          if (result.replyText) {
            setTimeout(() => {
              const botMsg: ChatMessage = {
                id: `msg-bot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                sender: botIdentity.botName,
                senderRole: 'bot',
                isBot: true,
                content: result.replyText!,
                timestamp: new Date().toLocaleTimeString(),
                matchedRule: result.matchedRule
              };
              setMessages((prev) => [...prev, botMsg]);
              addLog('bot', 'ROLES', `Dispatched response [${result.matchedRule}]: "${result.replyText}"`);
            }, botIdentity.typingDelayMs || 400);
          }
        }
      }
    },
    [profiles, isListening, botIdentity, roles, triggers, pointsConfig, achievements, redeems, soundEffects, uptimeSeconds, handleRedeemItem, addLog, shoutoutConfig, handleTriggerShoutout]
  );

  // --- Real-time Chat Sync Poller ---
  useEffect(() => {
    if (!isLive || !isListening) return;

    let lastFetchedId: string | null = null;
    const pollInterval = 4000; // 4 seconds

    const syncChat = async () => {
      try {
        const url = `/api/youtube/chat${lastFetchedId ? `?lastId=${lastFetchedId}` : ''}`;
        const res = await fetch(url);
        const newMsgs = await res.json();

        if (Array.isArray(newMsgs) && newMsgs.length > 0) {
          lastFetchedId = newMsgs[newMsgs.length - 1].id;
          
          // Inject into local processing engine
          newMsgs.forEach((msg: any) => {
            handleIncomingMessage(msg.sender, msg.content, msg.senderRole);
          });
        }
      } catch (err) {
        console.warn('[DroidOS Chat Sync] Polling failed:', err);
      }
    };

    const interval = setInterval(syncChat, pollInterval);
    syncChat();

    return () => clearInterval(interval);
  }, [isLive, isListening, handleIncomingMessage]);

  const handleSendBotMessage = (content: string) => {
    const botMsg: ChatMessage = {
      id: `msg-manual-bot-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sender: botIdentity.botName,
      senderRole: 'bot',
      isBot: true,
      content,
      timestamp: new Date().toLocaleTimeString(),
      matchedRule: 'Manual Broadcaster Dispatch'
    };
    setMessages((prev) => [...prev, botMsg]);
    addLog('bot', 'SYSTEM', `Manual bot broadcast sent: "${content}"`);
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
  const isOverlayMode = new URLSearchParams(window.location.search).get('mode') === 'overlay';

  if (isOverlayMode) {
    return (
      <div className={`min-h-screen flex items-center justify-center bg-transparent overflow-hidden`}>
        <ShoutoutOverlayWidget activeShoutout={activeShoutout} />
        {/* Additional minimal overlay elements can go here */}
      </div>
    );
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
