import { getDatabase, runTransaction } from '../../database/index.js';
import { InventoryService } from '../inventory/inventory.service.js';
import { WalletService } from '../wallet/wallet.service.js';

export class TradeService {
  /**
   * Platforma botlari zaxirasidagi almashtirish uchun mavjud skinlar
   */
  static getBotStock(search?: string, rarity?: string, maxPrice?: number) {
    const db = getDatabase();
    let query = 'SELECT * FROM items WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (name LIKE ? OR market_hash_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (rarity && rarity !== 'all') {
      query += ' AND rarity = ?';
      params.push(rarity);
    }

    if (maxPrice && maxPrice > 0) {
      query += ' AND base_price <= ?';
      params.push(maxPrice);
    }

    query += ' ORDER BY base_price DESC LIMIT 50';

    return db.prepare(query).all(...params);
  }

  /**
   * Skinlarni platforma zaxirasiga almashtirish (Exchange)
   */
  static exchange(
    userId: string,
    inputInventoryIds: string[],
    targetItemIds: string[]
  ) {
    if (!inputInventoryIds.length && !targetItemIds.length) {
      throw new Error('Almashtirish uchun skinlar tanlanmagan');
    }

    const db = getDatabase();

    return runTransaction(() => {
      // 1. Foydalanuvchi tikkan skinlar qiymatini hisoblash
      let totalInputValue = 0;
      for (const invId of inputInventoryIds) {
        const item = db.prepare(`
          SELECT ui.id, ui.status, i.base_price, ui.obtained_price
          FROM user_inventory ui
          JOIN items i ON ui.item_id = i.id
          WHERE ui.id = ? AND ui.user_id = ?
        `).get(invId, userId) as any;

        if (!item || item.status !== 'AVAILABLE') {
          throw new Error('Tanlangan skinlardan biri almashtirish uchun mavjud emas');
        }

        totalInputValue += (item.base_price || item.obtained_price);
        InventoryService.consumeItem(userId, invId, 'TRADED_AWAY');
      }

      // 2. Olinayotgan yangi skinlar qiymatini hisoblash
      let totalTargetValue = 0;
      const targetItems: any[] = [];
      for (const itemId of targetItemIds) {
        const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
        if (!item) {
          throw new Error('Tanlangan maqsadli skin topilmadi');
        }
        totalTargetValue += item.base_price;
        targetItems.push(item);
      }

      // 3. Narxlar farqini tekshirish
      const difference = totalTargetValue - totalInputValue;

      if (difference > 0) {
        // Balansdan yetmagan farqni yechish
        WalletService.deductBalance(
          userId,
          difference,
          'TRADE_DIFFERENCE',
          undefined,
          `Skin almashtirishdagi narx farqi to'landi`
        );
      } else if (difference < 0) {
        // Agar o'z skinlari qimmatroq bo'lsa, ortiqcha summa balansga qaytadi
        const refundAmount = Math.abs(difference);
        WalletService.addBalance(
          userId,
          refundAmount,
          'TRADE_REFUND',
          undefined,
          `Skin almashtirishdan ortgan summa qaytarildi`
        );
      }

      // 4. Yangi skinlarni foydalanuvchi inventariga qo'shish
      const newInventoryIds: string[] = [];
      for (const item of targetItems) {
        const invId = InventoryService.addItem(
          userId,
          item.id,
          'TRADE',
          item.base_price
        );
        newInventoryIds.push(invId);
      }

      const balance = WalletService.getBalance(userId);

      return {
        success: true,
        receivedCount: targetItems.length,
        totalTargetValue,
        differencePaid: difference > 0 ? difference : 0,
        differenceRefunded: difference < 0 ? Math.abs(difference) : 0,
        newBalance: balance.balance,
      };
    });
  }
}
