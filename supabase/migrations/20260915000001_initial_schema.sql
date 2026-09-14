-- =====================================================================
-- CSSKINUZ — SUPABASE POSTGRESQL PRODUCTION DDL & RLS POLICIES
-- Versiya: 1.0.0
-- Xavfsizlik: Row-Level Security (RLS), ACID Ledger, Non-Floating Currency
-- Pul birligi: tiyin (1 UZS = 100 tiyin) saqlanadi
-- =====================================================================

-- 1. UUID kengaytmasi
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Foydalanuvchilar (Users) Jadvali
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE,
    steam_id VARCHAR(64) UNIQUE,
    username VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'VIP', 'STREAMER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN')),
    ref_code VARCHAR(32) UNIQUE,
    referred_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    trade_url TEXT,
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Hamyonlar (Wallets) Jadvali — Qat'iy manfiy balansdan himoyalangan
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    balance BIGINT NOT NULL DEFAULT 0 CHECK (balance >= 0),
    bonus_balance BIGINT NOT NULL DEFAULT 0 CHECK (bonus_balance >= 0),
    wager_required BIGINT NOT NULL DEFAULT 0 CHECK (wager_required >= 0),
    wager_current BIGINT NOT NULL DEFAULT 0 CHECK (wager_current >= 0),
    currency VARCHAR(10) DEFAULT 'UZS',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. O'zgarmas Moliyaviy Ledger (Double-Entry Ledger Transactions)
CREATE TABLE IF NOT EXISTS public.ledger_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'DEPOSIT', 'WITHDRAWAL', 'CASE_OPEN', 'CASE_DROP',
        'UPGRADE_BET', 'UPGRADE_WIN', 'BATTLE_ENTRY', 'BATTLE_WIN',
        'ITEM_SELL', 'TRADE_ADJUSTMENT', 'REFERRAL_REWARD',
        'PROMO_BONUS', 'ADMIN_ADJUSTMENT'
    )),
    amount BIGINT NOT NULL,
    balance_after BIGINT NOT NULL,
    reference_id TEXT,
    idempotency_key VARCHAR(255) UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Skinlar va Qurollar (Items) Katalogi
CREATE TABLE IF NOT EXISTS public.items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    market_hash_name VARCHAR(255) NOT NULL,
    weapon_type VARCHAR(100) NOT NULL,
    rarity VARCHAR(50) NOT NULL CHECK (rarity IN ('consumer', 'milspec', 'restricted', 'classified', 'covert', 'special')),
    exterior VARCHAR(50) DEFAULT 'Factory New',
    base_price BIGINT NOT NULL CHECK (base_price > 0),
    image_url TEXT NOT NULL,
    is_stattrak BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Keyslar (Cases) Jadvali
CREATE TABLE IF NOT EXISTS public.cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'popular',
    price BIGINT NOT NULL DEFAULT 0 CHECK (price >= 0),
    image_url TEXT NOT NULL,
    is_free BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Keys tarkibidagi skinlar va drop og'irliklari (Case Items & Weights)
CREATE TABLE IF NOT EXISTS public.case_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
    drop_weight INTEGER NOT NULL CHECK (drop_weight > 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Foydalanuvchilar Inventari (Inventory Items)
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
    obtained_from VARCHAR(100) NOT NULL,
    obtained_price BIGINT NOT NULL CHECK (obtained_price >= 0),
    status VARCHAR(50) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'LOCKED', 'SOLD', 'UPGRADED_AWAY', 'WITHDRAWAL_QUEUED', 'WITHDRAWN')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Case Battles (Janglar) Jadvali
CREATE TABLE IF NOT EXISTS public.battles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'WAITING_FOR_PLAYERS' CHECK (status IN ('WAITING_FOR_PLAYERS', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    max_players INTEGER NOT NULL CHECK (max_players BETWEEN 2 AND 4),
    is_crazy_mode BOOLEAN DEFAULT FALSE,
    total_cost BIGINT NOT NULL CHECK (total_cost >= 0),
    winner_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.battle_players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    is_bot BOOLEAN DEFAULT FALSE,
    slot_number INTEGER NOT NULL,
    total_drop_value BIGINT DEFAULT 0,
    is_winner BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.battle_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE RESTRICT,
    round_order INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.battle_drops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    battle_id UUID NOT NULL REFERENCES public.battles(id) ON DELETE CASCADE,
    player_id UUID NOT NULL REFERENCES public.battle_players(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE RESTRICT,
    item_price BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Steam Trade Chiqarish (Withdrawals) Navbati
CREATE TABLE IF NOT EXISTS public.trade_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    trade_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'SENT', 'ACCEPTED', 'DECLINED', 'FAILED', 'EXPIRED')),
    items_json JSONB NOT NULL,
    total_value BIGINT NOT NULL,
    steam_offer_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Xavfsizlik va Admin Audit Jurnali (Audit Logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    details JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- INDEKSLAR (HIGH-THROUGHPUT INDEXING)
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_users_steam_id ON public.users(steam_id);
CREATE INDEX IF NOT EXISTS idx_users_ref_code ON public.users(ref_code);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_wallet_id ON public.ledger_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_ledger_idempotency ON public.ledger_transactions(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_inventory_user_status ON public.inventory_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_case_items_case_id ON public.case_items(case_id);
CREATE INDEX IF NOT EXISTS idx_battles_status ON public.battles(status);
CREATE INDEX IF NOT EXISTS idx_trade_offers_user ON public.trade_offers(user_id, status);

-- =====================================================================
-- ROW-LEVEL SECURITY (RLS) XAVFSIZLIK POLICIES
-- =====================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ledger_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_offers ENABLE ROW LEVEL SECURITY;

-- 1. Ommaviy ko'rish mumkin bo'lgan jadvallar (Katalog)
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public items readable" ON public.items FOR SELECT USING (true);
CREATE POLICY "Public cases readable" ON public.cases FOR SELECT USING (true);
CREATE POLICY "Public case items readable" ON public.case_items FOR SELECT USING (true);

-- 2. Foydalanuvchilar o'z ma'lumotlarini ko'rishi
CREATE POLICY "Users can read own profile" ON public.users 
    FOR SELECT USING (auth.uid() = id OR current_setting('role', true) = 'service_role');

CREATE POLICY "Users can read own wallet" ON public.wallets 
    FOR SELECT USING (auth.uid() = user_id OR current_setting('role', true) = 'service_role');

CREATE POLICY "Users can read own inventory" ON public.inventory_items 
    FOR SELECT USING (auth.uid() = user_id OR current_setting('role', true) = 'service_role');

CREATE POLICY "Users can read own ledger" ON public.ledger_transactions 
    FOR SELECT USING (auth.uid() = user_id OR current_setting('role', true) = 'service_role');
