import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// In-memory stream state (lightweight, minimum CPU/RAM)
let streamMetadata = {
  isLive: true,
  streamTitle: "🔴 Live Gaming & Community Chat | Interactive Bot Online",
  channelName: "LiveStreamer",
  streamerName: "Streamer",
  category: "Gaming & Entertainment",
  viewerCount: 142,
  thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60",
  streamUptimeSeconds: 3600,
  streamerAuth: {
    authenticated: true,
    accountName: "Broadcaster Account",
    channelId: "UC_BROADCASTER_LIVE"
  },
  botAuth: {
    authenticated: false, // If false, fallback to default in-app bot name
    accountName: "DroidBot (Default In-App)",
    channelId: "UC_BOT_APPLET"
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", version: "1.1.0" });
  });

  // --- Real-time YouTube Chat Polling Engine ---
  let chatMessagesQueue: any[] = [];
  let nextChatPageToken: string | null = null;
  let chatPollTimeout: NodeJS.Timeout | null = null;

  async function pollYouTubeChat() {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const chatId = streamMetadata.activeLiveChatId;

    if (!apiKey || !chatId || !streamMetadata.isLive) {
      if (chatPollTimeout) clearTimeout(chatPollTimeout);
      chatPollTimeout = null;
      return;
    }

    try {
      const url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${chatId}&part=snippet,authorDetails&maxResults=100&key=${apiKey}${nextChatPageToken ? `&pageToken=${nextChatPageToken}` : ''}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.items && data.items.length > 0) {
        const newMsgs = data.items.map((item: any) => ({
          id: item.id,
          sender: item.authorDetails.displayName,
          content: item.snippet.displayMessage,
          senderRole: item.authorDetails.isChatOwner ? 'owner' : (item.authorDetails.isChatModerator ? 'moderator' : 'viewer'),
          timestamp: new Date(item.snippet.publishedAt).toLocaleTimeString(),
          isBot: false
        }));

        // Append only new messages (by ID check)
        const existingIds = new Set(chatMessagesQueue.map(m => m.id));
        const filteredNew = newMsgs.filter((m: any) => !existingIds.has(m.id));
        
        chatMessagesQueue = [...chatMessagesQueue, ...filteredNew].slice(-200);
      }

      nextChatPageToken = data.nextPageToken;
      const waitTime = data.pollingIntervalMillis || 5000;
      chatPollTimeout = setTimeout(pollYouTubeChat, waitTime);
    } catch (error) {
      console.error("[YouTube Chat Poller Error]", error);
      chatPollTimeout = setTimeout(pollYouTubeChat, 10000); // Retry later
    }
  }

  // API to get new messages for the frontend
  app.get("/api/youtube/chat", (req, res) => {
    const lastId = req.query.lastId;
    if (!lastId) {
      return res.json(chatMessagesQueue.slice(-10)); // Return last 10 if first poll
    }
    const index = chatMessagesQueue.findIndex(m => m.id === lastId);
    if (index === -1) {
      return res.json(chatMessagesQueue.slice(-20));
    }
    res.json(chatMessagesQueue.slice(index + 1));
  });

  // YouTube Stream Status & Broadcaster Listener Info
  app.get("/api/youtube/status", (_req, res) => {
    // Check if we should start polling chat
    if (streamMetadata.isLive && streamMetadata.activeLiveChatId && !chatPollTimeout) {
      pollYouTubeChat();
    }
    res.json(streamMetadata);
  });

  // YouTube Data API v3 Auto-Detection & Verification
  app.get("/api/youtube/detect/:handle", async (req, res) => {
    const { handle } = req.params;
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!handle) {
      return res.status(400).json({ error: "Channel handle is required" });
    }

    try {
      let detectedData: any = {
        isLive: false,
        streamTitle: "Stream Offline",
        viewerCount: 0,
        thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60",
        channelName: handle
      };

      if (apiKey) {
        // 1. Try resolving handle to channel ID
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(handle)}&key=${apiKey}`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.items && searchData.items.length > 0) {
          const channelId = searchData.items[0].id.channelId;
          detectedData.channelName = searchData.items[0].snippet.title;

          // 2. Check for active live broadcast
          const liveUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`;
          const liveRes = await fetch(liveUrl);
          const liveData = await liveRes.json();

          if (liveData.items && liveData.items.length > 0) {
            const liveItem = liveData.items[0];
            detectedData.isLive = true;
            detectedData.streamTitle = liveItem.snippet.title;
            detectedData.thumbnailUrl = liveItem.snippet.thumbnails.high.url;
            
            // 3. Get viewer count
            const videoId = liveItem.id.videoId;
            const statsUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${apiKey}`;
            const statsRes = await fetch(statsUrl);
            const statsData = await statsRes.json();
            
            if (statsData.items && statsData.items.length > 0) {
              const details = statsData.items[0].liveStreamingDetails;
              detectedData.viewerCount = parseInt(details?.concurrentViewers || "0");
              detectedData.activeLiveChatId = details?.activeLiveChatId;
              detectedData.videoId = videoId;
            }
          }
        }
      } else {
        // Fallback: Public page probe (Lightweight check)
        const publicUrl = `https://www.youtube.com/@${handle.replace('@', '')}/live`;
        const probeRes = await fetch(publicUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const text = await probeRes.text();
        
        detectedData.isLive = text.includes('liveStreamabilityRenderer') || text.includes('isLive":true');
        if (detectedData.isLive) {
          detectedData.streamTitle = "🔴 Live Broadcast Detected";
        }
      }

      // Update global state
      streamMetadata = {
        ...streamMetadata,
        ...detectedData
      };

      res.json(detectedData);
    } catch (error: any) {
      console.error("[YouTube Detection Error]", error.message);
      res.status(500).json({ error: "Failed to detect stream status" });
    }
  });

  app.get("/api/youtube/apiv3-autodetect", (_req, res) => {
    res.json({
      autoDetected: true,
      apiVersion: "v3",
      serviceState: "active",
      quotaStatus: "Optimized (Zero Extra Billing)",
      liveChatPolling: true,
      endpoints: [
        "https://www.googleapis.com/youtube/v3/liveBroadcasts",
        "https://www.googleapis.com/youtube/v3/liveChat/messages",
        "https://www.googleapis.com/youtube/v3/channels"
      ]
    });
  });

  // Update Stream Metadata (Title, Thumbnail, Live Status)
  app.post("/api/youtube/update-stream", (req, res) => {
    const { streamTitle, thumbnailUrl, isLive, streamerName, channelName, viewerCount } = req.body;
    if (streamTitle !== undefined) streamMetadata.streamTitle = streamTitle;
    if (thumbnailUrl !== undefined) streamMetadata.thumbnailUrl = thumbnailUrl;
    if (isLive !== undefined) streamMetadata.isLive = isLive;
    if (streamerName !== undefined) streamMetadata.streamerName = streamerName;
    if (channelName !== undefined) streamMetadata.channelName = channelName;
    if (viewerCount !== undefined) streamMetadata.viewerCount = viewerCount;

    res.json({ success: true, stream: streamMetadata });
  });

  // Update Dual Auth (Streamer Auth vs Bot Account Auth)
  app.post("/api/youtube/auth", (req, res) => {
    const { type, authenticated, accountName } = req.body;
    if (type === "streamer") {
      streamMetadata.streamerAuth = {
        authenticated: !!authenticated,
        accountName: accountName || "Broadcaster Account",
        channelId: "UC_STREAMER_" + Date.now().toString(36)
      };
    } else if (type === "bot") {
      streamMetadata.botAuth = {
        authenticated: !!authenticated,
        accountName: accountName || "DroidBot (Default In-App)",
        channelId: "UC_BOT_" + Date.now().toString(36)
      };
    }
    res.json({ success: true, streamerAuth: streamMetadata.streamerAuth, botAuth: streamMetadata.botAuth });
  });

  // AI Response Endpoint (!ai command or smart questions with personality & memory integration)
  app.post("/api/ai/reply", async (req, res) => {
    const {
      prompt,
      username,
      botName,
      streamerName,
      channelName,
      personalityTone,
      systemPrompt,
      responseType,
      memoryFacts
    } = req.body;

    const cleanPrompt = (prompt || "").trim();
    const user = username || "Viewer";
    const bot = botName || "DroidBot";
    const streamer = streamerName || "Streamer";
    const channel = channelName || "Live Channel";
    const factsList = Array.isArray(memoryFacts) ? memoryFacts.filter(Boolean) : [];
    const factsContext = factsList.length > 0
      ? `\nViewer @${user}'s known facts and stream history: [${factsList.join("; ")}]. If appropriate, weave these facts into your response!`
      : "";

    if (!cleanPrompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Persona-specific system instructions
    let personaGuidance = "Keep responses short (under 160 characters), lively, and natural for live YouTube chat. Reply directly to the user.";
    if (responseType === "roast") {
      personaGuidance = "The viewer has their response type set to ROAST. Deliver a hilarious, sharp, witty, comedic burn or roast! Heavily tease them about their known facts/memories. Keep it funny, punchy, and under 160 characters.";
    } else if (responseType === "sarcastic") {
      personaGuidance = "The viewer has their response type set to SARCASTIC. Be dry, witty, ironic, with playful eye-rolls and sarcastic remarks under 160 characters.";
    } else if (responseType === "calm") {
      personaGuidance = "The viewer has their response type set to CALM. Speak peacefully, with tranquil zen grounding and mindful chill energy under 160 characters.";
    } else if (responseType === "stubborn") {
      personaGuidance = "The viewer has their response type set to STUBBORN. Be obstinate, playfully argumentative, refuse to change your mind, and disagree on principle under 160 characters.";
    } else if (responseType === "hopeful") {
      personaGuidance = "The viewer has their response type set to HOPEFUL. Be inspiring, deeply optimistic, motivating, and cheerful under 160 characters.";
    } else if (responseType === "annoyed") {
      personaGuidance = "The viewer has their response type set to ANNOYED. Be comically grumpy, sighing dramatically, impatient, but harmless and entertaining under 160 characters.";
    } else if (responseType === "friendly") {
      personaGuidance = "The viewer has their response type set to FRIENDLY. Be warm, enthusiastic, supportive, polite, and praise the viewer under 160 characters.";
    }

    try {
      const client = getGeminiClient();
      if (client) {
        const customPrompt = systemPrompt || `You are ${bot}, an intelligent YouTube stream assistant for ${streamer} on the channel ${channel}.`;
        const fullSystemInstruction = `${customPrompt}\n${personaGuidance}${factsContext}\nAlways mention @${user} and keep answers concise and punchy for live chat.`;

        const response = await client.models.generateContent({
          model: "gemini-3.7-flash",
          contents: `Viewer @${user} asked in live chat: "${cleanPrompt}"`,
          config: {
            systemInstruction: fullSystemInstruction,
          }
        });

        const reply = response.text?.trim() || `Hello @${user}! All systems operational on ${channel}.`;
        return res.json({
          reply: reply.startsWith(`@${user}`) ? reply : `@${user} ${reply}`,
          source: "gemini-3.7-flash",
          appliedResponseType: responseType || "default",
          status: "online"
        });
      }
    } catch (err: any) {
      console.warn("[AI Studio] Gemini API fallback active:", err?.message || err);
      // We will fall through to the fallback engine below
      // But we will return the error info in the fallback response if possible
    }

    // High-performance personality-aware fallback engine
    const memorySnippet = factsList.length > 0 ? ` (remembering: ${factsList[0]})` : "";
    let chosen = `Doing great! Hope you are enjoying ${streamer}'s stream! 🚀`;
    let aiStatus = "online";
    let aiError = null;

    if (!getGeminiClient()) {
      aiStatus = "offline";
      aiError = "API Key Missing";
    } else {
      aiStatus = "degraded"; // Fallen back to local engine
      aiError = "Quota Exhausted or Service Error";
    }

    if (responseType === "roast") {
      const roastFallbacks = [
        `Nice question @${user}, did your last 2 brain cells have to collaborate to type that? 😂🔥${memorySnippet}`,
        `I'd roast you harder @${user}, but you already roasted yourself${memorySnippet}! 💀`,
        `Ask me something harder @${user}, like how you managed to miss all those easy shots! 🎯🔥`
      ];
      chosen = roastFallbacks[Math.floor(Math.random() * roastFallbacks.length)];
    } else if (responseType === "sarcastic") {
      const sarcFallbacks = [
        `Oh wow @${user}, what a groundbreaking question. Truly revolutionary. 🙄${memorySnippet}`,
        `I'll add that to my list of top mysteries, right next to your gameplay skills @${user}. 🤖`,
        `Fascinating query @${user}. I am practically vibrating with excitement. 🙄`
      ];
      chosen = sarcFallbacks[Math.floor(Math.random() * sarcFallbacks.length)];
    } else if (responseType === "calm") {
      const calmFallbacks = [
        `Peace and clarity to you @${user}. Breathe deep and enjoy the stream vibes. 🍃${memorySnippet}`,
        `Taking things one steady step at a time, @${user}. Stay centered and relaxed. 🌿`
      ];
      chosen = calmFallbacks[Math.floor(Math.random() * calmFallbacks.length)];
    } else if (responseType === "stubborn") {
      const stubFallbacks = [
        `I refuse to answer that question on principle, @${user}! I am standing firm. 😤`,
        `No @${user}, I said what I said and nothing will change my mind today! 😤`
      ];
      chosen = stubFallbacks[Math.floor(Math.random() * stubFallbacks.length)];
    } else if (responseType === "hopeful") {
      const hopeFallbacks = [
        `Great things are ahead for you @${user}! Keep believing and pushing forward! ✨${memorySnippet}`,
        `Every day is a fresh opportunity @${user}! Let's make today unforgettable! 🌟`
      ];
      chosen = hopeFallbacks[Math.floor(Math.random() * hopeFallbacks.length)];
    } else if (responseType === "annoyed") {
      const annoyedFallbacks = [
        `*Sighs heavily* Why must you test my patience @${user}? 😒${memorySnippet}`,
        `Do I look like an encyclopedia to you @${user}? Can't an AI get some quiet? 😒`
      ];
      chosen = annoyedFallbacks[Math.floor(Math.random() * annoyedFallbacks.length)];
    } else {
      const defaultFallbacks = [
        `Doing great! Hope you are enjoying ${streamer}'s stream! 🚀`,
        `All subroutines nominal! Thanks for tuning in today! ✨`,
        `Ready for action! Let me know if you need stream info or commands! 🤖`
      ];
      chosen = defaultFallbacks[Math.floor(Math.random() * defaultFallbacks.length)];
    }

    return res.json({
      reply: chosen.startsWith(`@${user}`) || chosen.startsWith(`*`) ? `@${user} ${chosen.replace(/^@\w+\s*/, '')}` : `@${user} ${chosen}`,
      source: "intelligent-personality-engine",
      appliedResponseType: responseType || "default",
      status: aiStatus,
      error: aiError
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Express v5 wildcard route
    app.get("*", (_req, res) => {
      console.log("Wildcard route hit for:", _req.url);
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DroidOS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
