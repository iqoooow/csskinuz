import http from 'http';
import express from 'express';
import cors from 'cors';
import { CONFIG } from './config/index.js';
import { getDatabase } from './database/index.js';
import { seedDatabase } from './database/seeder.js';
import { authMiddleware, AuthenticatedRequest, requireRole } from './middleware/auth.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { AuthService } from './modules/auth/auth.service.js';
import { WalletService } from './modules/wallet/wallet.service.js';
import { InventoryService } from './modules/inventory/inventory.service.js';
import { CaseService } from './modules/cases/case.service.js';
import { UpgradeService } from './modules/upgrade/upgrade.service.js';
import { BattleService } from './modules/battles/battle.service.js';
import { TradeService } from './modules/trade/trade.service.js';
import { PaymentService } from './modules/payments/payment.service.js';
import { SteamService } from './modules/steam/steam.service.js';
import { AdminService } from './modules/admin/admin.service.js';
import { ProvablyFairService } from './modules/provably-fair/provably-fair.service.js';
import { WebSocketHub } from './websocket/hub.js';
import { telegramBot } from './modules/telegram/bot.service.js';
import { testSupabaseConnection, isSupabaseConfigured } from './database/supabase.js';

// Ma'lumotlar bazasini yuklash va seeder qilish
getDatabase();
seedDatabase();

// Telegram Botni ishga tushirish
telegramBot.start().catch((err) => {
  console.warn('⚠️ Telegram bot daemon ogohlantirishi:', err);
});

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ============================================================================
// 1. HEALTHCHECK
// ============================================================================
app.get('/api/v1/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(), 
    platform: 'CSSKINUZ Core',
    supabase_configured: isSupabaseConfigured(),
    telegram_bot: Boolean(CONFIG.TELEGRAM_BOT_TOKEN)
  });
});

app.get('/api/v1/supabase/status', async (req, res) => {
  const result = await testSupabaseConnection();
  res.json({ success: true, data: result });
});

// ============================================================================
// 2. AUTHENTICATION & PROFILE
// ============================================================================
app.post('/api/v1/auth/telegram', (req, res, next) => {
  try {
    const { initData, referrerCode } = req.body;
    if (!initData) {
      res.status(400).json({ success: false, error: { message: 'initData parametri talab etiladi' } });
      return;
    }
    const result = AuthService.loginWithTelegram(initData, referrerCode);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/auth/steam', (req, res, next) => {
  try {
    const { steamId, username, avatarUrl } = req.body;
    if (!steamId) {
      res.status(400).json({ success: false, error: { message: 'steamId parametri talab etiladi' } });
      return;
    }
    const result = AuthService.loginWithSteam(steamId, username || 'SteamUser', avatarUrl);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

app.get('/api/v1/auth/me', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const user = req.user!;
    const wallet = WalletService.getBalance(user.id);
    const db = getDatabase();
    const profile = db.prepare('SELECT trade_url FROM user_profiles WHERE user_id = ?').get(user.id) as any;

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          avatar_url: user.avatar_url,
          role: user.role,
          telegram_id: user.telegram_id,
          steam_id: user.steam_id,
          trade_url: profile?.trade_url || null,
        },
        wallet,
      },
    });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/profile/trade-url', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const { tradeUrl } = req.body;
    if (!tradeUrl) {
      res.status(400).json({ success: false, error: { message: 'tradeUrl parametri kiritilishi shart' } });
      return;
    }
    const result = SteamService.setTradeUrl(req.user!.id, tradeUrl);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 3. HAMYON VA TO'LOVLAR
// ============================================================================
app.get('/api/v1/wallet/balance', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const balance = WalletService.getBalance(req.user!.id);
    res.json({ success: true, data: balance });
  } catch (err) {
    next(err);
  }
});

app.get('/api/v1/wallet/transactions', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string || '20', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);
    const history = WalletService.getHistory(req.user!.id, limit, offset);
    res.json({ success: true, data: history });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/deposits/create', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const { amount, gateway, promoCode } = req.body;
    if (!amount || !gateway) {
      res.status(400).json({ success: false, error: { message: 'amount va gateway ko\'rsatilishi shart' } });
      return;
    }
    const result = PaymentService.createPayment(req.user!.id, amount, gateway, promoCode);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/deposits/simulate', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const { amount, gateway, promoCode } = req.body;
    const payment = PaymentService.createPayment(req.user!.id, amount || 5000000, gateway || 'PAYME', promoCode);
    const confirmed = PaymentService.confirmDeposit(payment.depositId);
    const newBalance = WalletService.getBalance(req.user!.id);
    res.json({ success: true, data: { ...confirmed, newBalance: newBalance.balance } });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 4. KEYSLAR VA OCHISH
// ============================================================================
app.get('/api/v1/cases', (req, res, next) => {
  try {
    const category = req.query.category as string;
    const cases = CaseService.getCases(category);
    res.json({ success: true, data: cases });
  } catch (err) {
    next(err);
  }
});

