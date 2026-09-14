-- =====================================================================
-- CSSKINUZ — SUPABASE POSTGRESQL ATOMIC PROCEDURES & FUNCTIONS (ACID)
-- Versiya: 1.0.0
-- Maqsad: Moliyaviy xavfsizlik, tranzaksion bloklash va race condition himoyasi
-- =====================================================================

-- 1. Atomik Pul Yechish Funksiyasi (Deduct Wallet Balance)
CREATE OR REPLACE FUNCTION public.deduct_wallet_balance(
    p_user_id UUID,
    p_amount BIGINT,
    p_type TEXT,
    p_reference_id TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_id UUID;
    v_balance_before BIGINT;
    v_balance_after BIGINT;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Yechiladigan summa musbat bo''lishi shart';
    END IF;

    -- Qat'iy qator darajasida bloklash (Row-level lock FOR UPDATE)
    SELECT id, balance INTO v_wallet_id, v_balance_before
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_wallet_id IS NULL THEN
        RAISE EXCEPTION 'Foydalanuvchi hamyoni topilmadi';
    END IF;

    IF v_balance_before < p_amount THEN
        RAISE EXCEPTION 'Hamyonda mablag'' yetarli emas';
    END IF;

    v_balance_after := v_balance_before - p_amount;

    -- Hamyonni yangilash
    UPDATE public.wallets
    SET balance = v_balance_after,
        wager_current = wager_current + p_amount,
        updated_at = NOW()
    WHERE id = v_wallet_id;

    -- Ledger tranzaksiyani kiritish
    INSERT INTO public.ledger_transactions (
        wallet_id, user_id, type, amount, balance_after, reference_id, description
    ) VALUES (
        v_wallet_id, p_user_id, p_type, -p_amount, v_balance_after, p_reference_id, p_description
    );

    RETURN jsonb_build_object(
        'success', true,
        'balance_before', v_balance_before,
        'balance_after', v_balance_after,
        'deducted', p_amount
    );
END;
$$;

-- 2. Atomik Pul Qo'shish Funksiyasi (Add Wallet Balance)
CREATE OR REPLACE FUNCTION public.add_wallet_balance(
    p_user_id UUID,
    p_amount BIGINT,
    p_type TEXT,
    p_reference_id TEXT DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_wallet_id UUID;
    v_balance_before BIGINT;
    v_balance_after BIGINT;
BEGIN
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Kiritiladigan summa musbat bo''lishi shart';
    END IF;

    -- Row-level lock
    SELECT id, balance INTO v_wallet_id, v_balance_before
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_wallet_id IS NULL THEN
        RAISE EXCEPTION 'Foydalanuvchi hamyoni topilmadi';
    END IF;

    v_balance_after := v_balance_before + p_amount;

    UPDATE public.wallets
    SET balance = v_balance_after,
        updated_at = NOW()
    WHERE id = v_wallet_id;

    INSERT INTO public.ledger_transactions (
        wallet_id, user_id, type, amount, balance_after, reference_id, description
    ) VALUES (
        v_wallet_id, p_user_id, p_type, p_amount, v_balance_after, p_reference_id, p_description
    );

    RETURN jsonb_build_object(
        'success', true,
        'balance_before', v_balance_before,
        'balance_after', v_balance_after,
        'added', p_amount
    );
END;
$$;

-- 3. Atomik Depozit Qabul Qilish (Process Deposit with Idempotency)
CREATE OR REPLACE FUNCTION public.process_deposit_atomic(
    p_user_id UUID,
    p_amount BIGINT,
    p_gateway TEXT,
    p_promo_code TEXT DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deposit_id UUID;
    v_bonus_percent INT := 0;
    v_bonus_amount BIGINT := 0;
    v_total_credit BIGINT;
    v_existing_deposit RECORD;
    v_referrer_id UUID;
    v_ref_reward BIGINT;
BEGIN
    -- Idempotentlik tekshiruvi
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id, amount, balance_after, description INTO v_existing_deposit
        FROM public.ledger_transactions
        WHERE idempotency_key = p_idempotency_key;

        IF v_existing_deposit.id IS NOT NULL THEN
            RETURN jsonb_build_object(
                'success', true,
                'already_processed', true,
                'amount', p_amount
            );
        END IF;
    END IF;

    -- Promo-kod bonusini hisoblash
    IF UPPER(p_promo_code) = 'WELCOME' THEN
        v_bonus_percent := 20;
    ELSIF UPPER(p_promo_code) = 'CSSKIN2026' THEN
        v_bonus_percent := 15;
    END IF;

    v_bonus_amount := (p_amount * v_bonus_percent) / 100;
    v_total_credit := p_amount + v_bonus_amount;
    v_deposit_id := uuid_generate_v4();

    -- Balansni to'ldirish
    PERFORM public.add_wallet_balance(
        p_user_id,
        v_total_credit,
        'DEPOSIT',
        v_deposit_id::text,
        'Depozit: ' || p_gateway || ' (+bonus: ' || v_bonus_percent || '%)'
    );

    -- Wager talabini oshirish
    UPDATE public.wallets
    SET wager_required = wager_required + (p_amount * 1) + (v_bonus_amount * 3)
    WHERE user_id = p_user_id;

    -- Referal mukofoti (5%)
    SELECT referred_by INTO v_referrer_id FROM public.users WHERE id = p_user_id;
    IF v_referrer_id IS NOT NULL THEN
        v_ref_reward := (p_amount * 5) / 100;
        IF v_ref_reward > 0 THEN
            PERFORM public.add_wallet_balance(
                v_referrer_id,
                v_ref_reward,
                'REFERRAL_REWARD',
                v_deposit_id::text,
                'Referal do''stingiz depozitidan 5% keshbek'
            );
        END IF;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'deposit_id', v_deposit_id,
        'amount', p_amount,
        'bonus_amount', v_bonus_amount,
        'total_credit', v_total_credit
    );
END;
$$;

-- 4. Ommaviy Skinlarni Sotish (Bulk Sell Inventory)
CREATE OR REPLACE FUNCTION public.bulk_sell_inventory_atomic(
    p_user_id UUID,
    p_inventory_ids UUID[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_payout BIGINT := 0;
    v_sold_count INT := 0;
    v_item RECORD;
BEGIN
    FOR v_item IN
        SELECT inv.id, inv.obtained_price, it.base_price
        FROM public.inventory_items inv
        JOIN public.items it ON inv.item_id = it.id
        WHERE inv.id = ANY(p_inventory_ids)
          AND inv.user_id = p_user_id
          AND inv.status = 'AVAILABLE'
        FOR UPDATE
    LOOP
        UPDATE public.inventory_items
        SET status = 'SOLD',
            updated_at = NOW()
        WHERE id = v_item.id;

        v_total_payout := v_total_payout + v_item.base_price;
        v_sold_count := v_sold_count + 1;
    END LOOP;

    IF v_sold_count > 0 THEN
        PERFORM public.add_wallet_balance(
            p_user_id,
            v_total_payout,
            'ITEM_SELL',
            NULL,
            v_sold_count || ' ta skin platformaga sotildi'
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'sold_count', v_sold_count,
        'total_payout', v_total_payout
    );
END;
$$;
