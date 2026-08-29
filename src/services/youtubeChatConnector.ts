import {
  ChatMessage,
  ViewerProfile,
  BotPersonality,
  StreamConnectionType,
  ConnectionStatus,
  UserRole
} from '../types';
import { recordApiCall, updateConnectionState, getQuotaMetrics } from './apiQuotaTracker';
import { interpolateTemplate } from './botEngine';

export interface ConnectorOptions {
  streamType: StreamConnectionType;
  targetIdOrUrl?: string;
  streamTitle?: string;
  channelName?: string;
  activePersonality: BotPersonality;
  viewers: ViewerProfile[];
  autoWelcomeViewers: boolean;
  autoWelcomeMode: 'all' | 'new_only' | 'returning_memory';
  memoryResponseChance: number;
  onReceiveMessage: (msg: ChatMessage) => void;
  onBotWelcomeMessage: (botMsg: ChatMessage, isReturning: boolean, customFactUsed?: string) => void;
  onStatusChange: (status: ConnectionStatus, message?: string) => void;
}

export class YouTubeChatConnector {
  private status: ConnectionStatus = 'disconnected';
  private streamType: StreamConnectionType = 'live';
  private targetIdOrUrl = '';
  private pollingTimer: any = null;
  private reconnectTimer: any = null;
  private isManuallyStopped = false;
  private greetedUsersThisSession = new Set<string>();
  private activePersonality!: BotPersonality;
  private viewers: ViewerProfile[] = [];
  private autoWelcomeViewers = true;
  private autoWelcomeMode: 'all' | 'new_only' | 'returning_memory' = 'all';
  private memoryResponseChance = 0.85;
  private pollingIntervalSeconds = 4;
  private consecutiveErrors = 0;
  private callbacks!: ConnectorOptions;

  constructor(options: ConnectorOptions) {
    this.updateConfig(options);
  }

  public updateConfig(options: Partial<ConnectorOptions>): void {
    if (options.activePersonality) this.activePersonality = options.activePersonality;
    if (options.viewers) this.viewers = options.viewers;
    if (options.streamType) this.streamType = options.streamType;
    if (options.targetIdOrUrl !== undefined) this.targetIdOrUrl = options.targetIdOrUrl;
    if (options.autoWelcomeViewers !== undefined) this.autoWelcomeViewers = options.autoWelcomeViewers;
    if (options.autoWelcomeMode !== undefined) this.autoWelcomeMode = options.autoWelcomeMode;
    if (options.memoryResponseChance !== undefined) this.memoryResponseChance = options.memoryResponseChance;
    this.callbacks = { ...this.callbacks, ...options };
  }

  /**
   * Connect persistently to the specified stream type (Live, Upcoming/Scheduled, or Unlisted/Private).
   * Once connected, it stays connected unless manually disconnected, fatal error, or stream ends.
   */
  public async connect(): Promise<void> {
    this.isManuallyStopped = false;
    this.consecutiveErrors = 0;
    this.clearTimers();

    const quota = getQuotaMetrics();
    if (quota.status === 'exhausted') {
      this.status = 'quota_exhausted';
      const errMsg = 'Cannot connect: Daily YouTube Data API quota is fully exhausted (10,000 / 10,000 units). Polling paused until midnight PST.';
      this.callbacks.onStatusChange('quota_exhausted', errMsg);
      updateConnectionState('quota_exhausted', { error: errMsg, streamType: this.streamType });
      return;
    }

    this.status = 'connecting';
    this.callbacks.onStatusChange('connecting', `Establishing persistent connection to ${this.getStreamTypeName()}...`);
    updateConnectionState('connecting', { streamType: this.streamType });

    try {
      // 1 unit for initial broadcast/stream lookup
      const lookupResult = recordApiCall('list_broadcasts');
      if (!lookupResult.success) {
        throw new Error('API Quota limit reached during stream verification.');
      }

      // Simulate stream resolution latency
      await new Promise((res) => setTimeout(res, 800));

      const streamLabel = this.targetIdOrUrl
        ? `Target Stream (${this.targetIdOrUrl.slice(0, 16)}...)`
        : this.streamType === 'upcoming'
        ? 'Scheduled Broadcast [Waiting Room]'
        : this.streamType === 'unlisted_private'
        ? 'Unlisted / Private Live Session'
        : 'Active Live Broadcast';

      this.status = 'connected';
      this.callbacks.onStatusChange('connected', `Connected to ${streamLabel}. Persistent listener active.`);
      updateConnectionState('connected', {
        streamType: this.streamType,
        streamTitle: streamLabel,
        liveChatId: `live-chat-${Date.now()}`,
        pollingIntervalSeconds: this.pollingIntervalSeconds
      });

      this.startPersistentPolling();
    } catch (err: any) {
      this.handleConnectionError(err.message || 'Failed to connect to stream chat');
    }
  }

