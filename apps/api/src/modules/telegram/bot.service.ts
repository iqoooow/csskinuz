import { Bot, InlineKeyboard } from 'grammy';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG } from '../../config/index.js';
import { getDatabase } from '../../database/index.js';
import { getOrCreateSupabaseUser, isSupabaseConfigured } from '../../database/supabase.js';

class TelegramBotService {
  private bot: Bot | null = null;
  private isRunning: boolean = false;

  constructor() {
    if (CONFIG.TELEGRAM_BOT_TOKEN && !CONFIG.TELEGRAM_BOT_TOKEN.includes('testBotToken')) {
      try {
        this.bot = new Bot(CONFIG.TELEGRAM_BOT_TOKEN);
        this.setupHandlers();
      } catch (err) {
        console.error('⚠️ Telegram Bot initsializatsiyasida xatolik:', err);
      }
    }
  }

  /**
   * Telegram WebApp va URL talablariga 100% mos xavfsiz inline tugma yaratish
   */
  private addPlayButton(keyboard: InlineKeyboard, text: string, url: string, callbackAction: string = 'cmd_open_app'): InlineKeyboard {
    const isPublicHttps = url.startsWith('https://') && !url.includes('localhost') && !url.includes('127.0.0.1');
    
    if (isPublicHttps) {
      return keyboard.webApp(text, url);
    } else {
      // Telegram localhost yoki http URL larni rad etishi sababli callback tugma ishlatamiz
      return keyboard.text(text, callbackAction);
    }
  }

