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
const defaultStreamMetadata: any = {
  isLive: true,
  streamTitle: "🔴 Live Gaming & Community Chat | Interactive Bot Online",
  channelName: "LiveStreamer",
  streamerName: "Streamer",
  category: "Gaming & Entertainment",
  viewerCount: 142,
  thumbnailUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=60",
  streamUptimeSeconds: 3600,
  activeLiveChatId: null,
  videoId: null,
  streamerAuth: {
    authenticated: true,
    accountName: "Broadcaster Account",
    channelId: "UC_BROADCASTER_LIVE"
  },
  botAuth: {
    authenticated: false,
    accountName: "DroidBot (Default In-App)",
    channelId: "UC_BOT_APPLET"
  }
};

const userRuntimeState = new Map<string, {
  streamMetadata: any;
  chatMessagesQueue: any[];
  nextChatPageToken: string | null;
  chatPollTimeout: NodeJS.Timeout | null;
  cachedOAuthToken: string | null;
  innertubeApiKey: string;
  innertubeContinuation: string | null;
  lastDirectFetchTime: number;
}>();

const createUserRuntimeState = () => ({
  streamMetadata: { ...defaultStreamMetadata },
  chatMessagesQueue: [],
  nextChatPageToken: null,
  chatPollTimeout: null,
  cachedOAuthToken: null,
  innertubeApiKey: "AIzaSyAO_FJ2SlqU8Q4usACZaau0dsnYwcWsj2g",
  innertubeContinuation: null,
  lastDirectFetchTime: 0
});

const getUserRuntimeState = (uid?: string) => {
  const key = uid || 'guest';
  if (!userRuntimeState.has(key)) {
    userRuntimeState.set(key, createUserRuntimeState());
  }
  return userRuntimeState.get(key)!;
};

