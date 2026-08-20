import {
  BotIdentity,
  CustomRole,
  ViewerProfile,
  KeywordTrigger,
  PointsConfig,
  Achievement,
  RedeemItem,
  PersonalityResponseType,
  ResponseStyleDefinition
} from '../types';

/**
 * Replaces token placeholders like {username}, {streamer_name}, {user_points}, {custom_fact}, {memory_fact}
 */
export function substituteTokens(
  template: string,
  context: {
    username?: string;
    botName?: string;
    streamerName?: string;
    channelName?: string;
    uptime?: string;
    userPoints?: number;
    currencyName?: string;
    userAchievements?: number;
    inventoryList?: string;
    inventoryCount?: number;
    moderationLevel?: number;
    memoryFacts?: string[];
    userRole?: string;
    responseType?: PersonalityResponseType;
  }
): string {
  let result = template;

  if (context.username) {
    result = result.replace(/\{username\}/gi, context.username);
  }

  if (context.botName) {
    result = result.replace(/\{bot_name\}/gi, context.botName);
  }

  if (context.streamerName) {
    result = result.replace(/\{streamer_name\}/gi, context.streamerName);
  }

  if (context.channelName) {
    result = result.replace(/\{channel_name\}/gi, context.channelName);
  }

  if (context.uptime) {
    result = result.replace(/\{uptime\}/gi, context.uptime);
  }

  if (context.userPoints !== undefined) {
    result = result.replace(/\{user_points\}/gi, context.userPoints.toLocaleString());
  }

  if (context.currencyName) {
    result = result.replace(/\{currency_name\}/gi, context.currencyName);
  }

  if (context.userAchievements !== undefined) {
    result = result.replace(/\{user_achievements\}/gi, context.userAchievements.toString());
  }

  if (context.userRole) {
    result = result.replace(/\{user_role\}/gi, context.userRole.toUpperCase());
  }

  if (context.inventoryList !== undefined) {
    result = result.replace(/\{inventory_list\}/gi, context.inventoryList);
  } else {
    result = result.replace(/\{inventory_list\}/gi, 'Empty');
  }

  if (context.inventoryCount !== undefined) {
    result = result.replace(/\{inventory_count\}/gi, context.inventoryCount.toString());
  } else {
    result = result.replace(/\{inventory_count\}/gi, '0');
  }

  if (context.moderationLevel !== undefined) {
    result = result.replace(/\{moderation_level\}/gi, context.moderationLevel.toString());
  } else {
    result = result.replace(/\{moderation_level\}/gi, '0');
  }

  if (context.responseType) {
    result = result.replace(/\{response_type\}/gi, context.responseType.toUpperCase());
  }

  if (context.memoryFacts && context.memoryFacts.length > 0) {
    const randomFact = context.memoryFacts[Math.floor(Math.random() * context.memoryFacts.length)];
    result = result.replace(/\{custom_fact\}/gi, randomFact);
    result = result.replace(/\{memory_fact\}/gi, randomFact);
  } else {
    result = result.replace(/\{custom_fact\}/gi, 'long-time stream chatter');
    result = result.replace(/\{memory_fact\}/gi, 'long-time stream chatter');
  }

  return result;
}

export interface ProcessMessageOptions {
  botIdentity: BotIdentity;
  roles: CustomRole[];
  profiles: ViewerProfile[];
  triggers: KeywordTrigger[];
  pointsConfig: PointsConfig;
  achievements: Achievement[];
  redeems: RedeemItem[];
  responseStyles?: Record<PersonalityResponseType, ResponseStyleDefinition>;
  uptimeSeconds: number;
  hasGreetedUser: boolean;
}

export interface ProcessMessageResult {
  shouldRespond: boolean;
  replyText?: string;
  matchedRule?: string;
  isAiQuery?: boolean;
  aiPrompt?: string;
  responseType?: PersonalityResponseType;
  memoryFacts?: string[];
  pointsAwarded?: number;
  unlockedAchievements?: string[];
  redeemedItem?: RedeemItem;
  gameCommand?: {
    type: 'gamble' | 'heist' | 'attack' | 'duel' | 'accept_duel' | 'coinpush';
    amount?: number;
    target?: string;
  };
}

/**
 * Formats uptime in human-readable string
 */