app.get('/api/v1/cases/:slug', (req, res, next) => {
  try {
    const caseData = CaseService.getCaseBySlug(req.params.slug);
    res.json({ success: true, data: caseData });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/cases/:slug/open', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const { count, clientSeed } = req.body;
    const result = CaseService.openCase(req.user!.id, req.params.slug, count || 1, clientSeed);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 5. INVENTAR VA SOTISH
// ============================================================================
app.get('/api/v1/inventory', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const status = (req.query.status as string) || 'AVAILABLE';
    const inventory = InventoryService.getUserInventory(req.user!.id, status);
    res.json({ success: true, data: inventory });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/inventory/:id/sell', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const result = InventoryService.sellItem(req.user!.id, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/inventory/bulk-sell', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const { itemIds } = req.body;
    const result = InventoryService.bulkSell(req.user!.id, itemIds || []);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 6. APGREYD (UPGRADE)
// ============================================================================
app.post('/api/v1/upgrades/calculate', (req, res, next) => {
  try {
    const { inputValue, targetItemPrice } = req.body;
    const odds = UpgradeService.calculateOdds(inputValue, targetItemPrice);
    res.json({ success: true, data: odds });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/upgrades/execute', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const { inputItemIds, inputBalanceAmount, targetItemId, clientSeed } = req.body;
    const result = UpgradeService.executeUpgrade(
      req.user!.id,
      inputItemIds || [],
      inputBalanceAmount || 0,
      targetItemId,
      clientSeed
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 7. CASE BATTLES (PVP)
// ============================================================================
app.get('/api/v1/battles', (req, res, next) => {
  try {
    const battles = BattleService.getBattles();
    res.json({ success: true, data: battles });
  } catch (err) {
    next(err);
  }
});

app.get('/api/v1/battles/:id', (req, res, next) => {
  try {
    const battle = BattleService.getBattleById(req.params.id);
    res.json({ success: true, data: battle });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/battles/create', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const { caseIds, maxPlayers, isCrazyMode } = req.body;
    const battle = BattleService.createBattle(req.user!.id, caseIds, maxPlayers || 2, isCrazyMode || false);
    res.json({ success: true, data: battle });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/battles/:id/join', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const battle = BattleService.joinBattle(req.user!.id, req.params.id);
    res.json({ success: true, data: battle });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/battles/:id/bot', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const battle = BattleService.addBot(req.user!.id, req.params.id);
    res.json({ success: true, data: battle });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 8. TRADE & EXCHANGE
// ============================================================================
app.get('/api/v1/trade/stock', (req, res, next) => {
  try {
    const search = req.query.search as string;
    const rarity = req.query.rarity as string;
    const maxPrice = req.query.maxPrice ? parseInt(req.query.maxPrice as string, 10) : undefined;
    const stock = TradeService.getBotStock(search, rarity, maxPrice);
    res.json({ success: true, data: stock });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/trade/exchange', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const { inputInventoryIds, targetItemIds } = req.body;
    const result = TradeService.exchange(req.user!.id, inputInventoryIds || [], targetItemIds || []);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 9. STEAM YECHIB OLISH
// ============================================================================
app.post('/api/v1/withdrawals/steam', authMiddleware, (req: AuthenticatedRequest, res, next) => {
  try {
    const { inventoryItemId } = req.body;
    if (!inventoryItemId) {
      res.status(400).json({ success: false, error: { message: 'inventoryItemId ko\'rsatilishi shart' } });
      return;
    }
    const result = SteamService.withdrawSkin(req.user!.id, inventoryItemId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 10. PROVABLY FAIR VERIFICATION
// ============================================================================
app.get('/api/v1/fairness/verify', (req, res) => {
  const { serverSeed, clientSeed, nonce, rollNumber } = req.query;
  if (!serverSeed || !clientSeed || !nonce || !rollNumber) {
    res.status(400).json({ success: false, error: { message: 'Barcha parametrlar (serverSeed, clientSeed, nonce, rollNumber) talab etiladi' } });
    return;
  }

  const calculatedRoll = ProvablyFairService.calculateRoll(
    serverSeed as string,
    clientSeed as string,
    parseInt(nonce as string, 10)
  );

  const isValid = Math.abs(calculatedRoll - parseFloat(rollNumber as string)) < 0.00001;
  res.json({
    success: true,
    data: {
      isValid,
      calculatedRoll,
      providedRoll: parseFloat(rollNumber as string),
    },
  });
});

// ============================================================================
// 11. ADMIN BOSHQARUV PANEL
// ============================================================================
app.get('/api/v1/admin/overview', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), (req, res, next) => {
  try {
    const metrics = AdminService.getDashboardMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
});

app.get('/api/v1/admin/users', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), (req, res, next) => {
  try {
    const search = req.query.search as string;
    const limit = parseInt(req.query.limit as string || '20', 10);
    const offset = parseInt(req.query.offset as string || '0', 10);
    const users = AdminService.getUsers(search, limit, offset);
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/admin/users/:id/ban', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), (req: AuthenticatedRequest, res, next) => {
  try {
    const { reason } = req.body;
    const result = AdminService.banUser(req.user!.id, req.params.id, reason || 'Qoidabuzarlik');
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/admin/users/:id/unban', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), (req: AuthenticatedRequest, res, next) => {
  try {
    const result = AdminService.unbanUser(req.user!.id, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/admin/users/:id/adjust-balance', authMiddleware, requireRole('SUPER_ADMIN'), (req: AuthenticatedRequest, res, next) => {
  try {
    const { amount, reason } = req.body;
    const result = AdminService.adjustBalance(req.user!.id, req.params.id, amount, reason || 'Admin sozlamasi');
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

app.get('/api/v1/admin/audit-logs', authMiddleware, requireRole('ADMIN', 'SUPER_ADMIN'), (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string || '50', 10);
    const logs = AdminService.getAuditLogs(limit);
    res.json({ success: true, data: logs });
  } catch (err) {
    next(err);
  }
});

// Xatoliklarni ushlash
app.use(errorHandler);

// HTTP va WebSocket Serverni ko'tarish
const server = http.createServer(app);
WebSocketHub.init(server);

server.listen(CONFIG.PORT, () => {
  console.log(`🚀 CSSKINUZ API va WebSocket Server ishga tushdi: http://localhost:${CONFIG.PORT}`);
});

export default app;
