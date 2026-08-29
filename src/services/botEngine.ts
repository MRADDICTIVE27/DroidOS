import {
  BotPersonality,
  ViewerProfile,
  ChatMessage,
  ChatQuestionTrigger,
  EconomySettings,
  RedeemItem,
  CustomCommand,
  AutoResponse,
  OverlayAlert,
  AchievementItem,
  BlacklistSettings,
  ScriptPlugin,
  AppSettings
} from '../types';
import { isUserIgnoredOrBlacklisted } from './botBlacklistService';
import { executePluginCommand } from './pluginEngine';

export function getPointsCommandAliases(currencyName: string): string[] {
  const raw = (currencyName || 'DroidCoins').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const aliases = new Set<string>(['!points', '!coins', '!balance', '!point', '!coin']);
  if (raw.length > 0) {
    const base = raw.startsWith('my') && raw.length > 2 ? raw.slice(2) : raw;
    aliases.add(`!${base}`);
    aliases.add(`!my${base}`);
    aliases.add(`!${raw}`);
    aliases.add(`!my${raw}`);
    if (base.endsWith('s') && base.length > 2) {
      const sing = base.slice(0, -1);
      aliases.add(`!${sing}`);
      aliases.add(`!my${sing}`);
    } else {
      aliases.add(`!${base}s`);
      aliases.add(`!my${base}s`);
    }
  }
  return Array.from(aliases);
}

export function interpolateTemplate(
  template: string,
  variables: {
    username?: string;
    streamer_name?: string;
    custom_fact?: string;
    user_points?: number | string;
    channel_url?: string;
    target_user?: string;
    amount?: number | string;
    game_result?: string;
    currency_name?: string;
    currency_symbol?: string;
  }
): string {
  let res = template;
  res = res.replace(/{username}/gi, variables.username || 'Viewer');
  res = res.replace(/@{username}/gi, `@${variables.username || 'Viewer'}`);
  res = res.replace(/{user}/gi, variables.username || 'Viewer');
  res = res.replace(/@{user}/gi, `@${variables.username || 'Viewer'}`);
  res = res.replace(/{streamer_name}/gi, variables.streamer_name || 'Streamer');
  res = res.replace(/{custom_fact}/gi, variables.custom_fact || 'legendary chatter');
  res = res.replace(/{user_points}/gi, String(variables.user_points ?? 0));
  res = res.replace(/{points}/gi, String(variables.user_points ?? 0));
  res = res.replace(/{channel_url}/gi, variables.channel_url || `https://youtube.com/@${variables.username || 'Viewer'}`);
  res = res.replace(/{target_user}/gi, variables.target_user || 'Friend');
  res = res.replace(/{target}/gi, variables.target_user || 'Friend');
  res = res.replace(/{amount}/gi, String(variables.amount ?? 0));
  res = res.replace(/{game_result}/gi, variables.game_result || '');
  res = res.replace(/{currency_name}/gi, variables.currency_name || 'Coins');
  res = res.replace(/{currency_symbol}/gi, variables.currency_symbol || '🪙');
  return res;
}

export interface BotProcessResult {
  botReply?: string;
  pointsDelta?: number;
  redeemTriggered?: RedeemItem;
  overlayAlert?: Partial<OverlayAlert>;
  shoutoutUser?: string;
}

