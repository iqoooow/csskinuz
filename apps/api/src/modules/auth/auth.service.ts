import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '../../config/index.js';
import { getDatabase, runTransaction } from '../../database/index.js';

export interface UserSession {
  id: string;
  telegram_id?: number;
  steam_id?: string;
  username: string;
  avatar_url?: string;
  role: string;
  is_banned: boolean;
}

export class AuthService {
  /**
   * Telegram WebApp initData ni HMAC-SHA256 orqali tekshirish
   */
  static verifyTelegramInitData(initDataString: string): { isValid: boolean; user?: any } {
    try {
      const urlParams = new URLSearchParams(initDataString);
      const hash = urlParams.get('hash');
      if (!hash) return { isValid: false };

      urlParams.delete('hash');

      const params: string[] = [];
      Array.from(urlParams.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([key, val]) => {
          params.push(`${key}=${val}`);
        });

      const dataCheckString = params.join('\n');

      const secretKey = crypto
        .createHmac('sha256', 'WebAppData')
        .update(CONFIG.TELEGRAM_BOT_TOKEN)
        .digest();

      const calculatedHash = crypto
        .createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

      const isValid = crypto.timingSafeEqual(
        Buffer.from(calculatedHash, 'hex'),
        Buffer.from(hash, 'hex')
      );

      const authDate = parseInt(urlParams.get('auth_date') || '0', 10);
      const now = Math.floor(Date.now() / 1000);
      // 86400 soniya = 24 soat
      if (now - authDate > 86400) {
        return { isValid: false };
      }

      const userData = JSON.parse(urlParams.get('user') || '{}');
      return { isValid, user: userData };
    } catch {
      return { isValid: false };
    }
  }

  /**
   * Telegram foydalanuvchisini avtorizatsiya qilish va sessiya yaratish
   */
  static loginWithTelegram(initDataString: string, referrerCode?: string): { token: string; user: UserSession } {
    // Development va test rejimida test initData ga ruxsat berish
    let telegramUser: any = null;
    
    if (CONFIG.NODE_ENV === 'development' && initDataString.startsWith('test_user_')) {
      const parts = initDataString.split('_');
      telegramUser = {
        id: parseInt(parts[2] || '123456789', 10),
        username: parts[3] || 'test_player',
        first_name: 'Test Player',
        photo_url: 'https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/00/0000000000000000000000000000000000000000_full.jpg'
      };
    } else {
      const verification = this.verifyTelegramInitData(initDataString);
      if (!verification.isValid || !verification.user) {
        throw new Error('Noto\'g\'ri yoki muddati o\'tgan Telegram autentifikatsiya imzosi');
      }
      telegramUser = verification.user;
    }

    const db = getDatabase();

    return runTransaction(() => {
      let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(telegramUser.id) as any;

      if (!user) {
        const userId = uuidv4();
        let referrerId: string | null = null;

        if (referrerCode) {
          const referrer = db.prepare('SELECT id FROM users WHERE id = ? OR username = ?').get(referrerCode, referrerCode) as any;
          if (referrer && referrer.id !== userId) {
            referrerId = referrer.id;
          }
        }

        db.prepare(`
          INSERT INTO users (id, telegram_id, username, avatar_url, role, referrer_id)
          VALUES (?, ?, ?, ?, 'USER', ?)
        `).run(userId, telegramUser.id, telegramUser.username || `User_${telegramUser.id}`, telegramUser.photo_url || null, referrerId);

        // Hamyon yaratish (0 balans)
        db.prepare(`
          INSERT INTO wallets (id, user_id, balance, bonus_balance)
          VALUES (?, ?, 0, 0)
        `).run(uuidv4(), userId);

        // Profil yaratish
        db.prepare(`
          INSERT INTO user_profiles (user_id, last_login_at)
          VALUES (?, CURRENT_TIMESTAMP)
        `).run(userId);

        user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      } else {
        // Profilni yangilash
        db.prepare(`
          UPDATE users 
          SET username = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).run(telegramUser.username || user.username, telegramUser.photo_url || user.avatar_url, user.id);

        db.prepare('UPDATE user_profiles SET last_login_at = CURRENT_TIMESTAMP WHERE user_id = ?').run(user.id);
      }

      if (user.is_banned) {
        throw new Error(`Sizning hisobingiz bloklangan. Sabab: ${user.ban_reason || 'Qoidabuzarlik'}`);
      }

      const session: UserSession = {
        id: user.id,
        telegram_id: user.telegram_id,
        steam_id: user.steam_id,
        username: user.username,
        avatar_url: user.avatar_url,
        role: user.role,
        is_banned: Boolean(user.is_banned),
      };

      const token = jwt.sign(session, CONFIG.JWT_SECRET, { expiresIn: CONFIG.JWT_EXPIRES_IN });

      return { token, user: session };
    });
  }

  /**
   * Steam OpenID orqali kirish
   */
  static loginWithSteam(steamId: string, username: string, avatarUrl?: string): { token: string; user: UserSession } {
    if (!steamId || !/^\d{17}$/.test(steamId)) {
      throw new Error('Noto\'g\'ri SteamID64 formati');
    }

    const db = getDatabase();

    return runTransaction(() => {
      let user = db.prepare('SELECT * FROM users WHERE steam_id = ?').get(steamId) as any;

      if (!user) {
        const userId = uuidv4();
        db.prepare(`
          INSERT INTO users (id, steam_id, username, avatar_url, role)
          VALUES (?, ?, ?, ?, 'USER')
        `).run(userId, steamId, username, avatarUrl || null);

        db.prepare(`
          INSERT INTO wallets (id, user_id, balance, bonus_balance)
          VALUES (?, ?, 0, 0)
        `).run(uuidv4(), userId);

        db.prepare(`
          INSERT INTO user_profiles (user_id, last_login_at)
          VALUES (?, CURRENT_TIMESTAMP)
        `).run(userId);

        user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      } else {
        db.prepare(`
          UPDATE users 
          SET username = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP 
          WHERE id = ?
        `).run(username || user.username, avatarUrl || user.avatar_url, user.id);
      }

      if (user.is_banned) {
        throw new Error('Hisobingiz bloklangan');
      }

      const session: UserSession = {
        id: user.id,
        telegram_id: user.telegram_id,
        steam_id: user.steam_id,
        username: user.username,
        avatar_url: user.avatar_url,
        role: user.role,
        is_banned: Boolean(user.is_banned),
      };

      const token = jwt.sign(session, CONFIG.JWT_SECRET, { expiresIn: CONFIG.JWT_EXPIRES_IN });
      return { token, user: session };
    });
  }

  /**
   * JWT Tokenni tekshirish
   */
  static verifyToken(token: string): UserSession {
    try {
      const decoded = jwt.verify(token, CONFIG.JWT_SECRET) as UserSession;
      const db = getDatabase();
      const user = db.prepare('SELECT is_banned FROM users WHERE id = ?').get(decoded.id) as any;
      if (!user || user.is_banned) {
        throw new Error('Foydalanuvchi mavjud emas yoki bloklangan');
      }
      return decoded;
    } catch {
      throw new Error('Yaroqsiz yoki muddati o\'tgan avtorizatsiya tokeni');
    }
  }
}
