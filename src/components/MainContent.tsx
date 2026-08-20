import React from 'react';
import { DashboardTab } from './DashboardTab';
import { LiveViewerTab } from './LiveViewerTab';
import { PointsTab } from './PointsTab';
import { SoundEffectsTab } from './SoundEffectsTab';
import { AchievementsTab } from './AchievementsTab';
import { GamesTab } from './GamesTab';
import { ObsControlTab } from './ObsControlTab';
import { RedeemsTab } from './RedeemsTab';
import { GeneralCommandsTab } from './GeneralCommandsTab';
import { CustomCommandsTab } from './CustomCommandsTab';
import { BotIdentityTab } from './BotIdentityTab';
import { AuthenticatorTab } from './AuthenticatorTab';
import { MemoryTab } from './MemoryTab';
import { RolesResponsesTab } from './RolesResponsesTab';
import { ResponseStylesTab } from './ResponseStylesTab';
import { ShoutoutsTab } from './ShoutoutsTab';
import { ProfilesTab } from './ProfilesTab';
import { CloudBackupTab } from './CloudBackupTab';
import { ShoutoutOverlayWidget } from './ShoutoutOverlayWidget';
import { AutomationsTab } from './AutomationsTab';
import { AnalyticsTab } from './AnalyticsTab';
import { TelemetryTab } from './TelemetryTab';
import { UpdatesTab } from './UpdatesTab';
import { SettingsTab } from './SettingsTab';

export const MainContent = ({ activeTab, ...props }: any) => {
  return (
    <>
      {activeTab === 'dashboard' && <DashboardTab {...props} />}
      {activeTab === 'liveviewer' && <LiveViewerTab {...props} />}
      {activeTab === 'points' && <PointsTab {...props} />}
      {activeTab === 'soundeffects' && <SoundEffectsTab {...props} />}
      {activeTab === 'achievements' && <AchievementsTab {...props} />}
      {activeTab === 'games' && <GamesTab {...props} />}
      {activeTab === 'obs' && <ObsControlTab {...props} />}
      {activeTab === 'redeems' && <RedeemsTab {...props} />}
      {activeTab === 'general' && <GeneralCommandsTab {...props} />}
      {activeTab === 'custom' && <CustomCommandsTab {...props} />}
      {activeTab === 'identity' && <BotIdentityTab {...props} />}
      {activeTab === 'authenticator' && <AuthenticatorTab {...props} />}
      {activeTab === 'memory' && <MemoryTab {...props} />}
      {activeTab === 'roles' && <RolesResponsesTab {...props} />}
      {activeTab === 'personalities' && <ResponseStylesTab {...props} />}
      {activeTab === 'shoutouts' && <ShoutoutsTab {...props} />}
      {activeTab === 'profiles' && <ProfilesTab {...props} />}
      {activeTab === 'cloudbackup' && <CloudBackupTab {...props} />}
      <ShoutoutOverlayWidget activeShoutout={props.activeShoutout} onDismiss={props.onDismissOverlay} />
      {activeTab === 'automations' && <AutomationsTab {...props} />}
      {activeTab === 'analytics' && <AnalyticsTab {...props} />}
      {activeTab === 'telemetry' && <TelemetryTab {...props} />}
      {activeTab === 'updates' && <UpdatesTab {...props} />}
      {activeTab === 'settings' && <SettingsTab {...props} />}
    </>
  );
};
