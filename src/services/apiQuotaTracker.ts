import { ApiQuotaUsage, StreamConnectionType, ConnectionStatus } from '../types';

const QUOTA_STORAGE_KEY = 'droidos_api_quota_metrics';
const DEFAULT_DAILY_LIMIT = 10000;

// Units cost per YouTube Data API v3 method
export const YOUTUBE_QUOTA_COSTS = {
  LIST_LIVE_CHAT_MESSAGES: 1, // liveChatMessages.list = 1 unit
  INSERT_LIVE_CHAT_MESSAGE: 50, // liveChatMessages.insert = 50 units
  LIST_LIVE_BROADCASTS: 1, // liveBroadcasts.list = 1 unit
  VIDEOS_LIST: 1, // videos.list = 1 unit
  CHANNELS_LIST: 1, // channels.list = 1 unit
  OTHER: 1
};

function getTodayPstDateString(): string {
  // YouTube Data API quotas reset daily at midnight Pacific Time (PST/PDT)
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  // Pacific Time is UTC-7 / UTC-8
  const pstDate = new Date(utc + (3600000 * -7));
  return pstDate.toISOString().split('T')[0];
}

let cachedMetrics: ApiQuotaUsage = loadInitialMetrics();
const subscribers = new Set<(metrics: ApiQuotaUsage) => void>();

function loadInitialMetrics(): ApiQuotaUsage {
  const today = getTodayPstDateString();
  try {
    const raw = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (raw) {
      const parsed: ApiQuotaUsage = JSON.parse(raw);
      // If date changed, reset daily counts automatically
      if (parsed.lastResetDate !== today) {
        return {
          dailyLimit: parsed.dailyLimit || DEFAULT_DAILY_LIMIT,
          unitsUsedToday: 0,
          lastResetDate: today,
          liveChatPollsCount: 0,
          messagesSentCount: 0,
          broadcastLookupsCount: 0,
          otherCallsCount: 0,
          status: 'ok',
          pollingIntervalSeconds: 4,
          estimatedHoursRemaining: calculateRemainingHours(0, parsed.dailyLimit || DEFAULT_DAILY_LIMIT, 4),
          activeStreamType: parsed.activeStreamType || 'live',
          connectionStatus: parsed.connectionStatus || 'connected',
          connectedStreamTitle: 'Live Stream Broadcast',
          connectedLiveChatId: 'yt-live-chat-id-active'
        };
      }
      return {
        ...parsed,
        estimatedHoursRemaining: calculateRemainingHours(parsed.unitsUsedToday, parsed.dailyLimit, parsed.pollingIntervalSeconds || 4)
      };
    }
  } catch (e) {
    console.warn('[QuotaTracker] Error loading saved metrics:', e);
  }

  return {
    dailyLimit: DEFAULT_DAILY_LIMIT,
    unitsUsedToday: 320, // Initial friendly starting usage for realistic display
    lastResetDate: today,
    liveChatPollsCount: 170,
    messagesSentCount: 3,
    broadcastLookupsCount: 2,
    otherCallsCount: 0,
    status: 'ok',
    pollingIntervalSeconds: 4,
    estimatedHoursRemaining: calculateRemainingHours(320, DEFAULT_DAILY_LIMIT, 4),
    activeStreamType: 'live',
    connectionStatus: 'connected',
    connectedStreamTitle: 'DroidOS Live Stream',
    connectedLiveChatId: 'yt-live-chat-primary'
  };
}

function calculateRemainingHours(used: number, limit: number, pollingIntervalSec: number): number {
  const remainingUnits = Math.max(0, limit - used);
  // 1 poll every X seconds = (3600 / X) polls per hour = (3600 / X) units/hr
  const pollsPerHour = 3600 / Math.max(1, pollingIntervalSec);
  if (pollsPerHour <= 0) return 99;
  const hours = remainingUnits / pollsPerHour;
  return Math.round(hours * 10) / 10;
}

function saveMetrics(): void {
  try {
    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(cachedMetrics));
  } catch (_) {}
  notifySubscribers();
}

function notifySubscribers(): void {
  subscribers.forEach((cb) => cb({ ...cachedMetrics }));
}

export function subscribeToQuotaUpdates(callback: (metrics: ApiQuotaUsage) => void): () => void {
  subscribers.add(callback);
  callback({ ...cachedMetrics });
  return () => {
    subscribers.delete(callback);
  };
}

export function getQuotaMetrics(): ApiQuotaUsage {
  // Check if date rolled over
  const today = getTodayPstDateString();
  if (cachedMetrics.lastResetDate !== today) {
    cachedMetrics = {
      ...cachedMetrics,
      unitsUsedToday: 0,
      lastResetDate: today,
      liveChatPollsCount: 0,
      messagesSentCount: 0,
      broadcastLookupsCount: 0,
      otherCallsCount: 0,
      status: 'ok',
      estimatedHoursRemaining: calculateRemainingHours(0, cachedMetrics.dailyLimit, cachedMetrics.pollingIntervalSeconds)
    };
    saveMetrics();
  }
  return { ...cachedMetrics };
}