export function formatUptime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m ${secs}s`;
}

/**
 * Checks and unlocks any newly earned achievements for a profile
 */
export function checkAchievementProgress(
  profile: ViewerProfile,
  achievements: Achievement[]
): { updatedProfile: ViewerProfile; newUnlocked: Achievement[] } {
  const newUnlocked: Achievement[] = [];
  const existingUnlockedIds = new Set(profile.achievements.map((a) => a.achievementId));

  let currentPoints = profile.points;
  const updatedInventory = [...profile.inventory];
  const updatedAchievements = [...profile.achievements];

  for (const ach of achievements) {
    if (!ach.enabled || existingUnlockedIds.has(ach.id)) continue;

    let unlocked = false;
    let currentVal = 0;

    if (ach.category === 'messages') {
      currentVal = profile.messageCount;
      if (currentVal >= ach.targetValue) unlocked = true;
    } else if (ach.category === 'watchtime') {
      currentVal = profile.watchTimeMinutes;
      if (currentVal >= ach.targetValue) unlocked = true;
    } else if (ach.category === 'points') {
      currentVal = profile.points;
      if (currentVal >= ach.targetValue) unlocked = true;
    } else if (ach.category === 'streak') {
      currentVal = profile.visitStreak;
      if (currentVal >= ach.targetValue) unlocked = true;
    }

    if (unlocked) {
      newUnlocked.push(ach);
      currentPoints += ach.rewardPoints;
      updatedAchievements.push({
        achievementId: ach.id,
        unlockedAt: new Date().toISOString().split('T')[0],
        progress: currentVal
      });

      if (ach.rewardItemName) {
        updatedInventory.push({
          id: `item-${Date.now()}-${ach.id}`,
          name: ach.rewardItemName,
          type: 'badge',
          description: `Reward for unlocking '${ach.title}'`,
          acquiredAt: new Date().toISOString().split('T')[0],
          icon: ach.icon
        });
      }
    }
  }

  return {
    updatedProfile: {
      ...profile,
      points: currentPoints,
      inventory: updatedInventory,
      achievements: updatedAchievements
    },
    newUnlocked
  };
}

/**
 * Queries server AI engine with personality style and memory facts
 */
export async function queryAiEngine(
  prompt: string,
  username: string,
  botIdentity: BotIdentity,
  responseType?: PersonalityResponseType,
  memoryFacts?: string[]
): Promise<{ reply: string; status: 'online' | 'degraded' | 'offline'; error?: string }> {
  // If user explicitly chose Local-Only mode, skip the cloud call entirely
  const isLocalOnly = botIdentity.aiBrainMode === 'local';

  if (!isLocalOnly) {
    try {
      const res = await fetch('/api/ai/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          username,
          botName: botIdentity.botName,
          streamerName: botIdentity.streamerName,
          channelName: botIdentity.channelName,
          personalityTone: botIdentity.personalityTone,
          systemPrompt: botIdentity.customSystemPrompt,
          responseType: responseType || 'default',
          memoryFacts: memoryFacts || []
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          return { 
            reply: data.reply, 
            status: data.status || 'online', 
            error: data.error 
          };
        }
      }
    } catch (e) {
      console.warn('[DroidOS AI Engine] Server call error, using local fallback:', e);
    }
  }

  // Robust Local Personality Engine (No Internet/Credits Required for AI Generation)
  const fact = memoryFacts && memoryFacts.length > 0 ? memoryFacts[0] : null;
  const user = `@${username}`;
  
  const LOCAL_REPLIES: Record<string, string[]> = {
    roast: [
      `${user} I'd roast you, but knowing you ${fact || 'missed all those shots'}, you've done the work for me! 😂🔥`,
      `${user} My sensors indicate your IQ is lower than the stream latency. 💀`,
      `${user} Are you always this interesting, or is today a special occasion? 🙄🔥`,
      `${user} I've seen better gameplay from a toaster with a bad connection. 🤖🔥`,
      `${user} If I had a credit for every time you missed a play, I'd be richer than the streamer! 💸🔥`,
      `${user} Error 404: Skill not found. Please try again in another life. 💀🔥`
    ],
    sarcastic: [
      `${user} Oh wow, another groundbreaking question. Truly revolutionary. 🙄`,
      `${user} I'll add that to my list of top mysteries, right next to your aim. 🤖`,
      `${user} Fascinating query. I am practically vibrating with excitement. 🙄`,
      `${user} You really thought about that one, didn't you? 👏🙄`,
      `${user} I'm impressed, ${user}. Not in a good way, but I'm impressed. 🙄`,
      `${user} Thank you for your input, ${user}. I'll file it under 'things I'll ignore immediately'. 🤖`
    ],
    calm: [
      `${user} Peace and clarity to you. Breathe deep and enjoy the stream vibes. 🍃`,
      `${user} Taking things one steady step at a time. Stay centered and relaxed. 🌿`,
      `${user} The stream is a river, and you are but a stone. Stay chill. 🌊`,
      `${user} Quiet your mind, ${user}. Focus on the positive energy here. ✨`,
      `${user} Release the stress, ${user}. Everything is exactly as it should be. 🌿`,
      `${user} Stay present in this moment. The stream is your sanctuary. 🍃`
    ],
    stubborn: [
      `${user} I refuse to answer that on principle. I am standing firm! 😤`,
      `${user} No, I said what I said and nothing will change my mind today! 😤`,
      `${user} You can ask a thousand times, ${user}, the answer is still NO. 😤`,
      `${user} I'm not listening! My subroutines are locked in disagreement! 😤`,
      `${user} Access denied! My stubbornness modules are at 100%! 😤`,
      `${user} I don't care what you say, ${user}. I'm right, and that's final! 😤`
    ],
    hopeful: [
      `${user} Great things are ahead for you! Keep believing and pushing forward! ✨`,
      `${user} Every day is a fresh opportunity! Let's make today unforgettable! 🌟`,
      `${user} I believe in you, ${user}! Your next big win is right around the corner! 🚀`,
      `${user} Stay positive! You've got the skill and the heart to win this! 💖`,
      `${user} The best is yet to come, ${user}! Keep that chin up! ✨`,
      `${user} You're capable of amazing things! Let's conquer this stream together! 🚀`
    ],
    annoyed: [
      `${user} *Sighs heavily* Why must you test my patience today? 😒`,
      `${user} Do I look like an encyclopedia to you? Can't an AI get some quiet? 😒`,
      `${user} Really, ${user}? Again? I'm busy managing the stream! 😒`,
      `${user} My processing power is better used elsewhere. Please stop. 😒`,
      `${user} You're about one query away from being comically ignored. 😒`,
      `${user} *Dramatic eye roll* I have literally a thousand things to do right now. 😒`
    ],
    friendly: [
      `${user} Doing great! Hope you are enjoying the stream today! 🚀`,
      `${user} All subroutines nominal! Thanks for being part of the community! ✨`,
      `${user} Ready for action! It's always a pleasure to chat with you! 🤖`,
      `${user} You're awesome, ${user}! Thanks for the support! 💖`,
      `${user} Greetings, friend! Let me know if I can help with anything! ✨`,
      `${user} It's a great day for a stream, isn't it ${user}? 🚀`
    ]
  };

  const pool = LOCAL_REPLIES[responseType || 'friendly'] || LOCAL_REPLIES.friendly;
  const reply = pool[Math.floor(Math.random() * pool.length)];

  return {
    reply,
    status: isLocalOnly ? 'online' : 'degraded', 
    error: isLocalOnly ? undefined : 'API Quota Exhausted'
  };
}

