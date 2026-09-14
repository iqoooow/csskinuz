import { LiveDropEvent } from '../types/index.js';

type LiveDropCallback = (drop: LiveDropEvent) => void;
type BattleUpdateCallback = (battleId: string, data: any) => void;

export class WebSocketClient {
  private static ws: WebSocket | null = null;
  private static dropCallbacks: Set<LiveDropCallback> = new Set();
  private static battleCallbacks: Set<BattleUpdateCallback> = new Set();
  private static reconnectTimer: any = null;

  static connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        const token = localStorage.getItem('csskinuz_token');
        if (token && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'AUTH', token }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'LIVE_DROP') {
            this.dropCallbacks.forEach((cb) => cb(msg.data));
          } else if (msg.type === 'BATTLE_UPDATE') {
            this.battleCallbacks.forEach((cb) => cb(msg.battleId, msg.data));
          }
        } catch {
          // JSON parse error
        }
      };

      this.ws.onclose = () => {
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.scheduleReconnect();
    }
  }

  private static scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 4000);
  }

  static subscribeToLiveDrops(callback: LiveDropCallback) {
    this.dropCallbacks.add(callback);
    return () => {
      this.dropCallbacks.delete(callback);
    };
  }

  static subscribeToBattle(battleId: string, callback: BattleUpdateCallback) {
    this.battleCallbacks.add(callback);
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'SUBSCRIBE_BATTLE', battleId }));
    }

    return () => {
      this.battleCallbacks.delete(callback);
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'UNSUBSCRIBE_BATTLE', battleId }));
      }
    };
  }
}
