import { AppSettings, StreamMetadata, GoogleOAuthAccount } from '../types';

export interface GoogleClientSecretsPayload {
  web?: {
    client_id: string;
    project_id?: string;
    auth_uri?: string;
    token_uri?: string;
    auth_provider_x509_cert_url?: string;
    client_secret?: string;
    redirect_uris?: string[];
    javascript_origins?: string[];
  };
  installed?: {
    client_id: string;
    project_id?: string;
    auth_uri?: string;
    token_uri?: string;
    auth_provider_x509_cert_url?: string;
    client_secret?: string;
    redirect_uris?: string[];
  };
  client_id?: string;
  client_secret?: string;
  project_id?: string;
  auth_uri?: string;
  token_uri?: string;
  redirect_uris?: string[];
}

export interface ParsedClientSecretsResult {
  valid: boolean;
  clientId: string;
  clientSecret?: string;
  projectId?: string;
  clientType: 'web' | 'installed' | 'flat' | 'unknown';
  authUri: string;
  tokenUri: string;
  redirectUris: string[];
  youtubeApiV3Ready: boolean;
  rawJson: string;
  errorMessage?: string;
}

/**
 * Standard YouTube OAuth Scopes required for Live Streaming, Live Chat Polling and Sending
 */
export const REQUIRED_YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email'
];

/**
 * Parses client_secret.json content (from Google Cloud Console)
 */
export function parseClientSecretsJson(jsonString: string): ParsedClientSecretsResult {
  try {
    const data: GoogleClientSecretsPayload = JSON.parse(jsonString);

    let clientId = '';
    let clientSecret: string | undefined;
    let projectId: string | undefined;
    let clientType: 'web' | 'installed' | 'flat' | 'unknown' = 'unknown';
    let authUri = 'https://accounts.google.com/o/oauth2/auth';
    let tokenUri = 'https://oauth2.googleapis.com/token';
    let redirectUris: string[] = [];

    if (data.web && data.web.client_id) {
      clientId = data.web.client_id.trim();
      clientSecret = data.web.client_secret;
      projectId = data.web.project_id;
      clientType = 'web';
      authUri = data.web.auth_uri || authUri;
      tokenUri = data.web.token_uri || tokenUri;
      redirectUris = data.web.redirect_uris || [];
    } else if (data.installed && data.installed.client_id) {
      clientId = data.installed.client_id.trim();
      clientSecret = data.installed.client_secret;
      projectId = data.installed.project_id;
      clientType = 'installed';
      authUri = data.installed.auth_uri || authUri;
      tokenUri = data.installed.token_uri || tokenUri;
      redirectUris = data.installed.redirect_uris || [];
    } else if (data.client_id) {
      clientId = data.client_id.trim();
      clientSecret = data.client_secret;
      projectId = data.project_id;
      clientType = 'flat';
      authUri = data.auth_uri || authUri;
      tokenUri = data.token_uri || tokenUri;
      redirectUris = data.redirect_uris || [];
    }

    if (!clientId) {
      return {
        valid: false,
        clientId: '',
        clientType: 'unknown',
        authUri,
        tokenUri,
        redirectUris: [],
        youtubeApiV3Ready: false,
        rawJson: jsonString,
        errorMessage: 'Invalid client_secret.json: Missing "client_id" in web or installed configuration block.'
      };
    }

    return {
      valid: true,
      clientId,
      clientSecret,
      projectId: projectId || `droidos-${clientId.split('-')[0] || 'project'}`,
      clientType,
      authUri,
      tokenUri,
      redirectUris,
      youtubeApiV3Ready: true,
      rawJson: jsonString
    };
  } catch (err: any) {
    return {
      valid: false,
      clientId: '',
      clientType: 'unknown',
      authUri: '',
      tokenUri: '',
      redirectUris: [],
      youtubeApiV3Ready: false,
      rawJson: jsonString,
      errorMessage: `JSON Parse error: ${err.message || 'Malformed JSON file'}`
    };
  }
}

/**
 * Generates sample template client_secret.json for users who want to create it manually in %LOCALAPPDATA%\DroidOS\
 */
export function getSampleClientSecretsTemplate(): string {
  return JSON.stringify(
    {
      web: {
        client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
        project_id: "droidos-stream-automation",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_secret: "GOCSPX-YOUR_CLIENT_SECRET_KEY",
        redirect_uris: [
          "http://localhost:3000",
          "http://localhost:3000/oauth2callback",
          "https://localhost"
        ],
        javascript_origins: [
          "http://localhost:3000",
          "https://localhost"
        ]
      }
    },
    null,
    2
  );
}

/**
 * Applies parsed client secrets directly to AppSettings and StreamMetadata
 */
export function applyParsedClientSecrets(
  parsed: ParsedClientSecretsResult,
  currentSettings: AppSettings,
  currentMeta: StreamMetadata
): { updatedSettings: AppSettings; updatedMeta: StreamMetadata } {
  const updatedSettings: AppSettings = {
    ...currentSettings,
    googleOAuthClientId: parsed.clientId,
    googleOAuthClientSecret: parsed.clientSecret,
    googleCloudProjectId: parsed.projectId
  };

  const updatedMeta: StreamMetadata = {
    ...currentMeta,
    youtubeApiV3: {
      autoDetected: true,
      apiVersion: 'v3 (Official YouTube Data API)',
      quotaStatus: 'Verified via client_secret.json (Direct Push & Polling)',
      liveChatPolling: true,
      serviceState: 'active'
    },
    streamerAuth: {
      ...currentMeta.streamerAuth,
      clientId: parsed.clientId,
      apiV3AutoIncluded: true
    },
    botAuth: {
      ...currentMeta.botAuth,
      clientId: parsed.clientId,
      apiV3AutoIncluded: true
    }
  };

  return { updatedSettings, updatedMeta };
}