  private setupHandlers() {
    if (!this.bot) return;

    // Xatoliklarni ushlash va bot to'xtab qolishining oldini olish
    this.bot.catch((err) => {
      console.error('⚠️ [TelegramBot Error]:', err.error || err);
    });

    // 1. /start buyrug'i (Referal kodi bilan birga)
    this.bot.command('start', async (ctx) => {
      try {
        const tgUser = ctx.from;
        if (!tgUser) return;

        const payload = ctx.match; // Referal kodi
        let refCode: string | null = null;
        if (payload && typeof payload === 'string') {
          refCode = payload.replace('ref_', '').trim();
        }

        const db = getDatabase();
        let user = db.prepare('SELECT * FROM users WHERE telegram_id = ?').get(tgUser.id) as any;

        if (!user) {
          const userId = `tg_${tgUser.id}`;
          const username = tgUser.username || `${tgUser.first_name || 'Player'}`;

          let referrerId: string | null = null;
          if (refCode) {
            const referrer = db.prepare('SELECT id FROM users WHERE id = ? OR username = ?').get(refCode, refCode) as any;
            if (referrer) referrerId = referrer.id;
          }

          db.prepare(`
            INSERT INTO users (id, telegram_id, username, role, referrer_id)
            VALUES (?, ?, ?, 'USER', ?)
          `).run(userId, tgUser.id, username, referrerId);

          db.prepare(`
            INSERT INTO wallets (id, user_id, balance, bonus_balance, currency)
            VALUES (?, ?, 0, 1000000, 'UZS')
          `).run(uuidv4(), userId); // 10,000 UZS boshlang'ich bonus

          db.prepare(`
            INSERT INTO user_profiles (user_id, last_login_at)
            VALUES (?, CURRENT_TIMESTAMP)
          `).run(userId);

          user = { id: userId, username };

          // Supabase bilan ham sinxronizatsiya
          if (isSupabaseConfigured()) {
            getOrCreateSupabaseUser(tgUser.id, undefined, username).catch((e) =>
              console.warn('Supabase TG user sync info:', e?.message || e)
            );
          }
        }

        // Inline Tugmalar
        const webAppUrl = `${CONFIG.APP_URL}?tg_id=${tgUser.id}`;
        let keyboard = new InlineKeyboard();
        keyboard = this.addPlayButton(keyboard, '⚡ CS2 SKINLARNI O\'YNASH (MINI APP)', webAppUrl, 'cmd_open_app');
        keyboard
          .row()
          .text('💰 Balansim', 'cmd_balance')
          .text('🎁 Bepul Keys', 'cmd_free_case')
          .row()
          .text('👥 Referal Tizimi', 'cmd_referral')
          .text('🛡️ Provably Fair', 'cmd_fairness');

        const welcomeText = `
🎯 <b>CSSKIN.UZ — O'zbekistondagi #1 CS2 Keys Platformasi!</b>

Xush kelibsiz, <b>${tgUser.first_name || 'Gamer'}</b>!

💎 <b>Imkoniyatlar:</b>
• 100% Provably Fair (SHA256 adolat kafolati)
• Lahzali Payme, Click, Uzum va USDT to'lovlari
• Steam Trade orqali 60 soniyada inventarga chiqarish
• Case Battles (PvP) va 360° Upgrade Arenasi

Pastdagi tugmani bosing va darhol o'yinni boshlang! 👇
        `.trim();

        await ctx.reply(welcomeText, {
          parse_mode: 'HTML',
          reply_markup: keyboard,
        });
      } catch (cmdError) {
        console.error('Error handling /start:', cmdError);
      }
    });

    // 2. /play buyrug'i
    this.bot.command('play', async (ctx) => {
      try {
        const webAppUrl = `${CONFIG.APP_URL}?tg_id=${ctx.from?.id}`;
        let keyboard = new InlineKeyboard();
        keyboard = this.addPlayButton(keyboard, '🚀 O\'yinga Kirish', webAppUrl, 'cmd_open_app');

        await ctx.reply('O\'yinni boshlash uchun quyidagi tugmani bosing:', {
          reply_markup: keyboard,
        });
      } catch (err) {
        console.error('Error handling /play:', err);
      }
    });

    // 3. /balance buyrug'i
    this.bot.command('balance', async (ctx) => {
      await this.handleBalanceCommand(ctx);
    });

    // 4. /cases buyrug'i
    this.bot.command('cases', async (ctx) => {
      try {
        const webAppUrl = `${CONFIG.APP_URL}`;
        let keyboard = new InlineKeyboard();
        keyboard = this.addPlayButton(keyboard, '📦 Barcha Keyslarni Ko\'rish', webAppUrl, 'cmd_open_app');

        const casesText = `
🔥 <b>TOP CS2 KEYSLAR:</b>

1. <b>Covert Beast</b> — 45,000 UZS (AWP Dragon Lore, AK-47 Bloodsport)
2. <b>Knife Odyssey</b> — 120,000 UZS (Butterfly Knife, Karambit Fade)
3. <b>Starter Case</b> — 15,000 UZS (M4A4 Neo-Noir, USP-S Kill Confirmed)
4. <b>Kunlik Bepul Keys</b> — 0 UZS (Har 24 soatda bepul)
        `.trim();

        await ctx.reply(casesText, {
          parse_mode: 'HTML',
          reply_markup: keyboard,
        });
      } catch (err) {
        console.error('Error handling /cases:', err);
      }
    });

    // 5. /help buyrug'i
    this.bot.command('help', async (ctx) => {
      try {
        const helpText = `
ℹ️ <b>Yordam va Qo'llab-quvvatlash:</b>

• <b>Qanday o'ynayman?</b> — /play buyrug'ini yuboring va Mini App-ni oching.
• <b>Balansni to'ldirish:</b> — Mini App ichida "+ To'ldirish" tugmasini bosing (Payme, Click, Uzum, USDT).
• <b>Steamga chiqarish:</b> — Profilingizda Steam Trade URL kiriting va "Yechib olish" tugmasini bosing.
• <b>Adolat kafolati:</b> — Barcha o'yin natijalari ochiq HMAC-SHA256 kriptografiyasi orqali tasdiqlangan.

Savollar bo'yicha: @csskinuz_support
        `.trim();

        await ctx.reply(helpText, { parse_mode: 'HTML' });
      } catch (err) {
        console.error('Error handling /help:', err);
      }
    });

    // Inline Callback Handlers
    this.bot.callbackQuery('cmd_open_app', async (ctx) => {
      try {
        await ctx.answerCallbackQuery();
        const tgId = ctx.from?.id;
        const appUrl = `${CONFIG.APP_URL}?tg_id=${tgId}`;
        
        await ctx.reply(`
🎮 <b>CSSKINUZ PLATFORMASIGA XUSH KELIBSIZ!</b>

O'yin platformasiga kirish uchun havolani bosing:
👉 <b>${appUrl}</b>

<i>(Eslatma: Loyiha serverga yuklanib HTTPS domen ulanganda, o'yin to'g'ridan-to'g'ri Telegram ichida to'liq ekranli Mini App sifatida ochiladi!)</i>
        `.trim(), { parse_mode: 'HTML' });
      } catch (err) {
        console.error('Error handling cmd_open_app:', err);
      }
    });

    this.bot.callbackQuery('cmd_balance', async (ctx) => {
      try {
        await ctx.answerCallbackQuery();
        await this.handleBalanceCommand(ctx);
      } catch (err) {
        console.error('Error handling cmd_balance:', err);
      }
    });

    this.bot.callbackQuery('cmd_referral', async (ctx) => {
      try {
        await ctx.answerCallbackQuery();
        const tgId = ctx.from?.id;
        const refLink = `https://t.me/${CONFIG.TELEGRAM_BOT_USERNAME}?start=ref_${tgId}`;

        const refText = `
👥 <b>DO'STLARNI TAKLIF QILING VA DAROMAD OLING!</b>

Do'stlaringizni shaxsiy referal havolangiz orqali taklif qiling va ularning har bir to'ldirgan depozitidan <b>5% doimiy daromad</b> oling!

Sizning referal havolangiz:
<code>${refLink}</code>
        `.trim();

        await ctx.reply(refText, { parse_mode: 'HTML' });
      } catch (err) {
        console.error('Error handling cmd_referral:', err);
      }
    });

    this.bot.callbackQuery('cmd_free_case', async (ctx) => {
      try {
        await ctx.answerCallbackQuery();
        const webAppUrl = `${CONFIG.APP_URL}`;
        let keyboard = new InlineKeyboard();
        keyboard = this.addPlayButton(keyboard, '🎁 Bepul Keysni Ochish', webAppUrl, 'cmd_open_app');

        await ctx.reply(`Kunlik bepul keysingizni ochish uchun platformaga kiring:\n👉 ${webAppUrl}`, {
          reply_markup: keyboard,
        });
      } catch (err) {
        console.error('Error handling cmd_free_case:', err);
      }
    });

    this.bot.callbackQuery('cmd_fairness', async (ctx) => {
      try {
        await ctx.answerCallbackQuery();
        await ctx.reply(`
🛡️ <b>100% PROVABLY FAIR ADOLAT KAFOLATI:</b>

Har bir keys ochilishi va apgreyd natijasi quyidagi formula bilan hisoblanadi:
<code>HMAC-SHA256(ServerSeed, ClientSeed:Nonce)</code>

Server natijani o'zgartira olmaydi. Natijani mustaqil ravishda istalgan SHA256 kalkulyatorida tekshirishingiz mumkin.
        `.trim(), { parse_mode: 'HTML' });
      } catch (err) {
        console.error('Error handling cmd_fairness:', err);
      }
    });
  }

