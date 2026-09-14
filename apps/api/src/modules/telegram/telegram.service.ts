import { CONFIG } from '../../config/index.js';
import { getDatabase } from '../../database/index.js';

export class TelegramService {
  /**
   * Telegram Bot xabarlarini yuborish (Notification Dispatcher)
   */
  static async sendNotification(telegramId: number, message: string): Promise<boolean> {
    if (!telegramId || !CONFIG.TELEGRAM_BOT_TOKEN) return false;

    try {
      const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_BOT_TOKEN}/sendMessage`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: telegramId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const res = await response.json() as any;
      return Boolean(res.ok);
    } catch {
      // Offline yoki mock rejimda xatolik yuz bermasligi kerak
      return false;
    }
  }

  /**
   * Foydalanuvchiga depozit tushgani haqida xabar
   */
  static notifyDeposit(telegramId: number, amountUzs: number, bonusUzs: number) {
    const text = `🎉 <b>Depozit Muvaffaqiyatli Qabul Qilindi!</b>\n\n` +
      `💰 Summa: <b>${amountUzs.toLocaleString()} UZS</b>\n` +
      (bonusUzs > 0 ? `🎁 Bonus: <b>+${bonusUzs.toLocaleString()} UZS</b>\n` : '') +
      `🚀 Omad tilaymiz! O'yinni boshlash uchun Mini Appga kiring.`;

    return this.sendNotification(telegramId, text);
  }

  /**
   * Foydalanuvchiga savdo taklifi (Trade Offer) yuborilgani haqida xabar
   */
  static notifyTradeOffer(telegramId: number, itemName: string, tradeOfferId: string) {
    const text = `📦 <b>Steam Savdo Taklifi Yuborildi!</b>\n\n` +
      `🔫 Skin: <b>${itemName}</b>\n` +
      `🆔 Trade ID: <code>${tradeOfferId}</code>\n\n` +
      `⚡ Iltimos, Steam mobil ilovangizda taklifni 15 daqiqa ichida qabul qiling.`;

    return this.sendNotification(telegramId, text);
  }

  /**
   * Referral havolasini olish
   */
  static getReferralLink(userId: string) {
    const db = getDatabase();
    const user = db.prepare('SELECT username FROM users WHERE id = ?').get(userId) as any;
    const botUsername = 'csskinuz_bot';
    return `https://t.me/${botUsername}?start=ref_${user?.username || userId}`;
  }
}
