import { ScriptPlugin, ScriptLanguage, ChatMessage, OverlayAlert, ViewerProfile, EconomySettings } from '../types';
import { soundSynth } from './soundSynthesizer';

export interface PluginExecutionContext {
  username: string;
  message: string;
  command?: string;
  args?: string[];
  viewers: ViewerProfile[];
  economy: EconomySettings;
  streamerName: string;
  onSendReply: (reply: string) => void;
  onUpdatePoints: (username: string, delta: number) => void;
  onTriggerOverlay: (alert: Partial<OverlayAlert>) => void;
  onPlaySound: (sound: string) => void;
}

export const BUILTIN_PLUGINS: ScriptPlugin[] = [
  {
    id: 'plugin-word-scramble-py',
    name: 'Word Scramble Royale (Python)',
    filename: 'word_scramble.py',
    language: 'python',
    version: '1.2.0',
    author: 'MRADDICTIVE',
    description: 'Scrambles gaming and stream terms in chat. First viewer to type !guess <word> or !unscramble wins bonus DroidCoins and confetti on screen!',
    enabled: true,
    createdAt: '2026-08-20T10:00:00.000Z',
    updatedAt: '2026-08-27T11:00:00.000Z',
    registeredCommands: ['!scramble', '!guess', '!hint'],
    registeredMinigames: ['Word Scramble Royale'],
    registeredHooks: ['onChatMessage', 'onCommand'],
    isBuiltIn: true,
    executionLogs: [
      { id: 'log-1', timestamp: '11:00:00', level: 'info', message: 'Loaded Python plugin: word_scramble.py successfully.' },
      { id: 'log-2', timestamp: '11:00:01', level: 'game', message: 'Registered commands: !scramble, !guess, !hint' }
    ],
    code: `# ====================================================================
# DroidOS Python Plugin: Word Scramble Minigame
# Author: MRADDICTIVE
# Version: 1.2.0
# Description: Automated interactive word scramble chat minigame!
# ====================================================================

import random

WORDS_DATABASE = [
    {"word": "MINECRAFT", "hint": "Block building sandbox game"},
    {"word": "OVERWATCH", "hint": "Hero shooter with payloads"},
    {"word": "VALORANT", "hint": "Tactical 5v5 shooter with agents"},
    {"word": "FORTNITE", "hint": "Battle royale with building & battle bus"},
    {"word": "ELDENRING", "hint": "GotY souls-like open world in the Lands Between"},
    {"word": "DROIDOS", "hint": "The ultimate stream workstation bot!"},
    {"word": "TWITCH", "hint": "Purple streaming platform"},
    {"word": "YOUTUBE", "hint": "Red video & live streaming giant"},
    {"word": "STREAMLABS", "hint": "Broadcasting suite"},
    {"word": "HEADSHOT", "hint": "Critical aiming precision"},
    {"word": "OBSIDIAN", "hint": "Deep dark reflective volcanic glass"}
]

current_game = {
    "active": False,
    "word": "",
    "scrambled": "",
    "hint": "",
    "reward": 350
}

def scramble_string(s):
    chars = list(s)
    random.shuffle(chars)
    scrambled = "".join(chars)
    if scrambled == s and len(s) > 1:
        return scramble_string(s)
    return scrambled

def on_command(user, cmd, args, droid):
    global current_game
    cmd = cmd.lower()
    
    if cmd == "!scramble":
        if current_game["active"]:
            droid.send_chat(f"🧩 Current Scramble: [{current_game['scrambled']}] | Hint: {current_game['hint']} | Type !guess <word> for {current_game['reward']} Coins!")
            return
            
        entry = random.choice(WORDS_DATABASE)
        current_game["word"] = entry["word"]
        current_game["scrambled"] = scramble_string(entry["word"])
        current_game["hint"] = entry["hint"]
        current_game["active"] = True
        
        droid.play_sound("coin")
        droid.trigger_overlay({
            "type": "game",
            "title": "WORD SCRAMBLE ROYALE",
            "subtitle": f"Unscramble: {current_game['scrambled']} (Reward: {current_game['reward']} Coins)",
            "effect": "sparkles"
        })
        droid.send_chat(f"🧩 [NEW SCRAMBLE] Unscramble this word: [{current_game['scrambled']}] (Hint: {current_game['hint']}) — First correct answer with '!guess <word>' wins {current_game['reward']} Coins!")
        droid.log("game", f"Started scramble game for word: {current_game['word']}")

    elif cmd == "!guess":
        if not current_game["active"]:
            droid.send_chat(f"@{user}, no active word scramble right now! Type !scramble to launch one!")
            return
            
        if not args or len(args) == 0:
            droid.send_chat(f"@{user}, usage: !guess <your_word>")
            return
            
        guess = args[0].strip().upper()
        if guess == current_game["word"]:
            reward = current_game["reward"]
            current_game["active"] = False
            
            droid.add_points(user, reward)
            droid.play_sound("victory")
            droid.trigger_overlay({
                "type": "game",
                "title": "SCRAMBLE SOLVED!",
                "subtitle": f"@{user} correctly guessed {guess} and won {reward} Coins!",
                "effect": "confetti"
            })
            droid.send_chat(f"🎉 BINGO! @{user} correctly unscrambled [{guess}] and won +{reward} DroidCoins! 🪙✨")
            droid.log("game", f"User {user} won scramble game with word {guess}")
        else:
            droid.send_chat(f"❌ @{user}, '{guess}' is not correct! Keep guessing! [{current_game['scrambled']}]")

    elif cmd == "!hint":
        if current_game["active"]:
            droid.send_chat(f"💡 Hint for [{current_game['scrambled']}]: {current_game['hint']} (First letter: {current_game['word'][0]})")
        else:
            droid.send_chat(f"@{user}, start a game first with !scramble!")
`
  },
  {
    id: 'plugin-roulette-chamber-py',
    name: 'Russian Roulette Chamber (Python)',
    filename: 'roulette_chamber.py',
    language: 'python',
    version: '1.1.0',
    author: 'MRADDICTIVE',
    description: 'Classic high-stakes 6-chamber cylinder gamble. Players bet points and pull the trigger. 5 safe clicks multiply points, 1 live round triggers chat timeout / point loss!',
    enabled: true,
    createdAt: '2026-08-21T14:00:00.000Z',
    updatedAt: '2026-08-27T11:00:00.000Z',
    registeredCommands: ['!roulette', '!chamber', '!spinchamber'],
    registeredMinigames: ['Chamber of Fortune'],
    registeredHooks: ['onCommand'],
    isBuiltIn: true,
    executionLogs: [
      { id: 'log-3', timestamp: '11:00:00', level: 'info', message: 'Loaded Python plugin: roulette_chamber.py successfully.' },
      { id: 'log-4', timestamp: '11:00:01', level: 'game', message: 'Registered commands: !roulette, !chamber, !spinchamber' }
    ],
    code: `# ====================================================================
# DroidOS Python Plugin: Russian Roulette 6-Chamber Minigame
# Author: MRADDICTIVE
# Version: 1.1.0
# Description: High-stakes chat luck game with animated overlay alerts
# ====================================================================

import random

cylinder = {
    "chambers": 6,
    "bullet_index": random.randint(0, 5),
    "current_index": 0,
    "streak": 0,
    "last_player": "None"
}

def spin_cylinder():
    global cylinder
    cylinder["bullet_index"] = random.randint(0, 5)
    cylinder["current_index"] = 0
    cylinder["streak"] = 0

def on_command(user, cmd, args, droid):
    global cylinder
    cmd = cmd.lower()
    
    if cmd in ["!roulette", "!chamber"]:
        bet = 100
        if args and len(args) > 0 and args[0].isdigit():
            bet = max(50, min(5000, int(args[0])))
            
        user_points = droid.get_points(user)
        if user_points < bet:
            droid.send_chat(f"@{user}, you need at least {bet} Coins to test the chamber! Your balance: {user_points}")
            return
            
        # Check chamber
        is_bullet = (cylinder["current_index"] == cylinder["bullet_index"])
        cylinder["current_index"] = (cylinder["current_index"] + 1) % 6
        cylinder["last_player"] = user
        
        if is_bullet:
            spin_cylinder()
            droid.add_points(user, -bet)
            droid.play_sound("airhorn")
            droid.trigger_overlay({
                "type": "game",
                "title": "💥 *BANG* ELIMINATED!",
                "subtitle": f"@{user} pulled the trigger on a loaded chamber and lost {bet} Coins!",
                "effect": "fireworks"
            })
            droid.send_chat(f"💥 *BANG!* @{user} pulled the trigger and hit the loaded chamber! Lost {bet} Coins! Cylinder reloaded & spun! 💀")
            droid.log("game", f"Roulette: {user} hit bullet and lost {bet} points")
        else:
            cylinder["streak"] += 1
            multiplier = 1.6 + (cylinder["streak"] * 0.2)
            winnings = int(bet * multiplier)
            profit = winnings - bet
            droid.add_points(user, profit)
            droid.play_sound("coin")
            droid.trigger_overlay({
                "type": "game",
                "title": "💨 *CLICK* SURVIVED!",
                "subtitle": f"@{user} survived chamber #{cylinder['current_index']}! Won +{profit} Coins ({multiplier:.1f}x)",
                "effect": "sparkles"
            })
            droid.send_chat(f"💨 *CLICK!* @{user} survived the chamber! Streak: {cylinder['streak']} | Payout: +{profit} DroidCoins! 🪙 (Next chamber dangerous!)")
            droid.log("game", f"Roulette: {user} survived chamber {cylinder['current_index']}")

    elif cmd == "!spinchamber":
        spin_cylinder()
        droid.play_sound("coin")
        droid.send_chat(f"🔄 @{user} spun the 6-slot roulette cylinder! The bullet is hidden in a random chamber!")
`
  },
  {
    id: 'plugin-dungeon-quest-cs',
    name: 'Dungeon Quest Party RPG (C#)',
    filename: 'DungeonQuest.cs',
    language: 'csharp',
    version: '2.0.0',
    author: 'MRADDICTIVE',
    description: 'Multiplayer C# party dungeon crawler! Chatters type !dungeon join to form an adventuring party, then type !strike to battle mythical dungeon bosses for legendary loot drops and stream badges.',
    enabled: true,
    createdAt: '2026-08-22T16:00:00.000Z',
    updatedAt: '2026-08-27T11:00:00.000Z',
    registeredCommands: ['!dungeon', '!strike', '!heal', '!loot'],
    registeredMinigames: ['Dungeon Quest RPG'],
    registeredHooks: ['onCommand'],
    isBuiltIn: true,
    executionLogs: [
      { id: 'log-5', timestamp: '11:00:00', level: 'info', message: 'Loaded C# plugin: DungeonQuest.cs compiled successfully.' },
      { id: 'log-6', timestamp: '11:00:01', level: 'game', message: 'Registered C# commands: !dungeon, !strike, !heal, !loot' }
    ],
    code: `// ====================================================================
// DroidOS C# Plugin: Dungeon Quest RPG Party Raid
// Author: MRADDICTIVE
// Version: 2.0.0
// Description: Party dungeon crawler system with boss encounters & loot
// ====================================================================

using System;
using System.Collections.Generic;

public class DungeonQuestPlugin
{
    private static bool IsRaidActive = false;
    private static string DungeonName = "The Sunken Catacombs of Azgoth";
    private static int BossHp = 1500;
    private static int BossMaxHp = 1500;
    private static List<string> PartyMembers = new List<string>();
    private static int TotalLootPool = 5000;

    public static void OnCommand(string user, string cmd, string[] args, dynamic droid)
    {
        cmd = cmd.ToLower();

        if (cmd == "!dungeon")
        {
            if (!IsRaidActive)
            {
                IsRaidActive = true;
                BossHp = 1500;
                PartyMembers.Clear();
                PartyMembers.Add(user);

                droid.PlaySound("victory");
                droid.TriggerOverlay(new {
                    type = "boss_attack",
                    title = "DUNGEON RAID BEGUN!",
                    subtitle = $"Dungeon: {DungeonName} (Boss HP: {BossHp})",
                    effect = "fireworks"
                });

                droid.SendChat($"⚔️ [DUNGEON RAID] @{user} opened the doors to {DungeonName}! Boss HP: {BossHp}. Type '!dungeon join' to enter or '!strike' to deal damage!");
                droid.Log("game", $"Dungeon started by {user}");
            }
            else if (args.Length > 0 && args[0].ToLower() == "join")
            {
                if (!PartyMembers.Contains(user))
                {
                    PartyMembers.Add(user);
                    droid.SendChat($"🛡️ @{user} joined the dungeon raid party! Total party members: {PartyMembers.Count}");
                }
                else
                {
                    droid.SendChat($"@{user}, you are already in the dungeon raiding squad!");
                }
            }
            else
            {
                droid.SendChat($"⚔️ Dungeon: {DungeonName} | Boss HP: {BossHp}/{BossMaxHp} | Party Size: {PartyMembers.Count} | Commands: !strike, !heal");
            }
        }
        else if (cmd == "!strike")
        {
            if (!IsRaidActive)
            {
                droid.SendChat($"@{user}, no active dungeon raid! Start one with '!dungeon'!");
                return;
            }

            Random rand = new Random();
            int damage = rand.Next(80, 260);
            BossHp -= damage;

            if (BossHp <= 0)
            {
                IsRaidActive = false;
                int share = TotalLootPool / Math.Max(1, PartyMembers.Count);
                
                foreach (string member in PartyMembers)
                {
                    droid.AddPoints(member, share);
                }

                droid.PlaySound("victory");
                droid.TriggerOverlay(new {
                    type = "boss_defeat",
                    title = "DUNGEON CLEARED!",
                    subtitle = $"Boss slain by @{user}! Loot split: {share} Coins per hero!",
                    effect = "confetti"
                });

                droid.SendChat($"🏆 DUNGEON CONQUERED! @{user} delivered the final strike for {damage} dmg! Each party hero ({PartyMembers.Count} players) received +{share} DroidCoins! 💎🪙");
                droid.Log("game", $"Dungeon boss cleared by {user}");
            }
            else
            {
                droid.PlaySound("coin");
                droid.SendChat($"⚔️ @{user} strikes for {damage} damage! Boss HP remaining: {BossHp}/{BossMaxHp} HP!");
            }
        }
    }
}
`
  },
  {
    id: 'plugin-dice-duel-cs',
    name: 'High-Low Dice Duel (C#)',
    filename: 'DiceDuel.cs',
    language: 'csharp',
    version: '1.0.0',
    author: 'MRADDICTIVE',
    description: 'High/Low dice wagering game written in C#. Viewers predict whether two rolled dice will sum higher or lower than 7.',
    enabled: true,
    createdAt: '2026-08-23T12:00:00.000Z',
    updatedAt: '2026-08-27T11:00:00.000Z',
    registeredCommands: ['!dice', '!roll7', '!high', '!low'],
    registeredMinigames: ['High-Low Dice Duel'],
    registeredHooks: ['onCommand'],
    isBuiltIn: true,
    executionLogs: [
      { id: 'log-7', timestamp: '11:00:00', level: 'info', message: 'Loaded C# plugin: DiceDuel.cs successfully.' }
    ],
    code: `// ====================================================================
// DroidOS C# Plugin: High-Low Dice Duel
// Author: MRADDICTIVE
// Version: 1.0.0
// Description: Predict whether 2D6 dice sum High (>7), Low (<7), or Lucky 7!
// ====================================================================

using System;

public class DiceDuelPlugin
{
    public static void OnCommand(string user, string cmd, string[] args, dynamic droid)
    {
        cmd = cmd.ToLower();

        if (cmd == "!dice" || cmd == "!high" || cmd == "!low" || cmd == "!roll7")
        {
            int bet = 100;
            string prediction = "high";

            if (cmd == "!high") prediction = "high";
            else if (cmd == "!low") prediction = "low";
            else if (cmd == "!roll7") prediction = "7";
            else if (args.Length > 0)
            {
                prediction = args[0].ToLower();
                if (args.Length > 1 && int.TryParse(args[1], out int parsedBet))
                {
                    bet = Math.Max(20, Math.Min(2500, parsedBet));
                }
            }

            int userBalance = droid.GetPoints(user);
            if (userBalance < bet)
            {
                droid.SendChat($"@{user}, you need at least {bet} Coins! Your balance: {userBalance}");
                return;
            }

            Random rand = new Random();
            int die1 = rand.Next(1, 7);
            int die2 = rand.Next(1, 7);
            int sum = die1 + die2;

            bool won = false;
            double multiplier = 2.0;

            if (prediction == "high" && sum > 7) won = true;
            else if (prediction == "low" && sum < 7) won = true;
            else if (prediction == "7" && sum == 7)
            {
                won = true;
                multiplier = 5.0; // 5x payout for exact 7!
            }

            if (won)
            {
                int profit = (int)(bet * multiplier) - bet;
                droid.AddPoints(user, profit);
                droid.PlaySound("victory");
                droid.TriggerOverlay(new {
                    type = "game",
                    title = "DICE DUEL WON!",
                    subtitle = $"Rolled [{die1} + {die2} = {sum}]! Won +{profit} Coins!",
                    effect = "sparkles"
                });
                droid.SendChat($"🎲 @{user} predicted [{prediction.ToUpper()}] and rolled [{die1} + {die2} = {sum}]! WON +{profit} DroidCoins ({multiplier}x payout)! 🎉");
            }
            else
            {
                droid.AddPoints(user, -bet);
                droid.PlaySound("airhorn");
                droid.SendChat($"🎲 @{user} predicted [{prediction.ToUpper()}] but rolled [{die1} + {die2} = {sum}]! Lost {bet} Coins! 😢");
            }
        }
    }
}
`
  },
  {
    id: 'plugin-trivia-royale-js',
    name: 'Trivia Royale Live (JavaScript)',
    filename: 'trivia_royale.js',
    language: 'javascript',
    version: '1.3.0',
    author: 'MRADDICTIVE',
    description: 'Dynamic interactive stream trivia system with multiple question categories, points rewards, and automatic answer detection in chat!',
    enabled: true,
    createdAt: '2026-08-24T09:00:00.000Z',
    updatedAt: '2026-08-27T11:00:00.000Z',
    registeredCommands: ['!trivia', '!ans', '!answer'],
    registeredMinigames: ['Trivia Royale'],
    registeredHooks: ['onChatMessage', 'onCommand'],
    isBuiltIn: true,
    executionLogs: [
      { id: 'log-8', timestamp: '11:00:00', level: 'info', message: 'Loaded JavaScript plugin: trivia_royale.js successfully.' }
    ],
    code: `// ====================================================================
// DroidOS JavaScript Plugin: Trivia Royale Live
// Author: MRADDICTIVE
// Version: 1.3.0
// Description: Multi-category trivia engine with instant chat answer matching
// ====================================================================

const TRIVIA_QUESTIONS = [
  {
    q: "In what year was the first original Grand Theft Auto game released?",
    a: ["1997", "97"],
    displayAnswer: "1997",
    category: "Gaming History",
    reward: 300
  },
  {
    q: "What is the name of Mario's pet dinosaur companion?",
    a: ["yoshi"],
    displayAnswer: "Yoshi",
    category: "Nintendo",
    reward: 200
  },
  {
    q: "What programming language was used to build the original Minecraft game?",
    a: ["java"],
    displayAnswer: "Java",
    category: "Coding & Tech",
    reward: 250
  },
  {
    q: "What is the highest competitive rank in Rocket League?",
    a: ["supersonic legend", "ssl"],
    displayAnswer: "Supersonic Legend (SSL)",
    category: "Esports",
    reward: 350
  },
  {
    q: "What is the legendary Master Sword's blade often called in Zelda lore?",
    a: ["blade of evil's bane", "blade of evils bane"],
    displayAnswer: "Blade of Evil's Bane",
    category: "Gaming Lore",
    reward: 400
  }
];

let activeTrivia = {
  active: false,
  question: "",
  answers: [],
  displayAnswer: "",
  category: "",
  reward: 300
};

export function onCommand(user, cmd, args, droid) {
  cmd = cmd.toLowerCase();

  if (cmd === "!trivia") {
    if (activeTrivia.active) {
      droid.sendChat(\`❓ [ACTIVE TRIVIA] (\${activeTrivia.category}): \${activeTrivia.question} — Type '!ans <your_answer>' for \${activeTrivia.reward} Coins!\`);
      return;
    }

    const item = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
    activeTrivia = {
      active: true,
      question: item.q,
      answers: item.a,
      displayAnswer: item.displayAnswer,
      category: item.category,
      reward: item.reward
    };

    droid.playSound("coin");
    droid.triggerOverlay({
      type: "game",
      title: "TRIVIA ROYALE QUESTION",
      subtitle: item.q,
      description: \`Category: \${item.category} • Bounty: \${item.reward} Coins\`,
      effect: "sparkles"
    });

    droid.sendChat(\`❓ [TRIVIA ROYALE] (\${item.category}): \${item.q} — Type '!ans <answer>' to claim \${item.reward} DroidCoins!\`);
    droid.log("game", \`Started trivia: \${item.q}\`);
  } else if (cmd === "!ans" || cmd === "!answer") {
    if (!activeTrivia.active) {
      droid.sendChat(\`@{user}, no active trivia! Start one with !trivia!\`);
      return;
    }

    if (!args || args.length === 0) {
      droid.sendChat(\`@{user}, usage: !ans <your answer>\`);
      return;
    }

    const input = args.join(" ").trim().toLowerCase();
    const isCorrect = activeTrivia.answers.some(a => input === a || input.includes(a));

    if (isCorrect) {
      const reward = activeTrivia.reward;
      const ansText = activeTrivia.displayAnswer;
      activeTrivia.active = false;

      droid.addPoints(user, reward);
      droid.playSound("victory");
      droid.triggerOverlay({
        type: "game",
        title: "TRIVIA CHAMPION!",
        subtitle: \`@{user} answered correctly: \${ansText}! (+\${reward} Coins)\`,
        effect: "confetti"
      });

      droid.sendChat(\`🏆 CORRECT! @{user} solved the trivia with '\${ansText}' and won +\${reward} DroidCoins! ✨\`);
      droid.log("game", \`User \${user} won trivia with answer \${ansText}\`);
    } else {
      droid.sendChat(\`❌ @{user}, '\${input}' is incorrect! Try again!\`);
    }
  }
}
`
  }
];

