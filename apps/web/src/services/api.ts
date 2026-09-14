import { Battle, Case, RarityType } from '../types/index.js';

export const DEFAULT_SKINS = [
  { id: 'skin_dlore', name: 'AWP | Dragon Lore', weapon_type: 'Sniper Rifle', rarity: 'covert' as RarityType, exterior: 'FT', base_price: 4500000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0n_L1JaKfzzoGuMlOjede0uvFrInwigK2_UduYTjzJ4_AIA8-YlqErlnq35S7tJXBzXFiuCY8pSGK_kF_q08', is_stattrak: false },
  { id: 'skin_howl', name: 'M4A4 | Howl', weapon_type: 'Rifle', rarity: 'covert' as RarityType, exterior: 'FT', base_price: 3200000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwW09izh5CAlvDzPYTZk2pH8Ytz2rqTrN-h2gTm-0BoMTigLdPAJ1VqZgnXqFe3l-ruh5fouZ2anHA1uyF35y2LmEOyghgZbeBr', is_stattrak: false },
  { id: 'skin_butterfly_fade', name: 'Butterfly Knife | Fade', weapon_type: 'Knife', rarity: 'special' as RarityType, exterior: 'FN', base_price: 1800000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhGJP68twj-3I4IG7jAzm_xVoYWr2doWRcARrZQ2F8wS3ye-61pW16ZzOyXBi7yV37SuPzBfhn1gSOa-QvLqQ', is_stattrak: false },
  { id: 'skin_karambit_doppler', name: 'Karambit | Doppler', weapon_type: 'Knife', rarity: 'special' as RarityType, exterior: 'FN', base_price: 1450000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhGJP68tzteTE8DXi2Vbt-0ZoZTjydoXBcQc2N1jUrFS-x-rngZe77cmfznBi73Ym5SqMnwv3309aL0N4ug', is_stattrak: false },
  { id: 'skin_m9_gamma', name: 'M9 Bayonet | Gamma Doppler', weapon_type: 'Knife', rarity: 'special' as RarityType, exterior: 'FN', base_price: 1300000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czhx5ci5q5CKqPrxN7LEmyUB7ZYk0-vFpIrz2wzn_ENtYGD3LNPHdQBoZQvT81S4yLzuhMW_uZqanXBrsnI8pSGKw-L7K40', is_stattrak: false },
  { id: 'skin_fire_serpent', name: 'AK-47 | Fire Serpent', weapon_type: 'Rifle', rarity: 'covert' as RarityType, exterior: 'FT', base_price: 850000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV08y5nY6fqPP9ILrDhGpI18h0juDU-MKt0QLg_kdvamqlJITAdgA4aV-G-QC_yL3og5a8vZvOynI1uCIh-z-DyOCmJ9B4', is_stattrak: false },
  { id: 'skin_awp_asiimov', name: 'AWP | Asiimov', weapon_type: 'Sniper Rifle', rarity: 'covert' as RarityType, exterior: 'FT', base_price: 125000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17P7NdTRH-t26q4SZlvD7PYTQgXtu5Mx2gv2PoI-t3wW3_0VsMDr7coedegI_ZgvR_VO5k7q7jJTpu5_BmiZiu3Yn4SvczUGw1BlSLrs4003r-iM', is_stattrak: false },
  { id: 'skin_ak_vulcan', name: 'AK-47 | Vulcan', weapon_type: 'Rifle', rarity: 'classified' as RarityType, exterior: 'FT', base_price: 85000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV0924l4GSqP_xMq3ejlRd4cJ5nqfEp9rw0A2wqkRkNT_yItOXcgFsN1HYr1S9wbruh5fouZian3A1uCE8pSGKcZg0b1A', is_stattrak: false },
  { id: 'skin_usps_kill_confirmed', name: 'USP-S | Kill Confirmed', weapon_type: 'Pistol', rarity: 'covert' as RarityType, exterior: 'FT', base_price: 65000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j_OrfdqWhe5sN4mOTE8bP4jVC9vh5yZzzyc9TGc1M5NQqB-FS5kOm-05ftup6fznphuHIl4SvczkPjn1gSOY4lV8vE', is_stattrak: false },
  { id: 'skin_deagle_printstream', name: 'Desert Eagle | Printstream', weapon_type: 'Pistol', rarity: 'classified' as RarityType, exterior: 'FT', base_price: 45000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PDdTjlH_9mkgL-OlvD4NoTck29Y_cg_2rDHodSn3AHi_ERvYmGncNSddgc3NFnYr1O9wermjMTvuZ-byXBmuSE8pSGKhWc7_nU', is_stattrak: false },
  { id: 'skin_m4_emperor', name: 'M4A4 | The Emperor', weapon_type: 'Rifle', rarity: 'classified' as RarityType, exterior: 'FT', base_price: 32000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alIITfn2xV_Pp_g_eY99Sn0VDk_0Y-Z2CmJo6UIQ84aVnWr1i8k7vvh8Pq7smazCBgviQh4C2OmEbmhQYMMLInxX2s8A', is_stattrak: false },
  { id: 'skin_glock_water', name: 'Glock-18 | Water Elemental', weapon_type: 'Pistol', rarity: 'restricted' as RarityType, exterior: 'FT', base_price: 6500000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKA5v2t03iF195NOJh5SOkvPLPr7Vn35cpsB03-3A8Nug2Fbt-xVpMT_6INPAcA85YF-F_wO-wOft15G975_Kn3RruiMi4ivcnAv3309aL_T7Yg', is_stattrak: false },
  { id: 'skin_awp_atheris', name: 'AWP | Atheris', weapon_type: 'Sniper Rifle', rarity: 'restricted' as RarityType, exterior: 'FT', base_price: 4500000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17P7NdTRH-t26q4SZlvD7PYTQgXtu5Mx2gv2P8Nug31fkqUo-Zz_ydo_AdFQ3Ml2C-1i3xevrhMS_uZvBnXZjvCJ3-z-DyG2qS1zW', is_stattrak: false },
  { id: 'skin_usps_flashback', name: 'USP-S | Flashback', weapon_type: 'Pistol', rarity: 'milspec' as RarityType, exterior: 'FT', base_price: 1500000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j_OrfdqWhe5sN4mOTE8bP4jVC9vh5yZzzyc9TGc1M5NQqB-FS5kOm-05ftup6fznphuHIl4SvczkPjn1gSOY4lV8vE', is_stattrak: false },
  { id: 'skin_p250_valence', name: 'P250 | Valence', weapon_type: 'Pistol', rarity: 'milspec' as RarityType, exterior: 'FT', base_price: 1200000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopujwezhjxszYI2gS0924l4GSqP_xMq3ejlRd4cJ5nqfEp9rw0A2wqkRkNT_yItOXcgFsN1HYr1S9wbruh5fouZian3A1uCE8pSGKcZg0b1A', is_stattrak: false },
  { id: 'skin_ak_safari', name: 'AK-47 | Safari Mesh', weapon_type: 'Rifle', rarity: 'consumer' as RarityType, exterior: 'FT', base_price: 500000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV08y5nY6fqPP9ILrDhGpI18h0juDU-MKt0QLg_kdvamqlJITAdgA4aV-G-QC_yL3og5a8vZvOynI1uCIh-z-DyOCmJ9B4', is_stattrak: false },
];

export const DEFAULT_CASES: Case[] = [
  {
    id: 'case_knife_odyssey',
    slug: 'knife-odyssey',
    name: 'Knife Odyssey',
    category: 'knives',
    price: 12000000,
    image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhGJP68twj-3I4IG7jAzm_xVoYWr2doWRcARrZQ2F8wS3ye-61pW16ZzOyXBi7yV37SuPzBfhn1gSOa-QvLqQ',
    is_free: 0,
    is_active: 1,
    itemsCount: 6,
    bestItem: {
      name: 'Butterfly Knife | Fade',
      base_price: 1800000000,
      image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhGJP68twj-3I4IG7jAzm_xVoYWr2doWRcARrZQ2F8wS3ye-61pW16ZzOyXBi7yV37SuPzBfhn1gSOa-QvLqQ',
      rarity: 'special',
    },
    items: [
      DEFAULT_SKINS[2],
      DEFAULT_SKINS[3],
      DEFAULT_SKINS[4],
      DEFAULT_SKINS[6],
      DEFAULT_SKINS[7],
      DEFAULT_SKINS[9],
    ],
  },
  {
    id: 'case_covert_beast',
    slug: 'covert-beast',
    name: 'Covert Beast',
    category: 'popular',
    price: 4500000,
    image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0n_L1JaKfzzoGuMlOjede0uvFrInwigK2_UduYTjzJ4_AIA8-YlqErlnq35S7tJXBzXFiuCY8pSGK_kF_q08',
    is_free: 0,
    is_active: 1,
    itemsCount: 7,
    bestItem: {
      name: 'AWP | Dragon Lore',
      base_price: 4500000000,
      image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0n_L1JaKfzzoGuMlOjede0uvFrInwigK2_UduYTjzJ4_AIA8-YlqErlnq35S7tJXBzXFiuCY8pSGK_kF_q08',
      rarity: 'covert',
    },
    items: [
      DEFAULT_SKINS[0],
      DEFAULT_SKINS[1],
      DEFAULT_SKINS[5],
      DEFAULT_SKINS[6],
      DEFAULT_SKINS[8],
      DEFAULT_SKINS[10],
      DEFAULT_SKINS[11],
    ],
  },
  {
    id: 'case_starter_case',
    slug: 'starter-case',
    name: 'Starter Case',
    category: 'budget',
    price: 1500000,
    image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j_OrfdqWhe5sN4mOTE8bP4jVC9vh5yZzzyc9TGc1M5NQqB-FS5kOm-05ftup6fznphuHIl4SvczkPjn1gSOY4lV8vE',
    is_free: 0,
    is_active: 1,
    itemsCount: 6,
    bestItem: {
      name: 'USP-S | Kill Confirmed',
      base_price: 65000000,
      image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j_OrfdqWhe5sN4mOTE8bP4jVC9vh5yZzzyc9TGc1M5NQqB-FS5kOm-05ftup6fznphuHIl4SvczkPjn1gSOY4lV8vE',
      rarity: 'covert',
    },
    items: [
      DEFAULT_SKINS[8],
      DEFAULT_SKINS[9],
      DEFAULT_SKINS[11],
      DEFAULT_SKINS[12],
      DEFAULT_SKINS[13],
      DEFAULT_SKINS[14],
    ],
  },
  {
    id: 'case_daily_free',
    slug: 'daily-free',
    name: 'Kunlik Bepul Keys',
    category: 'free',
    price: 0,
    image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKA5v2t03iF195NOJh5SOkvPLPr7Vn35cpsB03-3A8Nug2Fbt-xVpMT_6INPAcA85YF-F_wO-wOft15G975_Kn3RruiMi4ivcnAv3309aL_T7Yg',
    is_free: 1,
    is_active: 1,
    itemsCount: 5,
    bestItem: {
      name: 'Glock-18 | Water Elemental',
      base_price: 6500000,
      image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKA5v2t03iF195NOJh5SOkvPLPr7Vn35cpsB03-3A8Nug2Fbt-xVpMT_6INPAcA85YF-F_wO-wOft15G975_Kn3RruiMi4ivcnAv3309aL_T7Yg',
      rarity: 'restricted',
    },
    items: [
      DEFAULT_SKINS[11],
      DEFAULT_SKINS[12],
      DEFAULT_SKINS[13],
      DEFAULT_SKINS[14],
      DEFAULT_SKINS[15],
    ],
  },
];

export class ApiClient {
  private static getStoredUser(): any | null {
    const raw = localStorage.getItem('csskinuz_user_data');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private static getStoredWallet(): any | null {
    const raw = localStorage.getItem('csskinuz_wallet_data');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private static getStoredInventory(): any[] {
    const raw = localStorage.getItem('csskinuz_inventory_data');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private static saveInventory(items: any[]) {
    localStorage.setItem('csskinuz_inventory_data', JSON.stringify(items));
  }

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  static async loginTelegram(_initData: string, _referrerCode?: string): Promise<{ token: string; user: any; wallet: any }> {
    let tgUser: any = null;
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
      tgUser = (window as any).Telegram.WebApp.initDataUnsafe.user;
    }

    const userId = tgUser?.id ? `tg_${tgUser.id}` : `user_${Date.now().toString(36)}`;
    const username = tgUser?.username || tgUser?.first_name || 'Telegram Gamer';
    const avatarUrl = tgUser?.photo_url || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';

    const user = {
      id: userId,
      username,
      avatar_url: avatarUrl,
      telegram_id: tgUser?.id || 12345678,
      role: 'USER' as const,
      trade_url: 'https://steamcommunity.com/tradeoffer/new/?partner=89000123&token=TelegramGamerToken',
    };

    const wallet = {
      balance: 10000000,
      bonus_balance: 2000000,
      currency: 'UZS',
      wager_required: 0,
      wager_current: 0,
    };

    const token = `jwt_csskinuz_${userId}`;
    return { token, user, wallet };
  }

  static async loginSteam(steamId: string, username: string, avatarUrl?: string): Promise<{ token: string; user: any; wallet: any }> {
    const userId = `steam_${steamId || Date.now().toString(36)}`;
    const cleanUsername = username.trim() || 'CS2_Pro_Player';
    const cleanAvatar = avatarUrl || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';

    const user = {
      id: userId,
      username: cleanUsername,
      avatar_url: cleanAvatar,
      steam_id: steamId,
      role: 'USER' as const,
      trade_url: `https://steamcommunity.com/tradeoffer/new/?partner=${steamId.slice(-8)}&token=SteamPartnerToken`,
    };

    const wallet = {
      balance: 10000000,
      bonus_balance: 2000000,
      currency: 'UZS',
      wager_required: 0,
      wager_current: 0,
    };

    const token = `jwt_steam_${userId}`;
    return { token, user, wallet };
  }

  static async getMe(): Promise<{ user: any; wallet: any }> {
    const user = this.getStoredUser() || {
      id: 'guest_user',
      username: 'CS2_Player',
      role: 'USER',
      avatar_url: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
    };
    const wallet = this.getStoredWallet() || {
      balance: 10000000,
      bonus_balance: 0,
      currency: 'UZS',
      wager_required: 0,
      wager_current: 0,
    };
    return { user, wallet };
  }

  static async setTradeUrl(tradeUrl: string) {
    const user = this.getStoredUser();
    if (user) {
      user.trade_url = tradeUrl;
      localStorage.setItem('csskinuz_user_data', JSON.stringify(user));
    }
    return { success: true };
  }

  // ==========================================
  // WALLET & DEPOSITS
  // ==========================================
  static async getBalance() {
    return this.getStoredWallet() || { balance: 10000000, bonus_balance: 0, currency: 'UZS' };
  }

  static async getTransactions(_limit = 20, _offset = 0) {
    return [];
  }

  static async createDeposit(amount: number, gateway: string, promoCode?: string) {
    return this.simulateDeposit(amount, gateway, promoCode);
  }

  static async simulateDeposit(amount: number, _gateway: string, promoCode?: string) {
    const wallet = this.getStoredWallet() || { balance: 0, bonus_balance: 0, currency: 'UZS' };
    const addedAmount = Math.round(amount * 100);
    const bonusAmount = promoCode ? Math.round(addedAmount * 0.1) : 0;

    wallet.balance += addedAmount;
    wallet.bonus_balance = (wallet.bonus_balance || 0) + bonusAmount;

    localStorage.setItem('csskinuz_wallet_data', JSON.stringify(wallet));

    return {
      success: true,
      transactionId: `dep_${Date.now()}`,
      amountAdded: addedAmount,
      bonusAdded: bonusAmount,
      newBalance: wallet.balance,
    };
  }

  // ==========================================
  // CASES & CATALOG
  // ==========================================
  static async getCases(category?: string) {
    if (category && category !== 'all') {
      return DEFAULT_CASES.filter((c) => c.category === category);
    }
    return DEFAULT_CASES;
  }

  static async getCase(slug: string) {
    const found = DEFAULT_CASES.find((c) => c.slug === slug);
    return found || DEFAULT_CASES[0];
  }

  static async openCase(slug: string, count = 1, _clientSeed?: string) {
    const caseItem = DEFAULT_CASES.find((c) => c.slug === slug) || DEFAULT_CASES[0];
    const wallet = this.getStoredWallet() || { balance: 10000000, bonus_balance: 0, currency: 'UZS' };
    const totalCost = caseItem.price * count;

    if (wallet.balance < totalCost && !caseItem.is_free) {
      throw new Error('Hisobingizda mablag\' yetarli emas. Iltimos hisobingizni to\'ldiring.');
    }

    wallet.balance = Math.max(0, wallet.balance - totalCost);
    localStorage.setItem('csskinuz_wallet_data', JSON.stringify(wallet));

    const drops: any[] = [];
    const currentInventory = this.getStoredInventory();

    for (let i = 0; i < count; i++) {
      const items = caseItem.items || DEFAULT_SKINS;
      const randomIndex = Math.floor(Math.random() * items.length);
      const wonSkin = items[randomIndex] || items[0];

      const invItem = {
        id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        user_id: 'current_user',
        item_id: wonSkin.id,
        name: wonSkin.name,
        market_hash_name: wonSkin.name,
        weapon_type: wonSkin.weapon_type,
        rarity: wonSkin.rarity,
        exterior: wonSkin.exterior || 'FN',
        base_price: wonSkin.base_price,
        image_url: wonSkin.image_url,
        is_stattrak: Boolean(wonSkin.is_stattrak),
        obtained_from: caseItem.name,
        obtained_price: caseItem.price,
        status: 'AVAILABLE',
        created_at: new Date().toISOString(),
      };

      drops.push(invItem);
      currentInventory.unshift(invItem);
    }

    this.saveInventory(currentInventory);

    return {
      results: drops,
      drops,
      totalCost,
      newBalance: wallet.balance,
      balanceAfter: wallet.balance,
    };
  }

  // ==========================================
  // INVENTORY
  // ==========================================
  static async getInventory(status = 'AVAILABLE') {
    const all = this.getStoredInventory();
    if (status) {
      return all.filter((i) => i.status === status);
    }
    return all;
  }

  static async sellItem(id: string) {
    const items = this.getStoredInventory();
    const target = items.find((i) => i.id === id);
    if (!target) throw new Error('Skin topilmadi');

    target.status = 'SOLD';
    this.saveInventory(items);

    const wallet = this.getStoredWallet() || { balance: 0, bonus_balance: 0, currency: 'UZS' };
    wallet.balance += target.base_price;
    localStorage.setItem('csskinuz_wallet_data', JSON.stringify(wallet));

    return {
      success: true,
      soldPrice: target.base_price,
      newBalance: wallet.balance,
    };
  }

  static async bulkSell(itemIds: string[]) {
    const items = this.getStoredInventory();
    let totalGained = 0;

    items.forEach((item) => {
      if (itemIds.includes(item.id)) {
        item.status = 'SOLD';
        totalGained += item.base_price;
      }
    });

    this.saveInventory(items);

    const wallet = this.getStoredWallet() || { balance: 0, bonus_balance: 0, currency: 'UZS' };
    wallet.balance += totalGained;
    localStorage.setItem('csskinuz_wallet_data', JSON.stringify(wallet));

    return {
      success: true,
      soldCount: itemIds.length,
      totalAmount: totalGained,
      totalGained,
      newBalance: wallet.balance,
    };
  }

  // ==========================================
  // UPGRADES
  // ==========================================
  static async calculateUpgrade(inputValue: number, targetItemPrice: number) {
    const rawChance = (inputValue / targetItemPrice) * 100 * 0.95;
    const winChance = Math.min(80, Math.max(1, Math.round(rawChance * 100) / 100));
    return {
      inputValue,
      targetItemPrice,
      winChance,
      multiplier: Math.round((targetItemPrice / (inputValue || 1)) * 10) / 10,
      winAngle: (winChance / 100) * 360,
    };
  }

  static async executeUpgrade(_inputItemIds: string[], inputBalanceAmount: number, targetItemId: string, _clientSeed?: string) {
    const targetSkin = DEFAULT_SKINS.find((s) => s.id === targetItemId) || DEFAULT_SKINS[0];
    const winChance = Math.min(80, Math.max(1, (inputBalanceAmount / targetSkin.base_price) * 100 * 0.95));
    const rollNumber = Math.random() * 100;
    const isWon = rollNumber <= winChance;

    const wallet = this.getStoredWallet() || { balance: 0, bonus_balance: 0, currency: 'UZS' };
    wallet.balance = Math.max(0, wallet.balance - inputBalanceAmount);
    localStorage.setItem('csskinuz_wallet_data', JSON.stringify(wallet));

    if (isWon) {
      const inventory = this.getStoredInventory();
      const wonItem = {
        id: `upg_${Date.now()}`,
        name: targetSkin.name,
        rarity: targetSkin.rarity,
        base_price: targetSkin.base_price,
        image_url: targetSkin.image_url,
        status: 'AVAILABLE',
        obtained_from: 'Upgrade',
        created_at: new Date().toISOString(),
      };
      inventory.unshift(wonItem);
      this.saveInventory(inventory);
    }

    return {
      isWon,
      rollNumber: Math.round(rollNumber * 100) / 100,
      winChance: Math.round(winChance * 100) / 100,
      wonItem: isWon ? targetSkin : null,
      newBalance: wallet.balance,
      stopAngle: (rollNumber / 100) * 360,
    };
  }

  // ==========================================
  // BATTLES
  // ==========================================
  static async getBattles(): Promise<Battle[]> {
    return [];
  }

  static async getBattle(id: string): Promise<Battle | null> {
    return {
      id,
      creator_id: 'user_1',
      creator_name: 'CS2_Master',
      status: 'WAITING_FOR_PLAYERS',
      max_players: 2,
      is_crazy_mode: 0,
      total_cost: 1500000,
      created_at: new Date().toISOString(),
      players: [
        {
          id: 'p1',
          username: 'CS2_Master',
          is_bot: 0,
          slot_number: 1,
          total_drop_value: 0,
          is_winner: 0,
        },
      ],
      cases: [
        {
          id: 'case_starter_case',
          name: 'Starter Case',
          image_url: DEFAULT_CASES[2].image_url,
          price: DEFAULT_CASES[2].price,
          slug: DEFAULT_CASES[2].slug,
          round_order: 1,
        },
      ],
    };
  }

  static async createBattle(_caseIds: string[], maxPlayers = 2, isCrazyMode = false): Promise<Battle> {
    return {
      id: `battle_${Date.now()}`,
      creator_id: 'current_user',
      creator_name: 'Mening Jangim',
      status: 'WAITING_FOR_PLAYERS',
      max_players: maxPlayers,
      is_crazy_mode: isCrazyMode ? 1 : 0,
      total_cost: 1500000,
      created_at: new Date().toISOString(),
      players: [
        {
          id: 'p1',
          username: 'Mening Jangim',
          is_bot: 0,
          slot_number: 1,
          total_drop_value: 0,
          is_winner: 0,
        },
      ],
      cases: [
        {
          id: 'case_starter_case',
          name: 'Starter Case',
          image_url: DEFAULT_CASES[2].image_url,
          price: DEFAULT_CASES[2].price,
          slug: DEFAULT_CASES[2].slug,
          round_order: 1,
        },
      ],
    };
  }

  static async joinBattle(id: string): Promise<Battle> {
    const battle = await this.getBattle(id);
    return battle || ({} as Battle);
  }

  static async addBotToBattle(id: string): Promise<Battle> {
    const battle = await this.getBattle(id);
    return battle || ({} as Battle);
  }

  // ==========================================
  // TRADE & WITHDRAWAL
  // ==========================================
  static async getTradeStock(_search?: string, _rarity?: string, _maxPrice?: number) {
    return DEFAULT_SKINS;
  }

  static async executeTrade(_inputInventoryIds: string[], _targetItemIds: string[]) {
    const wallet = this.getStoredWallet() || { balance: 10000000, bonus_balance: 0, currency: 'UZS' };
    return { success: true, newBalance: wallet.balance };
  }

  static async withdrawSkin(_inventoryItemId: string) {
    return { success: true, message: 'Steam Trade taklifi 60 soniya ichida yuboriladi' };
  }

  static async verifyFairness(_serverSeed: string, _clientSeed: string, _nonce: number, rollNumber: number) {
    return {
      verified: true,
      calculatedHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      rollNumber,
    };
  }

  // ==========================================
  // ADMIN
  // ==========================================
  static async getAdminOverview() {
    return {
      totalUsers: 1420,
      totalCasesOpened: 18520,
      totalVolume: 42500000000,
      todayProfit: 385000000,
    };
  }

  static async getAdminUsers(_search?: string) {
    return [];
  }

  static async banUser(_id: string, _reason: string) {
    return { success: true };
  }

  static async unbanUser(_id: string) {
    return { success: true };
  }

  static async adjustBalance(_id: string, _amount: number, _reason: string) {
    return { success: true };
  }
}
