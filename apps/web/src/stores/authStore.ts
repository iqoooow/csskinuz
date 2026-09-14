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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  wallet: null,
  token: localStorage.getItem('csskinuz_token'),
  isLoading: true,
  isDepositModalOpen: false,
  isAuthModalOpen: false,

  initAuth: async () => {
    set({ isLoading: true });

    // 1. Agar Telegram Mini App ichida ochilgan bo'lsa
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;
      try {
        tg.ready();
        tg.expand();
      } catch {
        // Ignored
      }

      if (tg.initData || tg.initDataUnsafe?.user) {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const ref = urlParams.get('tgWebAppStartParam') || undefined;
          await get().loginTelegram(tg.initData || 'tg_mini_app', ref);
          set({ isLoading: false });
          return;
        } catch {
          // Fallback down
        }
      }
    }

    // 2. Token orqali tekshirish
    const token = get().token;
    if (token) {
      try {
        const res = await ApiClient.getMe();
        set({ user: res.user, wallet: res.wallet, isLoading: false });
        return;
      } catch {
        get().logout();
      }
    }

    // 3. LocalStorage dan yuklash
    const storedUserRaw = localStorage.getItem('csskinuz_user_data');
    const storedWalletRaw = localStorage.getItem('csskinuz_wallet_data');
    if (storedUserRaw && storedWalletRaw) {
      try {
        const user = JSON.parse(storedUserRaw);
        const wallet = JSON.parse(storedWalletRaw);
        set({ user, wallet, isLoading: false });
        return;
      } catch {
        // Ignored
      }
    }

    set({ isLoading: false });
  },

  loginTelegram: async (initData: string, referrerCode?: string) => {
    const res = await ApiClient.loginTelegram(initData, referrerCode);
    localStorage.setItem('csskinuz_token', res.token);
    set({ token: res.token, user: res.user, wallet: res.wallet, isAuthModalOpen: false });
    await get().refreshUserData();
  },

  loginSteam: async (steamId: string, username: string, avatarUrl?: string) => {
    const res = await ApiClient.loginSteam(steamId, username, avatarUrl);
    localStorage.setItem('csskinuz_token', res.token);
    set({ token: res.token, user: res.user, wallet: res.wallet, isAuthModalOpen: false });
    await get().refreshUserData();
  },

  logout: () => {
    localStorage.removeItem('csskinuz_token');
    localStorage.removeItem('csskinuz_user_data');
    localStorage.removeItem('csskinuz_wallet_data');
    set({ token: null, user: null, wallet: null });
  },

  updateBalance: (newBalance: number) => {
    set((state) => ({
      wallet: state.wallet ? { ...state.wallet, balance: newBalance } : null,
    }));
  },

  refreshUserData: async () => {
    try {
      const res = await ApiClient.getMe();
      if (res.user) {
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
