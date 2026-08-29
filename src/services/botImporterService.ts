import {
  CustomCommand,
  AutomationTimer,
  AutoResponse,
  ImportTransferResult,
  SupportedBotSource,
  UserRole
} from '../types';

export function normalizeBotVariables(raw: string): string {
  if (!raw) return '';
  let text = raw;

  // Replace user variables
  text = text.replace(/\$\(user\)/gi, '{user}');
  text = text.replace(/\$\{user\}/gi, '{user}');
  text = text.replace(/\$user\b/gi, '{user}');
  text = text.replace(/<user>/gi, '{user}');
  text = text.replace(/\$sender\b/gi, '{user}');
  text = text.replace(/\$\(sender\)/gi, '{user}');

  // Replace target / touser variables
  text = text.replace(/\$\(touser\)/gi, '{target_user}');
  text = text.replace(/\$\{touser\}/gi, '{target_user}');
  text = text.replace(/\$\{target\}/gi, '{target_user}');
  text = text.replace(/\$target\b/gi, '{target_user}');
  text = text.replace(/<touser>/gi, '{target_user}');
  text = text.replace(/<target>/gi, '{target_user}');

  // Replace points / currency variables
  text = text.replace(/\$\(points\)/gi, '{points}');
  text = text.replace(/\$\{user\.points\}/gi, '{points}');
  text = text.replace(/\$points\b/gi, '{points}');
  text = text.replace(/<points>/gi, '{points}');

  // Replace channel / streamer variables
  text = text.replace(/\$\(channel\)/gi, '{streamer_name}');
  text = text.replace(/\$\{channel\}/gi, '{streamer_name}');
  text = text.replace(/\$channel\b/gi, '{streamer_name}');
  text = text.replace(/\$\(broadcaster\)/gi, '{streamer_name}');

  // Replace game variables
  text = text.replace(/\$\(game\)/gi, '{game_name}');
  text = text.replace(/\$\{game\}/gi, '{game_name}');
  text = text.replace(/\$game\b/gi, '{game_name}');

  // Replace time / date
  text = text.replace(/\$\(time\)/gi, '{current_time}');

  return text;
}

export function detectBotSource(content: string, filename?: string): SupportedBotSource {
  const lower = content.toLowerCase();
  const fileLower = (filename || '').toLowerCase();

  if (fileLower.includes('streamlabs') || lower.includes('cloudbot') || lower.includes('"streamlabs"') || lower.includes('streamlabs chatbot')) {
    return 'streamlabs';
  }
  if (fileLower.includes('nightbot') || lower.includes('nightbot') || lower.includes('"_id"') && lower.includes('"coolDown"')) {
    return 'nightbot';
  }
  if (fileLower.includes('mixitup') || fileLower.endsWith('.bot') || lower.includes('mixitup') || lower.includes('commandtype')) {
    return 'mixitup';
  }
  if (fileLower.includes('streamelements') || lower.includes('streamelements') || lower.includes('sebot')) {
    return 'streamelements';
  }
  if (fileLower.includes('moobot') || lower.includes('moobot')) {
    return 'moobot';
  }
  if (fileLower.includes('firebot') || lower.includes('firebot')) {
    return 'firebot';
  }
  if (fileLower.includes('wizebot') || lower.includes('wizebot')) {
    return 'wizebot';
  }
  return 'generic';
}

/**
 * Converts external bot exports (JSON, CSV, TXT, XML) into DroidOS native commands, timers, and auto-responses.
 */