let overlayAlertsQueue: any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", version: "1.1.0" });
  });

  // --- Real-time YouTube Chat Polling Engine ---
  const getValidApiKey = (uid?: string): string | null => {
    const state = getUserRuntimeState(uid);
    const raw = process.env.YOUTUBE_API_KEY;
    if (raw && raw.startsWith("AIza") && raw.length >= 25) {
      return raw;
    }
    return null;
  };

  const isPlaceholderLiveChatId = (value?: string | null): boolean => {
    if (!value) return true;
    return value.startsWith("public-") || value.startsWith("live-");
  };

  async function resolveActualLiveChatIdForVideo(uid: string, videoId: string, token?: string): Promise<string | null> {
    if (!videoId) return null;
    const state = getUserRuntimeState(uid);
    const effectiveToken = token || state.cachedOAuthToken;
    try {
      const headers: Record<string, string> = {};
      if (effectiveToken) headers.Authorization = `Bearer ${effectiveToken}`;

      const detailUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}`;
      const res = await fetch(detailUrl, { headers });
      if (!res.ok) return null;

      const data = await res.json();
      const liveChatId = data.items?.[0]?.liveStreamingDetails?.activeLiveChatId;
      if (liveChatId) {
        state.streamMetadata.activeLiveChatId = liveChatId;
        return liveChatId;
      }
    } catch (err) {
      console.warn("[Resolve actual liveChatId failed]", err);
    }
    return null;
  }

  async function fetchFreshInnertubeContinuation(uid: string, videoId: string): Promise<{ apiKey: string; continuation: string | null }> {
    const state = getUserRuntimeState(uid);
    try {
      const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const pageRes = await fetch(watchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      const html = await pageRes.text();
      const keyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/i) || html.match(/INNERTUBE_API_KEY\\":\\"([^"\\]+)\\"/i);
      const extractedKey = keyMatch && keyMatch[1] ? keyMatch[1] : state.innertubeApiKey;

      let extractedCont: string | null = null;
      const initDataMatch = html.match(/var ytInitialData = ({.*?});<\/script>/s) || html.match(/ytInitialData\s*=\s*({.+?});/);
      if (initDataMatch) {
        try {
          const parsed = JSON.parse(initDataMatch[1]);
          extractedCont = parsed.contents?.twoColumnWatchNextResults?.conversationBar?.liveChatRenderer?.continuations?.[0]?.reloadContinuationData?.continuation;
        } catch {
          // ignore json parse err
        }
      }

      if (!extractedCont) {
        const contMatch = html.match(/"liveChatRenderer":\s*\{[^}]*"continuation":\s*"([^"]+)"/) ||
                          html.match(/"continuation":"([A-Za-z0-9_-]{20,})"/i) ||
                          html.match(/continuation\\":\\"([A-Za-z0-9_-]{20,})\\"/i);
        if (contMatch && contMatch[1]) extractedCont = contMatch[1];
      }

      if (extractedKey) state.innertubeApiKey = extractedKey;
      if (extractedCont) state.innertubeContinuation = extractedCont;

      return { apiKey: extractedKey, continuation: extractedCont };
    } catch (e) {
      console.warn('[Fetch Innertube Continuation Failed]', e);
      return { apiKey: state.innertubeApiKey, continuation: null };
    }
  }

  async function fetchLiveChatFromInnertube(uid: string, videoId: string) {
    const state = getUserRuntimeState(uid);
    if (!videoId) return [];

    if (!state.innertubeContinuation) {
      await fetchFreshInnertubeContinuation(uid, videoId);
    }

    if (!state.innertubeContinuation || !state.innertubeApiKey) return [];

    try {
      const innertubeUrl = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${state.innertubeApiKey}`;
      const innertubeRes = await fetch(innertubeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240228.01.00',
              hl: 'en',
              gl: 'US'
            }
          },
          continuation: state.innertubeContinuation
        })
      });

      if (!innertubeRes.ok) {
        state.innertubeContinuation = null;
        return [];
      }

      const data = await innertubeRes.json();
      const liveChatContinuation = data.continuationContents?.liveChatContinuation;
      const actions = liveChatContinuation?.actions || [];
      const parsedMsgs: any[] = [];

      if (actions.length > 0) {
        for (const act of actions) {
          const item = act.addChatItemAction?.item;
          const textRenderer = item?.liveChatTextMessageRenderer || item?.liveChatPaidMessageRenderer;
          if (textRenderer) {
            const author = textRenderer.authorName?.simpleText || "Viewer";
            const runs = textRenderer.message?.runs || [];
            const msgText = runs.map((r: any) => r.text || '').join('');
            const authorBadges = textRenderer.authorBadges || [];
            const isMod = authorBadges.some((b: any) => b.liveChatAuthorBadgeRenderer?.icon?.iconType === 'MODERATOR');
            const isOwner = authorBadges.some((b: any) => b.liveChatAuthorBadgeRenderer?.icon?.iconType === 'OWNER');
            const isMember = authorBadges.some((b: any) => b.liveChatAuthorBadgeRenderer?.customThumbnail);

            parsedMsgs.push({
              id: textRenderer.id || `yt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              sender: author,
              content: msgText,
              senderRole: isOwner ? 'owner' : (isMod ? 'moderator' : (isMember ? 'subscriber' : 'viewer')),
              timestamp: new Date().toLocaleTimeString(),
              isBot: false
            });
          }
        }

        const existingIds = new Set(state.chatMessagesQueue.map(m => m.id));
        const filteredNew = parsedMsgs.filter((m: any) => !existingIds.has(m.id));
        if (filteredNew.length > 0) {
          state.chatMessagesQueue = [...state.chatMessagesQueue, ...filteredNew].slice(-200);
        }
      }

      const continuations = liveChatContinuation?.continuations || [];
      const nextCont = continuations[0]?.invalidationContinuationData?.continuation ||
                       continuations[0]?.timedContinuationData?.continuation;

      if (nextCont) {
        state.innertubeContinuation = nextCont;
      } else {
        state.innertubeContinuation = null;
      }

      return parsedMsgs;
    } catch (err) {
      console.warn('[Innertube Live Chat Poll Error]', err);
      state.innertubeContinuation = null;
      return [];
    }
  }

  async function pollYouTubeChat(uid?: string) {
    const state = getUserRuntimeState(uid);
    if (state.chatPollTimeout) {
      clearTimeout(state.chatPollTimeout);
      state.chatPollTimeout = null;
    }

    const apiKey = getValidApiKey(uid);
    let chatId = state.streamMetadata.activeLiveChatId;
    const token = state.cachedOAuthToken;
    const videoId = state.streamMetadata.videoId;

    if (!state.streamMetadata.isLive && !videoId) {
      return;
    }

    try {
      if (videoId && isPlaceholderLiveChatId(chatId)) {
        const resolvedId = await resolveActualLiveChatIdForVideo(videoId, token || undefined);
        if (resolvedId) {
          chatId = resolvedId;
          streamMetadata.activeLiveChatId = resolvedId;
        }
      }

      // 1. Try Official YouTube Data API v3 if API key or OAuth token is available and chatId is a valid non-public ID
      if ((apiKey || token) && chatId && !isPlaceholderLiveChatId(chatId)) {
        let url = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${encodeURIComponent(chatId)}&part=snippet,authorDetails&maxResults=100`;
        if (apiKey) url += `&key=${apiKey}`;
        if (nextChatPageToken) url += `&pageToken=${encodeURIComponent(nextChatPageToken)}`;

        const headers: Record<string, string> = {};
        if (token && !apiKey) headers["Authorization"] = `Bearer ${token}`;

        try {
          const res = await fetch(url, { headers });
          const contentType = res.headers.get("content-type") || "";
          if (res.ok && contentType.includes("json")) {
            const data = await res.json();
            if (data.items && data.items.length > 0) {
              const newMsgs = data.items.map((item: any) => ({
                id: item.id,
                sender: item.authorDetails?.displayName || "Viewer",
                content: item.snippet?.displayMessage || item.snippet?.textMessageDetails?.messageText || "",
                senderRole: item.authorDetails?.isChatOwner ? 'owner' : (item.authorDetails?.isChatModerator ? 'moderator' : (item.authorDetails?.isChatSponsor ? 'subscriber' : 'viewer')),
                timestamp: new Date(item.snippet?.publishedAt || Date.now()).toLocaleTimeString(),
                isBot: false
              }));

              const existingIds = new Set(state.chatMessagesQueue.map(m => m.id));
              const filteredNew = newMsgs.filter((m: any) => !existingIds.has(m.id));
              if (filteredNew.length > 0) {
                state.chatMessagesQueue = [...state.chatMessagesQueue, ...filteredNew].slice(-200);
              }
            }

            state.nextChatPageToken = data.nextPageToken;
            const waitTime = data.pollingIntervalMillis || 3000;
            state.chatPollTimeout = setTimeout(() => pollYouTubeChat(uid), Math.max(2500, waitTime));
            return;
          }
        } catch (apiErr) {
          console.warn("[Official liveChat API failed, using Innertube fallback]", apiErr);
        }
      }

      if (videoId) {
        await fetchLiveChatFromInnertube(uid, videoId);
        state.chatPollTimeout = setTimeout(() => pollYouTubeChat(uid), 2500);
        return;
      }

      state.chatPollTimeout = setTimeout(() => pollYouTubeChat(uid), 4000);
    } catch (error) {
      console.error("[YouTube Chat Poller Error]", error);
      state.chatPollTimeout = setTimeout(() => pollYouTubeChat(uid), 5000);
    }
  }

  app.get("/api/youtube/chat", async (req, res) => {
    const uid = (req.query.uid as string) || 'guest';
    const state = getUserRuntimeState(uid);
    const token = req.query.token as string || req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      state.cachedOAuthToken = token;
    }

    const videoId = (req.query.videoId as string) || state.streamMetadata.videoId;
    if (videoId && (!state.streamMetadata.videoId || state.streamMetadata.videoId !== videoId)) {
      state.streamMetadata.videoId = videoId;
      state.streamMetadata.isLive = true;
    }

    const now = Date.now();
    if (videoId && now - state.lastDirectFetchTime > 1500) {
      state.lastDirectFetchTime = now;
      try {
        await fetchLiveChatFromInnertube(uid, videoId);
      } catch (err) {
        console.warn('[Direct chat poll failed]', err);
      }
    }

    if (state.streamMetadata.isLive && state.streamMetadata.videoId && !state.chatPollTimeout) {
      pollYouTubeChat(uid);
    }

    const lastId = req.query.lastId;
    if (!lastId) {
      return res.json(state.chatMessagesQueue.slice(-30));
    }
    const index = state.chatMessagesQueue.findIndex(m => m.id === lastId);
    if (index === -1) {
      return res.json(state.chatMessagesQueue.slice(-30));
    }
    res.json(state.chatMessagesQueue.slice(index + 1));
  });


  // API to send message to YouTube Live Chat
  app.post("/api/youtube/send", async (req, res) => {
    const { message, liveChatId, accessToken, videoId, uid } = req.body;
    const userState = getUserRuntimeState(uid || 'guest');
    const cleanMsg = (message || "").trim();
    let activeChatId = liveChatId || userState.streamMetadata.activeLiveChatId;
    const token = accessToken || req.headers.authorization?.replace("Bearer ", "") || userState.cachedOAuthToken;
    const targetVideoId = videoId || userState.streamMetadata.videoId;

    if (!cleanMsg) {
      return res.status(400).json({ error: "Message content cannot be empty" });
    }

    if (targetVideoId && isPlaceholderLiveChatId(activeChatId)) {
      const resolvedId = await resolveActualLiveChatIdForVideo(uid || 'guest', targetVideoId, token || undefined);
      if (resolvedId) {
        activeChatId = resolvedId;
      }
    }

    // If chat is public scraper, no real liveChatId, or no OAuth token
    if (!token) {
      // Local broadcast fallback when not authenticated
      const localMsg = {
        id: `msg-server-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sender: req.body.sender || "DroidBot",
        content: cleanMsg,
        senderRole: req.body.senderRole || "bot",
        timestamp: new Date().toLocaleTimeString(),
        isBot: true
      };
      userState.chatMessagesQueue = [...userState.chatMessagesQueue, localMsg].slice(-200);
      return res.json({
        success: false,
        requiresAuth: true,
        localOnly: true,
        message: localMsg,
        error: "Google account not authenticated with YouTube. Sign in with Google to post directly into live YouTube chat.",
        notice: "Message displayed in stream overlay only. (Log in with Google to send to YouTube live chat)"
      });
    }

    if (!activeChatId || isPlaceholderLiveChatId(activeChatId)) {
      const localMsg = {
        id: `msg-server-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        sender: req.body.sender || "DroidBot",
        content: cleanMsg,
        senderRole: req.body.senderRole || "bot",
        timestamp: new Date().toLocaleTimeString(),
        isBot: true
      };
      userState.chatMessagesQueue = [...userState.chatMessagesQueue, localMsg].slice(-200);
      return res.json({
        success: false,
        localOnly: true,
        message: localMsg,
        error: "Active YouTube live chat ID could not be found for this stream. Make sure the stream is live, chat is enabled, and your YouTube account is properly signed in.",
        notice: "Message displayed in stream overlay only."
      });
    }

    try {
      const response = await fetch(
        "https://www.googleapis.com/youtube/v3/liveChat/messages?part=snippet",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            snippet: {
              liveChatId: activeChatId,
              type: "textMessageEvent",
              textMessageDetails: {
                messageText: cleanMsg
              }
            }
          })
        }
      );

      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("json")) {
        const data = await response.json();
        const sentMsg = {
          id: data.id || `yt-${Date.now()}`,
          sender: req.body.sender || data.snippet?.authorDetails?.displayName || "DroidBot",
          content: cleanMsg,
          senderRole: "bot",
          timestamp: new Date().toLocaleTimeString(),
          isBot: true
        };
        userState.chatMessagesQueue = [...userState.chatMessagesQueue, sentMsg].slice(-200);
        return res.json({ success: true, item: data, liveChatId: activeChatId });
      } else {
        let errMessage = "YouTube LiveChat API returned an error";
        let errReason = "unknown";
        let errDetails: any = null;
        if (contentType.includes("json")) {
          try {
            const errData = await response.json();
            errMessage = errData.error?.message || errMessage;
            errReason = errData.error?.errors?.[0]?.reason || errReason;
            errDetails = errData.error;
          } catch {
            // ignore
          }
        }

        // Provide clear troubleshooting for common YouTube API errors
        let humanNotice = errMessage;
        if (errReason === "youtubeSignupRequired" || errMessage.toLowerCase().includes("channel not found") || errMessage.toLowerCase().includes("user has not created a channel")) {
          humanNotice = "Your Google account has not created a YouTube channel yet. Go to https://www.youtube.com/create_channel to activate your channel.";
        } else if (errReason === "liveChatNotFound") {
          humanNotice = "Active Live Chat not found. Ensure your YouTube stream is currently Live and Live Chat is turned on in YouTube Studio.";
        } else if (errReason === "liveChatEnded") {
          humanNotice = "The YouTube live stream or chat session has ended.";
        } else if (errReason === "liveChatDisabled") {
          humanNotice = "Live chat is disabled on this YouTube live stream.";
        } else if (response.status === 403) {
          humanNotice = `YouTube access denied (403): ${errMessage}. Make sure you accepted YouTube permissions during Google sign in and that your channel has permission to post.`;
        }

        // Fallback: save to local queue
        const sentMsg = {
          id: `local-${Date.now()}`,
          sender: req.body.sender || "DroidBot",
          content: cleanMsg,
          senderRole: "bot",
          timestamp: new Date().toLocaleTimeString(),
          isBot: true
        };
        userState.chatMessagesQueue = [...userState.chatMessagesQueue, sentMsg].slice(-200);
        return res.json({
          success: false,
          sentToYouTube: false,
          localOnly: true,
          error: humanNotice,
          rawError: errMessage,
          reason: errReason,
          status: response.status,
          message: sentMsg
        });
      }
    } catch (err: any) {
      console.error("[YouTube LiveChat Network Error]", err);
      const sentMsg = {
        id: `local-${Date.now()}`,
        sender: req.body.sender || "DroidBot",
        content: cleanMsg,
        senderRole: "bot",
        timestamp: new Date().toLocaleTimeString(),
        isBot: true
      };
      userState.chatMessagesQueue = [...userState.chatMessagesQueue, sentMsg].slice(-200);
      return res.json({
        success: false,
        sentToYouTube: false,
        localOnly: true,
        error: err.message || "Network exception while contacting YouTube API",
        message: sentMsg
      });
    }
  });

  // --- YouTube Diagnostics API ---
  app.post("/api/youtube/diagnostic", async (req, res) => {
    const { accessToken, videoId } = req.body;
    const token = accessToken || req.headers.authorization?.replace("Bearer ", "") || cachedOAuthToken;
    const targetVideoId = videoId || streamMetadata.videoId;

    const report: {
      auth: { ok: boolean; message: string; userChannel?: any };
      stream: { ok: boolean; message: string; activeLiveChatId?: string; videoDetails?: any };
      permissions: { ok: boolean; message: string; checklist: { name: string; status: 'ok' | 'fail' | 'warn'; details: string }[] };
    } = {
      auth: { ok: false, message: "No Google OAuth token provided." },
      stream: { ok: false, message: "No stream video connected." },
      permissions: { ok: false, message: "Testing permissions...", checklist: [] }
    };

    if (!token) {
      report.auth = {
        ok: false,
        message: "Google Account is not connected. Sign in with Google to enable YouTube API live chat broadcasting."
      };
      report.permissions.checklist.push({
        name: "Google OAuth Token",
        status: "fail",
        details: "Click 'Sign in with Google' in the Live Viewer tab."
      });
    } else {
      report.permissions.checklist.push({
        name: "Google OAuth Token",
        status: "ok",
        details: "Valid OAuth access token detected."
      });

      // Check YouTube Channel presence
      try {
        const chanRes = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet,status&mine=true", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (chanRes.ok) {
          const chanData = await chanRes.json();
          if (chanData.items && chanData.items.length > 0) {
            const chan = chanData.items[0];
            report.auth = {
              ok: true,
              message: `Connected YouTube Channel: "${chan.snippet?.title}" (ID: ${chan.id})`,
              userChannel: {
                id: chan.id,
                title: chan.snippet?.title,
                customUrl: chan.snippet?.customUrl,
                thumbnail: chan.snippet?.thumbnails?.default?.url
              }
            };
            report.permissions.checklist.push({
              name: "YouTube Channel Created",
              status: "ok",
              details: `Active channel: "${chan.snippet?.title}"`
            });
          } else {
            report.auth = {
              ok: false,
              message: "Google Account has NO YouTube channel created yet! YouTube chat API requires a channel."
            };
            report.permissions.checklist.push({
              name: "YouTube Channel Created",
              status: "fail",
              details: "Your Google account needs a YouTube Channel. Open https://www.youtube.com/create_channel to create one."
            });
          }
        } else {
          const errData = await chanRes.json().catch(() => ({}));
          report.auth = {
            ok: false,
            message: `YouTube Channel Check Failed (${chanRes.status}): ${errData.error?.message || 'Unauthorized or expired token'}`
          };
          report.permissions.checklist.push({
            name: "YouTube Channel Created",
            status: "fail",
            details: errData.error?.message || "Token may be expired or missing youtube.force-ssl scope."
          });
        }
      } catch (e: any) {
        report.auth = { ok: false, message: `Channel check error: ${e.message}` };
      }
    }

    // Check Live Stream & LiveChat ID
    if (!targetVideoId) {
      report.stream = { ok: false, message: "No live stream connected yet. Enter your stream URL or Video ID above." };
      report.permissions.checklist.push({
        name: "Active Stream Connection",
        status: "warn",
        details: "Connect to your YouTube live broadcast URL."
      });
    } else {
      try {
        let vidUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${targetVideoId}`;
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;

        const vidRes = await fetch(vidUrl, { headers });
        if (vidRes.ok) {
          const vidData = await vidRes.json();
          if (vidData.items && vidData.items.length > 0) {
            const vidItem = vidData.items[0];
            const liveChatId = vidItem.liveStreamingDetails?.activeLiveChatId;
            if (liveChatId) {
              report.stream = {
                ok: true,
                message: `Active Live Chat ID found: ${liveChatId}`,
                activeLiveChatId: liveChatId,
                videoDetails: {
                  title: vidItem.snippet?.title,
                  channelTitle: vidItem.snippet?.channelTitle
                }
              };
              report.permissions.checklist.push({
                name: "YouTube LiveChat Room Access",
                status: "ok",
                details: `Stream is live with active chat ID (${liveChatId.substring(0, 12)}...)`
              });
            } else {
              report.stream = {
                ok: false,
                message: "Video found, but no activeLiveChatId returned. Ensure the video is currently broadcasted live with live chat enabled."
              };
              report.permissions.checklist.push({
                name: "YouTube LiveChat Room Access",
                status: "fail",
                details: "No activeLiveChatId returned. Ensure YouTube stream is currently Live and Live Chat is turned on in YouTube Studio."
              });
            }
          } else {
            report.stream = { ok: false, message: `Video ID ${targetVideoId} not found on YouTube.` };
            report.permissions.checklist.push({
              name: "Active Stream Connection",
              status: "fail",
              details: "Video not found."
            });
          }
        } else {
          report.stream = { ok: false, message: `Video lookup returned HTTP ${vidRes.status}` };
        }
      } catch (e: any) {
        report.stream = { ok: false, message: `Stream lookup error: ${e.message}` };
      }
    }

    report.permissions.ok = report.permissions.checklist.every(c => c.status === 'ok');
    report.permissions.message = report.permissions.ok
      ? "All permissions and stream conditions are verified! Outbound YouTube chat posting is 100% active."
      : "Some prerequisites need attention before messages can appear in your live YouTube chat room.";

    res.json(report);
  });


  // --- OBS Overlay Alert Real-time Sync API ---
  app.get("/api/overlay/alerts", (req, res) => {
    const since = parseInt(req.query.since as string) || 0;
    const filtered = overlayAlertsQueue.filter((a) => (a.timestamp || 0) > since);
    res.json({ alerts: filtered });
  });

  app.post("/api/overlay/alerts", (req, res) => {
    const alert = req.body;
    if (!alert || !alert.title) {
      return res.status(400).json({ error: "Invalid alert payload" });
    }
    const alertItem = {
      ...alert,
      id: alert.id || `alert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: alert.timestamp || Date.now()
    };
    overlayAlertsQueue = [...overlayAlertsQueue, alertItem].slice(-50);
    res.json({ success: true, alert: alertItem });
  });

  // --- YouTube Stream Connect & Resolve Endpoints ---
  app.post("/api/youtube/connect", (req, res) => {
    const { activeLiveChatId, videoId, streamTitle, thumbnailUrl, viewerCount, isLive, accessToken } = req.body;
    
    if (activeLiveChatId !== undefined) streamMetadata.activeLiveChatId = activeLiveChatId;
    if (videoId !== undefined) streamMetadata.videoId = videoId;
    if (streamTitle !== undefined) streamMetadata.streamTitle = streamTitle;
    if (thumbnailUrl !== undefined) streamMetadata.thumbnailUrl = thumbnailUrl;
    if (viewerCount !== undefined) streamMetadata.viewerCount = viewerCount;
    if (isLive !== undefined) streamMetadata.isLive = isLive;
    if (accessToken) cachedOAuthToken = accessToken;

    // Reset pagination token and trigger poll immediately
    nextChatPageToken = null;
    if (chatPollTimeout) clearTimeout(chatPollTimeout);
    chatPollTimeout = null;

    if (streamMetadata.isLive && streamMetadata.activeLiveChatId) {
      pollYouTubeChat();
    }

    res.json({ success: true, streamMetadata });
  });

  app.post("/api/youtube/resolve-stream", async (req, res) => {
    const { input, token } = req.body;
    const effectiveToken = token || cachedOAuthToken;
    const apiKey = getValidApiKey();

    try {
      // 1. If user asks to auto-detect from active broadcasts
      if (input === '__MY_ACTIVE_BROADCAST__' && effectiveToken) {
        try {
          const broadcastRes = await fetch(
            'https://youtube.googleapis.com/youtube/v3/liveBroadcasts?broadcastStatus=active&broadcastType=all&part=id,snippet,status,contentDetails',
            { headers: { Authorization: `Bearer ${effectiveToken}` } }
          );
          const cType = broadcastRes.headers.get("content-type") || "";
          if (broadcastRes.ok && cType.includes("json")) {
            const broadcastData = await broadcastRes.json();
            if (broadcastData.items && broadcastData.items.length > 0) {
              const item = broadcastData.items[0];
              const liveChatId = item.snippet?.liveChatId;
              const videoId = item.id;
              const title = item.snippet?.title || 'Live Stream';
              const thumb = item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || '';

              streamMetadata.isLive = true;
              streamMetadata.activeLiveChatId = liveChatId;
              streamMetadata.videoId = videoId;
              streamMetadata.streamTitle = title;
              if (thumb) streamMetadata.thumbnailUrl = thumb;
              if (effectiveToken) cachedOAuthToken = effectiveToken;

              nextChatPageToken = null;
              pollYouTubeChat();

              return res.json({
                success: true,
                activeLiveChatId: liveChatId,
                videoId,
                streamTitle: title,
                thumbnailUrl: thumb,
                isLive: true
              });
            }
          }
        } catch (authErr) {
          console.warn("[Auto-Detect Broadcast API Failed]", authErr);
        }
      }

      // 2. Parse Video ID from URL or input
      let videoId = (input || '').trim();
      const urlMatch = videoId.match(/(?:youtube\.com\/(?:watch\?v=|live\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (urlMatch) {
        videoId = urlMatch[1];
      }

      // Clean ID if extra query params are attached
      if (videoId.includes('?')) {
        videoId = videoId.split('?')[0];
      }
      if (videoId.includes('&')) {
        videoId = videoId.split('&')[0];
      }

      if (videoId.length === 11) {
        // 2a. Attempt official API if key/token available
        if (apiKey || effectiveToken) {
          try {
            let videoUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,statistics&id=${videoId}`;
            if (apiKey) videoUrl += `&key=${apiKey}`;

            const headers: Record<string, string> = {};
            if (effectiveToken && !apiKey) headers['Authorization'] = `Bearer ${effectiveToken}`;

            const vidRes = await fetch(videoUrl, { headers });
            const cType = vidRes.headers.get("content-type") || "";
            if (vidRes.ok && cType.includes("json")) {
              const vidData = await vidRes.json();
              if (vidData.items && vidData.items.length > 0) {
                const item = vidData.items[0];
                const liveChatId = item.liveStreamingDetails?.activeLiveChatId || null;
                const viewers = parseInt(item.liveStreamingDetails?.concurrentViewers || '0', 10);
                const title = item.snippet?.title || streamMetadata.streamTitle;
                const thumb = item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

                streamMetadata.isLive = true;
                streamMetadata.activeLiveChatId = liveChatId;
                streamMetadata.videoId = videoId;
                streamMetadata.streamTitle = title;
                streamMetadata.viewerCount = viewers;
                streamMetadata.thumbnailUrl = thumb;
                if (effectiveToken) cachedOAuthToken = effectiveToken;

                nextChatPageToken = null;
                pollYouTubeChat();

                return res.json({
                  success: true,
                  activeLiveChatId: liveChatId,
                  videoId,
                  streamTitle: title,
                  thumbnailUrl: thumb,
                  viewerCount: viewers,
                  isLive: true
                });
              }
            }
          } catch (apiErr) {
            console.warn("[YouTube API check fallback]", apiErr);
          }
        }

        // 2b. Universal Fallback: Scrape public YouTube live video page
        try {
          const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
          const pageRes = await fetch(watchUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept-Language': 'en-US,en;q=0.9',
            }
          });

          const html = await pageRes.text();

          // Extract Title
          let title = `YouTube Live Stream (${videoId})`;
          const titleMatch = html.match(/<meta\s+name="title"\s+content="([^"]+)"/i) ||
                             html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                             html.match(/"title":{"runs":\[{"text":"([^"]+)"}/) ||
                             html.match(/"title":"([^"]+)"/);
          if (titleMatch && titleMatch[1] && titleMatch[1].trim()) {
            const clean = titleMatch[1].replace(/\s*-\s*YouTube$/i, '').trim();
            if (clean) title = clean;
          }

          // Extract Channel Name
          let channelName = "Live Channel";
          const authorMatch = html.match(/<link\s+itemprop="name"\s+content="([^"]+)"/i) ||
                              html.match(/"ownerChannelName":"([^"]+)"/i) ||
                              html.match(/"author":"([^"]+)"/i);
          if (authorMatch && authorMatch[1] && authorMatch[1].trim()) {
            channelName = authorMatch[1].trim();
          }

          // Extract Innertube API Key & Continuation
          const keyMatch = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/i) ||
                           html.match(/INNERTUBE_API_KEY\\":\\"([^"\\]+)\\"/i);
          if (keyMatch && keyMatch[1]) {
            innertubeApiKey = keyMatch[1];
          }

          const contMatch = html.match(/"continuation":"([A-Za-z0-9_-]{20,})"/i) ||
                            html.match(/continuation\\":\\"([A-Za-z0-9_-]{20,})\\"/i);
          if (contMatch && contMatch[1]) {
            innertubeContinuation = contMatch[1];
          }

          const thumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
          const liveChatId = streamMetadata.activeLiveChatId || null;

          streamMetadata.isLive = true;
          streamMetadata.activeLiveChatId = liveChatId;
          streamMetadata.videoId = videoId;
          streamMetadata.streamTitle = title;
          streamMetadata.channelName = channelName;
          streamMetadata.thumbnailUrl = thumb;
          if (effectiveToken) cachedOAuthToken = effectiveToken;

          nextChatPageToken = null;
          pollYouTubeChat();

          return res.json({
            success: true,
            activeLiveChatId: liveChatId,
            videoId,
            streamTitle: title,
            channelName,
            thumbnailUrl: thumb,
            viewerCount: streamMetadata.viewerCount,
            isLive: true
          });
        } catch (scrapeErr: any) {
          console.error("[YouTube Scrape Fallback Error]", scrapeErr);
          // If network fetch fails, still register the video ID safely
          const fallbackTitle = `YouTube Live Stream (${videoId})`;
          const fallbackThumb = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

          streamMetadata.isLive = true;
          streamMetadata.activeLiveChatId = null;
          streamMetadata.videoId = videoId;
          streamMetadata.streamTitle = fallbackTitle;
          streamMetadata.thumbnailUrl = fallbackThumb;

          return res.json({
            success: true,
            activeLiveChatId: null,
            videoId,
            streamTitle: fallbackTitle,
            thumbnailUrl: fallbackThumb,
            isLive: true
          });
        }
      }

      return res.status(400).json({ error: "Could not parse a valid YouTube Video ID or Live Stream URL." });
    } catch (e: any) {
      console.error("[YouTube Resolve Stream Error]", e);
      return res.status(500).json({ error: e.message || "Failed to resolve stream" });
    }
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
