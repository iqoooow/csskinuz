-- CSSKINUZ SQLite Production-Grade Relational Schema

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- 1. FOYDALANUVCHILAR VA PROFIL
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    steam_id TEXT UNIQUE,
    telegram_id INTEGER UNIQUE,
    username TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'USER', -- 'USER', 'VIP', 'STREAMER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'
    is_banned INTEGER DEFAULT 0,
    ban_reason TEXT,
    referrer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    trade_url TEXT,
    trade_url_partner_id TEXT,
    trade_url_token TEXT,
    email TEXT,
    last_login_ip TEXT,
    last_login_at DATETIME,
    last_free_case_claimed_at DATETIME
);

-- 2. HAMYON VA TRANZAKSIYALAR
CREATE TABLE IF NOT EXISTS wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0), -- Tiyinlarda (100,000 UZS = 10,000,000)
    bonus_balance INTEGER NOT NULL DEFAULT 0 CHECK (bonus_balance >= 0),
    wager_required INTEGER NOT NULL DEFAULT 0,
    wager_current INTEGER NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'UZS',
    version INTEGER NOT NULL DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id TEXT PRIMARY KEY,
    wallet_id TEXT NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL, -- Musbat (+) yoki Manfiy (-)
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'DEPOSIT', 'WITHDRAWAL', 'CASE_OPEN', 'UPGRADE_BET', 'UPGRADE_WIN', 'BATTLE_BET', 'BATTLE_WIN', 'ITEM_SELL', 'REFERRAL_REWARD', 'BONUS_CLAIM', 'ADMIN_ADJUST'
    reference_id TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. CS2 SKINLAR KATALOGI
CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    market_hash_name TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    weapon_type TEXT NOT NULL,
    rarity TEXT NOT NULL, -- 'consumer', 'milspec', 'restricted', 'classified', 'covert', 'special'
    exterior TEXT DEFAULT 'FIELD_TESTED', -- 'FN', 'MW', 'FT', 'WW', 'BS'
    is_stattrak INTEGER DEFAULT 0,
    is_souvenir INTEGER DEFAULT 0,
    base_price INTEGER NOT NULL CHECK (base_price >= 0), -- Tiyinlarda
    image_url TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. KEYSLAR VA TUSHISH OG'IRLIKLARI (CASE ENGINE)
CREATE TABLE IF NOT EXISTS cases (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'popular', -- 'popular', 'knives', 'gloves', 'limited', 'budget', 'free'
    price INTEGER NOT NULL CHECK (price >= 0),
    image_url TEXT NOT NULL,
    house_edge_percent REAL DEFAULT 10.00,
    is_active INTEGER DEFAULT 1,
    is_free INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS case_items (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    drop_weight INTEGER NOT NULL CHECK (drop_weight > 0),
    is_jackpot INTEGER DEFAULT 0,
    UNIQUE(case_id, item_id)
);

-- 5. FOYDALANUVCHI INVENTARI VA OCHILISHLAR
CREATE TABLE IF NOT EXISTS user_inventory (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    obtained_from TEXT NOT NULL, -- 'CASE', 'UPGRADE', 'BATTLE', 'TRADE'
    obtained_price INTEGER NOT NULL,
    status TEXT DEFAULT 'AVAILABLE', -- 'AVAILABLE', 'LOCKED', 'SOLD', 'UPGRADED_AWAY', 'WITHDRAWAL_QUEUED', 'WITHDRAWN'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS case_openings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id TEXT NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
    won_inventory_item_id TEXT NOT NULL REFERENCES user_inventory(id),
    case_price_paid INTEGER NOT NULL,
    provably_fair_seed_id TEXT,
    roll_number REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. APGREYD (UPGRADE) VA CASE BATTLES
CREATE TABLE IF NOT EXISTS upgrades (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    input_value INTEGER NOT NULL,
    target_item_id TEXT NOT NULL REFERENCES items(id),
    win_chance REAL NOT NULL,
    roll_number REAL NOT NULL,
    is_won INTEGER NOT NULL,
    won_inventory_item_id TEXT REFERENCES user_inventory(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS battles (
    id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL REFERENCES users(id),
    status TEXT DEFAULT 'WAITING_FOR_PLAYERS', -- 'WAITING_FOR_PLAYERS', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    max_players INTEGER DEFAULT 2,
    is_crazy_mode INTEGER DEFAULT 0,
    total_cost INTEGER NOT NULL,
    winner_id TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

CREATE TABLE IF NOT EXISTS battle_players (
    id TEXT PRIMARY KEY,
    battle_id TEXT NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id),
    is_bot INTEGER DEFAULT 0,
    slot_number INTEGER NOT NULL,
    total_drop_value INTEGER DEFAULT 0,
    is_winner INTEGER DEFAULT 0,
    UNIQUE(battle_id, slot_number)
);

CREATE TABLE IF NOT EXISTS battle_cases (
    id TEXT PRIMARY KEY,
    battle_id TEXT NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
    case_id TEXT NOT NULL REFERENCES cases(id),
    round_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS battle_drops (
    id TEXT PRIMARY KEY,
    battle_id TEXT NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
    player_id TEXT NOT NULL REFERENCES battle_players(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    item_id TEXT NOT NULL REFERENCES items(id),
    item_price INTEGER NOT NULL,
    roll_number REAL
);

-- 7. DEPOZIT VA YECHIB OLISH
CREATE TABLE IF NOT EXISTS deposits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gateway TEXT NOT NULL, -- 'PAYME', 'CLICK', 'UZUM', 'CRYPTO_USDT', 'TELEGRAM_STARS'
    amount INTEGER NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'UZS',
    bonus_amount INTEGER DEFAULT 0,
    promo_code TEXT,
    external_id TEXT,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'
    payment_url TEXT,
    idempotency_key TEXT UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME
);

CREATE TABLE IF NOT EXISTS withdrawals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    inventory_item_id TEXT NOT NULL REFERENCES user_inventory(id),
    steam_bot_id TEXT,
    trade_offer_id TEXT,
    status TEXT DEFAULT 'QUEUED', -- 'QUEUED', 'OFFER_SENT', 'ACCEPTED', 'DECLINED', 'TIMED_OUT', 'CANCELLED'
    trade_url TEXT NOT NULL,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. PROVABLY FAIR VA AUDIT
CREATE TABLE IF NOT EXISTS provably_fair_seeds (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    server_seed_hash TEXT NOT NULL,
    server_seed_plain TEXT NOT NULL,
    client_seed TEXT NOT NULL,
    nonce INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fraud_alerts (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    description TEXT NOT NULL,
    is_resolved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promo_codes (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    bonus_percent REAL NOT NULL,
    max_uses INTEGER DEFAULT 100,
    current_uses INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    expires_at DATETIME
);

-- INDEKSLAR
CREATE INDEX IF NOT EXISTS idx_users_telegram ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_steam ON users(steam_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON wallet_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_user_status ON user_inventory(user_id, status);
CREATE INDEX IF NOT EXISTS idx_cases_category ON cases(category, is_active);
