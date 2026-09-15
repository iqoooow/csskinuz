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
      user: { username: 'Doniyor_CS2' },
      case: { name: 'Covert Beast', slug: 'covert-beast' },
      item: {
        name: 'AWP | Dragon Lore',
        price: 4500000000,
        rarity: 'covert',
        imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0n_L1JaKfzzoGuMlOjede0uvFrInwigK2_UduYTjzJ4_AIA8-YlqErlnq35S7tJXBzXFiuCY8pSGK_kF_q08',
      },
      timestamp: new Date().toISOString(),
    },
    {
      user: { username: 'Shohrukh_Pro' },
      case: { name: 'Knife Odyssey', slug: 'knife-odyssey' },
      item: {
        name: 'Butterfly Knife | Fade',
        price: 1800000000,
        rarity: 'special',
        imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhGJP68twj-3I4IG7jAzm_xVoYWr2doWRcARrZQ2F8wS3ye-61pW16ZzOyXBi7yV37SuPzBfhn1gSOa-QvLqQ',
      },
      timestamp: new Date().toISOString(),
    },
    {
      user: { username: 'Sardor_UZ' },
      case: { name: 'Covert Beast', slug: 'covert-beast' },
      item: {
        name: 'M4A4 | Howl',
        price: 3200000000,
        rarity: 'covert',
        imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwW09izh5CAlvDzPYTZk2pH8Ytz2rqTrN-h2gTm-0BoMTigLdPAJ1VqZgnXqFe3l-ruh5fouZ2anHA1uyF35y2LmEOyghgZbeBr',
      },
      timestamp: new Date().toISOString(),
    },
    {
      user: { username: 'Bekzod_Gamer' },
      case: { name: 'Knife Odyssey', slug: 'knife-odyssey' },
      item: {
        name: 'Karambit | Doppler',
        price: 1450000000,
        rarity: 'special',
        imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhGJP68tzteTE8DXi2Vbt-0ZoZTjydoXBcQc2N1jUrFS-x-rngZe77cmfznBi73Ym5SqMnwv3309aL0N4ug',
      },
      timestamp: new Date().toISOString(),
    },
    {
      user: { username: 'Jasur_Sniper' },
      case: { name: 'Covert Beast', slug: 'covert-beast' },
      item: {
        name: 'AWP | Asiimov',
        price: 125000000,
        rarity: 'covert',
        imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17P7NdTRH-t26q4SZlvD7PYTQgXtu5Mx2gv2PoI-t3wW3_0VsMDr7coedegI_ZgvR_VO5k7q7jJTpu5_BmiZiu3Yn4SvczUGw1BlSLrs4003r-iM',
      },
      timestamp: new Date().toISOString(),
    },
    {
      user: { username: 'Ulugbek_CS' },
      case: { name: 'Popular Cases', slug: 'covert-beast' },
      item: {
        name: 'AK-47 | Vulcan',
        price: 85000000,
        rarity: 'classified',
        imageUrl: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV0924l4GSqP_xMq3ejlRd4cJ5nqfEp9rw0A2wqkRkNT_yItOXcgFsN1HYr1S9wbruh5fouZian3A1uCE8pSGKcZg0b1A',
      },
      timestamp: new Date().toISOString(),
    },
  ],

  initLiveDrops: () => {
    WebSocketClient.subscribeToLiveDrops((newDrop) => {
      set((state) => ({
        drops: [newDrop, ...state.drops.slice(0, 19)],
      }));
    });
  },
}));
