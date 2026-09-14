/**
 * CSSKINUZ — Telegram Mini App (TMA) SDK Service
 * Telegram WebApp API bilan to'liq integratsiya, haptika va avto-avtorizatsiya
 */

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

class TelegramWebAppService {
  private get webApp(): any {
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      return (window as any).Telegram.WebApp;
    }
    return null;
  }

  public isAvailable(): boolean {
    return Boolean(this.webApp && (this.webApp.initData || this.webApp.initDataUnsafe?.user));
  }

  public init() {
    const wa = this.webApp;
    if (!wa) return;

    try {
      wa.ready?.();
      wa.expand?.();

      // Versiya tekshiruvi bilan xavfsiz chaqirish
      const isAtLeast = (ver: string) => {
        try {
          return Boolean(wa.isVersionAtLeast?.(ver));
        } catch {
          return false;
        }
      };

      if (isAtLeast('6.1')) {
        wa.setHeaderColor?.('#08090d');
        wa.setBackgroundColor?.('#08090d');
      }

      if (isAtLeast('6.2')) {
        wa.enableClosingConfirmation?.();
      }
    } catch {
      // Ignore
    }
  }

  public getInitData(): string {
    return this.webApp?.initData || '';
  }

  public getUser(): TelegramUser | null {
    return this.webApp?.initDataUnsafe?.user || null;
  }

  public hapticImpact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
    try {
      this.webApp?.HapticFeedback?.impactOccurred(style);
    } catch {
      // Ignore
    }
  }

  public hapticNotification(type: 'error' | 'success' | 'warning') {
    try {
      this.webApp?.HapticFeedback?.notificationOccurred(type);
    } catch {
      // Ignore
    }
  }

  public hapticSelection() {
    try {
      this.webApp?.HapticFeedback?.selectionChanged();
    } catch {
      // Ignore
    }
  }

  public openLink(url: string) {
    if (this.webApp?.openTelegramLink && url.includes('t.me/')) {
      this.webApp.openTelegramLink(url);
    } else if (this.webApp?.openLink) {
      this.webApp.openLink(url);
    } else if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }

  public close() {
    try {
      this.webApp?.close();
    } catch {
      // Ignore
    }
  }
}

export const telegram = new TelegramWebAppService();
