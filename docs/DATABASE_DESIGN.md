# MA'LUMOTLAR BAZASI DIZAYNI VA SXEMASI (DATABASE DESIGN & SCHEMA SPECIFICATION)

**Loyiha:** SKINOZ / csskinuz  
**Ma'lumotlar Bazasi:** PostgreSQL 16+  
**Kesh va Navbat:** Redis 7+  
**Til:** O'zbek tili  

---

## 1. STRATEGIYA VA TAMOYILLAR

1. **Moliyaviy Xavfsizlik:** Barcha pul balanslari manfiy bo'lishi mumkin emas (`CHECK (balance >= 0)`). Suzuvchi nuqtali (float) turlardan voz kechilib, barcha summalar eng kichik pul birligida (tiyinlarda) `BIGINT` sifatida saqlanadi.
2. **ACID Tranzaksiyalar va Qulflar:** Moliyaviy va o'yin operatsiyalari `SELECT ... FOR UPDATE` qulflari bilan bajariladi.
3. **Audit va O'chmas Tarix:** Birorta ham moliyaviy yozuv jismonan o'chirilmaydi (`Soft Delete` yoki `Append-Only Ledger`).

---

## 2. TO'LIQ SQL DDL SXEMASI (PRODUCTION-READY POSTGRESQL DDL)