export function convertExternalBotExport(fileContent: string, filename?: string): ImportTransferResult {
  const source = detectBotSource(fileContent, filename);
  const transferredCommands: CustomCommand[] = [];
  const transferredTimers: AutomationTimer[] = [];
  const transferredResponses: AutoResponse[] = [];
  const errors: Array<{ item: string; reason: string; lineNumber?: number }> = [];

  let totalFound = 0;

  // Try parsing as JSON first
  let isJson = false;
  let parsedJson: any = null;
  try {
    parsedJson = JSON.parse(fileContent);
    isJson = true;
  } catch (e) {
    isJson = false;
  }

  if (isJson && parsedJson) {
    // 1. JSON Array (Common in Nightbot, Streamlabs, StreamElements)
    const items = Array.isArray(parsedJson)
      ? parsedJson
      : parsedJson.commands || parsedJson.items || parsedJson.data || parsedJson.custom_commands || [parsedJson];

    totalFound += items.length;

    items.forEach((item: any, idx: number) => {
      const lineNum = idx + 1;
      const rawCmd = item.name || item.command || item.trigger || item.alias || item.cmd || '';
      const rawResp = item.response || item.message || item.reply || item.text || item.output || '';

      if (!rawCmd && !rawResp) {
        // Might be a timer
        if (item.interval || item.intervalMinutes || item.timerName) {
          const timerName = item.timerName || item.name || `Imported Timer #${idx + 1}`;
          const timerMsg = item.message || item.text || '';
          if (timerMsg) {
            transferredTimers.push({
              id: `timer-imported-${Date.now()}-${idx}`,
              name: timerName,
              message: normalizeBotVariables(timerMsg),
              intervalMinutes: item.interval || item.intervalMinutes || 15,
              minChatLines: item.minChatLines || item.lines || 5,
              enabled: item.enabled !== false,
              linesSinceLastPost: 0
            });
            return;
          }
        }
        errors.push({
          item: `JSON Item #${lineNum}`,
          reason: 'Missing both command trigger and response payload',
          lineNumber: lineNum
        });
        return;
      }

      if (!rawCmd) {
        errors.push({
          item: `Item #${lineNum} (${rawResp.slice(0, 20)}...)`,
          reason: 'Command trigger prefix is empty',
          lineNumber: lineNum
        });
        return;
      }

      // Check for unsupported remote API integrations
      if (rawResp.includes('$(urlfetch') || rawResp.includes('$urlfetch') || rawResp.includes('eval(')) {
        errors.push({
          item: `Command '${rawCmd}'`,
          reason: 'Contains unsupported external dynamic $(urlfetch) API or unsafe eval script; convert to DroidOS Python/C# plugin instead',
          lineNumber: lineNum
        });
        return;
      }

      const formattedCmd = rawCmd.startsWith('!') ? rawCmd : `!${rawCmd}`;
      const userLevelMap: Record<string, 'everyone' | 'subscriber' | 'vip' | 'moderator' | 'owner'> = {
        everyone: 'everyone',
        all: 'everyone',
        regular: 'everyone',
        subscriber: 'subscriber',
        sub: 'subscriber',
        vip: 'vip',
        mod: 'moderator',
        moderator: 'moderator',
        broadcaster: 'owner',
        owner: 'owner',
        host: 'owner'
      };

      const rawLevel = String(item.userlevel || item.permission || item.userLevel || 'everyone').toLowerCase();
      const level = userLevelMap[rawLevel] || 'everyone';
      const cooldown = Number(item.coolDown || item.cooldown || item.cooldownSeconds || 10);

      transferredCommands.push({
        id: `cmd-imported-${Date.now()}-${idx}`,
        command: formattedCmd,
        aliases: Array.isArray(item.aliases) ? item.aliases : [],
        response: normalizeBotVariables(rawResp),
        userLevel: level,
        cooldownSeconds: isNaN(cooldown) ? 10 : cooldown,
        enabled: item.enabled !== false,
        useCount: item.count || item.uses || 0,
        category: item.category || 'general',
        description: `Imported from ${source.toUpperCase()} backup`
      });
    });
  } else {
    // 2. CSV or Plain Text Line-by-Line Parser
    const lines = fileContent.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    totalFound = lines.length;

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      // Skip header comments
      if (line.startsWith('#') || line.startsWith('//') || line.toLowerCase().startsWith('command,response')) {
        return;
      }

      // Check CSV split vs Space split
      let cmd = '';
      let resp = '';

      if (line.includes('\t')) {
        const parts = line.split('\t');
        cmd = parts[0];
        resp = parts.slice(1).join('\t');
      } else if (line.includes(',') && (line.startsWith('!') || line.startsWith('"!') || line.split(',').length >= 2)) {
        // Simple CSV
        const parts = line.split(/,(.*)/s);
        cmd = parts[0].replace(/^["']|["']$/g, '');
        resp = (parts[1] || '').replace(/^["']|["']$/g, '');
      } else if (line.startsWith('!')) {
        const parts = line.split(/\s+(.*)/s);
        cmd = parts[0];
        resp = parts[1] || '';
      } else {
        errors.push({
          item: `Line ${lineNum}: "${line.slice(0, 30)}..."`,
          reason: 'Could not parse command format (expected CSV, tab-separated, or !command response)',
          lineNumber: lineNum
        });
        return;
      }

      if (!cmd || !resp) {
        errors.push({
          item: `Line ${lineNum}`,
          reason: 'Missing command name or response content',
          lineNumber: lineNum
        });
        return;
      }

      if (resp.includes('$(urlfetch') || resp.includes('$urlfetch')) {
        errors.push({
          item: `Command '${cmd}' (Line ${lineNum})`,
          reason: 'Contains $(urlfetch) endpoint which requires custom Python/C# Script Plugin',
          lineNumber: lineNum
        });
        return;
      }

      const formattedCmd = cmd.startsWith('!') ? cmd : `!${cmd}`;
      transferredCommands.push({
        id: `cmd-imported-${Date.now()}-${idx}`,
        command: formattedCmd,
        aliases: [],
        response: normalizeBotVariables(resp),
        userLevel: 'everyone',
        cooldownSeconds: 10,
        enabled: true,
        useCount: 0,
        category: 'general',
        description: `Imported from ${source.toUpperCase()} text list`
      });
    });
  }

  const transferredCount = transferredCommands.length + transferredTimers.length + transferredResponses.length;
  const failedCount = errors.length;

  return {
    sourceBot: source,
    totalFound,
    transferredCount,
    failedCount,
    transferredCommands,
    transferredTimers,
    transferredResponses,
    errors
  };
}