  private async handleBalanceCommand(ctx: any) {
    try {
      const tgUser = ctx.from;
      if (!tgUser) return;

      const db = getDatabase();
      const user = db.prepare('SELECT id FROM users WHERE telegram_id = ?').get(tgUser.id) as any;

      if (!user) {
        await ctx.reply('Siz hali platformada ro\'yxatdan o\'tmadingiz. /start ni bosing.');
        return;
      }

      const wallet = db.prepare('SELECT * FROM wallets WHERE user_id = ?').get(user.id) as any;
      const balanceUzs = wallet ? Math.floor(wallet.balance / 100).toLocaleString() : '0';
      const bonusUzs = wallet ? Math.floor(wallet.bonus_balance / 100).toLocaleString() : '0';

      const webAppUrl = `${CONFIG.APP_URL}`;
      let keyboard = new InlineKeyboard();
      keyboard = this.addPlayButton(keyboard, '💳 Balansni To\'ldirish', webAppUrl, 'cmd_open_app');
      keyboard.row();
      keyboard = this.addPlayButton(keyboard, '🎮 O\'yinga O\'tish', webAppUrl, 'cmd_open_app');

      const balanceText = `
💰 <b>Sizning Balansingiz:</b>

• Asosiy Balans: <b>${balanceUzs} UZS</b>
• Bonus Balans: <b>${bonusUzs} UZS</b>

Hisobingizni to'ldirish yoki o'yinni davom ettirish uchun quyidagi tugmani bosing:
      `.trim();

      await ctx.reply(balanceText, {
        parse_mode: 'HTML',
        reply_markup: keyboard,
      });
    } catch (err) {
      console.error('Error handling balance command:', err);
    }
  }

  /**
   * Foydalanuvchiga Telegram orqali Push Bildirishnoma yuborish
   */
  public async sendPushNotification(telegramId: number, message: string): Promise<boolean> {
    if (!this.bot) return false;
    try {
      await this.bot.api.sendMessage(telegramId, message, { parse_mode: 'HTML' });
      return true;
    } catch (err) {
      console.warn(`[TelegramBot] Bildirishnoma yuborilmadi (ID: ${telegramId}):`, err);
      return false;
    }
  }

  /**
   * Botni ishga tushirish (Polling rejimida)
   */
  public async start(): Promise<void> {
    if (!this.bot || this.isRunning) return;

    try {
      this.isRunning = true;
      console.log(`🤖 Telegram Bot ishga tushmoqda (@${CONFIG.TELEGRAM_BOT_USERNAME})...`);
      this.bot.start({
        onStart: (botInfo) => {
          console.log(`✅ Telegram Bot muvaffaqiyatli ishga tushdi: @${botInfo.username}`);
        },
      });
    } catch (err) {
      console.error('⚠️ Telegram Bot start xatosi:', err);
      this.isRunning = false;
    }
  }

  public stop(): void {
    if (this.bot && this.isRunning) {
      this.bot.stop();
      this.isRunning = false;
    }
  }
}

export const telegramBot = new TelegramBotService();