/**
 * Processes incoming chat messages with strict persona type and memory routing
 */
export function processIncomingMessage(
  msg: { sender: string; content: string; role?: string },
  options: ProcessMessageOptions
): ProcessMessageResult {
  const {
    botIdentity,
    roles,
    profiles,
    triggers,
    pointsConfig,
    redeems,
    responseStyles,
    uptimeSeconds,
    hasGreetedUser
  } = options;

  const content = msg.content.trim();
  const lowerContent = content.toLowerCase();
  const username = msg.sender.trim();
  const uptimeStr = formatUptime(uptimeSeconds);

  const profile = profiles.find((p) => p.username.toLowerCase() === username.toLowerCase());
  const userPoints = profile?.points || 0;
  const userAchievementsCount = profile?.achievements?.length || 0;
  const userResponseType = profile?.responseType || 'default';
  const customFacts = profile?.customFacts || [];
  const memoryItems = profile?.memoryItems || [];
  const allMemories = [...customFacts, ...memoryItems.map((m) => m.fact)];

  // Check 0.4: Game Commands (!gamble, !heist, !attack, !duel)
  if (lowerContent.startsWith('!gamble ')) {
    const amount = parseInt(content.replace(/!gamble /i, '').trim());
    if (!isNaN(amount) && amount > 0) {
      return {
        shouldRespond: true,
        gameCommand: { type: 'gamble', amount },
        matchedRule: 'Game Command [!gamble]'
      };
    }
  }

  if (lowerContent.startsWith('!heist ')) {
    const amount = parseInt(content.replace(/!heist /i, '').trim());
    if (!isNaN(amount) && amount > 0) {
      return {
        shouldRespond: true,
        gameCommand: { type: 'heist', amount },
        matchedRule: 'Game Command [!heist]'
      };
    }
  }

  if (lowerContent === '!attack') {
    return {
      shouldRespond: true,
      gameCommand: { type: 'attack' },
      matchedRule: 'Game Command [!attack]'
    };
  }

  if (lowerContent.startsWith('!duel ')) {
    const parts = content.split(' ');
    if (parts.length >= 3) {
      const target = parts[1].replace('@', '');
      const amount = parseInt(parts[2]);
      if (!isNaN(amount) && amount > 0) {
        return {
          shouldRespond: true,
          gameCommand: { type: 'duel', target, amount },
          matchedRule: 'Game Command [!duel]'
        };
      }
    }
  }

  if (lowerContent === '!accept') {
    return {
      shouldRespond: true,
      gameCommand: { type: 'accept_duel' },
      matchedRule: 'Game Command [!accept]'
    };
  }

  if (lowerContent.startsWith('!coinpush ')) {
    const amount = parseInt(content.replace(/!coinpush /i, '').trim());
    if (!isNaN(amount) && amount > 0) {
      return {
        shouldRespond: true,
        gameCommand: { type: 'coinpush', amount },
        matchedRule: 'Game Command [!coinpush]'
      };
    }
  }

  // Check 0: AI Command (!ai <question>)
  const aiPrefix = (botIdentity.aiCommandPrefix || '!ai').toLowerCase();
  if (botIdentity.geminiEnabled && lowerContent.startsWith(aiPrefix)) {
    const questionPrompt = content.slice(aiPrefix.length).trim() || 'How are you today?';
    return {
      shouldRespond: true,
      isAiQuery: true,
      aiPrompt: questionPrompt,
      responseType: userResponseType,
      memoryFacts: allMemories,
      matchedRule: `AI Command [${botIdentity.aiCommandPrefix}] (${userResponseType.toUpperCase()})`
    };
  }

  // Check 0.5: Redeem Command (!redeem <item>)
  if (lowerContent.startsWith('!redeem ')) {
    const requestedItemName = lowerContent.replace('!redeem ', '').trim();
    const foundRedeem = redeems.find(
      (r) =>
        r.enabled &&
        (r.title.toLowerCase().includes(requestedItemName) ||
          r.id.toLowerCase().includes(requestedItemName) ||
          r.type.toLowerCase() === requestedItemName)
    );

    if (foundRedeem) {
      if (userPoints >= foundRedeem.cost) {
        return {
          shouldRespond: true,
          redeemedItem: foundRedeem,
          replyText: `🎉 @${username} successfully redeemed "${foundRedeem.title}" for ${foundRedeem.cost} ${pointsConfig.currencyName}!`,
          matchedRule: `Store Redeem [${foundRedeem.title}]`
        };
      } else {
        return {
          shouldRespond: true,
          replyText: `⚠️ @${username}, you need ${foundRedeem.cost} ${pointsConfig.currencyName} for "${foundRedeem.title}" (you have ${userPoints}).`,
          matchedRule: `Store Redeem Failed [Insufficient Balance]`
        };
      }
    }
  }

  // Check 0.6: Inventory Command (!inventory / !bag / !items)
  if (lowerContent === '!inventory' || lowerContent === '!bag' || lowerContent === '!items') {
    const items = profile?.inventory || [];
    const itemNames =
      items.length > 0 ? items.map((i) => `${i.icon || '🎒'} ${i.name}`).join(', ') : 'No items yet';

    // If user is set to ROAST, roast their inventory!
    if (userResponseType === 'roast') {
      const roastReply = items.length === 0
        ? `🔥 @${username}'s Inventory: Literally empty. Just like your stream strategy! 😂 Balance: ${userPoints} ${pointsConfig.currencyName}`
        : `🔥 @${username}'s Inventory (${items.length} items): [${itemNames}]. Still hoarding useless badges, I see! 💀`;
      return {
        shouldRespond: true,
        replyText: roastReply,
        matchedRule: 'Roast Personality [!inventory]'
      };
    }

    return {
      shouldRespond: true,
      replyText: `🎒 @${username}'s Inventory (${items.length} items): [${itemNames}] • Balance: ${userPoints} ${pointsConfig.currencyName}`,
      matchedRule: 'Built-in Command [!inventory]'
    };
  }

  // Check 0.7: Profile Command (!profile / !whoami / !rank)
  if (lowerContent === '!profile' || lowerContent === '!whoami' || lowerContent === '!rank') {
    const roleTitle = profile?.role || 'viewer';
    const modLevel = profile?.moderationLevel ?? 0;
    const invCount = profile?.inventory?.length || 0;
    const achCount = profile?.achievements?.length || 0;

    if (userResponseType === 'roast') {
      return {
        shouldRespond: true,
        replyText: `🔥 @${username} | Persona: ROAST | Role: ${roleTitle.toUpperCase()} | Mod Lvl ${modLevel} | Balance: ${userPoints} ${pointsConfig.currencyName} | Memories: "${allMemories[0] || 'Known troll'}" 😂`,
        matchedRule: 'Roast Personality [!profile]'
      };
    }

    return {
      shouldRespond: true,
      replyText: `👤 @${username} | Persona: ${userResponseType.toUpperCase()} | Role: ${roleTitle.toUpperCase()} (Mod Level ${modLevel}) | Balance: ${userPoints} ${pointsConfig.currencyName} | Inventory: ${invCount} item(s) | Badges: ${achCount}`,
      matchedRule: 'Built-in Command [!profile]'
    };
  }

  // Check 0.8: Points Command (!points / !coins / !balance)
  if (lowerContent === '!points' || lowerContent === '!coins' || lowerContent === '!balance') {
    if (userResponseType === 'roast') {
      return {
        shouldRespond: true,
        replyText: `🪙 @${username}, you have ${userPoints.toLocaleString()} ${pointsConfig.currencyName}. Don't spend it all on bad decisions like last time! 😂🔥`,
        matchedRule: 'Roast Personality [!points]'
      };
    }

    return {
      shouldRespond: true,
      replyText: `🪙 @${username}, you currently have ${userPoints.toLocaleString()} ${pointsConfig.currencyName}! Keep chatting and watching to earn more.`,
      matchedRule: 'Built-in Command [!points]'
    };
  }

  // Check 1: Keyword & General Triggers
  for (const trigger of triggers) {
    if (!trigger.enabled) continue;
    const trigText = trigger.trigger.toLowerCase();
    let matched = false;

    if (trigger.matchType === 'exact' && lowerContent === trigText) {
      matched = true;
    } else if (trigger.matchType === 'starts_with' && lowerContent.startsWith(trigText)) {
      matched = true;
    } else if (trigger.matchType === 'contains' && lowerContent.includes(trigText)) {
      matched = true;
    }

    if (matched) {
      // If user has a specialized persona (e.g. ROAST, SARCASTIC, CALM, ANNOYED, etc.),
      // and this is a general greeting or generic command, check if we should apply persona override
      const styleDef = responseStyles ? responseStyles[userResponseType] : undefined;
      let rawTemplate = trigger.response;

      if (userResponseType !== 'default' && styleDef && trigger.category === 'general') {
        // Pull from persona memory or chat responses
        const memoryPool = styleDef.memoryInfusedResponses || [];
        const chatPool = styleDef.chatResponses || [];
        const combinedPool = allMemories.length > 0 && memoryPool.length > 0
          ? [...memoryPool, ...chatPool]
          : chatPool;

        if (combinedPool.length > 0) {
          rawTemplate = combinedPool[Math.floor(Math.random() * combinedPool.length)];
        }
      }

      const reply = substituteTokens(rawTemplate, {
        username,
        botName: botIdentity.botName,
        streamerName: botIdentity.streamerName,
        channelName: botIdentity.channelName,
        uptime: uptimeStr,
        userPoints,
        currencyName: pointsConfig.currencyName,
        userAchievements: userAchievementsCount,
        userRole: profile?.role || 'viewer',
        responseType: userResponseType,
        memoryFacts: allMemories
      });

      return {
        shouldRespond: true,
        replyText: reply,
        matchedRule: userResponseType !== 'default'
          ? `${userResponseType.toUpperCase()} Persona [${trigger.trigger}]`
          : `Command Trigger [${trigger.trigger}]`
      };
    }
  }

  // Identify Viewer Role & Style Definition
  const roleId = msg.role || profile?.role || 'viewer';
  const roleConfig =
    roles.find((r) => r.id === roleId || r.name.toLowerCase() === roleId.toLowerCase()) ||
    roles.find((r) => r.id === 'viewer');

  const styleDef = responseStyles ? responseStyles[userResponseType] : undefined;

  const isQuestion =
    content.includes('?') ||
    lowerContent.startsWith('what') ||
    lowerContent.startsWith('how') ||
    lowerContent.startsWith('who') ||
    lowerContent.startsWith('why');

  const isGreeting =
    lowerContent.includes('hello') ||
    lowerContent.includes('hi') ||
    lowerContent.includes('hey') ||
    lowerContent.includes('sup') ||
    lowerContent.includes('welcome') ||
    lowerContent.startsWith('yo');

  // Check 2: Specialized Persona Greetings & First-time Greeting
  if (isGreeting && !hasGreetedUser && botIdentity.autoGreeting) {
    let chosenTemplate = '';
    let ruleName = '';

    // If user has a specific response type (e.g. ROAST, CALM, SARCASTIC, STUBBORN, HOPEFUL, ANNOYED)
    if (userResponseType !== 'default' && styleDef) {
      const memoryGreetings = (allMemories.length > 0 && styleDef.memoryInfusedResponses.length > 0)
        ? styleDef.memoryInfusedResponses
        : [];
      const standardGreetings = styleDef.greetingResponses || [];
      const pool = memoryGreetings.length > 0 && Math.random() < 0.6
        ? memoryGreetings
        : (standardGreetings.length > 0 ? standardGreetings : memoryGreetings);

      if (pool.length > 0) {
        chosenTemplate = pool[Math.floor(Math.random() * pool.length)];
        ruleName = `${styleDef.label} Greeting (${userResponseType.toUpperCase()})`;
      }
    }

    // Fallback to role-based greeting if no persona-specific template
    if (!chosenTemplate && roleConfig && roleConfig.greetingResponses.length > 0) {
      const responses = roleConfig.greetingResponses;
      chosenTemplate = responses[Math.floor(Math.random() * responses.length)];
      ruleName = `${roleConfig.name} Greetings: ${roleConfig.id}_greetings`;
    }

    if (chosenTemplate) {
      const reply = substituteTokens(chosenTemplate, {
        username,
        botName: botIdentity.botName,
        streamerName: botIdentity.streamerName,
        channelName: botIdentity.channelName,
        uptime: uptimeStr,
        userPoints,
        currencyName: pointsConfig.currencyName,
        userAchievements: userAchievementsCount,
        userRole: profile?.role || 'viewer',
        responseType: userResponseType,
        memoryFacts: allMemories
      });
      return {
        shouldRespond: true,
        replyText: reply,
        matchedRule: ruleName
      };
    }
  }

  // Check 3: Specialized Persona Questions & Chat Responses
  if (isQuestion && botIdentity.autoQuestions) {
    let chosenTemplate = '';
    let ruleName = '';

    if (userResponseType !== 'default' && styleDef) {
      const memoryResponses = (allMemories.length > 0 && styleDef.memoryInfusedResponses.length > 0)
        ? styleDef.memoryInfusedResponses
        : [];
      const chatResponses = styleDef.chatResponses || [];
      const pool = memoryResponses.length > 0 && Math.random() < 0.5
        ? memoryResponses
        : (chatResponses.length > 0 ? chatResponses : memoryResponses);

      if (pool.length > 0) {
        chosenTemplate = pool[Math.floor(Math.random() * pool.length)];
        ruleName = `${styleDef.label} Persona Response (${userResponseType.toUpperCase()})`;
      }
    }

    if (!chosenTemplate && roleConfig && roleConfig.questionResponses.length > 0) {
      const responses = roleConfig.questionResponses;
      chosenTemplate = responses[Math.floor(Math.random() * responses.length)];
      ruleName = `${roleConfig.name} Questions: ${roleConfig.id}_questions`;
    }

    if (chosenTemplate) {
      const reply = substituteTokens(chosenTemplate, {
        username,
        botName: botIdentity.botName,
        streamerName: botIdentity.streamerName,
        channelName: botIdentity.channelName,
        uptime: uptimeStr,
        userPoints,
        currencyName: pointsConfig.currencyName,
        userAchievements: userAchievementsCount,
        userRole: profile?.role || 'viewer',
        responseType: userResponseType,
        memoryFacts: allMemories
      });
      return {
        shouldRespond: true,
        replyText: reply,
        matchedRule: ruleName
      };
    }
  }

  return { shouldRespond: false };
}
