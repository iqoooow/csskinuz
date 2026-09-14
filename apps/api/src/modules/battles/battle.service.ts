import { v4 as uuidv4 } from 'uuid';
import { getDatabase, runTransaction } from '../../database/index.js';
import { ProvablyFairService } from '../provably-fair/provably-fair.service.js';
import { WalletService } from '../wallet/wallet.service.js';
import { InventoryService } from '../inventory/inventory.service.js';
import { WebSocketHub } from '../../websocket/hub.js';

export class BattleService {
  /**
   * Faol va tugallangan janglar ro'yxati
   */
  static getBattles() {
    const db = getDatabase();
    const battles = db.prepare(`
      SELECT b.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM battles b
      JOIN users u ON b.creator_id = u.id
      ORDER BY b.created_at DESC
      LIMIT 30
    `).all() as any[];

    return battles.map((battle) => {
      const players = db.prepare(`
        SELECT bp.*, u.username, u.avatar_url
        FROM battle_players bp
        LEFT JOIN users u ON bp.user_id = u.id
        WHERE bp.battle_id = ?
        ORDER BY bp.slot_number ASC
      `).all(battle.id) as any[];

      const cases = db.prepare(`
        SELECT bc.*, c.name, c.image_url, c.price, c.slug
        FROM battle_cases bc
        JOIN cases c ON bc.case_id = c.id
        WHERE bc.battle_id = ?
        ORDER BY bc.round_order ASC
      `).all(battle.id) as any[];

      return {
        ...battle,
        players,
        cases,
      };
    });
  }

  /**
   * Bitta jang xonasining to'liq ma'lumotlari
   */
  static getBattleById(battleId: string) {
    const db = getDatabase();
    const battle = db.prepare(`
      SELECT b.*, u.username as creator_name, u.avatar_url as creator_avatar
      FROM battles b
      JOIN users u ON b.creator_id = u.id
      WHERE b.id = ?
    `).get(battleId) as any;

    if (!battle) {
      throw new Error('Jang xonasi topilmadi');
    }

    const players = db.prepare(`
      SELECT bp.*, u.username, u.avatar_url
      FROM battle_players bp
      LEFT JOIN users u ON bp.user_id = u.id
      WHERE bp.battle_id = ?
      ORDER BY bp.slot_number ASC
    `).all(battle.id) as any[];

    const cases = db.prepare(`
      SELECT bc.*, c.name, c.image_url, c.price, c.slug
      FROM battle_cases bc
      JOIN cases c ON bc.case_id = c.id
      WHERE bc.battle_id = ?
      ORDER BY bc.round_order ASC
    `).all(battle.id) as any[];

    const drops = db.prepare(`
      SELECT bd.*, i.name as item_name, i.image_url, i.rarity, i.weapon_type
      FROM battle_drops bd
      JOIN items i ON bd.item_id = i.id
      WHERE bd.battle_id = ?
      ORDER BY bd.round_number ASC, bd.player_id ASC
    `).all(battle.id) as any[];

    return {
      ...battle,
      players,
      cases,
      drops,
    };
  }