  public disconnect(): void {
    this.isManuallyStopped = true;
    this.clearTimers();
    this.status = 'disconnected';
    this.callbacks.onStatusChange('disconnected', 'Live chat disconnected by broadcaster.');
    updateConnectionState('disconnected');
  }

  public getStatus(): ConnectionStatus {
    return this.status;
  }

  public getStreamTypeName(): string {
    switch (this.streamType) {
      case 'upcoming':
        return 'Scheduled / Upcoming Stream';
      case 'unlisted_private':
        return 'Unlisted or Private Stream';
      case 'live':
      default:
        return 'Live Stream Broadcast';
    }
  }

  public resetGreetedUsers(): void {
    this.greetedUsersThisSession.clear();
  }

  /**
   * Process a chatter's first message in this stream session and welcome them appropriately
   */
  public handleViewerFirstMessage(
    username: string,
    displayName: string,
    streamerName: string
  ): { welcomed: boolean; response?: string; isReturning: boolean; memoryFact?: string } {
    if (!this.autoWelcomeViewers) {
      return { welcomed: false, isReturning: false };
    }

    const cleanUsername = username.toLowerCase().replace('@', '').trim();
    if (this.greetedUsersThisSession.has(cleanUsername)) {
      return { welcomed: false, isReturning: false };
    }

    // Mark as greeted for this stream session
    this.greetedUsersThisSession.add(cleanUsername);

    // Look up viewer in database
    const existingViewer = this.viewers.find(
      (v) => v.username.toLowerCase() === cleanUsername || v.displayName.toLowerCase() === displayName.toLowerCase()
    );

    const isReturningViewer = Boolean(
      existingViewer &&
      (existingViewer.messageCount > 1 || (existingViewer.customFacts && existingViewer.customFacts.length > 0) || (existingViewer.visitStreak && existingViewer.visitStreak > 1))
    );

    // Filter by mode
    if (this.autoWelcomeMode === 'new_only' && isReturningViewer) {
      return { welcomed: false, isReturning: true };
    }
    if (this.autoWelcomeMode === 'returning_memory' && !isReturningViewer) {
      return { welcomed: false, isReturning: false };
    }

    const personality = this.activePersonality;
    let chosenText = '';
    let memoryFact: string | undefined = undefined;

    if (isReturningViewer && existingViewer) {
      // Returning viewer with memory responses
      const facts = existingViewer.customFacts || [];
      const hasFacts = facts.length > 0;
      const shouldUseMemory = hasFacts && Math.random() < this.memoryResponseChance;

      if (shouldUseMemory && facts.length > 0) {
        memoryFact = facts[Math.floor(Math.random() * facts.length)];
        
        // Pick a memory-infused response template
        const memoryPool = personality.memoryInfusedResponses && personality.memoryInfusedResponses.length > 0
          ? personality.memoryInfusedResponses
          : [
              `Welcome back @{username}! Great to see you again! (Still remember when you {custom_fact}!)`,
              `Hey @{username}! Look who returned! Last time you were here, {custom_fact}! Hope you have a great stream!`,
              `Welcome back in @{username}! I logged in my database that you {custom_fact}! Ready for today's broadcast?`
            ];
        
        const template = memoryPool[Math.floor(Math.random() * memoryPool.length)];
        chosenText = interpolateTemplate(template, {
          username: displayName || username,
          streamer_name: streamerName,
          custom_fact: memoryFact,
          user_points: existingViewer.points || 100
        });
      } else if (existingViewer.customGreeting) {
        // Custom greeting assigned to this specific viewer
        chosenText = interpolateTemplate(existingViewer.customGreeting, {
          username: displayName || username,
          streamer_name: streamerName,
          custom_fact: facts[0] || 'veteran viewer',
          user_points: existingViewer.points || 100
        });
      } else {
        // Standard returning greeting from personality bank
        const greetings = personality.greetingResponses && personality.greetingResponses.length > 0
          ? personality.greetingResponses
          : [`Welcome back @{username}! Good to see you in chat!`];
        const template = greetings[Math.floor(Math.random() * greetings.length)];
        chosenText = interpolateTemplate(template, {
          username: displayName || username,
          streamer_name: streamerName,
          custom_fact: facts[0] || 'returning friend',
          user_points: existingViewer.points || 100
        });
      }
    } else {
      // Brand new viewer: use Personality First-Contact / Greeting responses
      const greetings = personality.greetingResponses && personality.greetingResponses.length > 0
        ? personality.greetingResponses
        : [`Hey @{username}! Welcome in to the stream! Enjoy your time with us! ✨`];
      const template = greetings[Math.floor(Math.random() * greetings.length)];
      chosenText = interpolateTemplate(template, {
        username: displayName || username,
        streamer_name: streamerName,
        custom_fact: 'first-time viewer',
        user_points: 100
      });
    }

    return {
      welcomed: true,
      response: chosenText,
      isReturning: isReturningViewer,
      memoryFact
    };
  }

