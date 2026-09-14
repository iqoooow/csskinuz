import { v4 as uuidv4 } from 'uuid';
import { getDatabase, runTransaction } from '../../database/index.js';
import { WalletService } from '../wallet/wallet.service.js';

export class InventoryService {
  /**
   * Foydalanuvchi inventaridagi skinlarni olish
   */
  static getUserInventory(userId: string, status = 'AVAILABLE') {
    const db = getDatabase();
    return db.prepare(`
      SELECT 
        ui.id,
        ui.user_id,
        ui.item_id,
        ui.obtained_from,
        ui.obtained_price,
        ui.status,
        ui.created_at,
        i.name,
        i.market_hash_name,
        i.weapon_type,
        i.rarity,
        i.exterior,
        i.base_price,
        i.image_url,
        i.is_stattrak
      FROM user_inventory ui
      JOIN items i ON ui.item_id = i.id
      WHERE ui.user_id = ? AND ui.status = ?
      ORDER BY ui.created_at DESC
    `).all(userId, status);
  }

  /**
   * Yangi yutilgan skinni inventarga kiritish
   */
  static addItem(userId: string, itemId: string, obtainedFrom: string, price: number) {
    const db = getDatabase();
    const inventoryId = uuidv4();

    db.prepare(`
      INSERT INTO user_inventory (id, user_id, item_id, obtained_from, obtained_price, status)
      VALUES (?, ?, ?, ?, ?, 'AVAILABLE')
    `).run(inventoryId, userId, itemId, obtainedFrom, price);

    return inventoryId;
  }

  /**
   * Bitta skinni platformaga sotish (Instant Sell)
   */
  static sellItem(userId: string, inventoryItemId: string) {
    const db = getDatabase();

    return runTransaction(() => {
      const item = db.prepare(`
        SELECT ui.id, ui.user_id, ui.obtained_price, ui.status, i.name, i.base_price
        FROM user_inventory ui
        JOIN items i ON ui.item_id = i.id
        WHERE ui.id = ? AND ui.user_id = ?
      `).get(inventoryItemId, userId) as any;

      if (!item) {
        throw new Error('Skin topilmadi yoki sizga tegishli emas');
      }

      if (item.status !== 'AVAILABLE') {
        throw new Error(`Ushbu skin sotish uchun yaroqsiz (Holati: ${item.status})`);
      }

      // Skin holatini SOLD ga o'zgartirish
      db.prepare(`
        UPDATE user_inventory 
        SET status = 'SOLD', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(inventoryItemId);

      const sellPrice = item.base_price || item.obtained_price;

      // Balansga pulni qo'shish
      const walletResult = WalletService.addBalance(
        userId,
        sellPrice,
        'ITEM_SELL',
        inventoryItemId,
        `Skin sotildi: ${item.name}`
      );

      return {
        success: true,
        soldPrice: sellPrice,
        newBalance: walletResult.balanceAfter,
      };
    });
  }

  /**
   * Bir nechta skinlarni ommaviy sotish (Bulk Sell)
   */
  static bulkSell(userId: string, inventoryItemIds: string[]) {
    if (!inventoryItemIds.length) {
      throw new Error('Sotish uchun skinlar tanlanmagan');
    }

    const db = getDatabase();

    return runTransaction(() => {
      let totalAmount = 0;
      const soldItems: string[] = [];

      for (const id of inventoryItemIds) {
        const item = db.prepare(`
          SELECT ui.id, ui.status, i.name, i.base_price, ui.obtained_price
          FROM user_inventory ui
          JOIN items i ON ui.item_id = i.id
          WHERE ui.id = ? AND ui.user_id = ?
        `).get(id, userId) as any;

        if (item && item.status === 'AVAILABLE') {
          const price = item.base_price || item.obtained_price;
          totalAmount += price;
          soldItems.push(id);

          db.prepare(`
            UPDATE user_inventory 
            SET status = 'SOLD', updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
          `).run(id);
        }
      }

      if (soldItems.length === 0) {
        throw new Error('Sotish uchun yaroqli skinlar mavjud emas');
      }

      const walletResult = WalletService.addBalance(
        userId,
        totalAmount,
        'ITEM_SELL',
        soldItems[0],
        `${soldItems.length} ta skin ommaviy sotildi`
      );

      return {
        success: true,
        soldCount: soldItems.length,
        totalAmount,
        newBalance: walletResult.balanceAfter,
      };
    });
  }

  /**
   * Skinni qulflash (Upgrade yoki Trade jarayonida)
   */
  static lockItem(userId: string, inventoryItemId: string) {
    const db = getDatabase();
    const result = db.prepare(`
      UPDATE user_inventory 
      SET status = 'LOCKED', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ? AND status = 'AVAILABLE'
    `).run(inventoryItemId, userId);

    if (result.changes === 0) {
      throw new Error('Skin band qilinmadi (Mavjud emas yoki allaqachon band)');
    }
  }

  /**
   * Skinni bandlikdan chiqarish
   */
  static unlockItem(userId: string, inventoryItemId: string) {
    const db = getDatabase();
    db.prepare(`
      UPDATE user_inventory 
      SET status = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ? AND status = 'LOCKED'
    `).run(inventoryItemId, userId);
  }

  /**
   * Skinni yutqazilgan/ishlatilgan deb belgilash
   */
  static consumeItem(userId: string, inventoryItemId: string, finalStatus: string) {
    const db = getDatabase();
    db.prepare(`
      UPDATE user_inventory 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ? AND user_id = ?
    `).run(finalStatus, inventoryItemId, userId);
  }
}
