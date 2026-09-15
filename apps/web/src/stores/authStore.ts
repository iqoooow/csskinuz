import { create } from 'zustand';
import { User, Wallet } from '../types/index.js';
import { ApiClient } from '../services/api.js';

interface AuthState {
  user: User | null;
  wallet: Wallet | null;
  token: string | null;
  isLoading: boolean;
  isDepositModalOpen: boolean;
  isAuthModalOpen: boolean;
  initAuth: () => Promise<void>;
  loginTelegram: (initData: string, referrerCode?: string) => Promise<void>;
  loginSteam: (steamId: string, username: string, avatarUrl?: string) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
  refreshUserData: () => Promise<void>;
  openDepositModal: () => void;
  closeDepositModal: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  wallet: null,
  token: localStorage.getItem('csskinuz_token'),
  isLoading: true,
  isDepositModalOpen: false,
  isAuthModalOpen: false,

  initAuth: async () => {
    set({ isLoading: true });

    // 1. Telegram Mini App yoki URL orqali Telegram foydalanuvchisini aniqlash
    let tgUser: any = null;
    if (typeof window !== 'undefined') {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        try {
          tg.ready?.();
          tg.expand?.();
        } catch {
          // Ignored
        }
        if (tg.initDataUnsafe?.user) {
          tgUser = tg.initDataUnsafe.user;
        }
      }

      // Agar URL search parametrlari bo'lsa (?tg_id=...&username=...)
      if (!tgUser) {
        try {
          const params = new URLSearchParams(window.location.search);
          const tgIdParam = params.get('tg_id');
          const usernameParam = params.get('username');
          if (tgIdParam) {
            tgUser = {
              id: Number(tgIdParam),
              username: usernameParam || 'Telegram_Gamer',
              first_name: usernameParam || 'Gamer',
            };
          }
        } catch {
          // Ignored
        }
      }
    }

    // Agar Telegram foydalanuvchisi mavjud bo'lsa — darhol tizimga kiritish!
    if (tgUser) {
      const userId = `tg_${tgUser.id}`;
      const username = tgUser.username ? `@${tgUser.username}` : (tgUser.first_name || 'Telegram Gamer');
      const avatarUrl = tgUser.photo_url || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';

      let wallet: Wallet = {
        balance: 10000000, // 100 000 UZS boshlang'ich balans
        bonus_balance: 2000000,
        currency: 'UZS',
        wager_required: 0,
        wager_current: 0,
      };

      const storedWalletRaw = localStorage.getItem('csskinuz_wallet_data');
      if (storedWalletRaw) {
        try {
          wallet = JSON.parse(storedWalletRaw);
        } catch {
          // Ignored
        }
      }

      const user: User = {
        id: userId,
        username,
        avatar_url: avatarUrl,
        telegram_id: tgUser.id,
        role: 'USER',
        trade_url: 'https://steamcommunity.com/tradeoffer/new/?partner=89000123&token=TelegramGamerToken',
      };

      const token = `jwt_tg_${userId}`;
      localStorage.setItem('csskinuz_token', token);
      localStorage.setItem('csskinuz_user_data', JSON.stringify(user));
      localStorage.setItem('csskinuz_wallet_data', JSON.stringify(wallet));

      set({ token, user, wallet, isLoading: false, isAuthModalOpen: false });
      return;
    }

    // 2. LocalStorage dan oldingi sessiyani yuklash
    const storedUserRaw = localStorage.getItem('csskinuz_user_data');
    const storedWalletRaw = localStorage.getItem('csskinuz_wallet_data');
    if (storedUserRaw && storedWalletRaw) {
      try {
        const user = JSON.parse(storedUserRaw);
        const wallet = JSON.parse(storedWalletRaw);
        set({ user, wallet, token: localStorage.getItem('csskinuz_token'), isLoading: false });
        return;
      } catch {
        // Ignored
      }
    }

    set({ isLoading: false });
  },

  loginTelegram: async (_initData: string, _referrerCode?: string) => {
    let tgUser: any = null;
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.initDataUnsafe?.user) {
      tgUser = (window as any).Telegram.WebApp.initDataUnsafe.user;
    }

    const userId = tgUser?.id ? `tg_${tgUser.id}` : `user_${Date.now().toString(36)}`;
    const username = tgUser?.username ? `@${tgUser.username}` : (tgUser?.first_name || 'Telegram Gamer');
    const avatarUrl = tgUser?.photo_url || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';

    const user: User = {
      id: userId,
      username,
      avatar_url: avatarUrl,
      telegram_id: tgUser?.id || 12345678,
      role: 'USER',
      trade_url: 'https://steamcommunity.com/tradeoffer/new/?partner=89000123&token=TelegramGamerToken',
    };

    let wallet: Wallet = {
      balance: 10000000,
      bonus_balance: 2000000,
      currency: 'UZS',
      wager_required: 0,
      wager_current: 0,
    };

    const storedWalletRaw = localStorage.getItem('csskinuz_wallet_data');
    if (storedWalletRaw) {
      try {
        wallet = JSON.parse(storedWalletRaw);
      } catch {
        // Ignored
      }
    }

    const token = `jwt_csskinuz_${userId}`;
    localStorage.setItem('csskinuz_token', token);
    localStorage.setItem('csskinuz_user_data', JSON.stringify(user));
    localStorage.setItem('csskinuz_wallet_data', JSON.stringify(wallet));

    set({ token, user, wallet, isAuthModalOpen: false, isLoading: false });
  },

  loginSteam: async (steamId: string, username: string, avatarUrl?: string) => {
    const userId = `steam_${steamId || Date.now().toString(36)}`;
    const cleanUsername = username.trim() || 'CS2_Pro_Player';
    const cleanAvatar = avatarUrl || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';

    const user: User = {
      id: userId,
      username: cleanUsername,
      avatar_url: cleanAvatar,
      steam_id: steamId,
      role: 'USER',
      trade_url: `https://steamcommunity.com/tradeoffer/new/?partner=${steamId.slice(-8)}&token=SteamPartnerToken`,
    };

    const wallet: Wallet = {
      balance: 10000000,
      bonus_balance: 2000000,
      currency: 'UZS',
      wager_required: 0,
      wager_current: 0,
    };

    const token = `jwt_steam_${userId}`;
    localStorage.setItem('csskinuz_token', token);
    localStorage.setItem('csskinuz_user_data', JSON.stringify(user));
    localStorage.setItem('csskinuz_wallet_data', JSON.stringify(wallet));

    set({ token, user, wallet, isAuthModalOpen: false, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('csskinuz_token');
    localStorage.removeItem('csskinuz_user_data');
    localStorage.removeItem('csskinuz_wallet_data');
    set({ token: null, user: null, wallet: null });
  },

  updateBalance: (newBalance: number) => {
    set((state) => {
      const updatedWallet = state.wallet ? { ...state.wallet, balance: newBalance } : null;
      if (updatedWallet) {
        localStorage.setItem('csskinuz_wallet_data', JSON.stringify(updatedWallet));
      }
      return { wallet: updatedWallet };
    });
  },

  refreshUserData: async () => {
    try {
      const res = await ApiClient.getMe();
      if (res?.user) {
        set({ user: res.user, wallet: res.wallet });
      }
    } catch {
      // Ignored
    }
  },

  openDepositModal: () => set({ isDepositModalOpen: true }),
  closeDepositModal: () => set({ isDepositModalOpen: false }),
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
}));
