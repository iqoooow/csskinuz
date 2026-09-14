import { v4 as uuidv4 } from 'uuid';
import { getDatabase, runTransaction } from '../../database/index.js';
import { ProvablyFairService } from '../provably-fair/provably-fair.service.js';
import { WalletService } from '../wallet/wallet.service.js';
import { InventoryService } from '../inventory/inventory.service.js';
import { CONFIG } from '../../config/index.js';

export class UpgradeService {
  /**
   * Yutish ehtimolligini hisoblash
   */
  static calculateOdds(inputValue: number, targetItemPrice: number) {
    if (inputValue <= 0 || targetItemPrice <= 0) {
      throw new Error('Tikilgan summa va maqsadli skin narxi musbat bo\'lishi shart');
    }

    if (inputValue >= targetItemPrice) {
      throw new Error('Tikilgan summa maqsadli skindan qimmat bo\'la olmaydi');
    }

    const houseEdge = CONFIG.HOUSE_EDGE_DEFAULT; // 0.10 (10%)
    const rawChance = (inputValue / targetItemPrice) * (1 - houseEdge) * 100;
    const winChance = Math.min(80.0, parseFloat(rawChance.toFixed(2))); // Maksimal 80%
    const multiplier = parseFloat((targetItemPrice / inputValue).toFixed(2));
    const winAngle = parseFloat(((winChance / 100) * 360).toFixed(2));

    return {
      inputValue,
      targetItemPrice,
      winChance,
      multiplier,
      winAngle,
    };
  }

  /**
   * Apgreyd o'yinini bajarish (Core Upgrade Execution)
   */
  static executeUpgrade(
    userId: string,
    inputItemIds: string[] = [],
    inputBalanceAmount = 0,
    targetItemId: string,
    customClientSeed?: string
  ) {
    const db = getDatabase();

    const targetItem = db.prepare('SELECT * FROM items WHERE id = ?').get(targetItemId) as any;
    if (!targetItem) {
      throw new Error('Maqsadli skin topilmadi');
    }

    return runTransaction(() => {
      let totalInputValue = inputBalanceAmount;
      const consumedItemNames: string[] = [];

      // 1. Tikilgan skinlarni tekshirish va qulflash
      for (const invId of inputItemIds) {
        const item = db.prepare(`
          SELECT ui.id, ui.status, i.name, i.base_price, ui.obtained_price
          FROM user_inventory ui
          JOIN items i ON ui.item_id = i.id
          WHERE ui.id = ? AND ui.user_id = ?
        `).get(invId, userId) as any;

        if (!item || item.status !== 'AVAILABLE') {
          throw new Error(`Tikilgan skin yaroqsiz yoki mavjud emas: ${item?.name || invId}`);
        }

        const price = item.base_price || item.obtained_price;
        totalInputValue += price;
        consumedItemNames.push(item.name);

        // Skinni sarflangan deb belgilash
        InventoryService.consumeItem(userId, invId, 'UPGRADED_AWAY');
      }

      // 2. Balansdan qo'shimcha pul tikilgan bo'lsa yechish
      if (inputBalanceAmount > 0) {
        WalletService.deductBalance(
          userId,
          inputBalanceAmount,
          'UPGRADE_BET',
          targetItemId,
          `Apgreyd uchun balans tikildi: ${targetItem.name}`
        );
      }

      if (totalInputValue <= 0) {
        throw new Error('Apgreyd uchun hech qanday skin yoki mablag\' tikilmadi');
      }

      // 3. Ehtimollikni hisoblash
      const odds = this.calculateOdds(totalInputValue, targetItem.base_price);

      // 4. Provably Fair urug'ini olish
      let pfSeed = db.prepare(`
        SELECT * FROM provably_fair_seeds WHERE user_id = ? AND is_active = 1
      `).get(userId) as any;

      if (!pfSeed) {
        const serverSeed = ProvablyFairService.generateServerSeed();
        const serverSeedHash = ProvablyFairService.hashServerSeed(serverSeed);
        const clientSeed = customClientSeed || ProvablyFairService.generateClientSeed();
        const seedId = uuidv4();

        db.prepare(`
          INSERT INTO provably_fair_seeds (id, user_id, server_seed_hash, server_seed_plain, client_seed, nonce)
          VALUES (?, ?, ?, ?, ?, 0)
        `).run(seedId, userId, serverSeedHash, serverSeed, clientSeed);

        pfSeed = db.prepare('SELECT * FROM provably_fair_seeds WHERE id = ?').get(seedId);
      }

      pfSeed.nonce += 1;
      const currentNonce = pfSeed.nonce;

      // 5. Roll sonini hisoblash (0..100)
      const rollNumber = ProvablyFairService.calculateRoll(
        pfSeed.server_seed_plain,
        pfSeed.client_seed,
        currentNonce
      );

      const isWon = rollNumber <= odds.winChance;
      let wonInventoryItemId: string | null = null;

      if (isWon) {
        // G'alaba: Yangi skin inventarga tushadi
        wonInventoryItemId = InventoryService.addItem(
          userId,
          targetItem.id,
          'UPGRADE',
          targetItem.base_price
        );
      }

      // 6. Strelkaning to'xtash burchagi (0..360 daraja)
      // Roll 0 bo'lsa burchak 0; roll 100 bo'lsa burchak 360
      const stopAngle = parseFloat(((rollNumber / 100) * 360).toFixed(2));

      const upgradeId = uuidv4();
      db.prepare(`
        INSERT INTO upgrades (
          id, user_id, input_value, target_item_id, win_chance, roll_number, is_won, won_inventory_item_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        upgradeId,
        userId,
        totalInputValue,
        targetItem.id,
        odds.winChance,
        rollNumber,
        isWon ? 1 : 0,
        wonInventoryItemId
      );

      // Nonce ni yangilash
      db.prepare('UPDATE provably_fair_seeds SET nonce = ? WHERE id = ?').run(currentNonce, pfSeed.id);

      const currentBalance = WalletService.getBalance(userId);

      return {
        upgradeId,
        isWon,
        rollNumber,
        winChance: odds.winChance,
        multiplier: odds.multiplier,
        stopAngle,
        targetAngle: odds.winAngle,
        wonItem: isWon ? {
          inventoryItemId: wonInventoryItemId,
          id: targetItem.id,
          name: targetItem.name,
          weaponType: targetItem.weapon_type,
          rarity: targetItem.rarity,
          price: targetItem.base_price,
          imageUrl: targetItem.image_url,
        } : null,
        newBalance: currentBalance.balance,
        provablyFair: {
          serverSeedHash: pfSeed.server_seed_hash,
          serverSeedPlain: pfSeed.server_seed_plain,
          clientSeed: pfSeed.client_seed,
          nonce: currentNonce,
        },
      };
    });
  }
}