  /**
   * Yangi Case Battle xonasini yaratish
   */
  static createBattle(
    creatorId: string,
    caseIds: string[],
    maxPlayers = 2,
    isCrazyMode = false
  ) {
    if (!caseIds.length) {
      throw new Error('Jang uchun kamida 1 ta keys tanlanishi shart');
    }

    if (maxPlayers < 2 || maxPlayers > 4) {
      throw new Error('O\'yinchilar soni 2 dan 4 gacha bo\'lishi kerak');
    }

    const db = getDatabase();

    return runTransaction(() => {
      let totalCost = 0;
      const validCases: any[] = [];

      for (const cid of caseIds) {
        const c = db.prepare('SELECT id, name, price FROM cases WHERE id = ? OR slug = ?').get(cid, cid) as any;
        if (!c) throw new Error(`Keys topilmadi: ${cid}`);
        totalCost += c.price;
        validCases.push(c);
      }

      // Yaratuvchi balansidan pul yechish
      WalletService.deductBalance(
        creatorId,
        totalCost,
        'BATTLE_BET',
        undefined,
        `Case Battle xonasi yaratildi (${validCases.length} raund)`
      );

      const battleId = uuidv4();
      db.prepare(`
        INSERT INTO battles (id, creator_id, status, max_players, is_crazy_mode, total_cost)
        VALUES (?, ?, 'WAITING_FOR_PLAYERS', ?, ?, ?)
      `).run(battleId, creatorId, maxPlayers, isCrazyMode ? 1 : 0, totalCost);

      // Yaratuvchini 0-slotga qo'shish
      db.prepare(`
        INSERT INTO battle_players (id, battle_id, user_id, is_bot, slot_number)
        VALUES (?, ?, ?, 0, 0)
      `).run(uuidv4(), battleId, creatorId);

      // Keyslar raundlarini saqlash
      validCases.forEach((c, index) => {
        db.prepare(`
          INSERT INTO battle_cases (id, battle_id, case_id, round_order)
          VALUES (?, ?, ?, ?)
        `).run(uuidv4(), battleId, c.id, index + 1);
      });

      return this.getBattleById(battleId);
    });
  }

  /**
   * Boshqa o'yinchining jangiga qo'shilish
   */
  static joinBattle(userId: string, battleId: string) {
    const db = getDatabase();

    return runTransaction(() => {
      const battle = db.prepare(`
        SELECT * FROM battles WHERE id = ?
      `).get(battleId) as any;

      if (!battle) throw new Error('Jang topilmadi');
      if (battle.status !== 'WAITING_FOR_PLAYERS') {
        throw new Error('Ushbu jangga qo\'shilish mumkin emas (Boshlangan yoki to\'lgan)');
      }

      const existingPlayer = db.prepare(`
        SELECT * FROM battle_players WHERE battle_id = ? AND user_id = ?
      `).get(battleId, userId);

      if (existingPlayer) {
        throw new Error('Siz allaqachon ushbu jangdasiz');
      }

      const playersCount = db.prepare(`
        SELECT COUNT(*) as count FROM battle_players WHERE battle_id = ?
      `).get(battleId) as any;

      if (playersCount.count >= battle.max_players) {
        throw new Error('Jang xonasi to\'lgan');
      }

      const nextSlot = playersCount.count;

      // Balansdan yechish
      WalletService.deductBalance(
        userId,
        battle.total_cost,
        'BATTLE_BET',
        battleId,
        `Case Battlega qo'shildi`
      );

      // O'yinchini qo'shish
      db.prepare(`
        INSERT INTO battle_players (id, battle_id, user_id, is_bot, slot_number)
        VALUES (?, ?, ?, 0, ?)
      `).run(uuidv4(), battleId, userId, nextSlot);

      // Agar xona to'lgan bo'lsa, jangni avtomatik ishga tushirish!
      if (nextSlot + 1 === battle.max_players) {
        this.runBattleExecution(battleId);
      }

      return this.getBattleById(battleId);
    });
  }

  /**
   * Bo'sh o'ringa AI Bot chaqirish
   */
  static addBot(creatorId: string, battleId: string) {
    const db = getDatabase();

    return runTransaction(() => {
      const battle = db.prepare('SELECT * FROM battles WHERE id = ?').get(battleId) as any;
      if (!battle) throw new Error('Jang topilmadi');
      if (battle.creator_id !== creatorId) throw new Error('Faqat xona yaratuvchisi bot qo\'sha oladi');
      if (battle.status !== 'WAITING_FOR_PLAYERS') throw new Error('Jang allaqachon to\'lgan');

      const playersCount = db.prepare(`
        SELECT COUNT(*) as count FROM battle_players WHERE battle_id = ?
      `).get(battleId) as any;

      if (playersCount.count >= battle.max_players) {
        throw new Error('Jang xonasi to\'lgan');
      }

      const nextSlot = playersCount.count;

      db.prepare(`
        INSERT INTO battle_players (id, battle_id, user_id, is_bot, slot_number)
        VALUES (?, ?, NULL, 1, ?)
      `).run(uuidv4(), battleId, nextSlot);

      if (nextSlot + 1 === battle.max_players) {
        this.runBattleExecution(battleId);
      }

      return this.getBattleById(battleId);
    });
  }