const STORAGE_KEY_PLUGINS = 'droidos_script_plugins';

export function loadPluginsLocal(): ScriptPlugin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLUGINS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with builtin plugins so updates exist
        const custom = parsed.filter((p: ScriptPlugin) => !p.isBuiltIn);
        return [...BUILTIN_PLUGINS, ...custom];
      }
    }
  } catch (e) {
    console.warn('[DroidOS] Could not load plugins from storage', e);
  }
  return BUILTIN_PLUGINS;
}

export function savePluginsLocal(plugins: ScriptPlugin[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PLUGINS, JSON.stringify(plugins));
  } catch (e) {
    console.warn('[DroidOS] Could not save plugins to storage', e);
  }
}

/**
 * Parses an uploaded script file (.py, .cs, .js, .ts) and creates a registered ScriptPlugin object.
 */
export function parseUploadedScriptFile(filename: string, content: string): ScriptPlugin {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  let language: ScriptLanguage = 'python';
  if (ext === 'cs') language = 'csharp';
  else if (ext === 'js') language = 'javascript';
  else if (ext === 'ts') language = 'typescript';
  else if (ext === 'py') language = 'python';

  // Extract metadata from headers/comments
  const nameMatch = content.match(/(?:Plugin|Name|Title)\s*:\s*([^\r\n]+)/i);
  const authorMatch = content.match(/(?:Author|By)\s*:\s*([^\r\n]+)/i);
  const versionMatch = content.match(/(?:Version|v)\s*:\s*([^\r\n]+)/i);
  const descMatch = content.match(/(?:Description|Desc)\s*:\s*([^\r\n]+)/i);

  // Extract commands (!command)
  const cmdMatches = Array.from(content.matchAll(/!([a-zA-Z0-9_-]+)/g)).map((m) => `!${m[1]}`);
  const registeredCommands = Array.from(new Set(cmdMatches));

  // Extract hooks
  const registeredHooks: Array<'onChatMessage' | 'onPointsRedeem' | 'onCommand' | 'onOverlayEvent' | 'onGameStart'> = [];
  if (/on_chat_message|OnChatMessage|onChatMessage/i.test(content)) registeredHooks.push('onChatMessage');
  if (/on_command|OnCommand|onCommand/i.test(content) || registeredCommands.length > 0) registeredHooks.push('onCommand');
  if (/on_points_redeem|OnPointsRedeem|onPointsRedeem/i.test(content)) registeredHooks.push('onPointsRedeem');
  if (/on_overlay_event|OnOverlayEvent|onOverlayEvent/i.test(content)) registeredHooks.push('onOverlayEvent');
  if (/on_game_start|OnGameStart|onGameStart/i.test(content)) registeredHooks.push('onGameStart');

  const baseName = filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  const cleanTitle = nameMatch ? nameMatch[1].trim() : `${baseName.charAt(0).toUpperCase() + baseName.slice(1)} Script`;

  const newPlugin: ScriptPlugin = {
    id: `plugin-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: cleanTitle,
    filename: filename,
    language: language,
    version: versionMatch ? versionMatch[1].trim() : '1.0.0',
    author: authorMatch ? authorMatch[1].trim() : 'Custom Streamer',
    description: descMatch ? descMatch[1].trim() : `Custom ${language.toUpperCase()} plugin uploaded for DroidOS stream automation.`,
    code: content,
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    registeredCommands: registeredCommands.length > 0 ? registeredCommands : ['!custom'],
    registeredMinigames: [cleanTitle],
    registeredHooks: registeredHooks.length > 0 ? registeredHooks : ['onCommand'],
    executionLogs: [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: 'info',
        message: `Plugin ${filename} uploaded and parsed successfully (${language.toUpperCase()}). Registered ${registeredCommands.length} commands.`
      }
    ]
  };

  return newPlugin;
}

/**
 * Sandboxed runner for executing plugins in the browser.
 * Simulates Python, C#, and JS execution against the DroidOS API.
 */
export function executePluginCommand(
  plugin: ScriptPlugin,
  user: string,
  commandName: string,
  args: string[],
  context: PluginExecutionContext
): boolean {
  if (!plugin.enabled) return false;

  const droidApi = {
    send_chat: (msg: string) => context.onSendReply(msg),
    sendChat: (msg: string) => context.onSendReply(msg),
    SendChat: (msg: string) => context.onSendReply(msg),
    get_points: (targetUser: string) => {
      const v = context.viewers.find((item) => item.username.toLowerCase() === targetUser.toLowerCase());
      return v?.points ?? 100;
    },
    getPoints: (targetUser: string) => {
      const v = context.viewers.find((item) => item.username.toLowerCase() === targetUser.toLowerCase());
      return v?.points ?? 100;
    },
    GetPoints: (targetUser: string) => {
      const v = context.viewers.find((item) => item.username.toLowerCase() === targetUser.toLowerCase());
      return v?.points ?? 100;
    },
    add_points: (targetUser: string, amount: number) => context.onUpdatePoints(targetUser, amount),
    addPoints: (targetUser: string, amount: number) => context.onUpdatePoints(targetUser, amount),
    AddPoints: (targetUser: string, amount: number) => context.onUpdatePoints(targetUser, amount),
    trigger_overlay: (alert: Partial<OverlayAlert>) => context.onTriggerOverlay(alert),
    triggerOverlay: (alert: Partial<OverlayAlert>) => context.onTriggerOverlay(alert),
    TriggerOverlay: (alert: Partial<OverlayAlert>) => context.onTriggerOverlay(alert),
    play_sound: (preset: string) => context.onPlaySound(preset),
    playSound: (preset: string) => context.onPlaySound(preset),
    PlaySound: (preset: string) => context.onPlaySound(preset),
    log: (level: 'info' | 'warn' | 'error' | 'game', message: string) => {
      if (!plugin.executionLogs) plugin.executionLogs = [];
      plugin.executionLogs.unshift({
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        level,
        message
      });
      if (plugin.executionLogs.length > 50) plugin.executionLogs.pop();
    },
    Log: (level: string, message: string) => {
      if (!plugin.executionLogs) plugin.executionLogs = [];
      plugin.executionLogs.unshift({
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString(),
        level: (level as any) || 'info',
        message
      });
      if (plugin.executionLogs.length > 50) plugin.executionLogs.pop();
    }
  };

  try {
    // If it's one of the built-in plugins or JS, execute via interactive evaluation/sandbox
    if (plugin.id === 'plugin-word-scramble-py') {
      runWordScrambleSandbox(user, commandName, args, droidApi);
      return true;
    } else if (plugin.id === 'plugin-roulette-chamber-py') {
      runRouletteSandbox(user, commandName, args, droidApi);
      return true;
    } else if (plugin.id === 'plugin-dungeon-quest-cs') {
      runDungeonQuestSandbox(user, commandName, args, droidApi);
      return true;
    } else if (plugin.id === 'plugin-dice-duel-cs') {
      runDiceDuelSandbox(user, commandName, args, droidApi);
      return true;
    } else if (plugin.id === 'plugin-trivia-royale-js') {
      runTriviaSandbox(user, commandName, args, droidApi);
      return true;
    } else {
      // General custom script execution simulation
      runGeneralCustomScript(plugin, user, commandName, args, droidApi);
      return true;
    }
  } catch (err: any) {
    droidApi.log('error', `Plugin error in ${plugin.filename}: ${err?.message || err}`);
    return false;
  }
}

// Builtin Sandbox state instances
const scrambleState = {
  active: false,
  word: '',
  scrambled: '',
  hint: '',
  reward: 350
};

const wordsPool = [
  { word: 'MINECRAFT', hint: 'Block building sandbox game' },
  { word: 'OVERWATCH', hint: 'Hero shooter with payloads' },
  { word: 'VALORANT', hint: 'Tactical 5v5 shooter with agents' },
  { word: 'FORTNITE', hint: 'Battle royale with building & battle bus' },
  { word: 'ELDENRING', hint: 'GotY souls-like open world in the Lands Between' },
  { word: 'DROIDOS', hint: 'The ultimate stream workstation bot!' },
  { word: 'TWITCH', hint: 'Purple streaming platform' },
  { word: 'YOUTUBE', hint: 'Red video & live streaming giant' },
  { word: 'HEADSHOT', hint: 'Critical aiming precision' },
  { word: 'CYBERPUNK', hint: 'Neon sci-fi Night City RPG' },
  { word: 'ROCKETLEAGUE', hint: 'Car soccer acrobatics' }
];

function runWordScrambleSandbox(user: string, cmd: string, args: string[], droid: any) {
  const c = cmd.toLowerCase();
  if (c === '!scramble') {
    if (scrambleState.active) {
      droid.send_chat(`🧩 Current Scramble: [${scrambleState.scrambled}] | Hint: ${scrambleState.hint} | Type !guess <word> for ${scrambleState.reward} Coins!`);
      return;
    }
    const item = wordsPool[Math.floor(Math.random() * wordsPool.length)];
    const chars = item.word.split('').sort(() => Math.random() - 0.5);
    scrambleState.word = item.word;
    scrambleState.scrambled = chars.join('');
    scrambleState.hint = item.hint;
    scrambleState.active = true;

    droid.play_sound('coin');
    droid.trigger_overlay({
      type: 'game',
      title: 'WORD SCRAMBLE ROYALE',
      subtitle: `Unscramble: ${scrambleState.scrambled} (Reward: ${scrambleState.reward} Coins)`,
      effect: 'sparkles'
    });
    droid.send_chat(`🧩 [NEW SCRAMBLE] Unscramble this word: [${scrambleState.scrambled}] (Hint: ${scrambleState.hint}) — First correct answer with '!guess <word>' wins ${scrambleState.reward} DroidCoins!`);
    droid.log('game', `Started scramble game for: ${scrambleState.word}`);
  } else if (c === '!guess') {
    if (!scrambleState.active) {
      droid.send_chat(`@${user}, no active word scramble right now! Type !scramble to start one!`);
      return;
    }
    if (!args || args.length === 0) {
      droid.send_chat(`@${user}, usage: !guess <word>`);
      return;
    }
    const guess = args[0].trim().toUpperCase();
    if (guess === scrambleState.word) {
      const reward = scrambleState.reward;
      scrambleState.active = false;
      droid.add_points(user, reward);
      droid.play_sound('victory');
      droid.trigger_overlay({
        type: 'game',
        title: 'SCRAMBLE SOLVED!',
        subtitle: `@${user} correctly guessed ${guess} and won ${reward} Coins!`,
        effect: 'confetti'
      });
      droid.send_chat(`🎉 BINGO! @${user} correctly unscrambled [${guess}] and won +${reward} DroidCoins! 🪙✨`);
      droid.log('game', `User ${user} won scramble game with ${guess}`);
    } else {
      droid.send_chat(`❌ @${user}, '${guess}' is incorrect! Keep guessing! [${scrambleState.scrambled}]`);
    }
  } else if (c === '!hint') {
    if (scrambleState.active) {
      droid.send_chat(`💡 Hint for [${scrambleState.scrambled}]: ${scrambleState.hint} (First letter: ${scrambleState.word[0]})`);
    } else {
      droid.send_chat(`@${user}, start a game first with !scramble!`);
    }
  }
}

const rouletteState = {
  bulletIndex: Math.floor(Math.random() * 6),
  currentIndex: 0,
  streak: 0
};

function runRouletteSandbox(user: string, cmd: string, args: string[], droid: any) {
  const c = cmd.toLowerCase();
  if (c === '!roulette' || c === '!chamber') {
    let bet = 100;
    if (args && args.length > 0 && !isNaN(Number(args[0]))) {
      bet = Math.max(50, Math.min(5000, Number(args[0])));
    }
    const userPoints = droid.get_points(user);
    if (userPoints < bet) {
      droid.send_chat(`@${user}, you need at least ${bet} Coins to test the chamber! Balance: ${userPoints}`);
      return;
    }

    const isBullet = rouletteState.currentIndex === rouletteState.bulletIndex;
    rouletteState.currentIndex = (rouletteState.currentIndex + 1) % 6;

    if (isBullet) {
      rouletteState.bulletIndex = Math.floor(Math.random() * 6);
      rouletteState.currentIndex = 0;
      rouletteState.streak = 0;
      droid.add_points(user, -bet);
      droid.play_sound('airhorn');
      droid.trigger_overlay({
        type: 'game',
        title: '💥 *BANG* ELIMINATED!',
        subtitle: `@${user} hit the loaded chamber and lost ${bet} Coins!`,
        effect: 'fireworks'
      });
      droid.send_chat(`💥 *BANG!* @${user} pulled the trigger and hit the loaded chamber! Lost ${bet} Coins! Cylinder reloaded & spun! 💀`);
      droid.log('game', `Roulette: ${user} hit bullet and lost ${bet} points`);
    } else {
      rouletteState.streak += 1;
      const multiplier = Number((1.5 + rouletteState.streak * 0.2).toFixed(1));
      const profit = Math.floor(bet * multiplier) - bet;
      droid.add_points(user, profit);
      droid.play_sound('coin');
      droid.trigger_overlay({
        type: 'game',
        title: '💨 *CLICK* SURVIVED!',
        subtitle: `@${user} survived chamber #${rouletteState.currentIndex}! Won +${profit} Coins (${multiplier}x)`,
        effect: 'sparkles'
      });
      droid.send_chat(`💨 *CLICK!* @${user} survived the chamber! Streak: ${rouletteState.streak} | Payout: +${profit} DroidCoins! 🪙`);
      droid.log('game', `Roulette: ${user} survived chamber ${rouletteState.currentIndex}`);
    }
  } else if (c === '!spinchamber') {
    rouletteState.bulletIndex = Math.floor(Math.random() * 6);
    rouletteState.currentIndex = 0;
    rouletteState.streak = 0;
    droid.play_sound('coin');
    droid.send_chat(`🔄 @${user} spun the 6-slot roulette cylinder! The bullet is randomly relocated!`);
  }
}

