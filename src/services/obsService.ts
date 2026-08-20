import OBSWebSocket from 'obs-websocket-js';

class ObsService {
  private obs: OBSWebSocket | null = null;
  private isConnected = false;
  private currentScene = '';
  private scenes: string[] = [];
  private onStatusChangeCallbacks: Array<(connected: boolean, scene: string, scenes: string[]) => void> = [];
  private onLogCallbacks: Array<(level: 'info' | 'warn' | 'success' | 'bot', msg: string) => void> = [];

  constructor() {
    this.obs = new OBSWebSocket();
    this.setupListeners();
  }

  private setupListeners() {
    if (!this.obs) return;

    this.obs.on('ConnectionClosed', () => {
      this.isConnected = false;
      this.notifyStatus();
      this.log('warn', 'OBS WebSocket connection closed.');
    });

    this.obs.on('ConnectionError', (err) => {
      this.isConnected = false;
      this.notifyStatus();
      this.log('warn', `OBS WebSocket error: ${err.message || err}`);
    });

    this.obs.on('CurrentProgramSceneChanged', (data) => {
      this.currentScene = data.sceneName;
      this.notifyStatus();
      this.log('info', `OBS Program Scene changed to: "${data.sceneName}"`);
    });
  }

  public subscribeStatus(cb: (connected: boolean, scene: string, scenes: string[]) => void) {
    this.onStatusChangeCallbacks.push(cb);
    cb(this.isConnected, this.currentScene, this.scenes);
    return () => {
      this.onStatusChangeCallbacks = this.onStatusChangeCallbacks.filter(c => c !== cb);
    };
  }

  public subscribeLogs(cb: (level: 'info' | 'warn' | 'success' | 'bot', msg: string) => void) {
    this.onLogCallbacks.push(cb);
    return () => {
      this.onLogCallbacks = this.onLogCallbacks.filter(c => c !== cb);
    };
  }

  private notifyStatus() {
    this.onStatusChangeCallbacks.forEach(cb => cb(this.isConnected, this.currentScene, this.scenes));
  }

  private log(level: 'info' | 'warn' | 'success' | 'bot', msg: string) {
    this.onLogCallbacks.forEach(cb => cb(level, msg));
  }

  public async connect(host: string = 'localhost', port: number = 4455, password?: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.obs) {
        this.obs = new OBSWebSocket();
        this.setupListeners();
      }

      if (this.isConnected) {
        await this.disconnect();
      }

      const url = `ws://${host.trim() || 'localhost'}:${port || 4455}`;
      this.log('info', `Attempting to connect to OBS at ${url}...`);

      await this.obs.connect(url, password || undefined);
      this.isConnected = true;

      // Fetch current scene & scene list
      const sceneList = await this.obs.call('GetSceneList');
      this.scenes = sceneList.scenes.map((s: any) => s.sceneName as string).reverse();
      this.currentScene = (sceneList.currentProgramSceneName as string) || (this.scenes[0] || '');

      this.notifyStatus();
      this.log('success', `Connected to OBS Studio! Current Scene: "${this.currentScene}" (${this.scenes.length} scenes found).`);
      return { success: true };
    } catch (err: any) {
      this.isConnected = false;
      this.notifyStatus();
      const errMsg = err?.message || String(err);
      this.log('warn', `Failed to connect to OBS: ${errMsg}`);
      return { success: false, error: errMsg };
    }
  }

  public async disconnect() {
    try {
      if (this.obs && this.isConnected) {
        await this.obs.disconnect();
      }
    } catch (e) {
      // ignore
    } finally {
      this.isConnected = false;
      this.notifyStatus();
    }
  }

  public async setScene(sceneName: string): Promise<boolean> {
    if (!this.obs || !this.isConnected) {
      this.log('warn', 'Cannot switch scene: OBS is not connected.');
      return false;
    }
    try {
      await this.obs.call('SetCurrentProgramScene', { sceneName });
      this.currentScene = sceneName;
      this.notifyStatus();
      this.log('info', `Switched OBS scene to "${sceneName}".`);
      return true;
    } catch (err: any) {
      this.log('warn', `Failed to switch scene to "${sceneName}": ${err?.message || err}`);
      return false;
    }
  }

  public getStatus() {
    return {
      connected: this.isConnected,
      currentScene: this.currentScene,
      scenes: this.scenes
    };
  }
}

export const obsService = new ObsService();
