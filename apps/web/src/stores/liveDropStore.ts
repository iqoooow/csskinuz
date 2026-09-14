import { create } from 'zustand';
import { LiveDropEvent } from '../types/index.js';
import { WebSocketClient } from '../services/websocket.js';

interface LiveDropState {
  drops: LiveDropEvent[];
  initLiveDrops: () => void;
}

export const useLiveDropStore = create<LiveDropState>((set) => ({
  drops: [
    {
      user: { username: 'Shohrukh***' },
      case: { name: 'Covert Dreams', slug: 'covert-dreams' },
      item: {
        name: 'AWP | Asiimov',
        price: 125000000,
        rarity: 'covert',
        imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17P7NdTRH-t26q4SZlvD7PYTQgXtu5Mx2gv2PoI-t3wW3_0VsMDr7coedegI_ZgvR_VO5k7q7jJTpu5_BmiZiu3Yn4SvczUGw1BlSLrs4003r-iM',
      },
      timestamp: new Date().toISOString(),
    },
    {
      user: { username: 'Bekzod_CS' },
      case: { name: 'Knife Odyssey', slug: 'knife-odyssey' },
      item: {
        name: 'Karambit | Doppler',
        price: 1450000000,
        rarity: 'special',
        imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhGJP68tzteTE8DXi2Vbt-0ZoZTjydoXBcQc2N1jUrFS-x-rngZe77cmfznBi73Ym5SqMnwv3309aL0N4ug',
      },
      timestamp: new Date().toISOString(),
    },
  ],

  initLiveDrops: () => {
    WebSocketClient.subscribeToLiveDrops((newDrop) => {
      set((state) => ({
        drops: [newDrop, ...state.drops.slice(0, 19)], // So'nggi 20 ta drop
      }));
    });
  },
}));
