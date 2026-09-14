import { v4 as uuidv4 } from 'uuid';
import { getDatabase, runTransaction } from '../../database/index.js';
import { ProvablyFairService } from '../provably-fair/provably-fair.service.js';
import { WalletService } from '../wallet/wallet.service.js';
import { InventoryService } from '../inventory/inventory.service.js';
import { WebSocketHub } from '../../websocket/hub.js';

export interface OpenCaseResult {
  openingId: string;
  wonItem: {
    inventoryItemId: string;
    id: string;
    name: string;
    weaponType: string;
    rarity: string;
    exterior: string;
    price: number;
    imageUrl: string;
    isStatTrak: boolean;
  };
  rouletteStrip: Array<{
    id: string;
    name: string;
    rarity: string;
    imageUrl: string;
    price: number;
  }>;
  winningIndex: number;
  rollNumber: number;
  provablyFair: {
    serverSeedHash: string;
    serverSeedPlain: string;
    clientSeed: string;
    nonce: number;
  };
}

export class CaseService {
  /**
   * Barcha faol keyslarni olish
   */
  static getCases(category?: string) {
    const db = getDatabase();
    let query = `
      SELECT 
        c.id, c.slug, c.name, c.category, c.price, c.image_url, 
        c.is_free, c.is_active, c.house_edge_percent
      FROM cases c
      WHERE c.is_active = 1
    `;
    const params: any[] = [];

    if (category && category !== 'all') {
      query += ' AND c.category = ?';
      params.push(category);
    }

    query += ' ORDER BY c.sort_order ASC, c.price ASC';

    const cases = db.prepare(query).all(...params) as any[];

    // Har bir keysning eng qimmat skinini topish
    return cases.map((c) => {
      const bestItem = db.prepare(`
        SELECT i.name, i.base_price, i.image_url, i.rarity
        FROM case_items ci
        JOIN items i ON ci.item_id = i.id
        WHERE ci.case_id = ?
        ORDER BY i.base_price DESC
        LIMIT 1
      `).get(c.id) as any;

      const itemsCount = db.prepare(`
        SELECT COUNT(*) as count FROM case_items WHERE case_id = ?
      `).get(c.id) as any;

      return {
        ...c,
        itemsCount: itemsCount?.count || 0,
        bestItem: bestItem || null,
      };
    });
  }

  /**
   * Aniq bitta keys va uning ichidagi barcha skinlarni olish
   */
  static getCaseBySlug(slug: string) {
    const db = getDatabase();
    const caseData = db.prepare(`
      SELECT * FROM cases WHERE slug = ? OR id = ?
    `).get(slug, slug) as any;

    if (!caseData) {
      throw new Error('Keys topilmadi');
    }

    const items = db.prepare(`
      SELECT 
        i.id, i.name, i.market_hash_name, i.weapon_type, i.rarity, 
        i.exterior, i.base_price, i.image_url, i.is_stattrak,
        ci.drop_weight, ci.is_jackpot
      FROM case_items ci
      JOIN items i ON ci.item_id = i.id
      WHERE ci.case_id = ?
      ORDER BY i.base_price DESC
    `).all(caseData.id) as any[];

    const totalWeight = items.reduce((sum, item) => sum + item.drop_weight, 0);

    const itemsWithProbabilities = items.map((item) => ({
      ...item,
      chancePercent: parseFloat(((item.drop_weight / totalWeight) * 100).toFixed(4)),
    }));

    return {
      ...caseData,
      items: itemsWithProbabilities,
      totalItems: items.length,
    };
  }

