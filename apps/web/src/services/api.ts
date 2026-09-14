const VITE_API_URL = (import.meta as any).env?.VITE_API_URL || '';
const API_BASE = VITE_API_URL ? `${VITE_API_URL.replace(/\/$/, '')}/api/v1` : '/api/v1';

export class ApiClient {
  private static getToken(): string | null {
    return localStorage.getItem('csskinuz_token');
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data?.error?.message || 'Tarmoq xatoligi yuz berdi';
        throw new Error(errorMsg);
      }

      return data.data;
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch')) {
        throw err;
      }
      throw new Error('Server bilan ulanishda uzilish bo\'ldi. Iltimos qayta urinib ko\'ring.');
    }
  }

  // Auth
  static loginTelegram(initData: string, referrerCode?: string) {
    return this.request<{ token: string; user: any }>('/auth/telegram', {
      method: 'POST',
      body: JSON.stringify({ initData, referrerCode }),
    });
  }

  static loginSteam(steamId: string, username: string, avatarUrl?: string) {
    return this.request<{ token: string; user: any }>('/auth/steam', {
      method: 'POST',
      body: JSON.stringify({ steamId, username, avatarUrl }),
    });
  }

  static getMe() {
    return this.request<{ user: any; wallet: any }>('/auth/me');
  }

  static setTradeUrl(tradeUrl: string) {
    return this.request('/profile/trade-url', {
      method: 'POST',
      body: JSON.stringify({ tradeUrl }),
    });
  }

  // Wallet & Deposits
  static getBalance() {
    return this.request<any>('/wallet/balance');
  }

  static getTransactions(limit = 20, offset = 0) {
    return this.request<any[]>(`/wallet/transactions?limit=${limit}&offset=${offset}`);
  }

  static createDeposit(amount: number, gateway: string, promoCode?: string) {
    return this.request<any>('/deposits/create', {
      method: 'POST',
      body: JSON.stringify({ amount, gateway, promoCode }),
    });
  }

  static simulateDeposit(amount: number, gateway: string, promoCode?: string) {
    return this.request<any>('/deposits/simulate', {
      method: 'POST',
      body: JSON.stringify({ amount, gateway, promoCode }),
    });
  }

  // Cases
  static getCases(category?: string) {
    return this.request<any[]>(`/cases${category ? `?category=${category}` : ''}`);
  }

  static getCase(slug: string) {
    return this.request<any>(`/cases/${slug}`);
  }

  static openCase(slug: string, count = 1, clientSeed?: string) {
    return this.request<any>(`/cases/${slug}/open`, {
      method: 'POST',
      body: JSON.stringify({ count, clientSeed }),
    });
  }

  // Inventory
  static getInventory(status = 'AVAILABLE') {
    return this.request<any[]>(`/inventory?status=${status}`);
  }

  static sellItem(id: string) {
    return this.request<any>(`/inventory/${id}/sell`, {
      method: 'POST',
    });
  }

  static bulkSell(itemIds: string[]) {
    return this.request<any>('/inventory/bulk-sell', {
      method: 'POST',
      body: JSON.stringify({ itemIds }),
    });
  }

  // Upgrades
  static calculateUpgrade(inputValue: number, targetItemPrice: number) {
    return this.request<any>('/upgrades/calculate', {
      method: 'POST',
      body: JSON.stringify({ inputValue, targetItemPrice }),
    });
  }

  static executeUpgrade(inputItemIds: string[], inputBalanceAmount: number, targetItemId: string, clientSeed?: string) {
    return this.request<any>('/upgrades/execute', {
      method: 'POST',
      body: JSON.stringify({ inputItemIds, inputBalanceAmount, targetItemId, clientSeed }),
    });
  }

  // Battles
  static getBattles() {
    return this.request<any[]>('/battles');
  }

  static getBattle(id: string) {
    return this.request<any>(`/battles/${id}`);
  }

  static createBattle(caseIds: string[], maxPlayers = 2, isCrazyMode = false) {
    return this.request<any>('/battles/create', {
      method: 'POST',
      body: JSON.stringify({ caseIds, maxPlayers, isCrazyMode }),
    });
  }

  static joinBattle(id: string) {
    return this.request<any>(`/battles/${id}/join`, {
      method: 'POST',
    });
  }

  static addBotToBattle(id: string) {
    return this.request<any>(`/battles/${id}/bot`, {
      method: 'POST',
    });
  }

  // Trade
  static getTradeStock(search?: string, rarity?: string, maxPrice?: number) {
    let url = '/trade/stock?';
    if (search) url += `search=${encodeURIComponent(search)}&`;
    if (rarity) url += `rarity=${rarity}&`;
    if (maxPrice) url += `maxPrice=${maxPrice}&`;
    return this.request<any[]>(url);
  }

  static executeTrade(inputInventoryIds: string[], targetItemIds: string[]) {
    return this.request<any>('/trade/exchange', {
      method: 'POST',
      body: JSON.stringify({ inputInventoryIds, targetItemIds }),
    });
  }

  // Steam Withdrawal
  static withdrawSkin(inventoryItemId: string) {
    return this.request<any>('/withdrawals/steam', {
      method: 'POST',
      body: JSON.stringify({ inventoryItemId }),
    });
  }

  // Provably Fair Verifier
  static verifyFairness(serverSeed: string, clientSeed: string, nonce: number, rollNumber: number) {
    return this.request<any>(`/fairness/verify?serverSeed=${serverSeed}&clientSeed=${clientSeed}&nonce=${nonce}&rollNumber=${rollNumber}`);
  }

  // Admin
  static getAdminOverview() {
    return this.request<any>('/admin/overview');
  }

  static getAdminUsers(search?: string) {
    return this.request<any[]>(`/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`);
  }

  static banUser(id: string, reason: string) {
    return this.request<any>(`/admin/users/${id}/ban`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  static unbanUser(id: string) {
    return this.request<any>(`/admin/users/${id}/unban`, {
      method: 'POST',
    });
  }

  static adjustBalance(id: string, amount: number, reason: string) {
    return this.request<any>(`/admin/users/${id}/adjust-balance`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    });
  }
}
