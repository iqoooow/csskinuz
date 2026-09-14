import { v4 as uuidv4 } from 'uuid';
import { getDatabase, runTransaction } from '../../database/index.js';

export class WalletService {
  /**
   * Foydalanuvchi joriy balansini olish
   */
  static getBalance(userId: string) {
    const db = getDatabase();
    const wallet = db.prepare(`
      SELECT balance, bonus_balance, wager_required, wager_current, currency, version
      FROM wallets WHERE user_id = ?
    `).get(userId) as any;

    if (!wallet) {
      throw new Error('Hamyon topilmadi');
    }

    return {
      balance: wallet.balance,
      bonus_balance: wallet.bonus_balance,
      wager_required: wallet.wager_required,
      wager_current: wallet.wager_current,
      currency: wallet.currency || 'UZS',
    };
  }

  /**
   * Atomik pul yechish (Deduct / Debit)
   */
  static deductBalance(
    userId: string,
    amount: number,
    type: string,
    referenceId?: string,
    description?: string
  ) {
    if (amount <= 0) {
      throw new Error('Yechiladigan summa musbat bo\'lishi shart');
    }

    return runTransaction((db) => {
      const wallet = db.prepare(`
        SELECT id, balance, wager_current FROM wallets WHERE user_id = ?
      `).get(userId) as any;

      if (!wallet) {
        throw new Error('Hamyon topilmadi');
      }

      if (wallet.balance < amount) {
        throw new Error('Balansda mablag\' yetarli emas');
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore - amount;

      db.prepare(`
        UPDATE wallets 
        SET balance = ?, wager_current = wager_current + ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(balanceAfter, amount, wallet.id);

      // Ledger tranzaksiya yozuvi
      db.prepare(`
        INSERT INTO wallet_transactions (
          id, wallet_id, user_id, amount, balance_before, balance_after, type, reference_id, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        wallet.id,
        userId,
        -amount,
        balanceBefore,
        balanceAfter,
        type,
        referenceId || null,
        description || null
      );

      return { balanceBefore, balanceAfter, deducted: amount };
    });
  }

  /**
   * Atomik pul qo'shish (Credit / Add)
   */
  static addBalance(
    userId: string,
    amount: number,
    type: string,
    referenceId?: string,
    description?: string
  ) {
    if (amount <= 0) {
      throw new Error('Kiritiladigan summa musbat bo\'lishi shart');
    }

    return runTransaction((db) => {
      const wallet = db.prepare(`
        SELECT id, balance FROM wallets WHERE user_id = ?
      `).get(userId) as any;

      if (!wallet) {
        throw new Error('Hamyon topilmadi');
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + amount;

      db.prepare(`
        UPDATE wallets 
        SET balance = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(balanceAfter, wallet.id);

      db.prepare(`
        INSERT INTO wallet_transactions (
          id, wallet_id, user_id, amount, balance_before, balance_after, type, reference_id, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        uuidv4(),
        wallet.id,
        userId,
        amount,
        balanceBefore,
        balanceAfter,
        type,
        referenceId || null,
        description || null
      );

      return { balanceBefore, balanceAfter, added: amount };
    });
  }

  /**
   * Depozitni muvaffaqiyatli qabul qilish va referral mukofotini hisoblash
   */
  static processDeposit(
    userId: string,
    amount: number,
    gateway: string,
    promoCode?: string,
    idempotencyKey?: string
  ) {
    const db = getDatabase();

    return runTransaction(() => {
      // Idempotency tekshiruvi
      if (idempotencyKey) {
        const existingDeposit = db.prepare(`
          SELECT * FROM deposits WHERE idempotency_key = ?
        `).get(idempotencyKey) as any;

        if (existingDeposit) {
          if (existingDeposit.status === 'SUCCESS') {
            return {
              depositId: existingDeposit.id,
              status: 'SUCCESS',
              amount: existingDeposit.amount,
              bonusAmount: existingDeposit.bonus_amount,
              alreadyProcessed: true,
            };
          }
        }
      }

      let bonusPercent = 0;
      if (promoCode) {
        const promo = db.prepare(`
          SELECT * FROM promo_codes WHERE code = ? AND is_active = 1
        `).get(promoCode.toUpperCase()) as any;

        if (promo && (!promo.expires_at || new Date(promo.expires_at) > new Date())) {
          bonusPercent = promo.bonus_percent;
          db.prepare('UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = ?').run(promo.id);
        }
      }

      const bonusAmount = Math.floor(amount * (bonusPercent / 100));
      const totalCredit = amount + bonusAmount;
      const depositId = uuidv4();

      db.prepare(`
        INSERT INTO deposits (
          id, user_id, gateway, amount, bonus_amount, promo_code, status, idempotency_key, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'SUCCESS', ?, CURRENT_TIMESTAMP)
      `).run(depositId, userId, gateway, amount, bonusAmount, promoCode || null, idempotencyKey || null);

      // Balansni to'ldirish
      this.addBalance(userId, totalCredit, 'DEPOSIT', depositId, `Depozit: ${gateway} orqali (+${bonusAmount > 0 ? bonusPercent + '% bonus' : ''})`);

      // Wager talabini oshirish (Asosiy summa x1, bonus summa x3)
      const additionalWager = amount * 1 + bonusAmount * 3;
      db.prepare(`
        UPDATE wallets SET wager_required = wager_required + ? WHERE user_id = ?
      `).run(additionalWager, userId);

      // Referral foizini hisoblash (5%)
      const user = db.prepare('SELECT referrer_id FROM users WHERE id = ?').get(userId) as any;
      if (user && user.referrer_id) {
        const referralReward = Math.floor(amount * 0.05); // 5%
        if (referralReward > 0) {
          this.addBalance(
            user.referrer_id,
            referralReward,
            'REFERRAL_REWARD',
            depositId,
            `Referral do'stingiz depozitidan 5% keshbek`
          );
        }
      }

      return {
        depositId,
        status: 'SUCCESS',
        amount,
        bonusAmount,
        totalCredit,
      };
    });
  }

  /**
   * Tranzaksiyalar tarixini olish
   */
  static getHistory(userId: string, limit = 20, offset = 0) {
    const db = getDatabase();
    return db.prepare(`
      SELECT id, amount, balance_before, balance_after, type, description, created_at
      FROM wallet_transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, limit, offset);
  }
}
