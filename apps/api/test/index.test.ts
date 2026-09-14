import assert from 'assert';
import { ProvablyFairService } from '../src/modules/provably-fair/provably-fair.service.js';
import { AuthService } from '../src/modules/auth/auth.service.js';
import { WalletService } from '../src/modules/wallet/wallet.service.js';
import { InventoryService } from '../src/modules/inventory/inventory.service.js';
import { CaseService } from '../src/modules/cases/case.service.js';
import { UpgradeService } from '../src/modules/upgrade/upgrade.service.js';
import { BattleService } from '../src/modules/battles/battle.service.js';
import { TradeService } from '../src/modules/trade/trade.service.js';
import { SteamService } from '../src/modules/steam/steam.service.js';
import { getDatabase } from '../src/database/index.js';
import { seedDatabase } from '../src/database/seeder.js';

async function runTests() {
  console.log('🧪 CSSKINUZ BARCHA AVTOMATLASHGAN TESTLARNI BOSHLASH...\n');
  
  getDatabase();
  seedDatabase();

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
      failed++;
    }
  }

  // ==========================================================================
  // 1. PROVABLY FAIR TESTLARI
  // ==========================================================================
  console.log('--- 1. PROVABLY FAIR VA KRIPTOGRAFIYA ---');
  
  test('Server Seed va Hash to\'g\'ri generatsiya qilinishi', () => {
    const seed = ProvablyFairService.generateServerSeed();
    assert.strictEqual(seed.length, 64);
    const hash = ProvablyFairService.hashServerSeed(seed);
    assert.strictEqual(hash.length, 64);
  });

  test('Roll hisoblash deterministik va 0..100 oralig\'ida bo\'lishi', () => {
    const serverSeed = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const clientSeed = 'test_client_seed_123';
    const roll1 = ProvablyFairService.calculateRoll(serverSeed, clientSeed, 1);
    const roll2 = ProvablyFairService.calculateRoll(serverSeed, clientSeed, 1);
    assert.strictEqual(roll1, roll2);
    assert.ok(roll1 >= 0 && roll1 <= 100);
    assert.ok(ProvablyFairService.verify(serverSeed, clientSeed, 1, roll1));
  });

  test('Drop og\'irliklari bo\'yicha skin tanlash to\'g\'riligi', () => {
    const pool = [
      { id: '1', drop_weight: 10 },
      { id: '2', drop_weight: 90 },
    ];
    // Roll 5% bo'lsa -> 1-element
    const item1 = ProvablyFairService.selectItemFromPool(pool, 5);
    assert.strictEqual(item1.id, '1');
    // Roll 50% bo'lsa -> 2-element
    const item2 = ProvablyFairService.selectItemFromPool(pool, 50);
    assert.strictEqual(item2.id, '2');
  });

  // ==========================================================================
  // 2. AUTH VA SESSIYA TESTLARI
  // ==========================================================================
  console.log('\n--- 2. AUTENTIFIKATSIYA VA IDENTIFIKATSIYA ---');

  let testUserToken = '';
  let testUserId = '';

  test('Steam OpenID orqali ro\'yxatdan o\'tish va JWT olish', () => {
    const res = AuthService.loginWithSteam('76561198000000001', 'TestGamer');
    assert.ok(res.token);
    assert.strictEqual(res.user.username, 'TestGamer');
    testUserToken = res.token;
    testUserId = res.user.id;

    const verified = AuthService.verifyToken(res.token);
    assert.strictEqual(verified.id, testUserId);
  });

  test('Noto\'g\'ri token rad etilishi', () => {
    assert.throws(() => {
      AuthService.verifyToken('soxta_yaroqsiz_jwt_token');
    });
  });

  // ==========================================================================
  // 3. HAMYON VA TRANZAKSIYALAR TESTLARI
  // ==========================================================================
  console.log('\n--- 3. HAMYON VA TRANZAKSION LEDGER ---');

  test('Depozit qilish va balans to\'ldirilishi', () => {
    const depositAmount = 10000000; // 100,000 UZS
    const testKey = `idemp_${Date.now()}`;
    const res = WalletService.processDeposit(testUserId, depositAmount, 'PAYME', 'CSSKIN2026', testKey);
    assert.strictEqual(res.status, 'SUCCESS');
    assert.strictEqual(res.amount, depositAmount);
    assert.strictEqual(res.bonusAmount, 1500000); // 15% bonus = 15,000 UZS

    const balance = WalletService.getBalance(testUserId);
    assert.ok(balance.balance >= 11500000);

    // Takroriy so'rov (Idempotency) tekshiruvi
    const replay = WalletService.processDeposit(testUserId, depositAmount, 'PAYME', undefined, testKey);
    assert.strictEqual(replay.alreadyProcessed, true);
  });

  test('Yetarli bo\'lmagan balansda pul yechish rad etilishi (No Negative Balance)', () => {
    assert.throws(() => {
      WalletService.deductBalance(testUserId, 99999999999, 'TEST_OVERDRAFT');
    });
  });

  // ==========================================================================
  // 4. KEYSLAR OCHISH ENGINE TESTLARI
  // ==========================================================================
  console.log('\n--- 4. KEYSLAR ENGINE VA PROVABLY FAIR DROPLAR ---');

  let wonInventoryItemId = '';

  test('Pullik keysni 1x ochish va inventarga tushishi', () => {
    const balanceBefore = WalletService.getBalance(testUserId).balance;
    const res = CaseService.openCase(testUserId, 'budget-rush', 1);
    
    assert.strictEqual(res.results.length, 1);
    assert.ok(res.results[0].wonItem.name);
    assert.strictEqual(res.results[0].rouletteStrip.length, 60);
    assert.ok(res.newBalance < balanceBefore);
    wonInventoryItemId = res.results[0].wonItem.inventoryItemId;
  });

  // ==========================================================================
  // 5. INVENTAR VA SOTISH TESTLARI
  // ==========================================================================
  console.log('\n--- 5. INVENTAR VA SOTISH (SELL) ---');

  test('Yutilgan skinni platformaga sotish va balansga pul qaytishi', () => {
    const balanceBefore = WalletService.getBalance(testUserId).balance;
    const res = InventoryService.sellItem(testUserId, wonInventoryItemId);
    assert.strictEqual(res.success, true);
    assert.ok(res.soldPrice > 0);
    assert.strictEqual(res.newBalance, balanceBefore + res.soldPrice);
  });

  test('Sotilgan skinni ikkinchi marta sotish rad etilishi', () => {
    assert.throws(() => {
      InventoryService.sellItem(testUserId, wonInventoryItemId);
    });
  });

  // ==========================================================================
  // 6. APGREYD (UPGRADE) TESTLARI
  // ==========================================================================
  console.log('\n--- 6. APGREYD (UPGRADE) ENGINI ---');

  test('Apgreyd ehtimolligi va burchak hisobi to\'g\'riligi', () => {
    const odds = UpgradeService.calculateOdds(2000000, 10000000); // 20k tikib 100k yutish
    assert.ok(odds.winChance > 0 && odds.winChance <= 80);
    assert.strictEqual(odds.multiplier, 5.00);
    assert.ok(odds.winAngle > 0 && odds.winAngle <= 360);
  });

  test('Apgreydni balans orqali amalga oshirish', () => {
    const db = getDatabase();
    const targetItem = db.prepare('SELECT id FROM items WHERE name LIKE ?').get('%Asiimov%') as any;
    
    const res = UpgradeService.executeUpgrade(
      testUserId,
      [],
      1000000, // 10,000 UZS tikish
      targetItem.id
    );

    assert.ok(typeof res.isWon === 'boolean');
    assert.ok(res.rollNumber >= 0 && res.rollNumber <= 100);
    assert.ok(res.stopAngle >= 0 && res.stopAngle <= 360);
  });

  // ==========================================================================
  // 7. CASE BATTLES TESTLARI
  // ==========================================================================
  console.log('\n--- 7. CASE BATTLES PVP ENGINI ---');

  test('Case Battle yaratish, Bot qo\'shish va avto-yakunlanish', () => {
    // Battle uchun hisobni to'ldirish
    WalletService.processDeposit(testUserId, 50000000, 'PAYME');

    const db = getDatabase();
    const caseRow = db.prepare('SELECT id FROM cases WHERE is_free = 0 LIMIT 1').get() as any;

    const battle = BattleService.createBattle(testUserId, [caseRow.id], 2);
    assert.strictEqual(battle.status, 'WAITING_FOR_PLAYERS');
    assert.strictEqual(battle.players.length, 1);

    // AI Bot qo'shish -> to'ladi va darhol o'ynaladi!
    const battleCompleted = BattleService.addBot(testUserId, battle.id);
    assert.strictEqual(battleCompleted.status, 'COMPLETED');
    assert.ok(battleCompleted.drops.length >= 2);
  });

  // ==========================================================================
  // 8. STEAM INTEGRATSIYA TESTLARI
  // ==========================================================================
  console.log('\n--- 8. STEAM TRADE INTEGRATSIYASI ---');

  test('Trade URL tekshirish va saqlash', () => {
    const tradeUrl = 'https://steamcommunity.com/tradeoffer/new/?partner=76561198&token=ValidToken2026';
    const res = SteamService.setTradeUrl(testUserId, tradeUrl);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.partnerId, '76561198');
  });

  test('Noto\'g\'ri Trade URL formatini rad etish', () => {
    assert.throws(() => {
      SteamService.setTradeUrl(testUserId, 'https://google.com');
    });
  });

  // ==========================================================================
  // 9. RED-TEAM XAVFSIZLIK VA IDOR HUJUMLARI TESTLARI
  // ==========================================================================
  console.log('\n--- 9. RED-TEAM XAVFSIZLIK VA HIMOYA AUDITI ---');

  test('IDOR: Boshqa foydalanuvchining skinini sotishga urinish rad etilishi', () => {
    const victimRes = AuthService.loginWithSteam('76561198000000002', 'VictimUser');
    WalletService.processDeposit(victimRes.user.id, 20000000, 'PAYME');
    const victimCase = CaseService.openCase(victimRes.user.id, 'budget-rush', 1);
    const victimSkinId = victimCase.results[0].wonItem.inventoryItemId;

    // Hujumchi (testUserId) boshqaning skinini sotishga urinadi
    assert.throws(() => {
      InventoryService.sellItem(testUserId, victimSkinId);
    });
  });

  test('Musbat bo\'lmagan depozit summasi rad etilishi', () => {
    assert.throws(() => {
      WalletService.deductBalance(testUserId, -50000, 'ILLEGAL_NEGATIVE');
    });
  });

  // ==========================================================================
  // 10. SUPABASE VA TELEGRAM BOT INTEGRATSIYA TESTLARI
  // ==========================================================================
  console.log('\n--- 10. SUPABASE VA TELEGRAM BOT INTEGRATSIYASI ---');

  test('Supabase DDL migratsiya fayli to\'liqligi va RLS qoidalari', () => {
    const fs = require('fs');
    const path = require('path');
    const migrationPath = path.resolve(process.cwd(), '../../supabase/migrations/20260915000001_initial_schema.sql');
    const altPath = path.resolve(process.cwd(), 'supabase/migrations/20260915000001_initial_schema.sql');
    const exists = fs.existsSync(migrationPath) || fs.existsSync(altPath);
    assert.ok(exists, 'Supabase DDL migratsiya fayli mavjud bo\'lishi shart');

    const content = fs.readFileSync(fs.existsSync(migrationPath) ? migrationPath : altPath, 'utf8');
    assert.ok(content.includes('CREATE TABLE IF NOT EXISTS public.wallets'), 'Wallets jadvali mavjud');
    assert.ok(content.includes('ENABLE ROW LEVEL SECURITY'), 'RLS xavfsizlik qoidalari mavjud');
    assert.ok(content.includes('CHECK (balance >= 0)'), 'Qat\'iy balans cheklovi mavjud');
  });

  test('Telegram Bot orqali referal kodi bilan ro\'yxatdan o\'tish', () => {
    const referrer = AuthService.loginWithTelegram('test_user_888111_TopReferrer');
    const newUser = AuthService.loginWithTelegram('test_user_999222_NewReferralFriend', referrer.user.id);
    
    assert.ok(newUser.user.id);
    assert.strictEqual(newUser.user.telegram_id, 888111 ? 999222 : 999222);
  });

  console.log(`\n======================================================`);
  console.log(`🏁 TEST NATIJALARI: Jami: ${passed + failed} | O'tdi: ${passed} | Xato: ${failed}`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