```sql
-- Kengaytmalarni yoqish
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. FOYDALANUVCHILAR VA AVTORIZATSIYA
-- ============================================================================

CREATE TYPE user_role_enum AS ENUM ('USER', 'VIP', 'STREAMER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    steam_id VARCHAR(32) UNIQUE,
    telegram_id BIGINT UNIQUE,
    username VARCHAR(64) NOT NULL,
    avatar_url TEXT,
    role user_role_enum DEFAULT 'USER',
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    referrer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    trade_url TEXT,
    trade_url_token VARCHAR(32),
    trade_url_partner_id VARCHAR(32),
    email VARCHAR(255),
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_2fa_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,
    last_login_ip INET,
    last_login_at TIMESTAMPTZ,
    last_free_case_claimed_at TIMESTAMPTZ
);

-- ============================================================================
-- 2. HAMYON VA BIZNES TRANZAKSIYALARI
-- ============================================================================

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),          -- Tiyinlarda (masalan, 100,000 UZS = 10,000,000 tiyin)
    bonus_balance BIGINT NOT NULL DEFAULT 0 CHECK (bonus_balance >= 0),
    wager_required BIGINT NOT NULL DEFAULT 0,                        -- Yechish uchun zarur o'yin aylanmasi
    wager_current BIGINT NOT NULL DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'UZS',
    version INT NOT NULL DEFAULT 1,                                  -- Optimistik qulflash uchun
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE transaction_type_enum AS ENUM (
    'DEPOSIT', 'WITHDRAWAL', 'CASE_OPEN', 'UPGRADE_BET', 'UPGRADE_WIN', 
    'BATTLE_BET', 'BATTLE_WIN', 'ITEM_SELL', 'REFERRAL_REWARD', 'BONUS_CLAIM', 'ADMIN_ADJUST'
);

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount BIGINT NOT NULL,                                          -- Musbat: Kirim (+), Manfiy: Chiqim (-)
    balance_before BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    type transaction_type_enum NOT NULL,
    reference_id UUID,                                               -- Tegishli case_opening, upgrade yoki deposit ID si
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. DEPOZIT VA TO'LOV SHLYUZLARI
-- ============================================================================

CREATE TYPE payment_gateway_enum AS ENUM ('PAYME', 'CLICK', 'UZUM', 'CRYPTO_USDT', 'TELEGRAM_STARS', 'SKINS');
CREATE TYPE deposit_status_enum AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'EXPIRED', 'CANCELLED');

CREATE TABLE deposits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gateway payment_gateway_enum NOT NULL,
    amount BIGINT NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) DEFAULT 'UZS',
    bonus_amount BIGINT DEFAULT 0,
    promo_code_id UUID,
    external_transaction_id VARCHAR(255),
    status deposit_status_enum DEFAULT 'PENDING',
    payment_url TEXT,
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- ============================================================================
-- 4. CS2 SKINLAR VA BUYUMLAR KATALOGI
-- ============================================================================

CREATE TYPE item_rarity_enum AS ENUM (
    'CONSUMER', 'INDUSTRIAL', 'MIL_SPEC', 'RESTRICTED', 'CLASSIFIED', 'COVERT', 'SPECIAL_EXTRAORDINARY'
);

CREATE TYPE item_exterior_enum AS ENUM (
    'FACTORY_NEW', 'MINIMAL_WEAR', 'FIELD_TESTED', 'WELL_WORN', 'BATTLE_SCARRED', 'NOT_APPLICABLE'
);

CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_hash_name VARCHAR(255) UNIQUE NOT NULL,                   -- Masalan: "AK-47 | Asiimov (Field-Tested)"
    name VARCHAR(128) NOT NULL,
    weapon_type VARCHAR(64) NOT NULL,
    rarity item_rarity_enum NOT NULL,
    exterior item_exterior_enum DEFAULT 'FIELD_TESTED',
    is_stattrak BOOLEAN DEFAULT FALSE,
    is_souvenir BOOLEAN DEFAULT FALSE,
    base_price BIGINT NOT NULL CHECK (base_price >= 0),              -- Tiyinlarda joriy bozor narxi
    image_url TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. KEYSLAR VA TUSHISH EHTIMOLLIKLARI (CASE ENGINE)
-- ============================================================================

CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    category VARCHAR(64) DEFAULT 'popular',
    price BIGINT NOT NULL CHECK (price >= 0),
    image_url TEXT NOT NULL,
    house_edge_percent NUMERIC(5, 2) DEFAULT 10.00,                  -- Platforma foydasi foizi (10.00%)
    is_active BOOLEAN DEFAULT TRUE,
    is_free BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE case_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    drop_weight INT NOT NULL CHECK (drop_weight > 0),                -- Ehtimollik og'irligi
    is_jackpot BOOLEAN DEFAULT FALSE,
    UNIQUE(case_id, item_id)
);

-- ============================================================================
-- 6. FOYDALANUVCHI INVENTARI VA KEYSLAR OCHILISHI
-- ============================================================================

CREATE TYPE inventory_status_enum AS ENUM (
    'AVAILABLE', 'LOCKED', 'SOLD', 'UPGRADED_AWAY', 'WITHDRAWAL_QUEUED', 'WITHDRAWN'
);

CREATE TABLE user_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES items(id) ON DELETE RESTRICT,
    obtained_from VARCHAR(32) NOT NULL,                              -- 'CASE', 'UPGRADE', 'BATTLE', 'TRADE'
    obtained_price BIGINT NOT NULL,
    status inventory_status_enum DEFAULT 'AVAILABLE',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE case_openings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE RESTRICT,
    won_inventory_item_id UUID NOT NULL REFERENCES user_inventory(id),
    case_price_paid BIGINT NOT NULL,
    provably_fair_seed_id UUID,
    roll_number NUMERIC(10, 6),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. APGREYD (UPGRADE) VA CASE BATTLES
-- ============================================================================

CREATE TABLE upgrades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    input_value BIGINT NOT NULL,
    target_item_id UUID NOT NULL REFERENCES items(id),
    win_chance NUMERIC(5, 2) NOT NULL,                              -- Masalan, 25.40%
    roll_number NUMERIC(10, 6) NOT NULL,
    is_won BOOLEAN NOT NULL,
    won_inventory_item_id UUID REFERENCES user_inventory(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TYPE battle_status_enum AS ENUM ('WAITING_FOR_PLAYERS', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

CREATE TABLE battles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES users(id),
    status battle_status_enum DEFAULT 'WAITING_FOR_PLAYERS',
    max_players INT DEFAULT 2,
    is_crazy_mode BOOLEAN DEFAULT FALSE,                             -- Crazy Mode: Eng kam yutgan g'olib
    total_cost BIGINT NOT NULL,
    winner_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE TABLE battle_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    battle_id UUID NOT NULL REFERENCES battles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),                               -- NULL bo'lsa AI Bot
    is_bot BOOLEAN DEFAULT FALSE,
    slot_number INT NOT NULL,
    total_drop_value BIGINT DEFAULT 0,
    is_winner BOOLEAN DEFAULT FALSE,
    UNIQUE(battle_id, slot_number)
);

-- ============================================================================
-- 8. STEAM TRADE BOTLARI VA YECHIB OLISHLAR
-- ============================================================================

CREATE TYPE withdrawal_status_enum AS ENUM (
    'QUEUED', 'OFFER_SENT', 'ACCEPTED', 'DECLINED', 'TIMED_OUT', 'CANCELLED', 'FAILED'
);

CREATE TABLE steam_bots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    steam_id VARCHAR(32) UNIQUE NOT NULL,
    account_name VARCHAR(64) NOT NULL,
    shared_secret_encrypted TEXT NOT NULL,
    identity_secret_encrypted TEXT NOT NULL,
    proxy_ip TEXT,
    is_online BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    active_trades_count INT DEFAULT 0,
    last_active_at TIMESTAMPTZ
);

CREATE TABLE withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES user_inventory(id),
    steam_bot_id UUID REFERENCES steam_bots(id),
    trade_offer_id VARCHAR(64),
    status withdrawal_status_enum DEFAULT 'QUEUED',
    trade_url TEXT NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. ADOLAT KAFOLATI (PROVABLY FAIR SEEDS)
-- ============================================================================

CREATE TABLE provably_fair_seeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    server_seed_hash VARCHAR(64) NOT NULL,                          -- Foydalanuvchiga ko'rsatiladigan SHA256 hash
    server_seed_encrypted TEXT NOT NULL,                            -- O'yin tugagach ochiluvchi ochiq urug'
    client_seed VARCHAR(64) NOT NULL,
    nonce BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. INDEKSLAR VA OPTIMIZATSIYA
-- ============================================================================

CREATE INDEX idx_users_telegram_id ON users(telegram_id);
CREATE INDEX idx_users_steam_id ON users(steam_id);
CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallet_transactions_user_id ON wallet_transactions(user_id, created_at DESC);
CREATE INDEX idx_user_inventory_user_status ON user_inventory(user_id, status);
CREATE INDEX idx_case_openings_created_at ON case_openings(created_at DESC);
CREATE INDEX idx_deposits_user_status ON deposits(user_id, status);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
```
