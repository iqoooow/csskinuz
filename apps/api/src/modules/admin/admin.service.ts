import { v4 as uuidv4 } from 'uuid';
import { getDatabase, runTransaction } from '../../database/index.js';
import { WalletService } from '../wallet/wallet.service.js';

export class AdminService {
  /**
   * Admin boshqaruv paneli umumiy KPI ko'rsatkichlari
   */
  static getDashboardMetrics() {
    const db = getDatabase();

    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const totalCasesOpened = db.prepare('SELECT COUNT(*) as count FROM case_openings').get() as any;
    const totalDeposits = db.prepare(`
      SELECT SUM(amount) as total FROM deposits WHERE status = 'SUCCESS'
    `).get() as any;

    const totalWithdrawals = db.prepare(`
      SELECT COUNT(*) as count FROM withdrawals WHERE status = 'ACCEPTED'
    `).get() as any;

    const activeCasesCount = db.prepare(`
      SELECT COUNT(*) as count FROM cases WHERE is_active = 1
    `).get() as any;

    const recentOpenings = db.prepare(`
      SELECT co.id, co.created_at, u.username, c.name as case_name, i.name as item_name, i.base_price, i.rarity
      FROM case_openings co
      JOIN users u ON co.user_id = u.id
      JOIN cases c ON co.case_id = c.id
      JOIN user_inventory ui ON co.won_inventory_item_id = ui.id
      JOIN items i ON ui.item_id = i.id
      ORDER BY co.created_at DESC
      LIMIT 10
    `).all();

    return {
      kpi: {
        totalUsers: totalUsers.count,
        totalCasesOpened: totalCasesOpened.count,
        totalDepositsSum: totalDeposits.total || 0,
        totalWithdrawalsCount: totalWithdrawals.count,
        activeCasesCount: activeCasesCount.count,
      },
      recentOpenings,
    };
  }

  /**
   * Foydalanuvchilar ro'yxati
   */
  static getUsers(search?: string, limit = 20, offset = 0) {
    const db = getDatabase();
    let query = `
      SELECT u.id, u.username, u.telegram_id, u.steam_id, u.role, u.is_banned, u.ban_reason, u.created_at,
             w.balance, w.bonus_balance
      FROM users u
      LEFT JOIN wallets w ON u.id = w.user_id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ' AND (u.username LIKE ? OR u.id LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return db.prepare(query).all(...params);
  }

  /**
   * Foydalanuvchini bloklash (Ban)
   */
  static banUser(adminId: string, targetUserId: string, reason: string) {
    const db = getDatabase();

    return runTransaction(() => {
      db.prepare(`
        UPDATE users SET is_banned = 1, ban_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(reason, targetUserId);

      // Audit jurnali
      db.prepare(`
        INSERT INTO admin_audit_logs (id, admin_id, action, target_type, target_id, details)
        VALUES (?, ?, 'BAN_USER', 'USER', ?, ?)
      `).run(uuidv4(), adminId, targetUserId, `Sabab: ${reason}`);

      return { success: true, message: 'Foydalanuvchi muvaffaqiyatli bloklandi' };
    });
  }

  /**
   * Foydalanuvchini blokdan chiqarish (Unban)
   */
  static unbanUser(adminId: string, targetUserId: string) {
    const db = getDatabase();

    return runTransaction(() => {
      db.prepare(`
        UPDATE users SET is_banned = 0, ban_reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `).run(targetUserId);

      db.prepare(`
        INSERT INTO admin_audit_logs (id, admin_id, action, target_type, target_id, details)
        VALUES (?, ?, 'UNBAN_USER', 'USER', ?, 'Blokdan chiqarildi')
      `).run(uuidv4(), adminId, targetUserId);

      return { success: true, message: 'Foydalanuvchi blokdan chiqarildi' };
    });
  }

  /**
   * Foydalanuvchi balansini qo'lda to'g'rilash (Manual Balance Adjustment)
   */
  static adjustBalance(adminId: string, targetUserId: string, amount: number, reason: string) {
    const db = getDatabase();

    return runTransaction(() => {
      if (amount > 0) {
        WalletService.addBalance(targetUserId, amount, 'ADMIN_ADJUST', undefined, `Admin tomonidan qo'shildi: ${reason}`);
      } else if (amount < 0) {
        WalletService.deductBalance(targetUserId, Math.abs(amount), 'ADMIN_ADJUST', undefined, `Admin tomonidan yechildi: ${reason}`);
      }

      db.prepare(`
        INSERT INTO admin_audit_logs (id, admin_id, action, target_type, target_id, details)
        VALUES (?, ?, 'ADJUST_BALANCE', 'WALLET', ?, ?)
      `).run(uuidv4(), adminId, targetUserId, `Miqdor: ${amount}, Sabab: ${reason}`);

      const wallet = WalletService.getBalance(targetUserId);
      return { success: true, newBalance: wallet.balance };
    });
  }

  /**
   * Audit jurnallarini olish
   */
  static getAuditLogs(limit = 50) {
    const db = getDatabase();
    return db.prepare(`
      SELECT a.*, u.username as admin_username
      FROM admin_audit_logs a
      JOIN users u ON a.admin_id = u.id
      ORDER BY a.created_at DESC
      LIMIT ?
    `).all(limit);
  }
}