export function processIncomingChatMessage(
  message: ChatMessage,
  viewers: ViewerProfile[],
  personality: BotPersonality,
  triggers: ChatQuestionTrigger[],
  redeems: RedeemItem[],
  economy: EconomySettings,
  streamerName: string,
  customCommands: CustomCommand[] = [],
  autoResponses: AutoResponse[] = [],
  allPersonalities: BotPersonality[] = [],
  achievements: AchievementItem[] = [],
  blacklistSettings?: BlacklistSettings,
  plugins: ScriptPlugin[] = [],
  appSettings?: AppSettings
): BotProcessResult {
  const content = message.content.trim();
  const lower = content.toLowerCase();

  // 0.0 Blacklist & Ignore Prevention Check:
  // Do NOT reply to blacklisted users or external bots (Streamlabs, Nightbot, MixItUp, etc.) or self
  if (blacklistSettings) {
    const ignoreCheck = isUserIgnoredOrBlacklisted(message.username, blacklistSettings, appSettings);
    if (ignoreCheck.ignored) {
      return {};
    }
  }

  // 0.01 Check Script Plugins (Python, C#, JS, TS Custom Commands & Minigames)
  if (content.startsWith('!') && plugins && plugins.length > 0) {
    const parts = content.split(' ');
    const cmdName = parts[0].toLowerCase();
    const args = parts.slice(1);

    for (const plugin of plugins) {
      if (!plugin.enabled) continue;
      const isRegistered = plugin.registeredCommands.some((c) => c.toLowerCase() === cmdName);
      if (isRegistered) {
        let generatedReply = '';
        let generatedAlert: Partial<OverlayAlert> | undefined;
        let generatedPointsDelta = 0;

        executePluginCommand(plugin, message.username, cmdName, args, {
          username: message.username,
          message: content,
          command: cmdName,
          args,
          viewers,
          economy,
          streamerName,
          onSendReply: (reply) => {
            generatedReply = reply;
          },
          onUpdatePoints: (targetUser, delta) => {
            if (targetUser.toLowerCase() === message.username.toLowerCase()) {
              generatedPointsDelta += delta;
            }
          },
          onTriggerOverlay: (alert) => {
            generatedAlert = alert;
          },
          onPlaySound: () => {}
        });

        if (generatedReply || generatedAlert || generatedPointsDelta !== 0) {
          return {
            botReply: generatedReply || undefined,
            overlayAlert: generatedAlert,
            pointsDelta: generatedPointsDelta !== 0 ? generatedPointsDelta : undefined
          };
        }
      }
    }
  }

  const viewer = viewers.find((v) => v.username.toLowerCase() === message.username.toLowerCase());
  const userPoints = viewer?.points ?? 100;
  const userFact = viewer?.customFacts?.[0] || 'active chatter in chat';

  // Check if viewer has a custom personality override
  let effectivePersonality = personality;
  if (viewer?.personalityOverrideId && viewer.personalityOverrideId !== 'default') {
    const override = allPersonalities.find((p) => p.id === viewer.personalityOverrideId);
    if (override) {
      effectivePersonality = override;
    }
  }

  // 0. Check custom commands defined by streamer first
  for (const cmd of customCommands) {
    if (!cmd.enabled) continue;
    const cmdTrigger = cmd.command.toLowerCase();
    const aliasTriggers = cmd.aliases.map((a) => a.toLowerCase());
    const isMatch =
      lower === cmdTrigger ||
      lower.startsWith(`${cmdTrigger} `) ||
      aliasTriggers.some((a) => lower === a || lower.startsWith(`${a} `));

    if (isMatch) {
      const parts = content.split(' ');
      const targetUser = (parts[1] || '').replace('@', '').trim() || message.username;
      const parsedText = interpolateTemplate(cmd.response, {
        username: message.displayName,
        target_user: targetUser,
        user_points: userPoints.toLocaleString(),
        streamer_name: streamerName,
        currency_name: economy.currencyName,
        currency_symbol: economy.currencySymbol
      })
        .replace(/{channel_url}/g, `https://youtube.com/@${targetUser}`)
        .replace(/{game_name}/g, 'Live Stream')
        .replace(/{uptime}/g, '1h 45m');

      // Check if command triggers an on-screen overlay or OBS alert
      let overlayAlertData: Partial<OverlayAlert> | undefined = undefined;
      if (cmd.triggerOverlay && cmd.overlayType) {
        const titleInterpolated = cmd.overlayTitle
          ? interpolateTemplate(cmd.overlayTitle, {
              username: message.displayName,
              target_user: targetUser,
              streamer_name: streamerName,
              user_points: userPoints.toLocaleString(),
              currency_name: economy.currencyName,
              currency_symbol: economy.currencySymbol
            })
          : `${cmd.command.toUpperCase()} TRIGGERED`;

        const subtitleInterpolated = cmd.overlaySubtitle
          ? interpolateTemplate(cmd.overlaySubtitle, {
              username: message.displayName,
              target_user: targetUser,
              streamer_name: streamerName,
              user_points: userPoints.toLocaleString(),
              currency_name: economy.currencyName,
              currency_symbol: economy.currencySymbol
            })
          : `Activated by @${message.displayName}`;

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

        overlayAlertData = {
          id: `cmd-alert-${Date.now()}`,
          type: alertType as any,
          title: titleInterpolated,
          subtitle: subtitleInterpolated,
          username: message.displayName,
          icon: cmd.overlayIcon || (cmd.overlayType === 'fireworks' ? '🔥' : cmd.overlayType === 'confetti' ? '🎉' : '⚡'),
          soundPreset: cmd.soundEffect,
          durationMs: (cmd.overlayDurationSeconds || 6) * 1000,
          bannerPreset: cmd.overlayBannerPreset || 'xbox',
          dropPreset: cmd.overlayDropPreset || 'coins',
          customDropImageUrl: cmd.customDropImageUrl,
          dropParticleCount: cmd.dropParticleCount || 75,
          mediaType: cmd.mediaType,
          mediaUrl: cmd.mediaUrl,
          mediaPosition: cmd.mediaPosition || 'center',
          mediaFit: cmd.mediaFit || 'contain',
          mediaVolume: cmd.mediaVolume ?? 1,
          chromaKey: cmd.chromaKey || 'none',
          timestamp: Date.now()
        };
      }

      return {
        botReply: parsedText,
        overlayAlert: overlayAlertData,
        pointsDelta: cmd.pointsRewardOrCost && cmd.pointsRewardOrCost !== 0 ? cmd.pointsRewardOrCost : undefined
      };
    }
  }

  // 0.1 Check Viewer-Linked Auto-Responses from Responses Tab
  if (viewer?.linkedAutoResponseIds?.length) {
    for (const autoRespId of viewer.linkedAutoResponseIds) {
      const resp = autoResponses.find((r) => r.id === autoRespId && r.enabled);
      if (resp) {
        const patterns = resp.patterns || (resp as any).triggers || [];
        const matchesKeyword = patterns.some((t: string) => lower.includes(t.toLowerCase()));
        if (matchesKeyword) {
          let chosenTemplate = resp.response;
          if (resp.responseMode === 'random_pool' && resp.responsePool && resp.responsePool.length > 0) {
            chosenTemplate = resp.responsePool[Math.floor(Math.random() * resp.responsePool.length)];
          } else if (resp.responseMode === 'personality_pool' && resp.personalitySourceId) {
            const pSource = allPersonalities.find((p) => p.id === resp.personalitySourceId);
            if (pSource && pSource.chatResponses.length > 0) {
              chosenTemplate = pSource.chatResponses[Math.floor(Math.random() * pSource.chatResponses.length)];
            }
          }
          return {
            botReply: interpolateTemplate(chosenTemplate, {
              username: message.displayName,
              streamer_name: streamerName,
              custom_fact: userFact,
              user_points: userPoints,
              currency_name: economy.currencyName,
              currency_symbol: economy.currencySymbol
            })
          };
        }
      }
    }
  }

  // 0.2 Check Viewer Response Behavior overrides (e.g. Silent)
  if (viewer?.responseBehavior === 'silent') {
    return {};
  }

  // 1. Check direct built-in commands
  // !points / !coins / !my{pointsname} / !{pointsname}
  const pointsAliases = getPointsCommandAliases(economy.currencyName);
  if (pointsAliases.some((alias) => lower === alias || lower.startsWith(`${alias} `))) {
    const formatted = userPoints.toLocaleString();
    return {
      botReply: `@${message.displayName} You currently have ${formatted} ${economy.currencyName} ${economy.currencySymbol}! Keep chatting, gamble on !gamble, or check your full bag with !inventory!`
    };
  }

  // !inventory / !inv / !profile / !stats / !bag / !items / !myinventory
  if (
    lower === '!inventory' || lower === '!inv' ||
    lower === '!profile' || lower === '!stats' ||
    lower === '!bag' || lower === '!items' ||
    lower === '!myinventory' || lower === '!myprofile' ||
    lower.startsWith('!inventory ') || lower.startsWith('!inv ') ||
    lower.startsWith('!profile ') || lower.startsWith('!stats ')
  ) {
    const unlockedList = (viewer?.achievements || [])
      .map((va) => achievements.find((a) => a.id === va.achievementId)?.title)
      .filter(Boolean) as string[];
    const totalAchs = achievements.length || 6;
    const achText = unlockedList.length > 0
      ? `${unlockedList.length}/${totalAchs} (🏆 ${unlockedList.slice(0, 3).join(', ')}${unlockedList.length > 3 ? ` +${unlockedList.length - 3} more` : ''})`
      : `0/${totalAchs} (None unlocked yet • type !achievements)`;
    const invBadges = (viewer?.inventory || []).map((i) => i.name).join(', ') || 'Standard Chatter Badge';
    const streak = viewer?.visitStreak || 1;
    const watchTime = viewer?.watchTimeMinutes || 0;
    const role = (viewer?.role || 'viewer').toUpperCase();
    const formatted = userPoints.toLocaleString();

    return {
      botReply: `🎒 @${message.displayName}'s Profile & Inventory: 💰 Balance: ${formatted} ${economy.currencyName} ${economy.currencySymbol} | 🏆 Achievements: ${achText} | 🎖️ Role: ${role} | 🔥 Streak: ${streak}d | ⏱️ Watched: ${watchTime}m | 🎁 Badges: ${invBadges}`
    };
  }

  // !achievements / !trophies / !myachievements
  if (lower === '!achievements' || lower === '!myachievements' || lower === '!trophies') {
    const unlockedList = (viewer?.achievements || [])
      .map((va) => achievements.find((a) => a.id === va.achievementId)?.title)
      .filter(Boolean) as string[];
    const achCount = achievements.length || 6;
    const summary = achievements.length > 0
      ? achievements.map((a) => `${unlockedList.includes(a.title) ? '✅' : '🔒'} ${a.title} (+${a.rewardPoints}pts)`).join(' | ')
      : 'First Contact (+100pts), Chat Legend (+500pts), High Roller (+1000pts), Vault Breached (+1000pts)';

    return {
      botReply: `🏆 @${message.displayName} Unlocked ${unlockedList.length}/${achCount} Achievements: ${summary}`
    };
  }

  // !commands / !help
  if (lower === '!commands' || lower === '!help') {
    const primaryPointsCmd = getPointsCommandAliases(economy.currencyName)[0] || '!points';
    return {
      botReply: `🤖 DroidOS Commands: ${primaryPointsCmd}, !my${economy.currencyName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'coins'}, !inventory, !achievements, !gamble [amt], !heist, !duel @user [amt], !boss, !redeem [item], !discord, !specs, !shoutout @user, !roast @user`
    };
  }

  // !gamble [amount]
  if (lower.startsWith('!gamble') || lower.startsWith('!slots') || lower.startsWith('!bet')) {
    const parts = content.split(' ');
    const bet = parseInt(parts[1], 10) || 50;

    if (bet < economy.minGambleBet) {
      return {
        botReply: `@${message.displayName} Minimum gamble bet is ${economy.minGambleBet} ${economy.currencyName}!`
      };
    }
    if (bet > userPoints) {
      return {
        botReply: `@${message.displayName} You don't have enough ${economy.currencyName} to bet ${bet}! You have ${userPoints}.`
      };
    }

    const roll = Math.random();
    if (roll > 0.85) {
      // Jackpot 3x
      const winAmt = bet * 3;
      return {
        botReply: `🎰 JACKPOT! 💎 7 7 7 💎 @${message.displayName} won ${winAmt.toLocaleString()} ${economy.currencyName}! (${economy.currencySymbol})`,
        pointsDelta: winAmt,
        overlayAlert: {
          type: 'game',
          title: 'SLOT MACHINE JACKPOT',
          subtitle: `${message.displayName} hit the 3x Jackpot!`,
          customMessage: `Won +${winAmt.toLocaleString()} ${economy.currencyName}`,
          gameId: 'gamble',
          outcome: 'jackpot'
        }
      };
    } else if (roll > 0.5) {
      // Win 1.5x
      const winAmt = Math.floor(bet * 1.5);
      return {
        botReply: `🎰 WINNER! 🍒 7 💎 @${message.displayName} won ${winAmt.toLocaleString()} ${economy.currencyName}!`,
        pointsDelta: winAmt - bet,
        overlayAlert: {
          type: 'game',
          title: 'SLOT WIN',
          subtitle: `${message.displayName} scored a win!`,
          customMessage: `Won +${winAmt.toLocaleString()} ${economy.currencyName}`,
          gameId: 'gamble',
          outcome: 'win'
        }
      };
    } else {
      // Loss
      return {
        botReply: `🎰 OOF! ❌ ❌ ❌ @${message.displayName} lost ${bet.toLocaleString()} ${economy.currencyName}. Better luck next spin!`,
        pointsDelta: -bet,
        overlayAlert: {
          type: 'game',
          title: 'SLOT LOSS',
          subtitle: `${message.displayName} lost the bet`,
          customMessage: `Lost -${bet.toLocaleString()} ${economy.currencyName}`,
          gameId: 'gamble',
          outcome: 'loss'
        }
      };
    }
  }

  // !heist
  if (lower.startsWith('!heist') || lower === '!bank') {
    const success = Math.random() > 0.45;
    if (success) {
      const loot = Math.floor(Math.random() * 300 + 200);
      return {
        botReply: `💼 BANK HEIST SUCCESS! 🔓 @${message.displayName} cracked the vault and escaped with +${loot} ${economy.currencyName}!`,
        pointsDelta: loot,
        overlayAlert: {
          type: 'game',
          title: 'HEIST CLEARED',
          subtitle: `${message.displayName} unlocked the vault!`,
          customMessage: `Escaped with +${loot} ${economy.currencyName}`,
          gameId: 'heist',
          outcome: 'success'
        }
      };
    } else {
      const penalty = Math.min(150, userPoints);
      return {
        botReply: `🚨 HEIST BUSTED! 🚓 The authorities surrounded @${message.displayName}! Lost -${penalty} ${economy.currencyName} in bail!`,
        pointsDelta: -penalty,
        overlayAlert: {
          type: 'game',
          title: 'HEIST BUSTED',
          subtitle: `Alarms triggered on the bank vault`,
          customMessage: `Bail cost: -${penalty} ${economy.currencyName}`,
          gameId: 'heist',
          outcome: 'busted'
        }
      };
    }
  }

  // !boss [attack]
  if (lower.startsWith('!boss') || lower.startsWith('!attack')) {
    const dmg = Math.floor(Math.random() * 250 + 50);
    const crit = Math.random() > 0.75;
    const finalDmg = crit ? dmg * 2 : dmg;
    const reward = Math.floor(finalDmg / 2);

    return {
      botReply: `⚔️ BOSS ATTACK! @${message.displayName} dealt ${finalDmg} ${crit ? 'CRITICAL ' : ''}damage to Cyber Dragon! Earned +${reward} ${economy.currencyName}!`,
      pointsDelta: reward,
      overlayAlert: {
        type: 'game',
        title: crit ? 'CRITICAL BOSS STRIKE' : 'BOSS ATTACK',
        subtitle: `${message.displayName} struck the Cyber Dragon`,
        customMessage: `Dealt ${finalDmg} DMG • Earned +${reward} ${economy.currencyName}`,
        gameId: 'boss',
        outcome: crit ? 'crit' : 'strike'
      }
    };
  }

  // !duel @user [amount]
  if (lower.startsWith('!duel')) {
    const parts = content.split(' ');
    const target = parts[1] || 'someone';
    const amount = parseInt(parts[2], 10) || 100;
    const win = Math.random() > 0.5;

    return {
      botReply: win
        ? `⚔️ DUEL ARENA: @${message.displayName} defeated ${target} in combat and claimed the ${amount * 2} ${economy.currencyName} purse!`
        : `🛡️ DUEL ARENA: ${target} countered @${message.displayName} and defended their title!`,
      pointsDelta: win ? amount : -amount,
      overlayAlert: {
        type: 'duel',
        title: 'DUEL ARENA OUTCOME',
        subtitle: `${message.displayName} vs ${target}`,
        customMessage: win ? `${message.displayName} took the purse!` : `${target} defended the title!`,
        gameId: 'duel',
        outcome: win ? 'win' : 'loss'
      }
    };
  }

  // !shoutout @user
  if (lower.startsWith('!shoutout') || lower.startsWith('!so')) {
    const parts = content.split(' ');
    const target = (parts[1] || '').replace('@', '').trim() || message.username;
    return {
      botReply: `📣 Huge shoutout to @${target}! Check out their channel: https://youtube.com/@${target} 🎉 Everyone show them some love!`,
      shoutoutUser: target,
      overlayAlert: {
        type: 'shoutout',
        title: `SHOUTOUT: @${target}`,
        subtitle: `Check out @${target}'s channel!`,
        customMessage: `https://youtube.com/@${target}`
      }
    };
  }

  // !redeem [item_name]
  if (lower.startsWith('!redeem')) {
    const query = lower.replace('!redeem', '').trim();
    const item = redeems.find((r) => r.name.toLowerCase().includes(query) || r.id.toLowerCase().includes(query));

    if (!item) {
      const list = redeems.map((r) => `${r.name} (${r.cost} pts)`).join(', ');
      return {
        botReply: `@${message.displayName} Available redeems: ${list}. Type !redeem [name]`
      };
    }

    if (userPoints < item.cost) {
      return {
        botReply: `@${message.displayName} You need ${item.cost} ${economy.currencyName} for ${item.name}! You only have ${userPoints}.`
      };
    }

    const isMediaVideo = item.type === 'media_video' || item.mediaType === 'video';
    const isMediaGif = item.type === 'media_gif' || item.mediaType === 'gif';
    const isOverlayEffect = item.type === 'overlay';

    return {
      botReply: `🎁 @${message.displayName} redeemed "${item.name}" for ${item.cost} ${economy.currencyName}! ${item.icon}`,
      pointsDelta: -item.cost,
      redeemTriggered: item,
      overlayAlert: {
        type: isMediaVideo ? 'media_video' : isMediaGif ? 'media_gif' : isOverlayEffect ? 'effect_confetti' : 'redeem',
        title: item.name.toUpperCase(),
        subtitle: `@${message.displayName} redeemed (${item.cost.toLocaleString()} ${economy.currencyName})`,
        customMessage: item.caption || item.description,
        username: message.displayName,
        mediaType: item.mediaType || (isMediaVideo ? 'video' : isMediaGif ? 'gif' : undefined),
        mediaUrl: item.mediaUrl,
        videoUrl: isMediaVideo ? item.mediaUrl : undefined,
        gifUrl: isMediaGif ? item.mediaUrl : undefined,
        mediaFit: item.mediaFit || 'contain',
        mediaPosition: item.mediaPosition || 'center',
        mediaVolume: item.mediaVolume ?? 1,
        chromaKey: item.chromaKey || 'none',
        soundPreset: item.soundPreset,
        caption: item.caption,
        durationMs: (item.overlayDuration || 6) * 1000
      }
    };
  }

  // !roast @user
  if (lower.startsWith('!roast')) {
    const parts = content.split(' ');
    const target = (parts[1] || '').replace('@', '').trim() || message.username;
    const targetViewer = viewers.find((v) => v.username.toLowerCase() === target.toLowerCase());
    const targetFact = targetViewer?.customFacts?.[0] || 'typing questions in chat';

    const roastList = effectivePersonality.id === 'roast' ? effectivePersonality.chatResponses : [
      `@{username}, I'd roast you, but life has clearly already done the work for me! 😂🔥`,
      `@{username}, you're the reason the gene pool needs a lifeguard. 🏊‍♂️`,
      `@{username}, your gaming skills are like dial-up internet: loud, slow, and nobody wants them.`
    ];

    const chosen = roastList[Math.floor(Math.random() * roastList.length)];
    const text = interpolateTemplate(chosen, {
      username: target,
      streamer_name: streamerName,
      custom_fact: targetFact,
      user_points: targetViewer?.points || 100
    });

    return { botReply: text };
  }

  // 2.0 Check Active Personality 22 Question Triggers
  if (effectivePersonality.questionTriggers?.length) {
    for (const qTrigger of effectivePersonality.questionTriggers) {
      const isQuestionMatch = qTrigger.keywords.some((kw) => {
        const cleanKw = kw.toLowerCase();
        return lower.includes(cleanKw) || lower === cleanKw;
      });

      if (isQuestionMatch) {
        let answerText = interpolateTemplate(qTrigger.answer, {
          username: message.displayName,
          streamer_name: streamerName,
          custom_fact: userFact,
          user_points: userPoints
        });

        // 30% chance to weave in a memory fact if viewer has registered memories
        if (viewer?.customFacts?.length && Math.random() < 0.35) {
          const memoryAddon = ` (Also, knowing that you ${userFact}, I knew you'd be asking!)`;
          if (!answerText.includes(userFact)) {
            answerText += memoryAddon;
          }
        }

        return {
          botReply: answerText
        };
      }
    }
  }

  // 2.1 Check general autoResponses list
  for (const resp of autoResponses) {
    if (!resp.enabled) continue;
    const patterns = resp.patterns || (resp as any).triggers || [];
    if (patterns.some((kw: string) => lower.includes(kw.toLowerCase()))) {
      let overlayAlert;
      if (resp.triggerOverlay) {
        overlayAlert = {
          type: 'achievement',
          preset: resp.overlayBannerPreset || 'xbox',
          title: interpolateTemplate(resp.overlayTitle || 'ALERT', { username: message.displayName }),
          description: interpolateTemplate(resp.overlaySubtitle || '{username} triggered this!', { username: message.displayName }),
          username: message.displayName,
          duration: 6
        };
      }
      return {
        botReply: interpolateTemplate(resp.response, {
          username: message.displayName,
          streamer_name: streamerName,
          custom_fact: userFact,
          user_points: userPoints
        }),
        overlayAlert
      };
    }
  }

  // 2.1 Check keyword triggers
  for (const trigger of triggers) {
    if (trigger.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
      return {
        botReply: interpolateTemplate(trigger.response, {
          username: message.displayName,
          streamer_name: streamerName,
          custom_fact: userFact,
          user_points: userPoints
        })
      };
    }
  }

  // 3. Custom viewer behavior checks
  if (viewer?.responseBehavior === 'custom_reply_template' && viewer.customBotReplyTemplate) {
    const botText = interpolateTemplate(viewer.customBotReplyTemplate, {
      username: message.displayName,
      streamer_name: streamerName,
      custom_fact: userFact,
      user_points: userPoints
    });
    return { botReply: botText };
  }

  if (viewer?.responseBehavior === 'always_roast') {
    const roastList = [
      `@{username}, classic roast: ${viewer.customRoastPrompt || 'Still waiting for you to win a single wager in this stream!'} 😂🔥`,
      `Oh look, @{username} is talking again! Someone get them a cheat sheet! 🎮`,
      `@{username}, remember when you thought you could beat the boss with 0 points? Good times! 🤣`
    ];
    return {
      botReply: interpolateTemplate(roastList[Math.floor(Math.random() * roastList.length)], {
        username: message.displayName,
        streamer_name: streamerName,
        custom_fact: userFact,
        user_points: userPoints
      })
    };
  }

  if (viewer?.responseBehavior === 'always_praise') {
    const praiseList = [
      `🌟 All hail @{username}! VIP presence detected in chat! Respect! 🙌`,
      `👑 @{username} in the building! True legend of this channel!`,
      `✨ Always an honor when @{username} drops knowledge in the stream!`
    ];
    return {
      botReply: interpolateTemplate(praiseList[Math.floor(Math.random() * praiseList.length)], {
        username: message.displayName,
        streamer_name: streamerName,
        custom_fact: userFact,
        user_points: userPoints
      })
    };
  }

  // 4. Spontaneous personality-infused bot reply (1 in 4 chance for general chat or if user mentions bot)
  const isMentioned = lower.includes('droidbot') || lower.includes('droid') || lower.includes('bot');
  if (isMentioned || Math.random() < 0.25) {
    const useMemory = Boolean(viewer?.customFacts?.length && Math.random() > 0.4 && effectivePersonality.memoryInfusedResponses?.length);
    const chatResponses = effectivePersonality.chatResponses || [];
    const memoryInfusedResponses = effectivePersonality.memoryInfusedResponses || [];
    const greetingResponses = effectivePersonality.greetingResponses || [];

    const pool = useMemory
      ? memoryInfusedResponses
      : chatResponses.length > 0
        ? chatResponses
        : greetingResponses;

    if (pool.length) {
      const template = pool[Math.floor(Math.random() * pool.length)];
      const botText = interpolateTemplate(template, {
        username: message.displayName,
        streamer_name: streamerName,
        custom_fact: userFact,
        user_points: userPoints
      });
      return { botReply: botText };
    }
  }

  return {};
}