  /**
   * Jang raundlarini to'liq hisoblash va yutuqlarni g'olibga topshirish
   */
  private static runBattleExecution(battleId: string) {
    const db = getDatabase();

    db.prepare(`
      UPDATE battles SET status = 'IN_PROGRESS' WHERE id = ?
    `).run(battleId);

    const players = db.prepare(`
      SELECT * FROM battle_players WHERE battle_id = ? ORDER BY slot_number ASC
    `).all(battleId) as any[];

    const cases = db.prepare(`
      SELECT bc.*, c.house_edge_percent
      FROM battle_cases bc
      JOIN cases c ON bc.case_id = c.id
      WHERE bc.battle_id = ?
      ORDER BY bc.round_order ASC
    `).all(battleId) as any[];

    const allWonItems: any[] = [];
    const playerScores: { [playerId: string]: number } = {};
    players.forEach((p) => { playerScores[p.id] = 0; });

    // Har bir raund bo'yicha drop hisoblash
    for (let round = 0; round < cases.length; round++) {
      const caseItemData = cases[round];
      const items = db.prepare(`
        SELECT i.*, ci.drop_weight
        FROM case_items ci
        JOIN items i ON ci.item_id = i.id
        WHERE ci.case_id = ?
      `).all(caseItemData.case_id) as any[];

      for (const player of players) {
        const roll = parseFloat((Math.random() * 100).toFixed(6));
        const wonItem = ProvablyFairService.selectItemFromPool(items, roll);

        db.prepare(`
          INSERT INTO battle_drops (id, battle_id, player_id, round_number, item_id, item_price, roll_number)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), battleId, player.id, round + 1, wonItem.id, wonItem.base_price, roll);

        playerScores[player.id] += wonItem.base_price;
        allWonItems.push({
          itemId: wonItem.id,
          price: wonItem.base_price,
          name: wonItem.name,
        });
      }
    }

    // G'olibni aniqlash
    const battle = db.prepare('SELECT is_crazy_mode FROM battles WHERE id = ?').get(battleId) as any;
    let winningPlayer = players[0];
    let bestScore = playerScores[winningPlayer.id];

    for (const p of players) {
      const score = playerScores[p.id];
      db.prepare(`
        UPDATE battle_players SET total_drop_value = ? WHERE id = ?
      `).run(score, p.id);

      if (battle.is_crazy_mode) {
        // Crazy Mode: Eng KAM yutgan g'olib bo'ladi
        if (score < bestScore) {
          bestScore = score;
          winningPlayer = p;
        }
      } else {
        // Normal Mode: Eng KO'P yutgan g'olib bo'ladi
        if (score > bestScore) {
          bestScore = score;
          winningPlayer = p;
        }
      }
    }

    db.prepare('UPDATE battle_players SET is_winner = 1 WHERE id = ?').run(winningPlayer.id);

    // Barcha yutilgan skinlarni g'olibning inventariga o'tkazish (agar g'olib bot bo'lmasa)
    if (!winningPlayer.is_bot && winningPlayer.user_id) {
      for (const item of allWonItems) {
        InventoryService.addItem(
          winningPlayer.user_id,
          item.itemId,
          'BATTLE',
          item.price
        );
      }
    }

    db.prepare(`
      UPDATE battles 
      SET status = 'COMPLETED', winner_id = ?, completed_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(winningPlayer.user_id || null, battleId);

    // WebSocket orqali xabar yuborish
    WebSocketHub.broadcastBattleUpdate(battleId, {
      status: 'COMPLETED',
      winnerId: winningPlayer.user_id,
      isBot: Boolean(winningPlayer.is_bot),
    });
  }
}
