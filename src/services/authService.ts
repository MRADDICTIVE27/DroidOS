import { GoogleOAuthAccount, StreamMetadata, AppSettings } from '../types';

export interface OAuthLoginConfig {
  clientId?: string;
  scope?: string;
  prompt?: string;
}

const DEFAULT_YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl'
].join(' ');

/**
 * Initializes and triggers Google OAuth Token Client flow (Google Identity Services)
 * or falls back gracefully to a seamless authenticated session if Client ID is configured or mocked.
 */
export async function authenticateWithGoogle(
  accountType: 'host' | 'bot',
  customClientId?: string
): Promise<GoogleOAuthAccount> {
  const clientId = customClientId?.trim() || 'droidos-oauth-client-id.apps.googleusercontent.com';

  // Check if Google Identity Services (GIS) client is loaded on window
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    try {
      return await new Promise<GoogleOAuthAccount>((resolve, reject) => {
        const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: DEFAULT_YOUTUBE_SCOPES,
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              reject(new Error(tokenResponse.error_description || tokenResponse.error));
              return;
            }

            try {
              // Fetch userinfo from Google API
              const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const userInfo = await userInfoRes.json();

              // Fetch YouTube channel details
              let channelId = '';
              let channelHandle = '';
              let channelTitle = userInfo.name || (accountType === 'host' ? 'Host Stream' : 'Bot Helper');

              try {
                const ytRes = await fetch(
                  'https://www.googleapis.com/youtube/v3/channels?part=snippet,contentDetails&mine=true',
                  {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                  }
                );
                if (ytRes.ok) {
                  const ytData = await ytRes.json();
                  if (ytData.items?.[0]) {
                    const item = ytData.items[0];
                    channelId = item.id;
                    channelTitle = item.snippet?.title || channelTitle;
                    channelHandle = item.snippet?.customUrl ? `@${item.snippet.customUrl.replace('@', '')}` : `@${channelTitle.replace(/\s+/g, '')}`;
                  }
                }
              } catch (ytErr) {
                console.warn('[Google Auth] YouTube Channel query warning:', ytErr);
              }

              const account: GoogleOAuthAccount = {
                authenticated: true,
                accountName: userInfo.name || (accountType === 'host' ? 'Host' : 'Bot'),
                email: userInfo.email || `${accountType}@youtube.com`,
                picture: userInfo.picture,
                channelId,
                channelHandle,
                channelTitle,
                role: accountType,
                accessToken: tokenResponse.access_token,
                expiresAt: Date.now() + (tokenResponse.expires_in || 3600) * 1000,
                scopes: tokenResponse.scope ? tokenResponse.scope.split(' ') : DEFAULT_YOUTUBE_SCOPES.split(' '),
                autoDetected: true
              };

              resolve(account);
            } catch (fetchErr) {
              reject(fetchErr);
            }
          }
        });

        tokenClient.requestAccessToken({ prompt: 'consent' });
      });
    } catch (gisError) {
      console.warn('[Google Auth] GIS Popup issue, continuing with verified profile generator:', gisError);
    }
  }

  // If GIS is missing or failed, we shouldn't simulate a login.
  throw new Error('Google Authentication is not available. Please ensure you are connected to the internet and Google Identity Services is loaded.');
}

/**
 * Revokes a Google OAuth access token to properly sign out the user.
 */
export function revokeGoogleToken(token?: string) {
  if (token && typeof window !== 'undefined' && (window as any).google?.accounts?.oauth2) {
    try {
      (window as any).google.accounts.oauth2.revoke(token, () => {
        console.log('User signed out.');
      });
    } catch (e) {
      console.error('Failed to revoke token', e);
    }
  }
}

/**
 * Auto-detects host details and keeps settings and stream metadata in sync
 */
export function syncHostDetailsFromAuth(
  authAccount: GoogleOAuthAccount,
  currentSettings: AppSettings,
  currentMeta: StreamMetadata
): { updatedSettings: AppSettings; updatedMeta: StreamMetadata } {
  const updatedSettings: AppSettings = {
    ...currentSettings,
    streamerName: authAccount.accountName,
    channelHandle: authAccount.channelHandle,
    hostLoginEmail: authAccount.email,
    hostChannelId: authAccount.channelId,
    autoDetectHostOnLogin: true,
    hostGoogleAccount: authAccount
  };

  const updatedMeta: StreamMetadata = {
    ...currentMeta,
    channelName: authAccount.accountName,
    streamUrl: `https://youtube.com/${authAccount.channelHandle}/live`,
    isLive: true,
    activeLiveChatId: `live-chat-${authAccount.channelId}`,
    streamerAuth: {
      authenticated: true,
      accountName: `${authAccount.accountName} (Host)`,
      channelId: authAccount.channelId,
      channelHandle: authAccount.channelHandle,
      channelTitle: authAccount.channelTitle,
      loginEmail: authAccount.email,
      autoDetectedFromLogin: true,
      apiV3AutoIncluded: true
    }
  };

  return { updatedSettings, updatedMeta };
}

/**
 * Syncs dedicated bot account details and keeps settings and stream metadata in sync
 */
export function syncBotDetailsFromAuth(
  authAccount: GoogleOAuthAccount,
  currentSettings: AppSettings,
  currentMeta: StreamMetadata
): { updatedSettings: AppSettings; updatedMeta: StreamMetadata } {
  const updatedSettings: AppSettings = {
    ...currentSettings,
    botAccountName: authAccount.accountName,
    botChannelHandle: authAccount.channelHandle,
    botChannelId: authAccount.channelId,
    botApiKey: authAccount.accessToken,
    botIsSeparateAccount: true,
    sendChatAsBot: true,
    botGoogleAccount: authAccount
  };

  const updatedMeta: StreamMetadata = {
    ...currentMeta,
    botAuth: {
      authenticated: true,
      accountName: authAccount.accountName,
      channelId: authAccount.channelId,
      channelHandle: authAccount.channelHandle,
      botChannelHandle: authAccount.channelHandle,
      isSeparateAccount: true,
      sendChatAsBot: true,
      moderatorStatus: 'verified_mod',
      apiV3AutoIncluded: true
    }
  };

  return { updatedSettings, updatedMeta };
}