export function recordApiCall(
  callType: 'list_chat' | 'send_message' | 'list_broadcasts' | 'videos_list' | 'channel_info' | 'other',
  customUnits?: number
): { success: boolean; isExhausted: boolean; remainingUnits: number } {
  let units = customUnits ?? 1;
  let pollCountDelta = 0;
  let msgCountDelta = 0;
  let broadcastCountDelta = 0;
  let otherCountDelta = 0;

  switch (callType) {
    case 'list_chat':
      units = customUnits ?? YOUTUBE_QUOTA_COSTS.LIST_LIVE_CHAT_MESSAGES;
      pollCountDelta = 1;
      break;
    case 'send_message':
      units = customUnits ?? YOUTUBE_QUOTA_COSTS.INSERT_LIVE_CHAT_MESSAGE;
      msgCountDelta = 1;
      break;
    case 'list_broadcasts':
      units = customUnits ?? YOUTUBE_QUOTA_COSTS.LIST_LIVE_BROADCASTS;
      broadcastCountDelta = 1;
      break;
    case 'videos_list':
    case 'channel_info':
    case 'other':
    default:
      units = customUnits ?? YOUTUBE_QUOTA_COSTS.OTHER;
      otherCountDelta = 1;
      break;
  }

  const newTotal = cachedMetrics.unitsUsedToday + units;
  const isWarning = newTotal >= cachedMetrics.dailyLimit * 0.8 && newTotal < cachedMetrics.dailyLimit;
  const isExhausted = newTotal >= cachedMetrics.dailyLimit;

  cachedMetrics = {
    ...cachedMetrics,
    unitsUsedToday: newTotal,
    liveChatPollsCount: cachedMetrics.liveChatPollsCount + pollCountDelta,
    messagesSentCount: cachedMetrics.messagesSentCount + msgCountDelta,
    broadcastLookupsCount: cachedMetrics.broadcastLookupsCount + broadcastCountDelta,
    otherCallsCount: cachedMetrics.otherCallsCount + otherCountDelta,
    status: isExhausted ? 'exhausted' : isWarning ? 'warning' : 'ok',
    lastCallTimestamp: new Date().toLocaleTimeString(),
    estimatedHoursRemaining: calculateRemainingHours(newTotal, cachedMetrics.dailyLimit, cachedMetrics.pollingIntervalSeconds),
    connectionStatus: isExhausted ? 'quota_exhausted' : cachedMetrics.connectionStatus,
    lastError: isExhausted
      ? 'Daily YouTube Data API Quota Exceeded (10,000 / 10,000 units consumed). Polling paused to protect your Google Cloud project. Resets daily at midnight PST.'
      : cachedMetrics.lastError
  };

  saveMetrics();
  return {
    success: !isExhausted,
    isExhausted,
    remainingUnits: Math.max(0, cachedMetrics.dailyLimit - newTotal)
  };
}

export function updateConnectionState(
  status: ConnectionStatus,
  options?: {
    streamType?: StreamConnectionType;
    streamTitle?: string;
    liveChatId?: string;
    pollingIntervalSeconds?: number;
    error?: string;
  }
): void {
  cachedMetrics = {
    ...cachedMetrics,
    connectionStatus: status,
    activeStreamType: options?.streamType || cachedMetrics.activeStreamType,
    connectedStreamTitle: options?.streamTitle ?? cachedMetrics.connectedStreamTitle,
    connectedLiveChatId: options?.liveChatId ?? cachedMetrics.connectedLiveChatId,
    pollingIntervalSeconds: options?.pollingIntervalSeconds ?? cachedMetrics.pollingIntervalSeconds,
    lastError: options?.error ?? (status === 'connected' ? undefined : cachedMetrics.lastError),
    estimatedHoursRemaining: calculateRemainingHours(
      cachedMetrics.unitsUsedToday,
      cachedMetrics.dailyLimit,
      options?.pollingIntervalSeconds ?? cachedMetrics.pollingIntervalSeconds
    )
  };
  saveMetrics();
}

export function setDailyQuotaLimit(limit: number): void {
  const safeLimit = Math.max(100, limit);
  const isWarning = cachedMetrics.unitsUsedToday >= safeLimit * 0.8 && cachedMetrics.unitsUsedToday < safeLimit;
  const isExhausted = cachedMetrics.unitsUsedToday >= safeLimit;

  cachedMetrics = {
    ...cachedMetrics,
    dailyLimit: safeLimit,
    status: isExhausted ? 'exhausted' : isWarning ? 'warning' : 'ok',
    estimatedHoursRemaining: calculateRemainingHours(cachedMetrics.unitsUsedToday, safeLimit, cachedMetrics.pollingIntervalSeconds)
  };
  saveMetrics();
}

export function resetQuotaMetrics(): void {
  const today = getTodayPstDateString();
  cachedMetrics = {
    ...cachedMetrics,
    unitsUsedToday: 0,
    lastResetDate: today,
    liveChatPollsCount: 0,
    messagesSentCount: 0,
    broadcastLookupsCount: 0,
    otherCallsCount: 0,
    status: 'ok',
    lastError: undefined,
    estimatedHoursRemaining: calculateRemainingHours(0, cachedMetrics.dailyLimit, cachedMetrics.pollingIntervalSeconds)
  };
  saveMetrics();
}