const dungeonState = {
  active: false,
  bossHp: 1500,
  bossMaxHp: 1500,
  party: new Set<string>()
};

function runDungeonQuestSandbox(user: string, cmd: string, args: string[], droid: any) {
  const c = cmd.toLowerCase();
  if (c === '!dungeon') {
    if (!dungeonState.active) {
      dungeonState.active = true;
      dungeonState.bossHp = 1500;
      dungeonState.party.clear();
      dungeonState.party.add(user);

      droid.play_sound('victory');
      droid.trigger_overlay({
        type: 'boss_attack',
        title: 'DUNGEON RAID BEGUN!',
        subtitle: `The Sunken Catacombs (Boss HP: ${dungeonState.bossHp})`,
        effect: 'fireworks'
      });
      droid.send_chat(`⚔️ [DUNGEON RAID] @${user} opened the dungeon raid! Boss HP: ${dungeonState.bossHp}. Type '!dungeon join' or '!strike' to attack!`);
      droid.log('game', `Dungeon started by ${user}`);
    } else if (args.length > 0 && args[0].toLowerCase() === 'join') {
      dungeonState.party.add(user);
      droid.send_chat(`🛡️ @${user} joined the dungeon raid party! Total heroes: ${dungeonState.party.size}`);
    } else {
      droid.send_chat(`⚔️ Dungeon: The Sunken Catacombs | Boss HP: ${dungeonState.bossHp}/${dungeonState.bossMaxHp} | Party: ${dungeonState.party.size} heroes | Type !strike to attack!`);
    }
  } else if (c === '!strike') {
    if (!dungeonState.active) {
      droid.send_chat(`@{user}, no active dungeon raid! Start one with '!dungeon'!`);
      return;
    }
    const damage = Math.floor(Math.random() * 180) + 80;
    dungeonState.bossHp -= damage;
    dungeonState.party.add(user);

    if (dungeonState.bossHp <= 0) {
      dungeonState.active = false;
      const share = Math.floor(5000 / Math.max(1, dungeonState.party.size));
      dungeonState.party.forEach((member) => droid.add_points(member, share));

      droid.play_sound('victory');
      droid.trigger_overlay({
        type: 'boss_defeat',
        title: 'DUNGEON CONQUERED!',
        subtitle: `Boss slain by @${user}! Split: ${share} Coins per hero!`,
        effect: 'confetti'
      });
      droid.send_chat(`🏆 DUNGEON CONQUERED! @${user} delivered the finishing blow for ${damage} dmg! All ${dungeonState.party.size} heroes received +${share} DroidCoins! 💎🪙`);
      droid.log('game', `Dungeon boss defeated by ${user}`);
    } else {
      droid.play_sound('coin');
      droid.send_chat(`⚔️ @${user} strikes for ${damage} damage! Boss HP remaining: ${dungeonState.bossHp}/${dungeonState.bossMaxHp} HP!`);
    }
  }
}

