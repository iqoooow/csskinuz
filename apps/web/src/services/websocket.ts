import { LiveDropEvent } from '../types/index.js';
import { subscribeToSupabaseDrops } from './supabase.js';

type LiveDropCallback = (drop: LiveDropEvent) => void;
type BattleUpdateCallback = (battleId: string, data: any) => void;

export class WebSocketClient {
  private static ws: WebSocket | null = null;
  private static dropCallbacks: Set<LiveDropCallback> = new Set();
  private static battleCallbacks: Set<BattleUpdateCallback> = new Set();
  private static reconnectTimer: any = null;
  private static simulationTimer: any = null;

  static connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const envWsUrl = (import.meta as any).env?.VITE_WS_URL;
    const envApiUrl = (import.meta as any).env?.VITE_API_URL;
    const isVercel = typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname !== 'localhost');

    // Agar Vercel hostingda bo'lsa va tashqi WS yo'q bo'lsa, xato bermasdan Supabase va simulyatsiyaga ulaymiz
    if (isVercel && !envWsUrl) {
      this.startSupabaseAndSimulatedDrops();
      return;
    }

    let wsUrl = '';
    if (envWsUrl) {
      wsUrl = envWsUrl;
    } else if (envApiUrl && !envApiUrl.includes('localhost')) {
      wsUrl = envApiUrl.replace(/^http/, 'ws').replace(/\/$/, '') + '/ws';
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      wsUrl = `${protocol}//${host}/ws`;
    }

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
        this.startSupabaseAndSimulatedDrops();
      };
    } catch {
      this.startSupabaseAndSimulatedDrops();
    }
  }

  private static startSupabaseAndSimulatedDrops() {
    if (this.simulationTimer) return;

    // 1. Supabase Realtime'ga ulanish
    try {
      subscribeToSupabaseDrops((newDrop) => {
        const event: LiveDropEvent = {
          user: { username: 'Gamer_' + (newDrop.user_id ? String(newDrop.user_id).slice(-4) : 'UZ') },
          case: { name: newDrop.obtained_from || 'Covert Case', slug: 'covert-beast' },
          item: {
            name: newDrop.name || 'CS2 Skin',
            price: newDrop.obtained_price || 4500000,
            rarity: (newDrop.rarity as any) || 'covert',
            imageUrl: newDrop.image_url || 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0n_L1JaKfzzoGuMlOjede0uvFrInwigK2_UduYTjzJ4_AIA8-YlqErlnq35S7tJXBzXFiuCY8pSGK_kF_q08',
          },
          timestamp: new Date().toISOString(),
        };
        this.dropCallbacks.forEach((cb) => cb(event));
      });
    } catch {
      // Ignored
    }

    // 2. Simulyatsiya qilingan droplar (jonli atmosfera uchun har 8-15 soniyada)
    const simulatedUsers = ['Shohrukh_UZ', 'Doniyor_CS', 'Jasur_777', 'Bekzod_Sniper', 'Timur_AK', 'Sardor_AWP', 'Farrukh_Pro'];
    const simulatedCases = ['Knife Odyssey', 'Covert Beast', 'Starter Case'];
    const simulatedItems = [
      { name: 'Butterfly Knife | Fade', price: 1800000000, rarity: 'special' as const, img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhGJP68twj-3I4IG7jAzm_xVoYWr2doWRcARrZQ2F8wS3ye-61pW16ZzOyXBi7yV37SuPzBfhn1gSOa-QvLqQ' },
      { name: 'AWP | Dragon Lore', price: 4500000000, rarity: 'covert' as const, img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0n_L1JaKfzzoGuMlOjede0uvFrInwigK2_UduYTjzJ4_AIA8-YlqErlnq35S7tJXBzXFiuCY8pSGK_kF_q08' },
      { name: 'M4A4 | Howl', price: 3200000000, rarity: 'covert' as const, img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwW09izh5CAlvDzPYTZk2pH8Ytz2rqTrN-h2gTm-0BoMTigLdPAJ1VqZgnXqFe3l-ruh5fouZ2anHA1uyF35y2LmEOyghgZbeBr' },
      { name: 'AWP | Asiimov', price: 125000000, rarity: 'covert' as const, img: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17P7NdTRH-t26q4SZlvD7PYTQgXtu5Mx2gv2PoI-t3wW3_0VsMDr7coedegI_ZgvR_VO5k7q7jJTpu5_BmiZiu3Yn4SvczUGw1BlSLrs4003r-iM' },
    ];

    this.simulationTimer = setInterval(() => {
      const randomUser = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];
      const randomCase = simulatedCases[Math.floor(Math.random() * simulatedCases.length)];
      const randomItem = simulatedItems[Math.floor(Math.random() * simulatedItems.length)];

      const dropEvent: LiveDropEvent = {
        user: { username: randomUser },
        case: { name: randomCase, slug: 'covert-beast' },
        item: {
          name: randomItem.name,
          price: randomItem.price,
          rarity: randomItem.rarity,
          imageUrl: randomItem.img,
        },
        timestamp: new Date().toISOString(),
      };

      this.dropCallbacks.forEach((cb) => cb(dropEvent));
    }, 10000);
  }

  private static scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, 8000);
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
