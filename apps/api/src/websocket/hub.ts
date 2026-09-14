import { WebSocket, WebSocketServer } from 'ws';
import { AuthService } from '../modules/auth/auth.service.js';

interface ClientConnection {
  ws: WebSocket;
  userId?: string;
  isAlive: boolean;
  subscribedBattles: Set<string>;
}

export class WebSocketHub {
  private static wss: WebSocketServer | null = null;
  private static clients: Map<WebSocket, ClientConnection> = new Map();

  /**
   * WebSocket Serverni ishga tushirish
   */
  static init(server: any) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      const client: ClientConnection = {
        ws,
        isAlive: true,
        subscribedBattles: new Set(),
      };
      this.clients.set(ws, client);

      ws.on('pong', () => {
        client.isAlive = true;
      });

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message.toString());
          this.handleClientMessage(client, parsed);
        } catch {
          // Noto'g'ri JSON format
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });

    // Heartbeat ping intervali (har 30 soniyada)
    setInterval(() => {
      this.clients.forEach((client, ws) => {
        if (!client.isAlive) {
          ws.terminate();
          this.clients.delete(ws);
          return;
        }
        client.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private static handleClientMessage(client: ClientConnection, msg: any) {
    if (msg.type === 'AUTH') {
      try {
        const session = AuthService.verifyToken(msg.token);
        client.userId = session.id;
        client.ws.send(JSON.stringify({ type: 'AUTH_SUCCESS', userId: session.id }));
      } catch {
        client.ws.send(JSON.stringify({ type: 'AUTH_FAILED' }));
      }
    } else if (msg.type === 'SUBSCRIBE_BATTLE') {
      if (msg.battleId) {
        client.subscribedBattles.add(msg.battleId);
      }
    } else if (msg.type === 'UNSUBSCRIBE_BATTLE') {
      if (msg.battleId) {
        client.subscribedBattles.delete(msg.battleId);
      }
    }
  }

  /**
   * Barcha faol mijozlarga jonli drop lentasini yuborish
   */
  static broadcastLiveDrop(dropData: any) {
    const payload = JSON.stringify({
      type: 'LIVE_DROP',
      data: dropData,
    });

    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    });
  }

  /**
   * Case Battle xonasidagi o'yinchilarga real vaqtda xabar tarqatish
   */
  static broadcastBattleUpdate(battleId: string, data: any) {
    const payload = JSON.stringify({
      type: 'BATTLE_UPDATE',
      battleId,
      data,
    });

    this.clients.forEach((client) => {
      if (client.ws.readyState === WebSocket.OPEN && client.subscribedBattles.has(battleId)) {
        client.ws.send(payload);
      }
    });
  }

  /**
   * Aniq bitta foydalanuvchiga shaxsiy xabarnoma yuborish
   */
  static sendToUser(userId: string, event: string, data: any) {
    const payload = JSON.stringify({
      type: event,
      data,
    });

    this.clients.forEach((client) => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(payload);
      }
    });
  }
}