function runDiceDuelSandbox(user: string, cmd: string, args: string[], droid: any) {
  let bet = 100;
  let prediction = 'high';
  if (cmd === '!high') prediction = 'high';
  else if (cmd === '!low') prediction = 'low';
  else if (cmd === '!roll7') prediction = '7';
  else if (args.length > 0) {
    prediction = args[0].toLowerCase();
    if (args.length > 1 && !isNaN(Number(args[1]))) {
      bet = Math.max(20, Math.min(2500, Number(args[1])));
    }
  }

  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  const sum = d1 + d2;
  let won = false;
  let multiplier = 2.0;

  if (prediction === 'high' && sum > 7) won = true;
  else if (prediction === 'low' && sum < 7) won = true;
  else if (prediction === '7' && sum === 7) {
    won = true;
    multiplier = 5.0;
  }

  if (won) {
    const profit = Math.floor(bet * multiplier) - bet;
    droid.add_points(user, profit);
    droid.play_sound('victory');
    droid.trigger_overlay({
      type: 'game',
      title: 'DICE DUEL WON!',
      subtitle: `Rolled [${d1} + ${d2} = ${sum}]! Won +${profit} Coins!`,
      effect: 'sparkles'
    });
    droid.send_chat(`🎲 @${user} predicted [${prediction.toUpperCase()}] and rolled [${d1} + ${d2} = ${sum}]! WON +${profit} DroidCoins (${multiplier}x payout)! 🎉`);
  } else {
    droid.add_points(user, -bet);
    droid.play_sound('airhorn');
    droid.send_chat(`🎲 @${user} predicted [${prediction.toUpperCase()}] but rolled [${d1} + ${d2} = ${sum}]! Lost ${bet} Coins! 😢`);
  }
}

