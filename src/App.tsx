import React, { useState, useEffect, useRef } from 'react';
import { fetchLiveChatId, pollLiveChat, sendChatMessage, fetchChannelStats, fetchBroadcastStats } from './services/youtubeChatReal';
import {
  Activity,
  MessageSquare,
  Bot,
  Coins,
  Gift,
  Trophy,
  Gamepad2,
  Users,
  Video,
  Download,
  Sparkles,
  Radio,
  ExternalLink,
  Layers,
  Monitor,
  CheckCircle2,
  Volume2,
  Coffee,
  Shield,
  FileText,
  Eye,
  X,
  Scale,
  ShieldCheck,
  Terminal,
  MessageSquareCode,
  Clock,
  Settings as SettingsIcon,
  GripHorizontal,
  FolderOpen,
  Cpu,
  HelpCircle
} from 'lucide-react';

import { WindowsTitlebar } from './components/WindowsTitlebar';
import { DashboardTab } from './components/DashboardTab';
import { LiveChatMonitor } from './components/LiveChatMonitor';
import { PersonalitiesTab } from './components/PersonalitiesTab';
import { PointsEconomyTab } from './components/PointsEconomyTab';
import { RedeemsSoundboardTab } from './components/RedeemsSoundboardTab';
import { AchievementsTab } from './components/AchievementsTab';
import { ChatGamesTab } from './components/ChatGamesTab';
import { ViewerProfilesTab } from './components/ViewerProfilesTab';
import { OBSIntegrationTab } from './components/OBSIntegrationTab';
import { CustomCommandsTab } from './components/CustomCommandsTab';
import { AutoResponsesTab } from './components/AutoResponsesTab';
import { AutomationTimersTab } from './components/AutomationTimersTab';
import { SettingsTab } from './components/SettingsTab';
import { ScriptPluginsTab } from './components/ScriptPluginsTab';
import { BotImporterModal } from './components/BotImporterModal';
import { KofiSupportBanner } from './components/KofiSupportBanner';
import { HelpQATab } from './components/HelpQATab';
import { LegalTermsModal } from './components/LegalTermsModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { LiveOverlayPreviewStage, OverlayEventData } from './components/LiveOverlayPreviewStage';
import { LocalDataFolderExplorer } from './components/LocalDataFolderExplorer';
import { DroidOsLogo } from './components/DroidOsLogo';
import { recordApiCall } from './services/apiQuotaTracker';
import { interpolateTemplate } from './services/botEngine';
import { DEFAULT_BLACKLIST_SETTINGS } from './services/botBlacklistService';
import { BUILTIN_PLUGINS } from './services/pluginEngine';

import {
  DEFAULT_PERSONALITIES,
  DEFAULT_VIEWERS,
  INITIAL_CHAT_MESSAGES,
  DEFAULT_OBS_CONFIG,
  DEFAULT_STREAM_METADATA,
  DEFAULT_SHOUTOUT_CONFIG,
  DEFAULT_ECONOMY_SETTINGS,
  DEFAULT_CHAT_TRIGGERS,
  DEFAULT_REDEEMS,
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_CUSTOM_COMMANDS,
  DEFAULT_AUTO_RESPONSES,
  DEFAULT_AUTOMATION_TIMERS,
  DEFAULT_APP_SETTINGS
} from './data/defaultData';

import {
  BotPersonality,
  ViewerProfile,
  ChatMessage,
  OBSConfig,
  StreamMetadata,
  ShoutoutConfig,
  EconomySettings,
  ChatQuestionTrigger,
  RedeemItem,
  AchievementItem,
  UserRole,
  CustomCommand,
  AutoResponse,
  AutomationTimer,
  AppSettings,
  BlacklistSettings,
  ScriptPlugin
} from './types';

