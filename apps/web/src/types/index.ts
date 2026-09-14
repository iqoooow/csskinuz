export interface User {
  id: string;
  username: string;
  avatar_url?: string;
  role: 'USER' | 'VIP' | 'STREAMER' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN';
  telegram_id?: number;
  steam_id?: string;
  trade_url?: string;
}

export interface Wallet {
  balance: number; // tiyinlarda
  bonus_balance: number;
  wager_required: number;
  wager_current: number;
  currency: string;
}

export type RarityType = 'consumer' | 'milspec' | 'restricted' | 'classified' | 'covert' | 'special';

export interface SkinItem {
  id: string;
  name: string;
  market_hash_name?: string;
  weapon_type: string;
  rarity: RarityType;
  exterior?: string;
  wear?: string;
  base_price: number; // tiyinlarda
  image_url: string;
  is_stattrak?: boolean;
  chancePercent?: number;
}

export interface InventoryItem {
  id: string;
  user_id: string;
  item_id: string;
  obtained_from: string;
  obtained_price: number;
  status: 'AVAILABLE' | 'LOCKED' | 'SOLD' | 'UPGRADED_AWAY' | 'WITHDRAWAL_QUEUED' | 'WITHDRAWN';
  created_at: string;
  name: string;
  market_hash_name: string;
  weapon_type: string;
  rarity: RarityType;
  exterior: string;
  base_price: number;
  image_url: string;
  is_stattrak: boolean;
}

export interface Case {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  image_url: string;
  is_free: number;
  is_active: number;
  open_count?: number;
  itemsCount?: number;
  bestItem?: {
    name: string;
    base_price: number;
    image_url: string;
    rarity: RarityType;
  };
  items?: SkinItem[];
}

export interface LiveDropEvent {
  user: {
    username: string;
    avatar_url?: string;
  };
  case: {
    name: string;
    slug: string;
  };
  item: {
    name: string;
    price: number;
    rarity: RarityType;
    imageUrl: string;
  };
  timestamp: string;
}

export interface Battle {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_avatar?: string;
  status: 'WAITING_FOR_PLAYERS' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  max_players: number;
  is_crazy_mode: number;
  total_cost: number;
  winner_id?: string;
  created_at: string;
  players: Array<{
    id: string;
    user_id?: string;
    username?: string;
    avatar_url?: string;
    is_bot: number;
    slot_number: number;
    total_drop_value: number;
    is_winner: number;
  }>;
  cases: Array<{
    id: string;
    name: string;
    image_url: string;
    price: number;
    slug: string;
    round_order: number;
  }>;
  drops?: Array<{
    id: string;
    player_id: string;
    round_number: number;
    item_id: string;
    item_name: string;
    item_price: number;
    image_url: string;
    rarity: RarityType;
  }>;
}