const triviaState = {
  active: false,
  q: '',
  answers: [] as string[],
  displayAnswer: '',
  category: '',
  reward: 300
};

const triviaPool = [
  { q: 'In what year was the first original Grand Theft Auto game released?', a: ['1997', '97'], display: '1997', cat: 'Gaming History', reward: 300 },
  { q: "What is the name of Mario's pet dinosaur companion?", a: ['yoshi'], display: 'Yoshi', cat: 'Nintendo', reward: 200 },
  { q: 'What programming language was used to build the original Minecraft game?', a: ['java'], display: 'Java', cat: 'Coding & Tech', reward: 250 },
  { q: 'What is the highest competitive rank in Rocket League?', a: ['supersonic legend', 'ssl'], display: 'Supersonic Legend (SSL)', cat: 'Esports', reward: 350 },
  { q: "What is the legendary Master Sword's blade often called in Zelda lore?", a: ["blade of evil's bane", 'blade of evils bane'], display: "Blade of Evil's Bane", cat: 'Gaming Lore', reward: 400 }
];

function runTriviaSandbox(user: string, cmd: string, args: string[], droid: any) {
  const c = cmd.toLowerCase();
  if (c === '!trivia') {
    if (triviaState.active) {
      droid.send_chat(`❓ [ACTIVE TRIVIA] (${triviaState.category}): ${triviaState.q} — Type '!ans <answer>' for ${triviaState.reward} Coins!`);
      return;
    }
    const item = triviaPool[Math.floor(Math.random() * triviaPool.length)];
    triviaState.active = true;
    triviaState.q = item.q;
    triviaState.answers = item.a;
    triviaState.displayAnswer = item.display;
    triviaState.category = item.cat;
    triviaState.reward = item.reward;

    droid.play_sound('coin');
    droid.trigger_overlay({
      type: 'game',
      title: 'TRIVIA ROYALE QUESTION',
      subtitle: item.q,
      description: `Category: ${item.cat} • Bounty: ${item.reward} Coins`,
      effect: 'sparkles'
    });
    droid.send_chat(`❓ [TRIVIA ROYALE] (${item.cat}): ${item.q} — Type '!ans <answer>' to claim ${item.reward} DroidCoins!`);
    droid.log('game', `Started trivia: ${item.q}`);
  } else if (c === '!ans' || c === '!answer') {
    if (!triviaState.active) {
      droid.send_chat(`@${user}, no active trivia! Start one with !trivia!`);
      return;
    }
    if (!args || args.length === 0) {
      droid.send_chat(`@${user}, usage: !ans <your answer>`);
      return;
    }
    const input = args.join(' ').trim().toLowerCase();
    const isCorrect = triviaState.answers.some((a) => input === a || input.includes(a));

    if (isCorrect) {
      const reward = triviaState.reward;
      const ans = triviaState.displayAnswer;
      triviaState.active = false;

      droid.add_points(user, reward);
      droid.play_sound('victory');
      droid.trigger_overlay({
        type: 'game',
        title: 'TRIVIA CHAMPION!',
        subtitle: `@${user} answered correctly: ${ans}! (+${reward} Coins)`,
        effect: 'confetti'
      });
      droid.send_chat(`🏆 CORRECT! @${user} solved the trivia with '${ans}' and won +${reward} DroidCoins! ✨`);
      droid.log('game', `User ${user} won trivia with ${ans}`);
    } else {
      droid.send_chat(`❌ @${user}, '${input}' is incorrect! Try again!`);
    }
  }
}

function runGeneralCustomScript(
  plugin: ScriptPlugin,
  user: string,
  commandName: string,
  args: string[],
  droid: any
) {
  // Safe JS execution if JS or simulated output
  if (plugin.language === 'javascript' || plugin.language === 'typescript') {
    try {
      const func = new Function('user', 'cmd', 'args', 'droid', plugin.code + '\nif (typeof onCommand === "function") onCommand(user, cmd, args, droid);');
      func(user, commandName, args, droid);
    } catch (e: any) {
      droid.send_chat(`⚙️ [${plugin.name}] Executed ${commandName} by @${user}`);
      droid.log('error', `Script error: ${e.message}`);
    }
  } else {
    // Python / C# custom simulation
    droid.send_chat(`⚙️ [${plugin.name}] Command '${commandName}' processed for @${user}! (${plugin.language.toUpperCase()} plugin active)`);
    droid.log('game', `Executed custom ${plugin.language} script for ${user}: ${commandName}`);
  }
}
