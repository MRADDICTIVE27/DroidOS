export const createDefaultUserState = () => ({
  botIdentity: null,
  roles: [],
  profiles: [],
  responseStyles: {},
  triggers: [],
  pointsConfig: null,
  achievements: [],
  soundEffects: [],
  redeems: [],
  obsConfig: null,
  automations: [],
  streamMetadata: null,
  tabOrder: [],
  theme: 'dark',
  shoutoutConfig: null,
  shoutoutHistory: [],
  gameState: null,
  updatedAt: new Date().toISOString()
});

export const getUserStatePayload = (state: Record<string, any> | null | undefined) => ({
  ...(state || {}),
  updatedAt: new Date().toISOString()
});
