import { v4 as uuidv4 } from 'uuid';
import { getDatabase, runTransaction } from '../../database/index.js';
import { InventoryService } from '../inventory/inventory.service.js';

export class SteamService {
  /**
   * Steam Trade URL ni tekshirish va PartnerID / Token ni ajratib olish
   */
  static parseTradeUrl(tradeUrl: string): { partnerId: string; token: string } {
    const regex = /https:\/\/steamcommunity\.com\/tradeoffer\/new\/\?partner=(\d+)&token=([a-zA-Z0-9_-]+)/;
    const match = tradeUrl.trim().match(regex);

    if (!match) {
      throw new Error('Noto\'g\'ri Steam Trade URL formati. Format: https://steamcommunity.com/tradeoffer/new/?partner=...&token=...');
    }

    return {
      partnerId: match[1],
      token: match[2],
    };
  }

  /**
   * Foydalanuvchining Trade URL ini saqlash
   */
  static setTradeUrl(userId: string, tradeUrl: string) {
    const { partnerId, token } = this.parseTradeUrl(tradeUrl);
    const db = getDatabase();

    db.prepare(`
      UPDATE user_profiles 
      SET trade_url = ?, trade_url_partner_id = ?, trade_url_token = ? 
      WHERE user_id = ?
    `).run(tradeUrl.trim(), partnerId, token, userId);

    return { success: true, tradeUrl: tradeUrl.trim(), partnerId };
  }

  /**
   * Skinni Steam hisobiga yechib olish so'rovi (Withdrawal)
   */
  static withdrawSkin(userId: string, inventoryItemId: string) {
    const db = getDatabase();

    return runTransaction(() => {
      // 1. Profil va Trade URL tekshiruvi
      const profile = db.prepare(`
        SELECT trade_url, trade_url_partner_id FROM user_profiles WHERE user_id = ?
      `).get(userId) as any;

      if (!profile || !profile.trade_url) {
        throw new Error('Steam Trade URL sozlanmagan. Avval profil sozlamalaridan Trade URL ni kiriting');
      }

      // 2. Skinni tekshirish
      const item = db.prepare(`
        SELECT ui.id, ui.status, i.name, i.market_hash_name, i.base_price
        FROM user_inventory ui
        JOIN items i ON ui.item_id = i.id
        WHERE ui.id = ? AND ui.user_id = ?
      `).get(inventoryItemId, userId) as any;

      if (!item || item.status !== 'AVAILABLE') {
        throw new Error('Skin yechib olish uchun mavjud emas');
      }

      // 3. Wager talabi tekshiruvi
      const wallet = db.prepare(`
        SELECT wager_required, wager_current FROM wallets WHERE user_id = ?
      `).get(userId) as any;

      if (wallet && wallet.wager_current < wallet.wager_required) {
        const remainingWager = wallet.wager_required - wallet.wager_current;
        throw new Error(`Yechib olish uchun depozit aylanmasi (wager) yetarli emas. Qolgan talab: ${Math.ceil(remainingWager / 100)} UZS`);
      }

      // 4. Skinni qulflash
      InventoryService.consumeItem(userId, inventoryItemId, 'WITHDRAWAL_QUEUED');

      const withdrawalId = uuidv4();
      const mockTradeOfferId = Math.floor(1000000000 + Math.random() * 9000000000).toString();

      db.prepare(`
        INSERT INTO withdrawals (
          id, user_id, inventory_item_id, trade_offer_id, status, trade_url
        ) VALUES (?, ?, ?, ?, 'OFFER_SENT', ?)
      `).run(withdrawalId, userId, inventoryItemId, mockTradeOfferId, profile.trade_url);

      return {
        withdrawalId,
        tradeOfferId: mockTradeOfferId,
        status: 'OFFER_SENT',
        itemName: item.name,
        message: 'Steam boti savdo taklifini muvaffaqiyatli shakllantirdi! Iltimos, Steam ilovangizda (Steam Guard) savdoni 15 daqiqa ichida qabul qiling.',
      };
    });
  }

  /**
   * Savdo muvaffaqiyatli qabul qilinganligini tasdiqlash
   */
  static confirmAccepted(withdrawalId: string) {
    const db = getDatabase();

    return runTransaction(() => {
      const withdrawal = db.prepare('SELECT * FROM withdrawals WHERE id = ?').get(withdrawalId) as any;
      if (!withdrawal) throw new Error('Yechib olish so\'rovi topilmadi');

      db.prepare(`
        UPDATE withdrawals SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(withdrawalId);

      db.prepare(`
        UPDATE user_inventory SET status = 'WITHDRAWN', updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(withdrawal.inventory_item_id);

      return { success: true, status: 'ACCEPTED' };
    });
  }
}
