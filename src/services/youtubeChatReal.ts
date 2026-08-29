export async function fetchLiveChatId(accessToken: string): Promise<string | null> {
  try {
    // Fetch all user's broadcasts (including private), and filter for active ones
    const res = await fetch('https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status&mine=true&broadcastType=all&maxResults=50', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      // Find the first active broadcast
      const activeBroadcast = data.items.find((item: any) => item.status?.lifeCycleStatus === 'live' || item.status?.lifeCycleStatus === 'testing' || item.snippet?.liveChatId);
      if (activeBroadcast) {
        return activeBroadcast.snippet.liveChatId || null;
      }
    }
    return null;
  } catch (err) {
    console.error('Error fetching liveBroadcasts', err);
    return null;
  }
}

export async function pollLiveChat(accessToken: string, liveChatId: string, pageToken?: string) {
  try {
    let url = `https://www.googleapis.com/youtube/v3/liveChatMessages?liveChatId=${liveChatId}&part=snippet,authorDetails`;
    if (pageToken) url += `&pageToken=${pageToken}`;
    
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error polling chat', err);
    return null;
  }
}

export async function sendChatMessage(accessToken: string, liveChatId: string, message: string) {
  try {
    const res = await fetch('https://www.googleapis.com/youtube/v3/liveChatMessages?part=snippet', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        snippet: {
          liveChatId,
          type: 'textMessageEvent',
          textMessageDetails: { messageText: message }
        }
      })
    });
    return res.ok;
  } catch (err) {
    console.error('Error sending message', err);
    return false;
  }
}

export async function fetchChannelStats(accessToken: string) {
  try {
    const res = await fetch('https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&mine=true', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      return {
        subscriberCount: parseInt(data.items[0].statistics.subscriberCount || '0', 10),
        channelName: data.items[0].snippet.title,
        thumbnailUrl: data.items[0].snippet.thumbnails?.default?.url
      };
    }
  } catch (err) {
    console.error('Error fetching channel stats', err);
  }
  return null;
}

export async function fetchBroadcastStats(accessToken: string) {
  try {
    const res = await fetch('https://www.googleapis.com/youtube/v3/liveBroadcasts?part=snippet,status,statistics&mine=true&broadcastType=all&maxResults=50', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      const activeBroadcast = data.items.find((item: any) => item.status?.lifeCycleStatus === 'live' || item.status?.lifeCycleStatus === 'testing' || item.snippet?.liveChatId);
      if (activeBroadcast) {
        return {
          viewerCount: parseInt(activeBroadcast.statistics?.concurrentViewers || '0', 10),
          title: activeBroadcast.snippet.title,
          isLive: activeBroadcast.status?.lifeCycleStatus === 'live',
          liveChatId: activeBroadcast.snippet.liveChatId
        };
      }
    }
  } catch (err) {
    console.error('Error fetching broadcast stats', err);
  }
  return null;
}