import { soundSynth } from './services/soundSynthesizer';
import { processIncomingChatMessage } from './services/botEngine';
import {
  loadAllLocalData, loadAllDataAsync,
  saveViewersLocal,
  saveCommandsLocal,
  saveResponsesLocal,
  saveTimersLocal,
  savePersonalitiesLocal,
  saveRedeemsLocal,
  saveAchievementsLocal,
  saveSettingsLocal,
  saveMetadataLocal,
  saveEconomyLocal,
  saveObsConfigLocal,
  saveShoutoutConfigLocal,
  saveBlacklistLocal,
  savePluginsLocal
} from './services/localDataStorage';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Draggable Tab Bar State & Refs
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [isDraggingTabs, setIsDraggingTabs] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragScrollLeft, setDragScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  // Legal & Support Modals
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showOverlayPreviewModal, setShowOverlayPreviewModal] = useState<boolean>(false);
  const [showDataFolderModal, setShowDataFolderModal] = useState<boolean>(false);

  // Initialize from Local Persistent Storage
  const initialLocal = loadAllLocalData();

  // Core State
  const [personalities, setPersonalities] = useState<BotPersonality[]>(initialLocal.personalities || DEFAULT_PERSONALITIES);
  const [activePersonalityId, setActivePersonalityId] = useState<string>('friendly');
  const [viewers, setViewers] = useState<ViewerProfile[]>(initialLocal.viewers || DEFAULT_VIEWERS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [obsConfig, setObsConfig] = useState<OBSConfig>(initialLocal.obsConfig || DEFAULT_OBS_CONFIG);
  const [streamMetadata, setStreamMetadata] = useState<StreamMetadata>(initialLocal.streamMetadata || DEFAULT_STREAM_METADATA);
  const [shoutoutConfig, setShoutoutConfig] = useState<ShoutoutConfig>(initialLocal.shoutoutConfig || DEFAULT_SHOUTOUT_CONFIG);
  const [economy, setEconomy] = useState<EconomySettings>(initialLocal.economy || DEFAULT_ECONOMY_SETTINGS);
  const [chatTriggers, setChatTriggers] = useState<ChatQuestionTrigger[]>(DEFAULT_CHAT_TRIGGERS);
  const [redeems, setRedeems] = useState<RedeemItem[]>(initialLocal.redeems || DEFAULT_REDEEMS);
  const [redeemQueue, setRedeemQueue] = useState<Array<{ id: string; name: string; cost: number; username: string; timestamp: number }>>([]);
  const [achievements, setAchievements] = useState<AchievementItem[]>(initialLocal.achievements || DEFAULT_ACHIEVEMENTS);
  const [isChatSimulating, setIsChatSimulating] = useState<boolean>(false);

  // Management State
  const [customCommands, setCustomCommands] = useState<CustomCommand[]>(initialLocal.customCommands || DEFAULT_CUSTOM_COMMANDS);
  const [autoResponses, setAutoResponses] = useState<AutoResponse[]>(initialLocal.autoResponses || DEFAULT_AUTO_RESPONSES);
  const [automationTimers, setAutomationTimers] = useState<AutomationTimer[]>(initialLocal.automationTimers || DEFAULT_AUTOMATION_TIMERS);
  const [appSettings, setAppSettings] = useState<AppSettings>(initialLocal.appSettings || DEFAULT_APP_SETTINGS);
  const [blacklistSettings, setBlacklistSettings] = useState<BlacklistSettings>(initialLocal.blacklistSettings || DEFAULT_BLACKLIST_SETTINGS);
  const [plugins, setPlugins] = useState<ScriptPlugin[]>(initialLocal.plugins || BUILTIN_PLUGINS);
  const [isBotImporterOpen, setIsBotImporterOpen] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  useEffect(() => {
    loadAllDataAsync().then((fresh) => {
      setPersonalities(fresh.personalities);
      setViewers(fresh.viewers);
      setObsConfig(fresh.obsConfig);
      setStreamMetadata(fresh.streamMetadata);
      setShoutoutConfig(fresh.shoutoutConfig);
      setEconomy(fresh.economy);
      setRedeems(fresh.redeems);
      setAchievements(fresh.achievements);
      setCustomCommands(fresh.customCommands);
      setAutoResponses(fresh.autoResponses);
      setAutomationTimers(fresh.automationTimers);
      setAppSettings(fresh.appSettings);
      setBlacklistSettings(fresh.blacklistSettings);
      setPlugins(fresh.plugins);
      // Check first launch
      if (!localStorage.getItem('hasSeenSetup')) {
        setShowTermsModal(true);
        localStorage.setItem('hasSeenSetup', 'true');
      }

      setIsLoadingData(false);
    });
  }, []);



  // Save changes to persistent local storage automatically
  useEffect(() => {
    if (!isLoadingData) saveViewersLocal(viewers);
  }, [viewers, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData) saveCommandsLocal(customCommands);
  }, [customCommands, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData) saveResponsesLocal(autoResponses);
  }, [autoResponses, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData) saveTimersLocal(automationTimers);
  }, [automationTimers, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData) savePersonalitiesLocal(personalities);
  }, [personalities, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData) saveRedeemsLocal(redeems);
  }, [redeems, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData) saveAchievementsLocal(achievements);
  }, [achievements, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData) saveSettingsLocal(appSettings);
  }, [appSettings, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData) saveMetadataLocal(streamMetadata);
  }, [streamMetadata, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData) saveEconomyLocal(economy);
  }, [economy, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData) saveObsConfigLocal(obsConfig);
  }, [obsConfig, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData) saveShoutoutConfigLocal(shoutoutConfig);
  }, [shoutoutConfig, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData) saveBlacklistLocal(blacklistSettings);
  }, [blacklistSettings, isLoadingData]);

  useEffect(() => {
    if (!isLoadingData) savePluginsLocal(plugins);
  }, [plugins, isLoadingData]);

  // Active overlay trigger notification toast & modal bridge
  const [activeAlert, setActiveAlert] = useState<{
    id: string;
    title: string;
    subtitle: string;
    type: string;
  } | null>(null);

  const [modalPreviewEvent, setModalPreviewEvent] = useState<OverlayEventData | null>(null);

  const activePersonality =
    personalities.find((p) => p.id === activePersonalityId) || personalities[0] || DEFAULT_PERSONALITIES[0];

  // Helper to broadcast overlay triggers
  const triggerOverlayEvent = (type: string, data?: any) => {
    if (data?.soundPreset) {
      soundSynth.play(data.soundPreset);
    } else {
      soundSynth.play(
        type === 'achievement'
          ? 'victory'
          : type === 'shoutout'
          ? 'shoutout'
          : type === 'media_video' || type === 'video'
          ? 'alarm'
          : type === 'media_gif' || type === 'gif'
          ? 'jackpot'
          : type === 'redeem'
          ? 'airhorn'
          : type === 'confetti'
          ? 'jackpot'
          : 'coin'
      );
    }

    const title = data?.title || `${type.toUpperCase()} TRIGGERED`;
    const subtitle = data?.subtitle || `Broadcast signal transmitted to OBS`;

    setActiveAlert({
      id: `alert-${Date.now()}`,
      title,
      subtitle,
      type
    });

    const isVideo = type === 'media_video' || data?.mediaType === 'video' || !!data?.videoUrl;
    const isGif = type === 'media_gif' || data?.mediaType === 'gif' || !!data?.gifUrl;

    setModalPreviewEvent({
      id: `evt-${Date.now()}`,
      type: (isVideo ? 'media_video' : isGif ? 'media_gif' : type) as any,
      title,
      subtitle,
      username: data?.username || 'PixelKnight',
      theme: data?.theme || data?.overlayTheme || shoutoutConfig.overlayTheme,
      preset: data?.preset || data?.bannerPreset || 'xbox',
      icon: data?.icon || '⭐',
      points: data?.points || 500,
      timestamp: Date.now(),
      mediaType: data?.mediaType || (isVideo ? 'video' : isGif ? 'gif' : undefined),
      mediaUrl: data?.mediaUrl || data?.videoUrl || data?.gifUrl,
      videoUrl: data?.videoUrl || (isVideo ? data?.mediaUrl : undefined),
      gifUrl: data?.gifUrl || (isGif ? data?.mediaUrl : undefined),
      mediaFit: data?.mediaFit || 'contain',
      mediaPosition: data?.mediaPosition || 'center',
      mediaVolume: data?.mediaVolume ?? 1,
      chromaKey: data?.chromaKey || 'none',
      caption: data?.caption || data?.customMessage,
      duration: data?.duration || (data?.durationMs ? Math.round(data.durationMs / 1000) : 6),
      dropPreset: data?.dropPreset,
      customDropImageUrl: data?.customDropImageUrl,
      dropParticleCount: data?.dropParticleCount
    });

    try {
      fetch('/api/overlay-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data, timestamp: Date.now() })
      }).catch(() => {});
    } catch (_) {}

    setTimeout(() => {
      setActiveAlert((prev) => (prev?.title === title ? null : prev));
    }, 5000);
  };

  // Auto-Welcome Session Cache (Tracks chatters greeted during the current live session)
  const greetedViewersSessionRef = useRef<Set<string>>(new Set());

  // Chat message submission handler
    const activeLiveChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    let interval: any;
    let pageToken: string | undefined;

    const poll = async () => {
      const token = appSettings.hostGoogleAccount?.accessToken;
      if (!token) return;
      
      if (!activeLiveChatIdRef.current) {
        activeLiveChatIdRef.current = await fetchLiveChatId(token);
      }
      
      if (activeLiveChatIdRef.current) {
        const data = await pollLiveChat(token, activeLiveChatIdRef.current, pageToken);
        if (data && data.items) {
          pageToken = data.nextPageToken;
          data.items.forEach((item: any) => {
            const author = item.authorDetails.displayName;
            const text = item.snippet.displayMessage;
            const pfp = item.authorDetails.profileImageUrl;
            const type = item.snippet.type;
            const isBot = author === appSettings.botGoogleAccount?.channelTitle;

            if (author && !isBot) {
              if (type === 'superChatEvent') {
                const superChatDetails = item.snippet.superChatDetails;
                const amountStr = superChatDetails?.amountDisplayString || '$5.00';
                handleSendMessage(text || 'Donated Super Chat!', author, 'subscriber', pfp, true, amountStr, false);
              } else if (type === 'newSponsorEvent' || type === 'memberMilestoneChatEvent') {
                handleSendMessage(text || 'Joined the channel membership!', author, 'subscriber', pfp, false, undefined, true);
              } else {
                handleSendMessage(text, author, 'viewer', pfp);
              }
            }
          });
        }
      }
    };

    const pollStats = async () => {
      const token = appSettings.hostGoogleAccount?.accessToken;
      if (!token) return;
      const channelStats = await fetchChannelStats(token);
      const broadcastStats = await fetchBroadcastStats(token);
      
      setStreamMetadata(prev => ({
        ...prev,
        ...(channelStats ? {
          subscriberCount: channelStats.subscriberCount,
          channelName: channelStats.channelName,
          thumbnailUrl: channelStats.thumbnailUrl
        } : {}),
        ...(broadcastStats ? {
          viewerCount: broadcastStats.viewerCount,
          streamTitle: broadcastStats.title
        } : {})
      }));
    };

    let statsInterval: any;
    if (streamMetadata.isLive) {
      poll();
      pollStats();
      interval = setInterval(poll, 5000);
      statsInterval = setInterval(pollStats, 30000); // every 30s
    }
    return () => {
      clearInterval(interval);
      if (statsInterval) clearInterval(statsInterval);
    };
  }, [streamMetadata.isLive, appSettings.hostGoogleAccount?.accessToken]);

  const handleSendMessage = (
    content: string,
    senderName = 'Streamer (Host)',
    role: UserRole = 'owner',
    profileImageUrl?: string,
    isSuperChat = false,
    superChatAmount?: string,
    isNewMember = false
  ) => {
    const botName = appSettings.botGoogleAccount?.channelTitle || 'Bot';
    if (senderName.includes(botName) && activeLiveChatIdRef.current) {
       const botToken = appSettings.botGoogleAccount?.accessToken;
       if (botToken) sendChatMessage(botToken, activeLiveChatIdRef.current, content).catch(console.error);
    }
    const isBot = senderName.includes('Bot') || senderName.includes('🤖') || senderName.includes('(Roast)') || senderName.includes('(Auto-Timer)');
    const cleanSender = senderName.replace(/[^a-zA-Z0-9_]/g, '');

    // Record API Call for Quota Tracking (1 unit for incoming chat poll / stream event)
    if (!isBot) {
      recordApiCall('list_chat');
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random()}`,
      username: cleanSender,
      displayName: senderName,
      role,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      avatarColor: role === 'owner' ? 'from-red-500 to-amber-500' : 'from-blue-500 to-cyan-400',
      isSuperChat,
      superChatAmount,
      isNewMember
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // Handle Super Chat / Member alerts & rewards
    if (isSuperChat && superChatAmount) {
      triggerOverlayEvent('custom', {
        title: `SUPER CHAT: ${superChatAmount}`,
        subtitle: `${senderName} donated ${superChatAmount}!`,
        soundPreset: 'victory',
        preset: 'xbox',
        theme: 'neon-cyber'
      });
      const numericAmount = parseFloat(superChatAmount.replace(/[^0-9.]/g, '') || '0') || 5;
      const pointsReward = Math.floor(numericAmount * 100);
      setViewers((prev) =>
        prev.map((v) =>
          v.username.toLowerCase() === cleanSender.toLowerCase()
            ? { ...v, points: v.points + pointsReward }
            : v
        )
      );
    } else if (isNewMember) {
      triggerOverlayEvent('custom', {
        title: `NEW CHANNEL MEMBER!`,
        subtitle: `Welcome @${senderName} to the channel family!`,
        soundPreset: 'shoutout',
        preset: 'playstation',
        theme: 'neon-cyber'
      });
      setViewers((prev) =>
        prev.map((v) =>
          v.username.toLowerCase() === cleanSender.toLowerCase()
            ? { ...v, points: v.points + 500 }
            : v
        )
      );
    }

    // Auto-register viewer or update message count & PFP
    if (!isBot) {
      const cleanKey = cleanSender.toLowerCase();
      const existing = viewers.find(v => v.username.toLowerCase() === cleanKey);
      if (!existing) {
        const colors = [
          'from-blue-500 to-cyan-400',
          'from-purple-500 to-indigo-600',
          'from-pink-500 to-rose-500',
          'from-emerald-400 to-teal-600',
          'from-orange-400 to-amber-600',
          'from-fuchsia-500 to-pink-600'
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const newViewer: ViewerProfile = {
          id: `viewer-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          username: cleanKey,
          displayName: senderName,
          role,
          moderationLevel: role === 'owner' ? 4 : role === 'moderator' ? 3 : role === 'vip' ? 2 : role === 'subscriber' ? 1 : 0,
          points: 100,
          totalPointsEarned: 100,
          watchTimeMinutes: 1,
          customFacts: ['New chat explorer'],
          notes: 'Auto-registered by DroidOS chat system.',
          firstSeen: new Date().toISOString().split('T')[0],
          lastSeen: 'Just now',
          messageCount: 1,
          visitStreak: 1,
          memoryItems: [],
          inventory: [],
          achievements: [],
          avatarColor: randomColor,
          profilePictureUrl: profileImageUrl
        };
        setViewers(prev => [newViewer, ...prev]);
      } else {
        setViewers(prev => prev.map(v => {
          if (v.username.toLowerCase() === cleanKey) {
            return {
              ...v,
              messageCount: v.messageCount + 1,
              profilePictureUrl: profileImageUrl || v.profilePictureUrl,
              lastSeen: 'Just now'
            };
          }
          return v;
        }));
      }
    }

    // CHECK FOR AUTO-WELCOME (New Chatter vs Returning Chatter with Memory)
    const autoWelcomeEnabled = appSettings.autoWelcomeViewers ?? true;
    const cleanKey = cleanSender.toLowerCase();

    if (!isBot && autoWelcomeEnabled && !greetedViewersSessionRef.current.has(cleanKey)) {
      greetedViewersSessionRef.current.add(cleanKey);

      // Find profile in database
      const existingViewer = viewers.find(
        (v) => v.username.toLowerCase() === cleanKey || v.displayName.toLowerCase() === senderName.toLowerCase()
      );

      const isReturning = Boolean(
        existingViewer &&
        (existingViewer.messageCount > 1 || (existingViewer.customFacts && existingViewer.customFacts.length > 0) || (existingViewer.visitStreak && existingViewer.visitStreak > 1))
      );

      const mode = appSettings.autoWelcomeMode || 'all';
      const shouldWelcome =
        mode === 'all' ||
        (mode === 'new_only' && !isReturning) ||
        (mode === 'returning_memory' && isReturning);

      if (shouldWelcome) {
        let welcomeText = '';
        if (isReturning && existingViewer) {
          const facts = existingViewer.customFacts || [];
          if (facts.length > 0) {
            const memoryFact = facts[Math.floor(Math.random() * facts.length)];
            const memoryBank = activePersonality.memoryInfusedResponses && activePersonality.memoryInfusedResponses.length > 0
              ? activePersonality.memoryInfusedResponses
              : [
                  `Welcome back @{username}! Still remember when you {custom_fact}! Ready for today's stream?`,
                  `Hey @{username}! Look who's back! I logged in my database: {custom_fact}! Good to see you!`
                ];
            const template = memoryBank[Math.floor(Math.random() * memoryBank.length)];
            welcomeText = interpolateTemplate(template, {
              username: senderName,
              streamer_name: streamMetadata.channelName,
              custom_fact: memoryFact,
              user_points: existingViewer.points || 100
            });
          } else if (existingViewer.customGreeting) {
            welcomeText = interpolateTemplate(existingViewer.customGreeting, {
              username: senderName,
              streamer_name: streamMetadata.channelName,
              custom_fact: 'veteran viewer',
              user_points: existingViewer.points || 100
            });
          } else {
            const greetings = activePersonality.greetingResponses && activePersonality.greetingResponses.length > 0
              ? activePersonality.greetingResponses
              : [`Welcome back @{username}! Good to have you here!`];
            const template = greetings[Math.floor(Math.random() * greetings.length)];
            welcomeText = interpolateTemplate(template, {
              username: senderName,
              streamer_name: streamMetadata.channelName,
              custom_fact: 'returning chatter',
              user_points: existingViewer.points || 100
            });
          }
        } else {
          // First-time new chatter
          const greetings = activePersonality.greetingResponses && activePersonality.greetingResponses.length > 0
            ? activePersonality.greetingResponses
            : [`Welcome, @{username}! Take a breath and settle in.`];
          const template = greetings[Math.floor(Math.random() * greetings.length)];
          welcomeText = interpolateTemplate(template, {
            username: senderName,
            streamer_name: streamMetadata.channelName,
            custom_fact: 'first-time chatter',
            user_points: 100
          });
        }

        if (welcomeText) {
          setTimeout(() => {
            recordApiCall('send_message'); // 50 units for sending live chat message
            const botDisplayName = appSettings.botAccountName || streamMetadata.botAuth?.accountName || 'DroidBot';
            const botRole: UserRole = appSettings.sendChatAsBot ? 'moderator' : 'owner';

            const welcomeMsg: ChatMessage = {
              id: `welcome-msg-${Date.now()}`,
              username: botDisplayName.replace(/[^a-zA-Z0-9_]/g, ''),
              displayName: `${botDisplayName} 🤖`,
              role: botRole,
              content: welcomeText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              isBot: true,
              avatarColor: 'from-purple-600 to-indigo-600'
            };
            setChatMessages((prev) => [...prev, welcomeMsg]);
          }, 600);
        }
      }
    }

    // Process bot responses with Custom Commands, Auto-Responses, Blacklist, Plugins, and Achievements/Inventory support
    const botResult = processIncomingChatMessage(
      newMsg,
      viewers,
      activePersonality,
      chatTriggers,
      redeems,
      economy,
      streamMetadata.channelName,
      customCommands,
      autoResponses,
      personalities,
      achievements,
      blacklistSettings,
      plugins,
      appSettings
    );

    if (botResult.pointsDelta) {
      const delta = botResult.pointsDelta;
      setViewers((prev) =>
        prev.map((v) =>
          v.username.toLowerCase() === newMsg.username.toLowerCase()
            ? { ...v, points: Math.max(0, v.points + delta) }
            : v
        )
      );
    }

    if (botResult.botReply) {
      setTimeout(() => {
        recordApiCall('send_message'); // 50 units for sending message
        const botDisplayName = appSettings.botAccountName || streamMetadata.botAuth?.accountName || 'DroidBot';
        const botHandle = appSettings.botChannelHandle || streamMetadata.botAuth?.botChannelHandle || '@DroidBotLive';
        const botRole: UserRole = appSettings.sendChatAsBot ? 'moderator' : 'owner';

        const botMsg: ChatMessage = {
          id: `bot-msg-${Date.now()}`,
          username: botDisplayName.replace(/[^a-zA-Z0-9_]/g, ''),
          displayName: `${botDisplayName} 🤖`,
          role: botRole,
          content: botResult.botReply!,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          isBot: true,
          avatarColor: 'from-purple-600 to-indigo-600'
        };
        setChatMessages((prev) => [...prev, botMsg]);

        // If backend proxy API is active, broadcast out as the bot account
        try {
          fetch('/api/send-bot-chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: botResult.botReply,
              botAccountName: botDisplayName,
              botChannelHandle: botHandle,
              botApiKey: appSettings.botApiKey || streamMetadata.botAuth?.botApiKey,
              sendAsBot: appSettings.sendChatAsBot
            })
          }).catch(() => {});
        } catch (_) {}
      }, 500);
    }

    if (botResult.overlayAlert) {
      triggerOverlayEvent(botResult.overlayAlert.type || 'achievement', {
        ...botResult.overlayAlert
      });
    }

    if (botResult.redeemTriggered) {
      triggerOverlayEvent('redeem', {
        title: `REDEEM: ${botResult.redeemTriggered.name}`,
        subtitle: `@${newMsg.displayName} redeemed for ${botResult.redeemTriggered.cost} ${economy.currencyName}`
      });
      setRedeemQueue((prev) => [
        {
          id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: botResult.redeemTriggered!.name,
          cost: botResult.redeemTriggered!.cost,
          username: newMsg.displayName,
          timestamp: Date.now()
        },
        ...prev
      ]);
    }
  };

  // Chat Simulator Loop
  useEffect(() => {
    if (!isChatSimulating) return;

    const sampleChatters = [
      { name: 'PixelKnight', role: 'moderator' as UserRole, lines: ['!points', '!gamble 250', '!discord', '!heist'] },
      { name: 'Luna_Starlight', role: 'vip' as UserRole, lines: ['Good evening everyone! ⭐', '!so', '!kofi', '!duel PixelKnight 100'] },
      { name: 'RetroGamer99', role: 'subscriber' as UserRole, lines: ['!boss', '!specs', '!points', 'GG stream team!'] },
      { name: 'CyberSamurai', role: 'viewer' as UserRole, lines: ['Hello chat!', '!gamble 50', 'Is this the Windows edition?', '!rules'] }
    ];

    const interval = setInterval(() => {
      const rand = Math.random();
      if (rand < 0.08) {
        // Simulate a Super Chat!
        const superChatters = ['MrBeast', 'Markiplier', 'Jacksepticeye', 'PewDiePie'];
        const name = superChatters[Math.floor(Math.random() * superChatters.length)];
        const amounts = ['$5.00', '$10.00', '$20.00', '$50.00', '$100.00'];
        const amount = amounts[Math.floor(Math.random() * amounts.length)];
        const messages = ['Keep up the amazing streams!', 'Love the bot automation!', 'DroidOS is fire! 🔥', 'Here is some hype! 🚀'];
        const msg = messages[Math.floor(Math.random() * messages.length)];
        handleSendMessage(msg, name, 'subscriber', undefined, true, amount, false);
      } else if (rand < 0.15) {
        // Simulate a new member!
        const newMembers = ['Sora_Keyblade', 'Kratos_God', 'Geralt_Rivia', 'Zelda_Hyrule'];
        const name = newMembers[Math.floor(Math.random() * newMembers.length)];
        handleSendMessage('Joined as a Channel Member!', name, 'subscriber', undefined, false, undefined, true);
      } else {
        const chatter = sampleChatters[Math.floor(Math.random() * sampleChatters.length)];
        const line = chatter.lines[Math.floor(Math.random() * chatter.lines.length)];
        handleSendMessage(line, chatter.name, chatter.role);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isChatSimulating, viewers, activePersonality, chatTriggers, redeems, economy, streamMetadata, customCommands, autoResponses, personalities]);

  // Periodic Automation Timers Engine Loop
  useEffect(() => {
    const timerInterval = setInterval(() => {
      const activeTimers = automationTimers.filter((t) => t.enabled);
      if (activeTimers.length === 0) return;

      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const randomTimer = activeTimers[Math.floor(Math.random() * activeTimers.length)];
      if (randomTimer && Math.random() < 0.3) {
        handleSendMessage(randomTimer.message, 'DroidBot (Auto-Timer)', 'owner');
        if (randomTimer.soundEffect) {
          soundSynth.play(randomTimer.soundEffect as any);
        }
        setAutomationTimers((prev) =>
          prev.map((t) =>
            t.id === randomTimer.id ? { ...t, lastTriggered: now } : t
          )
        );
      }
    }, 45000);

    return () => clearInterval(timerInterval);
  }, [automationTimers]);

  // Full Workstation Backup & Restore Handlers
  const handleExportFullBackup = () => {
    const backupData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      streamMetadata,
      appSettings,
      obsConfig,
      shoutoutConfig,
      economy,
      personalities,
      customCommands,
      autoResponses,
      automationTimers,
      viewers,
      redeems,
      achievements
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `droidos-workstation-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    soundSynth.play('coin');
  };

  const handleImportBackupFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.streamMetadata) setStreamMetadata(json.streamMetadata);
        if (json.appSettings) setAppSettings(json.appSettings);
        if (json.obsConfig) setObsConfig(json.obsConfig);
        if (json.shoutoutConfig) setShoutoutConfig(json.shoutoutConfig);
        if (json.economy) setEconomy(json.economy);
        if (json.personalities) setPersonalities(json.personalities);
        if (json.customCommands) setCustomCommands(json.customCommands);
        if (json.autoResponses) setAutoResponses(json.autoResponses);
        if (json.automationTimers) setAutomationTimers(json.automationTimers);
        if (json.viewers) setViewers(json.viewers);
        if (json.redeems) setRedeems(json.redeems);
        if (json.achievements) setAchievements(json.achievements);

        soundSynth.play('victory');
        triggerOverlayEvent('custom', {
          title: 'BACKUP RESTORED',
          subtitle: 'Workstation state successfully imported!'
        });
      } catch (err) {
        soundSynth.play('airhorn');
      }
    };
    reader.readAsText(file);
  };

  const handleResetToDefaults = () => {
    setPersonalities(DEFAULT_PERSONALITIES);
    setViewers(DEFAULT_VIEWERS);
    setChatMessages(INITIAL_CHAT_MESSAGES);
    setObsConfig(DEFAULT_OBS_CONFIG);
    setStreamMetadata(DEFAULT_STREAM_METADATA);
    setShoutoutConfig(DEFAULT_SHOUTOUT_CONFIG);
    setEconomy(DEFAULT_ECONOMY_SETTINGS);
    setChatTriggers(DEFAULT_CHAT_TRIGGERS);
    setRedeems(DEFAULT_REDEEMS);
    setAchievements(DEFAULT_ACHIEVEMENTS);
    setCustomCommands(DEFAULT_CUSTOM_COMMANDS);
    setAutoResponses(DEFAULT_AUTO_RESPONSES);
    setAutomationTimers(DEFAULT_AUTOMATION_TIMERS);
    setAppSettings(DEFAULT_APP_SETTINGS);
    soundSynth.play('coin');
  };

  // Drag-to-Scroll Tab Bar Handlers (Mouse & Touch)
  const handleTabMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tabBarRef.current) return;
    setIsDraggingTabs(true);
    setDragStartX(e.pageX - tabBarRef.current.offsetLeft);
    setDragScrollLeft(tabBarRef.current.scrollLeft);
    setDragDistance(0);
  };

  const handleTabMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingTabs || !tabBarRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabBarRef.current.offsetLeft;
    const walk = (x - dragStartX) * 1.5;
    tabBarRef.current.scrollLeft = dragScrollLeft - walk;
    setDragDistance((prev) => prev + Math.abs(walk));
  };

  const handleTabMouseUp = () => {
    setIsDraggingTabs(false);
  };

  const handleTabClick = (tabId: string) => {
    if (dragDistance > 8) return;
    setActiveTab(tabId);
    soundSynth.play('coin');
  };

  // Viewer Management handlers
  const handleUpdateViewer = (updated: ViewerProfile) => {
    setViewers((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleDeleteViewer = (viewerId: string) => {
    setViewers((prev) => prev.filter((v) => v.id !== viewerId));
    soundSynth.play('coin');
  };

  const handleAddViewer = (newViewer: ViewerProfile) => {
    setViewers((prev) => [newViewer, ...prev]);
    soundSynth.play('victory');
  };

  // Tab definitions
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, badge: 'Live' },
    { id: 'chat', label: 'Live Chat', icon: MessageSquare, badge: (chatMessages?.length ?? 0).toString() },
    { id: 'personalities', label: 'Personalities', icon: Bot, badge: activePersonality.icon },
    { id: 'commands', label: 'Commands', icon: Terminal, badge: (customCommands?.length ?? 0).toString() },
    { id: 'responses', label: 'Auto-Responses', icon: MessageSquareCode, badge: (autoResponses?.length ?? 0).toString() },
    { id: 'automation', label: 'Timers', icon: Clock, badge: (automationTimers?.filter((t) => t.enabled)?.length ?? 0).toString() },
    { id: 'economy', label: 'Points & Economy', icon: Coins },
    { id: 'redeems', label: 'Redeems & Sounds', icon: Gift },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'games', label: 'Chat Games', icon: Gamepad2 },
    { id: 'viewers', label: 'Viewer Profiles', icon: Users, badge: (viewers?.length ?? 0).toString() },
    { id: 'plugins', label: 'Script Plugins', icon: Cpu, badge: (plugins?.filter((p) => p.enabled)?.length ?? 0).toString() },
    { id: 'obs', label: 'Connect your streaming app', icon: Video },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
    { id: 'help', label: 'Help Q&A', icon: HelpCircle },
  ];

  if (isLoadingData) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white"><div className="animate-pulse flex flex-col items-center gap-4"><Cpu className="w-12 h-12 text-purple-500" /><h2>Loading Workstation Data...</h2></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200">
      {/* Native Windows Titlebar */}
      <WindowsTitlebar
        title="DroidOS - Ultimate YouTube Stream Automation & OBS Workstation"
        streamTitle={streamMetadata.streamTitle}
        isLive={streamMetadata.isLive}
        obsConnected={obsConfig.connected}
        onOpenOverlayPreview={() => setShowOverlayPreviewModal(true)}
        onOpenDownloadTab={() => setActiveTab('windows-download')}
        onOpenDataFolder={() => fetch('http://localhost:3000/api/open-folder', { method: 'POST' }).catch(console.error)}
      />

      {/* Main Frosted Glass App Container */}
      <div className="flex-1 flex flex-col max-w-[1720px] w-full mx-auto px-3 sm:px-6 py-4 space-y-5">
        {/* Navigation Bar with Mouse Click-and-Hold Drag to Move */}
        <header className="rounded-2xl bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-2 shadow-[0_16px_36px_rgba(0,0,0,0.3)] sticky top-2 z-40">
          <div className="flex items-center justify-between gap-3">
            {/* Logo / Brand */}
            <div
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 px-3 py-1 shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <DroidOsLogo size="sm" showText={true} />
            </div>

            {/* Draggable Navigation Tabs Container */}
            <div
              ref={tabBarRef}
              onMouseDown={handleTabMouseDown}
              onMouseMove={handleTabMouseMove}
              onMouseUp={handleTabMouseUp}
              onMouseLeave={handleTabMouseUp}
              className={`flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar py-1 select-none transition-colors ${
                isDraggingTabs ? 'cursor-grabbing' : 'cursor-grab'
              }`}
              title="Click and drag with mouse to scroll tabs"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all select-none whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-purple-600/90 text-white shadow-lg shadow-purple-600/30 border border-purple-400/40 backdrop-blur-md'
                        : ('highlight' in tab && tab.highlight)
                        ? 'bg-gradient-to-r from-purple-500/15 to-cyan-500/15 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-white/[0.08] text-slate-300'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Action Buttons (Live Stage Preview & OBS Source) */}
            <div className="flex items-center gap-2 pr-2 shrink-0">
              <button
                onClick={() => setShowDataFolderModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/15 hover:bg-purple-600/30 text-purple-200 border border-purple-400/30 text-xs font-bold backdrop-blur-md transition-all cursor-pointer hover:scale-105 shadow-sm"
                title="Open Local Data Folder Explorer"
              >
                <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden xl:inline">Data Folder</span>
              </button>

              <button
                onClick={() => setShowOverlayPreviewModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-purple-200 border border-white/10 text-xs font-bold backdrop-blur-md transition-all cursor-pointer hover:scale-105 shadow-sm"
                title="Preview Shoutouts and Overlays Directly in App"
              >
                <Eye className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden xl:inline">Live Stage</span>
              </button>

              <a
                href="/overlay.html"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/10 text-xs font-semibold backdrop-blur-md transition-colors cursor-pointer"
                title="Open OBS Browser Source Overlay"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden xl:inline">OBS Source</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>
        </header>

        {/* Ko-fi Support Banner */}
        <KofiSupportBanner />

        {/* Global Floating Alert Notification Toast */}
        {activeAlert && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/40 shadow-2xl backdrop-blur-2xl flex items-center gap-3.5 max-w-md text-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-xl shrink-0">
                ✨
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-white truncate">{activeAlert.title}</div>
                <div className="text-slate-400 text-[11px] truncate">{activeAlert.subtitle}</div>
              </div>
              <button
                onClick={() => setActiveAlert(null)}
                className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Active Tab View */}
        <main className="flex-1">
          {activeTab === 'dashboard' && (
            <DashboardTab
              streamMetadata={streamMetadata}
              onUpdateStreamMetadata={setStreamMetadata}
              personalities={personalities}
              activePersonality={activePersonality}
              onSelectPersonality={(p) => setActivePersonalityId(typeof p === 'string' ? p : p.id)}
              obsConfig={obsConfig}
              onUpdateObsConfig={setObsConfig}
              shoutoutConfig={shoutoutConfig}
              onUpdateShoutoutConfig={setShoutoutConfig}
              viewers={viewers}
              chatMessages={chatMessages}
              economy={economy}
              onSendMessage={(txt) => handleSendMessage(txt, 'Streamer (Host)', 'owner')}
              onSwitchScene={(sceneName) => setObsConfig((prev) => ({ ...prev, currentScene: sceneName }))}
              onTriggerOverlayAlert={(type) =>
                triggerOverlayEvent(type, {
                  title: `${type.toUpperCase()} ALERT`,
                  subtitle: 'Live broadcast test preview triggered from Dashboard'
                })
              }
              onTriggerOverlayTest={(type) =>
                triggerOverlayEvent(type, {
                  title: `${type.toUpperCase()} TEST OVERLAY`,
                  subtitle: 'Live broadcast test preview triggered from Dashboard'
                })
              }
              onNavigateTab={(tabId) => setActiveTab(tabId)}
            />
          )}

          {activeTab === 'chat' && (
            <LiveChatMonitor
              chatMessages={chatMessages}
              onSendMessage={(txt, role, name) => handleSendMessage(txt, name || 'Streamer', role || 'owner')}
              viewers={viewers}
              onGivePoints={(username, amount) => {
                setViewers((prev) =>
                  prev.map((v) =>
                    v.username.toLowerCase() === username.toLowerCase()
                      ? { ...v, points: v.points + amount }
                      : v
                  )
                );
                soundSynth.play('coin');
              }}
              onRoastUser={(username) => {
                const roastLines = [
                  `Hey @${username}, your gaming reflexes are lagging more than a 56k modem! 🔥`,
                  `Alert to chat: @${username} just missed the easiest shot in stream history! 💀`,
                  `@${username} spent 5,000 points just to get eliminated in 2 seconds! 💥`
                ];
                const roast = roastLines[Math.floor(Math.random() * roastLines.length)];
                const botDisplayName = appSettings.botAccountName || 'DroidBot';
                handleSendMessage(roast, `${botDisplayName} (Roast)`, 'moderator');
                triggerOverlayEvent('custom', { title: 'ROAST DEPLOYED', subtitle: `@${username} got roasted!` });
              }}
              onShoutoutUser={(username) => {
                const botDisplayName = appSettings.botAccountName || 'DroidBot';
                handleSendMessage(`Huge shoutout to @${username}! Incredible chatter & stream supporter! ⭐`, botDisplayName, 'moderator');
                triggerOverlayEvent('shoutout', {
                  title: username,
                  subtitle: `Check out @${username} on YouTube!`,
                  username
                });
              }}
              activePersonality={activePersonality}
              economy={economy}
              isSimulating={isChatSimulating}
              onToggleSimulation={() => setIsChatSimulating((prev) => !prev)}
              streamMetadata={streamMetadata}
              settings={appSettings}
              onUpdateSettings={setAppSettings}
              onUpdateStreamMetadata={setStreamMetadata}
              onClearChat={() => setChatMessages([])}
            />
          )}

          {activeTab === 'personalities' && (
            <PersonalitiesTab
              personalities={personalities}
              activePersonality={activePersonality}
              onSelectPersonality={(p) => setActivePersonalityId(p.id)}
              onUpdatePersonality={(updated) =>
                setPersonalities((prev) =>
                  prev.map((p) => (p.id === updated.id ? updated : p))
                )
              }
              streamerName={streamMetadata.channelName}
              viewers={viewers}
            />
          )}

          {activeTab === 'commands' && (
            <CustomCommandsTab
              commands={customCommands}
              onAddCommand={(cmd) => setCustomCommands((prev) => [...prev, cmd])}
              onUpdateCommand={(cmd) =>
                setCustomCommands((prev) => prev.map((c) => (c.id === cmd.id ? cmd : c)))
              }
              onDeleteCommand={(id) => setCustomCommands((prev) => prev.filter((c) => c.id !== id))}
              onToggleCommand={(id) =>
                setCustomCommands((prev) =>
                  prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
                )
              }
              onTestCommand={(cmd) => {
                handleSendMessage(cmd.command, 'Moderator (Test)', 'moderator');
              }}
              onTriggerOverlayTest={(cmd) => {
                if (cmd.triggerOverlay && cmd.overlayType) {
                  const alertType =
                    cmd.overlayType === 'confetti'
                      ? 'effect_confetti'
                      : cmd.overlayType === 'fireworks'
                      ? 'effect_fireworks'
                      : cmd.overlayType === 'sparkles'
                      ? 'effect_sparkles'
                      : cmd.overlayType === 'banner'
                      ? 'achievement'
                      : cmd.overlayType;

                  triggerOverlayEvent(alertType as any, {
                    title: (cmd.overlayTitle || `${cmd.command.toUpperCase()} TRIGGERED`)
                      .replace(/\{user\}/g, 'PixelKnight')
                      .replace(/\{username\}/g, 'PixelKnight'),
                    subtitle: (cmd.overlaySubtitle || `Triggered by @PixelKnight`)
                      .replace(/\{user\}/g, 'PixelKnight')
                      .replace(/\{username\}/g, 'PixelKnight'),
                    soundPreset: cmd.soundEffect,
                    preset: cmd.overlayBannerPreset || 'xbox',
                    theme: cmd.overlayTheme || 'neon-cyber',
                    icon: cmd.overlayIcon || '🔥',
                    duration: cmd.overlayDurationSeconds || 6,
                    dropPreset: cmd.overlayDropPreset || 'coins',
                    customDropImageUrl: cmd.customDropImageUrl,
                    dropParticleCount: cmd.dropParticleCount || 75,
                    mediaType: cmd.mediaType,
                    mediaUrl: cmd.mediaUrl,
                    mediaPosition: cmd.mediaPosition || 'center',
                    mediaFit: cmd.mediaFit || 'contain',
                    mediaVolume: cmd.mediaVolume ?? 1,
                    chromaKey: cmd.chromaKey || 'none'
                  });
                }
              }}
              obsConfig={obsConfig}
              currencyName={economy.currencyName}
            />
          )}

          {activeTab === 'responses' && (
            <AutoResponsesTab
              responses={autoResponses}
              onAddResponse={(resp) => setAutoResponses((prev) => [...prev, resp])}
              onUpdateResponse={(resp) =>
                setAutoResponses((prev) => prev.map((r) => (r.id === resp.id ? resp : r)))
              }
              onDeleteResponse={(id) => setAutoResponses((prev) => prev.filter((r) => r.id !== id))}
              onToggleResponse={(id) =>
                setAutoResponses((prev) =>
                  prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
                )
              }
              streamerName={streamMetadata.channelName}
              gameCategory={streamMetadata.category}
              personalities={personalities}
            />
          )}

          {activeTab === 'automation' && (
            <AutomationTimersTab
              timers={automationTimers}
              onAddTimer={(t) => setAutomationTimers((prev) => [...prev, t])}
              onUpdateTimer={(t) =>
                setAutomationTimers((prev) => prev.map((timer) => (timer.id === t.id ? t : timer)))
              }
              onDeleteTimer={(id) => setAutomationTimers((prev) => prev.filter((t) => t.id !== id))}
              onToggleTimer={(id) =>
                setAutomationTimers((prev) =>
                  prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
                )
              }
              onTriggerTimerNow={(t) => {
                handleSendMessage(t.message, 'DroidBot (Auto-Timer)', 'owner');
                if (t.soundEffect) soundSynth.play(t.soundEffect as any);
              }}
            />
          )}

          {activeTab === 'economy' && (
            <PointsEconomyTab
              economy={economy}
              onUpdateEconomy={setEconomy}
              viewers={viewers}
              onAdjustPoints={(username, delta) => {
                setViewers((prev) =>
                  prev.map((v) =>
                    v.username.toLowerCase() === username.toLowerCase()
                      ? { ...v, points: Math.max(0, v.points + delta) }
                      : v
                  )
                );
              }}
              onMassAirdrop={(amount) => {
                setViewers((prev) => prev.map((v) => ({ ...v, points: v.points + amount })));
                if (economy.massDropOverlayEnabled !== false) {
                  triggerOverlayEvent('mass_drop', {
                    title: `MASS AIRDROP: ${economy.currencyName.toUpperCase()}`,
                    subtitle: `All active chatters received +${amount} ${economy.currencyName}!`,
                    points: amount,
                    dropPreset: economy.massDropPreset || 'coins',
                    customDropImageUrl: economy.customDropImageUrl,
                    dropParticleCount: economy.massDropParticleCount || 75,
                    duration: 6
                  });
                } else {
                  triggerOverlayEvent('confetti', {
                    title: 'MASS COIN AIRDROP',
                    subtitle: `Every chatter received +${amount} ${economy.currencyName}!`
                  });
                }
                handleSendMessage(`🎉 [AIRDROP] The streamer dropped +${amount} ${economy.currencyName} ${economy.currencySymbol} to everyone in the chat! Type !${economy.currencyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'points'} to check your updated wallet!`, 'DroidBot 🤖', 'moderator');
              }}
              onResetAllPoints={() => setViewers((prev) => prev.map((v) => ({ ...v, points: 0 })))}
            />
          )}

          {activeTab === 'redeems' && (
            <RedeemsSoundboardTab
              redeems={redeems}
              onAddRedeem={(item) => setRedeems((prev) => [...prev, item])}
              onUpdateRedeem={(updated) =>
                setRedeems((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
              }
              onDeleteRedeem={(id) => setRedeems((prev) => prev.filter((r) => r.id !== id))}
              onToggleRedeem={(id) =>
                setRedeems((prev) =>
                  prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
                )
              }
              onTriggerRedeemTest={(item) => {
                const isVideo = item.type === 'media_video' || item.mediaType === 'video';
                const isGif = item.type === 'media_gif' || item.mediaType === 'gif';
                triggerOverlayEvent(isVideo ? 'media_video' : isGif ? 'media_gif' : 'redeem', {
                  title: `REDEEM: ${item.name}`,
                  subtitle: `${item.cost} ${economy.currencyName} - ${item.description}`,
                  customMessage: item.caption || item.description,
                  mediaType: item.mediaType || (isVideo ? 'video' : isGif ? 'gif' : undefined),
                  mediaUrl: item.mediaUrl,
                  videoUrl: isVideo ? item.mediaUrl : undefined,
                  gifUrl: isGif ? item.mediaUrl : undefined,
                  mediaFit: item.mediaFit || 'contain',
                  mediaPosition: item.mediaPosition || 'center',
                  mediaVolume: item.mediaVolume ?? 1,
                  chromaKey: item.chromaKey || 'none',
                  caption: item.caption,
                  soundPreset: item.soundPreset,
                  duration: item.overlayDuration || 6
                });
              }}
              obsConfig={obsConfig}
              economy={economy}
              redeemQueue={redeemQueue}
              onClearQueue={() => setRedeemQueue([])}
            />
          )}

          {activeTab === 'achievements' && (
            <AchievementsTab
              achievements={achievements}
              viewers={viewers}
              onAddAchievement={(item) => setAchievements((prev) => [...prev, item])}
              onDeleteAchievement={(id) => setAchievements((prev) => prev.filter((a) => a.id !== id))}
              onTriggerAchievementAlert={(ach, username) => {
                const chatter = username || viewers[0]?.username || 'PixelKnight';
                triggerOverlayEvent('achievement', {
                  title: ach.title,
                  subtitle: ach.description,
                  description: ach.description,
                  preset: ach.bannerPreset,
                  points: ach.rewardPoints,
                  gamerscore: ach.gamerscore || 50,
                  trophyTier: ach.trophyTier || 'gold',
                  username: chatter
                });
              }}
              economy={economy}
            />
          )}

          {activeTab === 'games' && (
            <ChatGamesTab
              economy={economy}
              viewers={viewers}
              onUpdateViewers={setViewers}
              achievements={achievements}
              onUnlockAchievement={(achId, username) => {
                const targetAch = achievements.find((a) => a.id === achId);
                if (targetAch) {
                  // Increment unlock count
                  setAchievements((prev) =>
                    prev.map((a) => (a.id === achId ? { ...a, unlockedCount: (a.unlockedCount || 0) + 1 } : a))
                  );
                  // Trigger console banner
                  triggerOverlayEvent('achievement', {
                    title: targetAch.title,
                    subtitle: targetAch.description,
                    description: targetAch.description,
                    preset: targetAch.bannerPreset,
                    points: targetAch.rewardPoints,
                    gamerscore: targetAch.gamerscore || 50,
                    trophyTier: targetAch.trophyTier || 'gold',
                    username
                  });
                  // Reward chatter
                  setViewers((prev) =>
                    prev.map((v) =>
                      v.username.toLowerCase() === username.toLowerCase()
                        ? { ...v, points: v.points + targetAch.rewardPoints }
                        : v
                    )
                  );
                }
              }}
              onTriggerGameOverlay={(gameId, outcome, title, subtitle, extra) =>
                triggerOverlayEvent(gameId || 'game', {
                  title,
                  subtitle,
                  gameId,
                  outcome,
                  ...extra
                })
              }
            />
          )}

          {activeTab === 'viewers' && (
            <ViewerProfilesTab
              viewers={viewers}
              onUpdateViewer={handleUpdateViewer}
              onDeleteViewer={handleDeleteViewer}
              onAddViewer={handleAddViewer}
              economy={economy}
              personalities={personalities}
              autoResponses={autoResponses}
              settings={appSettings}
              onUpdateSettings={setAppSettings}
            />
          )}

          {activeTab === 'plugins' && (
            <ScriptPluginsTab
              plugins={plugins}
              onUpdatePlugins={setPlugins}
              viewers={viewers}
              economy={economy}
              streamerName={streamMetadata.channelName}
              onSendChatMessage={(text) => handleSendMessage(text, 'DroidBot 🤖', 'moderator')}
            />
          )}

          {activeTab === 'obs' && (
            <OBSIntegrationTab
              obsConfig={obsConfig}
              onUpdateObsConfig={setObsConfig}
              shoutoutConfig={shoutoutConfig}
              onUpdateShoutoutConfig={setShoutoutConfig}
              onTriggerAlert={(type, title, subtitle) =>
                triggerOverlayEvent(type, {
                  title: title || `OBS ALERT: ${type.toUpperCase()}`,
                  subtitle: subtitle || 'Broadcast signal previewed'
                })
              }
              onTriggerOverlayTest={(type, data) =>
                triggerOverlayEvent(type, data || {
                  title: `OBS OVERLAY TEST: ${type.toUpperCase()}`,
                  subtitle: `Visual overlay and audio cue previewed successfully.`
                })
              }
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={appSettings}
              onUpdateSettings={setAppSettings}
              streamMetadata={streamMetadata}
              onUpdateStreamMetadata={setStreamMetadata}
              obsConfig={obsConfig}
              onExportFullBackup={handleExportFullBackup}
              onImportBackupFile={handleImportBackupFile}
              onResetToDefaults={handleResetToDefaults}
              onOpenDataFolder={() => fetch('http://localhost:3000/api/open-folder', { method: 'POST' }).catch(console.error)}
              blacklistSettings={blacklistSettings}
              onUpdateBlacklistSettings={setBlacklistSettings}
              onOpenBotImporter={() => setIsBotImporterOpen(true)}
            />
          )}

          {activeTab === 'help' && (
            <HelpQATab />
          )}


        </main>

        {/* Frosted Glass Streamer Footer */}
        <footer className="rounded-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-4 sm:p-5 shadow-[0_12px_30px_rgba(0,0,0,0.3)] mt-6 text-xs text-slate-400">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <DroidOsLogo size="xs" />
              <div>
                <p className="font-bold text-white">DroidOS Stream Automation Workstation</p>
                <p className="text-[11px] text-slate-400">Built by <span className="text-purple-300 font-semibold">MRADDICTIVE</span> • Local-First Desktop App • Zero Cloud Telemetry</p>
              </div>
            </div>

            {/* Footer Navigation Links */}
            <div className="flex items-center gap-4 flex-wrap justify-center text-xs">
              <button
                onClick={() => setShowTermsModal(true)}
                className="hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                <Scale className="w-3.5 h-3.5 text-purple-400" />
                <span>Terms & Conditions (T&C)</span>
              </button>

              <span className="text-white/20">•</span>

              <button
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-cyan-300 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Privacy Policy</span>
              </button>

              <span className="text-white/20">•</span>

              <button
                onClick={() => setShowDataFolderModal(true)}
                className="hover:text-purple-300 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                <FolderOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Local AppData Folder</span>
              </button>

              <span className="text-white/20">•</span>

              <button
                onClick={() => setShowOverlayPreviewModal(true)}
                className="hover:text-pink-300 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold"
              >
                <Eye className="w-3.5 h-3.5 text-pink-400" />
                <span>In-App Overlay Preview</span>
              </button>

              <span className="text-white/20">•</span>

              <a
                href="https://ko-fi.com/mraddictive"
                target="_blank"
                rel="noreferrer"
                className="text-[#FF8E8B] hover:text-[#ffaba9] transition-colors flex items-center gap-1.5 font-bold"
              >
                <Coffee className="w-3.5 h-3.5 text-[#FF5E5B]" />
                <span>Support on Ko-fi</span>
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Terms & Conditions Modal */}
      <LegalTermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* Local AppData Folder Explorer Modal */}
      {showDataFolderModal && (
        <LocalDataFolderExplorer
          isOpen={showDataFolderModal}
          onClose={() => setShowDataFolderModal(false)}
          viewers={viewers}
          customCommands={customCommands}
          autoResponses={autoResponses}
          automationTimers={automationTimers}
          personalities={personalities}
          appSettings={appSettings}
          streamMetadata={streamMetadata}
          economy={economy}
          redeems={redeems}
          achievements={achievements}
          onClientSecretsApplied={(_result) => {
            const fresh = loadAllLocalData();
            setAppSettings(fresh.appSettings);
            setStreamMetadata(fresh.streamMetadata);
          }}
          onReloadData={() => {
            const fresh = loadAllLocalData();
            setViewers(fresh.viewers);
            setCustomCommands(fresh.customCommands);
            setAutoResponses(fresh.autoResponses);
            setAutomationTimers(fresh.automationTimers);
            setPersonalities(fresh.personalities);
            setAppSettings(fresh.appSettings);
            setStreamMetadata(fresh.streamMetadata);
            setEconomy(fresh.economy);
            soundSynth.play('coin');
          }}
        />
      )}

      {/* Direct In-App Overlay Stage Preview Modal */}
      {showOverlayPreviewModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0b0f19] border border-purple-500/40 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Direct Live Overlay & Shoutout Previewer</h3>
                  <p className="text-xs text-slate-400">Simulate full-resolution broadcast overlays directly in the app</p>
                </div>
              </div>

              <button
                onClick={() => setShowOverlayPreviewModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <LiveOverlayPreviewStage
              shoutoutConfig={shoutoutConfig}
              initialEvent={modalPreviewEvent}
              onClose={() => setShowOverlayPreviewModal(false)}
            />
          </div>
        </div>
      )}
      {/* Cross-Bot Commands & Settings Importer Modal */}
      {isBotImporterOpen && (
        <BotImporterModal
          isOpen={isBotImporterOpen}
          onClose={() => setIsBotImporterOpen(false)}
          onImportSuccess={(newCmds, newTimers, newResponses) => {
            if (newCmds.length > 0) {
              setCustomCommands((prev) => [...prev, ...newCmds]);
            }
            if (newTimers.length > 0) {
              setAutomationTimers((prev) => [...prev, ...newTimers]);
            }
            if (newResponses.length > 0) {
              setAutoResponses((prev) => [...prev, ...newResponses]);
            }
            soundSynth.play('victory');
          }}
        />
      )}
    </div>
  );
}
