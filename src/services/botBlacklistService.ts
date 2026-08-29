import { BlacklistSettings, IgnoredUserEntry, AppSettings } from '../types';

export const DEFAULT_KNOWN_BOTS = [
  'streamlabs',
  'nightbot',
  'mixitup',
  'mix it up',
  'streamelements',
  'moobot',
  'botisimo',
  'wizebot',
  'fossabot',
  'songbot',
  'coebot',
  'stay_hydrated_bot',
  'ankhbot',
  'deepbot',
  'firebot',
  'nightbot#0001',
  'streamlabs#0001',
  'streamelements#0001',
  'cloudbot',
  'soundalerts',
  'kofi_bot',
  'creators_bot'
];

export const DEFAULT_BLACKLIST_SETTINGS: BlacklistSettings = {
  ignoreSelf: true,
  ignoreKnownBots: true,
  knownBotsList: DEFAULT_KNOWN_BOTS,
  ignoredUsers: [
    {
      id: 'ig-1',
      username: 'Streamlabs',
      reason: 'Known external broadcast bot',
      addedAt: new Date().toISOString(),
      isBot: true
    },
    {
      id: 'ig-2',
      username: 'Nightbot',
      reason: 'Known external moderation bot',
      addedAt: new Date().toISOString(),
      isBot: true
    },
    {
      id: 'ig-3',
      username: 'MixItUp',
      reason: 'Known external stream bot',
      addedAt: new Date().toISOString(),
      isBot: true
    },
    {
      id: 'ig-4',
      username: 'StreamElements',
      reason: 'Known external loyalty bot',
      addedAt: new Date().toISOString(),
      isBot: true
    },
    {
      id: 'ig-5',
      username: 'Moobot',
      reason: 'Known external chat bot',
      addedAt: new Date().toISOString(),
      isBot: true
    }
  ],
  ignoreCommandPrefixesFromBots: true
};

const STORAGE_KEY_BLACKLIST = 'droidos_blacklist_settings';

export function loadBlacklistSettingsLocal(): BlacklistSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BLACKLIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_BLACKLIST_SETTINGS,
        ...parsed,
        knownBotsList: Array.from(new Set([...(parsed.knownBotsList || []), ...DEFAULT_KNOWN_BOTS])),
        ignoredUsers: parsed.ignoredUsers || DEFAULT_BLACKLIST_SETTINGS.ignoredUsers
      };
    }
  } catch (e) {
    console.warn('[DroidOS] Could not load blacklist settings from storage', e);
  }
  return DEFAULT_BLACKLIST_SETTINGS;
}

export function saveBlacklistSettingsLocal(settings: BlacklistSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_BLACKLIST, JSON.stringify(settings));
  } catch (e) {
    console.warn('[DroidOS] Could not save blacklist settings to storage', e);
  }
}

/**
 * Evaluates whether an incoming message from a given username should be ignored.
 * Checks self-identity, known bot lists, and custom user blacklists.
 */
export function isUserIgnoredOrBlacklisted(
  username: string,
  blacklist: BlacklistSettings = DEFAULT_BLACKLIST_SETTINGS,
  appSettings?: AppSettings
): { ignored: boolean; reason?: string } {
  if (!username) return { ignored: false };
  const lower = username.trim().toLowerCase().replace(/^@/, '');

  // 1. Check self-ignore (DroidBot, DroidOS, or configured bot name)
  if (blacklist.ignoreSelf) {
    const selfNames = ['droidbot', 'droidos', 'droidos bot', 'droidbot 🤖', 'system'];
    if (appSettings?.botAccountName) {
      selfNames.push(appSettings.botAccountName.trim().toLowerCase().replace(/^@/, ''));
    }
    if (appSettings?.botChannelHandle) {
      selfNames.push(appSettings.botChannelHandle.trim().toLowerCase().replace(/^@/, ''));
    }
    if (appSettings?.streamerName) {
      // Don't necessarily ignore streamer unless configured, but don't loop bot responses to streamer if self-replying
    }
    if (selfNames.includes(lower)) {
      return { ignored: true, reason: 'Self-response prevention (DroidBot/System account)' };
    }
  }

  // 2. Check known bots list
  if (blacklist.ignoreKnownBots) {
    const isKnownBot = (blacklist.knownBotsList || DEFAULT_KNOWN_BOTS).some((bot) => {
      const bLower = bot.toLowerCase();
      return lower === bLower || lower.includes(bLower);
    });

    if (isKnownBot) {
      return { ignored: true, reason: 'Known third-party stream bot (Streamlabs/Nightbot/MixItUp/etc.)' };
    }
  }

  // 3. Check custom ignored users
  const customMatch = (blacklist.ignoredUsers || []).find((entry) => {
    const entryLower = entry.username.trim().toLowerCase().replace(/^@/, '');
    return entryLower === lower;
  });

  if (customMatch) {
    return {
      ignored: true,
      reason: customMatch.reason || 'User is on DroidOS custom ignore blacklist'
    };
  }

  return { ignored: false };
}