  private startPersistentPolling(): void {
    if (this.isManuallyStopped || this.status !== 'connected') return;

    this.pollingTimer = setTimeout(async () => {
      await this.pollCycle();
      if (!this.isManuallyStopped && this.status === 'connected') {
        this.startPersistentPolling();
      }
    }, this.pollingIntervalSeconds * 1000);
  }

  private async pollCycle(): Promise<void> {
    if (this.isManuallyStopped) return;

    // Check quota before making the 1-unit call
    const quota = getQuotaMetrics();
    if (quota.status === 'exhausted') {
      this.handleQuotaExhaustion();
      return;
    }

    try {
      // 1 unit for liveChatMessages.list
      const result = recordApiCall('list_chat');
      if (result.isExhausted) {
        this.handleQuotaExhaustion();
        return;
      }

      this.consecutiveErrors = 0;
      // In a real broadcast, messages are parsed from YouTube API v3 response.
      // Quota Tracker is updated and connection stays alive.
    } catch (err: any) {
      this.consecutiveErrors++;
      if (this.consecutiveErrors > 3) {
        this.handleConnectionError(err.message || 'Repeated polling failure');
      }
    }
  }

  private handleQuotaExhaustion(): void {
    this.clearTimers();
    this.status = 'quota_exhausted';
    const errMsg = 'YouTube API Quota Limit Exceeded (10,000 / 10,000 units consumed). Bot polling paused to avoid account suspension. Quota resets at 00:00 PST.';
    this.callbacks.onStatusChange('quota_exhausted', errMsg);
    updateConnectionState('quota_exhausted', { error: errMsg });
  }

  private handleConnectionError(errorMsg: string): void {
    this.clearTimers();
    if (this.isManuallyStopped) return;

    this.status = 'reconnecting';
    const backoffSec = Math.min(30, 3 * Math.pow(1.5, this.consecutiveErrors));
    const msg = `Connection dropped (${errorMsg}). Auto-reconnecting in ${Math.round(backoffSec)}s...`;
    this.callbacks.onStatusChange('reconnecting', msg);
    updateConnectionState('reconnecting', { error: errorMsg });

    this.reconnectTimer = setTimeout(() => {
      if (!this.isManuallyStopped) {
        this.connect();
      }
    }, backoffSec * 1000);
  }

  private clearTimers(): void {
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
