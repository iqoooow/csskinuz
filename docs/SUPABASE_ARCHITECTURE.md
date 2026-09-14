# 🗄️ CSSKINUZ — Supabase Backend & Database Architecture

Ushbu hujjatda **CSSKINUZ** platformasining to'liq Supabase (PostgreSQL 15+, Row-Level Security, Realtime WebSockets, Storage va Atomic Stored Procedures) arxitekturasi bayon etilgan.

---

## 🏛️ 1. Tizim Arxitekturasi

```mermaid
graph TD
    ClientWeb[Web Frontend / React 19] -->|Supabase Realtime WSS| SupabaseRealtime[Supabase Realtime Channel]
    ClientTMA[Telegram Mini App] -->|HTTPS REST| API[Express Core API Gateway]
    
    API -->|@supabase/supabase-js Service Role| SupabaseDB[(Supabase PostgreSQL + RLS)]
    
    subgraph Supabase Cloud
        SupabaseDB --> TableUsers[public.users]
        SupabaseDB --> TableWallets[public.wallets (ACID Balance >= 0)]
        SupabaseDB --> TableLedger[public.ledger_transactions (Double-Entry)]
        SupabaseDB --> TableInventory[public.inventory_items]
        SupabaseDB --> TableCases[public.cases & case_items]
        SupabaseDB --> TableBattles[public.battles & battle_players]
        SupabaseDB --> TableTrades[public.trade_offers]
        SupabaseDB --> RPCFunctions[PostgreSQL Stored Procedures / RPC]
    end
```

---

## 📋 2. Ma'lumotlar Bazasi Jadvallari (Tables)

| № | Jadval Nomi | Tavsifi | Asosiy Maydonlar |
|---|---|---|---|
| 1 | `public.users` | Foydalanuvchilar hisoblari | `id (UUID)`, `telegram_id (BIGINT)`, `steam_id`, `role`, `ref_code` |
| 2 | `public.wallets` | Foydalanuvchilar balansi (Tiyin) | `balance (BIGINT >= 0)`, `bonus_balance`, `wager_required`, `wager_current` |
| 3 | `public.ledger_transactions` | O'zgarmas buxgalteriya jurnali | `amount (BIGINT)`, `balance_after`, `type`, `idempotency_key` |
| 4 | `public.items` | CS2 skinlar katalogi | `name`, `weapon_type`, `rarity`, `base_price (BIGINT)`, `image_url` |
| 5 | `public.cases` | Keyslar ro'yxati | `slug`, `name`, `price (BIGINT)`, `image_url`, `is_free` |
| 6 | `public.case_items` | Keys ichidagi skinlar va drop ehtimolliklari | `case_id`, `item_id`, `drop_weight` |
| 7 | `public.inventory_items` | Foydalanuvchi inventari | `user_id`, `item_id`, `obtained_price`, `status (AVAILABLE/SOLD/...)` |
| 8 | `public.battles` | Case Battles PvP xonalari | `creator_id`, `status`, `max_players`, `is_crazy_mode`, `total_cost` |
| 9 | `public.battle_players` | Jang ishtirokchilari | `battle_id`, `user_id`, `is_bot`, `slot_number`, `total_drop_value` |
| 10 | `public.battle_drops` | Jangdagi ochilgan skinlar | `battle_id`, `player_id`, `round_number`, `item_price` |
| 11 | `public.trade_offers` | Steam yechib olish navbati | `user_id`, `trade_url`, `status`, `items_json`, `total_value` |
| 12 | `public.audit_logs` | Xavfsizlik va admin jurnali | `actor_id`, `action`, `resource`, `details (JSONB)`, `ip_address` |

---

## ⚡ 3. Atomik SQL Protseduralar (RPC Functions)

Supabase PostgreSQL ichida moliyaviy poyga holatlari (Race Condition) va xatoliklarni 100% oldini oluvchi funksiyalar:

1. `public.deduct_wallet_balance(p_user_id, p_amount, p_type, ...)`:
   - `FOR UPDATE` qator darajasida bloklash orqali pul yechadi va `ledger_transactions` ga qayd etadi.
2. `public.add_wallet_balance(p_user_id, p_amount, p_type, ...)`:
   - Balansga pul qo'shadi va tranzaksiyani yozadi.
3. `public.process_deposit_atomic(p_user_id, p_amount, p_gateway, p_promo_code, p_idempotency_key)`:
   - Idempotentlik kaliti orqali qayta to'lovlardan saqlaydi, bonusni hisoblaydi va 5% referal komissiyasini o'tkazadi.
4. `public.bulk_sell_inventory_atomic(p_user_id, p_inventory_ids)`:
   - Bir nechta skinlarni 1 ta atomik tranzaksiyada sotadi va pulini darhol balansga qaytaradi.

---

## 🛡️ 4. Row-Level Security (RLS) Qoidalari

Supabase RLS qoidalari orqali:
- Ommaviy jadvallar (`items`, `cases`, `case_items`) barcha tomonidan o'qiladi;
- Shaxsiy jadvallar (`wallets`, `inventory_items`, `ledger_transactions`) faqat tegishli foydalanuvchi (`auth.uid() = user_id`) yoki `service_role` orqali boshqariladi.

---

## ⚙️ 5. Supabase Loyihasini Ulash Ko'rsatmasi

### 1. `.env` faylga kalitlarni yozish:
```env
# Backend API (.env)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Frontend Web (.env)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2. Supabase Migratsiyalarini yuklash (CLI orqali):
```bash
# Supabase CLI orqali loyihaga ulash:
supabase link --project-ref your-project-id

# Migratsiyalarni PostgreSQL bazaga qo'llash:
supabase db push
```
Yoki Supabase Dashboard -> **SQL Editor** oynasiga kirib quyidagi fayllar kodini ishga tushiring:
1. `supabase/migrations/20260915000001_initial_schema.sql`
2. `supabase/migrations/20260915000002_atomic_procedures.sql`
