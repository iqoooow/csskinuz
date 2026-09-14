-- =====================================================================
-- CSSKINUZ — SUPABASE PRODUCTION SEED DATA (CS2 SKINS & CASES)
-- =====================================================================

-- 1. Qurollar va Skinlar Katalogi (Items)
INSERT INTO public.items (id, name, market_hash_name, weapon_type, rarity, exterior, base_price, image_url) VALUES
  ('00000001-0000-0000-0000-000000000001', 'Butterfly Knife | Fade', 'Butterfly Knife | Fade (Factory New)', 'Knife', 'special', 'Factory New', 1800000000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhGJP68twj-3I4IG7jAzm_xVoYWr2doWRcARrZQ2F8wS3ye-61pW16ZzOyXBi7yV37SuPzBfhn1gSOa-QvLqQ'),
  ('00000001-0000-0000-0000-000000000002', 'Karambit | Doppler', 'Karambit | Doppler (Factory New)', 'Knife', 'special', 'Factory New', 1450000000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhGJP68tzteTE8DXi2Vbt-0ZoZTjydoXBcQc2N1jUrFS-x-rngZe77cmfznBi73Ym5SqMnwv3309aL0N4ug'),
  ('00000001-0000-0000-0000-000000000003', 'M9 Bayonet | Gamma Doppler', 'M9 Bayonet | Gamma Doppler (Factory New)', 'Knife', 'special', 'Factory New', 1300000000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czhx5ci5q5CKqPrxN7LEmyUB7ZYk0-vFpIrz2wzn_ENtYGD3LNPHdQBoZQvT81S4yLzuhMW_uZqanXBrsnI8pSGKw-L7K40'),
  ('00000001-0000-0000-0000-000000000004', 'Skeleton Knife | Crimson Web', 'Skeleton Knife | Crimson Web (Field-Tested)', 'Knife', 'special', 'Field-Tested', 950000000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThH_9m7h5C0mfL1Ja_ummJW4NE_0ruS892njVC1_EY9Zjr3co7GIQJvZ12Fq1jvxrq715Xpu57JmnpguiMr-z-DyP2hP_d4'),
  ('00000001-0000-0000-0000-000000000005', 'AWP | Dragon Lore', 'AWP | Dragon Lore (Field-Tested)', 'Sniper Rifle', 'covert', 'Field-Tested', 4500000000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0n_L1JaKfzzoGuMlOjede0uvFrInwigK2_UduYTjzJ4_AIA8-YlqErlnq35S7tJXBzXFiuCY8pSGK_kF_q08'),
  ('00000001-0000-0000-0000-000000000006', 'M4A4 | Howl', 'M4A4 | Howl (Field-Tested)', 'Rifle', 'covert', 'Field-Tested', 3200000000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwW09izh5CAlvDzPYTZk2pH8Ytz2rqTrN-h2gTm-0BoMTigLdPAJ1VqZgnXqFe3l-ruh5fouZ2anHA1uyF35y2LmEOyghgZbeBr'),
  ('00000001-0000-0000-0000-000000000007', 'AK-47 | Fire Serpent', 'AK-47 | Fire Serpent (Field-Tested)', 'Rifle', 'covert', 'Field-Tested', 850000000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV08y5nY6fqPP9ILrDhGpI18h0juDU-MKt0QLg_kdvamqlJITAdgA4aV-G-QC_yL3og5a8vZvOynI1uCIh-z-DyOCmJ9B4'),
  ('00000001-0000-0000-0000-000000000008', 'AWP | Asiimov', 'AWP | Asiimov (Field-Tested)', 'Sniper Rifle', 'covert', 'Field-Tested', 125000000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17P7NdTRH-t26q4SZlvD7PYTQgXtu5Mx2gv2PoI-t3wW3_0VsMDr7coedegI_ZgvR_VO5k7q7jJTpu5_BmiZiu3Yn4SvczUGw1BlSLrs4003r-iM'),
  ('00000001-0000-0000-0000-000000000009', 'AK-47 | Asiimov', 'AK-47 | Asiimov (Field-Tested)', 'Rifle', 'covert', 'Field-Tested', 45000000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV08-5lpKKqPrxN7LEmyUH68R32bzHp46t2wW2-BFlNW_2doXBcQFsNFrSrFi4xevuh8S57Zqbm3Zh6Sg8pSGK4E7a4Hk'),
  ('00000001-0000-0000-0000-000000000010', 'USP-S | Kill Confirmed', 'USP-S | Kill Confirmed (Field-Tested)', 'Pistol', 'covert', 'Field-Tested', 65000000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j_OrfdqWhe5sN4mOTE8bP4jVC9vh5yZzzyc9TGc1M5NQqB-FS5kOm-05ftup6fznphuHIl4SvczkPjn1gSOY4lV8vE'),
  ('00000001-0000-0000-0000-000000000011', 'AK-47 | Vulcan', 'AK-47 | Vulcan (Field-Tested)', 'Rifle', 'classified', 'Field-Tested', 85000000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV0924l4GSqP_xMq3ejlRd4cJ5nqfEp9rw0A2wqkRkNT_yItOXcgFsN1HYr1S9wbruh5fouZian3A1uCE8pSGKcZg0b1A'),
  ('00000001-0000-0000-0000-000000000012', 'M4A4 | The Emperor', 'M4A4 | The Emperor (Field-Tested)', 'Rifle', 'classified', 'Field-Tested', 32000000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alIITfn2xV_Pp_g_eY99Sn0VDk_0Y-Z2CmJo6UIQ84aVnWr1i8k7vvh8Pq7smazCBgviQh4C2OmEbmhQYMMLInxX2s8A'),
  ('00000001-0000-0000-0000-000000000013', 'Desert Eagle | Printstream', 'Desert Eagle | Printstream (Field-Tested)', 'Pistol', 'classified', 'Field-Tested', 45000000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PDdTjlH_9mkgL-OlvD4NoTck29Y_cg_2rDHodSn3AHi_ERvYmGncNSddgc3NFnYr1O9wermjMTvuZ-byXBmuSE8pSGKhWc7_nU'),
  ('00000001-0000-0000-0000-000000000014', 'USP-S | Cortex', 'USP-S | Cortex (Field-Tested)', 'Pistol', 'classified', 'Field-Tested', 9500000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j_OrfdqWdY781lxOiSrNug0VXt_kdsZmrwJ4fAcwU4N12D-Vjqwb3rh8K6vcucnHdgvCI8pSGKG6zZ760'),
  ('00000001-0000-0000-0000-000000000015', 'Glock-18 | Water Elemental', 'Glock-18 | Water Elemental (Field-Tested)', 'Pistol', 'restricted', 'Field-Tested', 6500000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKA5v2t03iF195NOJh5SOkvPLPr7Vn35cpsB03-3A8Nug2Fbt-xVpMT_6INPAcA85YF-F_wO-wOft15G975_Kn3RruiMi4ivcnAv3309aL_T7Yg'),
  ('00000001-0000-0000-0000-000000000016', 'AWP | Atheris', 'AWP | Atheris (Field-Tested)', 'Sniper Rifle', 'restricted', 'Field-Tested', 4500000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17P7NdTRH-t26q4SZlvD7PYTQgXtu5Mx2gv2P8Nug31fkqUo-Zz_ydo_AdFQ3Ml2C-1i3xevrhMS_uZvBnXZjvCJ3-z-DyG2qS1zW'),
  ('00000001-0000-0000-0000-000000000017', 'P250 | Valence', 'P250 | Valence (Field-Tested)', 'Pistol', 'milspec', 'Field-Tested', 1200000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopujwezhjxszYI2gS0924l4GSqP_xMq3ejlRd4cJ5nqfEp9rw0A2wqkRkNT_yItOXcgFsN1HYr1S9wbruh5fouZian3A1uCE8pSGKcZg0b1A'),
  ('00000001-0000-0000-0000-000000000018', 'AK-47 | Safari Mesh', 'AK-47 | Safari Mesh (Field-Tested)', 'Rifle', 'consumer', 'Field-Tested', 500000, 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV08y5nY6fqPP9ILrDhGpI18h0juDU-MKt0QLg_kdvamqlJITAdgA4aV-G-QC_yL3og5a8vZvOynI1uCIh-z-DyOCmJ9B4')
ON CONFLICT (id) DO NOTHING;

-- 2. Keyslar (Cases) Jadvali
INSERT INTO public.cases (id, slug, name, category, price, image_url, is_free, is_active) VALUES
  ('00000002-0000-0000-0000-000000000001', 'daily-free', 'Kunlik Bepul Keys', 'free', 0, 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80', true, true),
  ('00000002-0000-0000-0000-000000000002', 'starter-noob', 'CS2 Boshlang''ich Keys', 'popular', 1500000, 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80', false, true),
  ('00000002-0000-0000-0000-000000000003', 'covert-beasts', 'Covert Yirtqichlar', 'popular', 4500000, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&q=80', false, true),
  ('00000002-0000-0000-0000-000000000004', 'awp-master', 'AWP Snayper Masters', 'weapons', 8500000, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&q=80', false, true),
  ('00000002-0000-0000-0000-000000000005', 'knife-hype', 'Pichoqlar Xazinasi', 'exclusive', 35000000, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', false, true),
  ('00000002-0000-0000-0000-000000000006', 'high-roller', 'High Roller VIP', 'exclusive', 120000000, 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&q=80', false, true)
ON CONFLICT (id) DO NOTHING;

-- 3. Keyslarga Skinlarni Biriktirish va Drop Ehtimolliklari (Case Items & Weights)
-- Starter Noob Case
INSERT INTO public.case_items (case_id, item_id, drop_weight) VALUES
  ('00000002-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000018', 6000), -- Safari Mesh (60%)
  ('00000002-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000017', 2500), -- P250 Valence (25%)
  ('00000002-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000015', 1000), -- Water Elemental (10%)
  ('00000002-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000014', 450),  -- USP Cortex (4.5%)
  ('00000002-0000-0000-0000-000000000002', '00000001-0000-0000-0000-000000000009', 50)    -- AK Asiimov (0.5%)
ON CONFLICT DO NOTHING;

-- Covert Beasts Case
INSERT INTO public.case_items (case_id, item_id, drop_weight) VALUES
  ('00000002-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000016', 5500), -- Atheris (55%)
  ('00000002-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000014', 2500), -- Cortex (25%)
  ('00000002-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000012', 1200), -- The Emperor (12%)
  ('00000002-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000010', 600),  -- Kill Confirmed (6%)
  ('00000002-0000-0000-0000-000000000003', '00000001-0000-0000-0000-000000000007', 200)   -- Fire Serpent (2%)
ON CONFLICT DO NOTHING;

-- Knife Hype Case
INSERT INTO public.case_items (case_id, item_id, drop_weight) VALUES
  ('00000002-0000-0000-0000-000000000005', '00000001-0000-0000-0000-000000000011', 5000), -- AK Vulcan (50%)
  ('00000002-0000-0000-0000-000000000005', '00000001-0000-0000-0000-000000000008', 3000), -- AWP Asiimov (30%)
  ('00000002-0000-0000-0000-000000000005', '00000001-0000-0000-0000-000000000004', 1200), -- Skeleton Crimson Web (12%)
  ('00000002-0000-0000-0000-000000000005', '00000001-0000-0000-0000-000000000002', 600),  -- Karambit Doppler (6%)
  ('00000002-0000-0000-0000-000000000005', '00000001-0000-0000-0000-000000000001', 200)   -- Butterfly Fade (2%)
ON CONFLICT DO NOTHING;

-- 4. Demo Admin va Foydalanuvchilar
INSERT INTO public.users (id, username, role, is_banned, trade_url) VALUES
  ('00000003-0000-0000-0000-000000000001', 'Admin', 'SUPER_ADMIN', false, 'https://steamcommunity.com/tradeoffer/new/?partner=10000001&token=AdminToken'),
  ('00000003-0000-0000-0000-000000000002', 'UzProPlayer', 'USER', false, 'https://steamcommunity.com/tradeoffer/new/?partner=20000002&token=PlayerToken')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.wallets (id, user_id, balance, bonus_balance, currency) VALUES
  ('00000004-0000-0000-0000-000000000001', '00000003-0000-0000-0000-000000000001', 10000000000, 0, 'UZS'),
  ('00000004-0000-0000-0000-000000000002', '00000003-0000-0000-0000-000000000002', 50000000, 1000000, 'UZS')
ON CONFLICT (id) DO NOTHING;