  /**
   * Keys Ochish (Case Opening Core Engine)
   */
  static openCase(
    userId: string,
    caseSlugOrId: string,
    count = 1,
    customClientSeed?: string
  ): { results: OpenCaseResult[]; newBalance: number } {
    if (count < 1 || count > 5) {
      throw new Error('Bir vaqtda 1 tadan 5 tagacha keys ochish mumkin');
    }

    const db = getDatabase();

    const caseData = db.prepare(`
      SELECT * FROM cases WHERE (slug = ? OR id = ?) AND is_active = 1
    `).get(caseSlugOrId, caseSlugOrId) as any;

    if (!caseData) {
      throw new Error('Keys topilmadi yoki faol emas');
    }

    // Bepul keys tekshiruvi
    if (caseData.is_free) {
      if (count > 1) throw new Error('Bepul keysni faqat 1 tadan ochish mumkin');
      const profile = db.prepare(`
        SELECT last_free_case_claimed_at FROM user_profiles WHERE user_id = ?
      `).get(userId) as any;

      if (profile && profile.last_free_case_claimed_at) {
        const lastClaim = new Date(profile.last_free_case_claimed_at).getTime();
        const now = Date.now();
        // 24 soat (86,400,000 ms)
        if (now - lastClaim < 86400000) {
          const remainingMinutes = Math.ceil((86400000 - (now - lastClaim)) / 60000);
          throw new Error(`Keyingi bepul keysgacha: ${Math.floor(remainingMinutes / 60)} soat ${remainingMinutes % 60} daqiqa`);
        }
      }
    }

    const caseItems = db.prepare(`
      SELECT 
        i.id, i.name, i.weapon_type, i.rarity, i.exterior, 
        i.base_price, i.image_url, i.is_stattrak, ci.drop_weight
      FROM case_items ci
      JOIN items i ON ci.item_id = i.id
      WHERE ci.case_id = ?
    `).all(caseData.id) as any[];

    if (!caseItems.length) {
      throw new Error('Ushbu keysda skinlar mavjud emas');
    }

    const totalCost = caseData.is_free ? 0 : caseData.price * count;

    return runTransaction(() => {
      // Pul yechish
      let newBalance = 0;
      if (totalCost > 0) {
        const walletRes = WalletService.deductBalance(
          userId,
          totalCost,
          'CASE_OPEN',
          caseData.id,
          `Keys ochildi: ${caseData.name} (${count}x)`
        );
        newBalance = walletRes.balanceAfter;
      } else {
        const bal = WalletService.getBalance(userId);
        newBalance = bal.balance;
        db.prepare(`
          UPDATE user_profiles 
          SET last_free_case_claimed_at = CURRENT_TIMESTAMP 
          WHERE user_id = ?
        `).run(userId);
      }

      // Provably Fair urug'ini olish yoki yaratish
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

      const results: OpenCaseResult[] = [];
      const user = db.prepare('SELECT username, avatar_url FROM users WHERE id = ?').get(userId) as any;

      for (let i = 0; i < count; i++) {
        pfSeed.nonce += 1;
        const currentNonce = pfSeed.nonce;

        // Roll hisoblash
        const rollNumber = ProvablyFairService.calculateRoll(
          pfSeed.server_seed_plain,
          pfSeed.client_seed,
          currentNonce
        );

        // Yutuq skinini aniqlash
        const wonItem = ProvablyFairService.selectItemFromPool(caseItems, rollNumber);

        // Inventarga kiritish
        const inventoryItemId = InventoryService.addItem(
          userId,
          wonItem.id,
          'CASE',
          wonItem.base_price
        );

        // Ochilishlar jurnaliga yozish
        const openingId = uuidv4();
        db.prepare(`
          INSERT INTO case_openings (
            id, user_id, case_id, won_inventory_item_id, case_price_paid, provably_fair_seed_id, roll_number
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          openingId,
          userId,
          caseData.id,
          inventoryItemId,
          caseData.price,
          pfSeed.id,
          rollNumber
        );

        // Ruletka lentasini hosil qilish (60 ta element, yutuq 45-indeksda)
        const winningIndex = 45;
        const rouletteStrip: any[] = [];
        for (let r = 0; r < 60; r++) {
          if (r === winningIndex) {
            rouletteStrip.push({
              id: wonItem.id,
              name: wonItem.name,
              rarity: wonItem.rarity,
              imageUrl: wonItem.image_url,
              price: wonItem.base_price,
            });
          } else {
            const randomItem = caseItems[Math.floor(Math.random() * caseItems.length)];
            rouletteStrip.push({
              id: randomItem.id,
              name: randomItem.name,
              rarity: randomItem.rarity,
              imageUrl: randomItem.image_url,
              price: randomItem.base_price,
            });
          }
        }

        // Live Drops WebSocket kanaliga yuborish
        WebSocketHub.broadcastLiveDrop({
          user: {
            username: user.username,
            avatar_url: user.avatar_url,
          },
          case: {
            name: caseData.name,
            slug: caseData.slug,
          },
          item: {
            name: wonItem.name,
            price: wonItem.base_price,
            rarity: wonItem.rarity,
            imageUrl: wonItem.image_url,
          },
          timestamp: new Date().toISOString(),
        });

        results.push({
          openingId,
          wonItem: {
            inventoryItemId,
            id: wonItem.id,
            name: wonItem.name,
            weaponType: wonItem.weapon_type,
            rarity: wonItem.rarity,
            exterior: wonItem.exterior,
            price: wonItem.base_price,
            imageUrl: wonItem.image_url,
            isStatTrak: Boolean(wonItem.is_stattrak),
          },
          rouletteStrip,
          winningIndex,
          rollNumber,
          provablyFair: {
            serverSeedHash: pfSeed.server_seed_hash,
            serverSeedPlain: pfSeed.server_seed_plain,
            clientSeed: pfSeed.client_seed,
            nonce: currentNonce,
          },
        });
      }

      // Nonce ni bazada yangilash
      db.prepare(`
        UPDATE provably_fair_seeds SET nonce = ? WHERE id = ?
      `).run(pfSeed.nonce, pfSeed.id);

      return { results, newBalance };
    });
  }
}
