import { v4 as uuidv4 } from 'uuid';
import { getDatabase, runTransaction } from './index.js';

export function seedDatabase() {
  const db = getDatabase();

  return runTransaction(() => {
    // 1. Admin va Demo foydalanuvchilar
    const adminUser = db.prepare('SELECT id FROM users WHERE username = ?').get('Admin');
    if (!adminUser) {
      const adminId = 'admin_user_001';
      db.prepare(`
        INSERT INTO users (id, username, role, is_banned)
        VALUES (?, 'Admin', 'SUPER_ADMIN', 0)
      `).run(adminId);

      db.prepare(`
        INSERT INTO wallets (id, user_id, balance, bonus_balance)
        VALUES (?, ?, 10000000000, 0)
      `).run(uuidv4(), adminId); // 100,000,000 UZS

      db.prepare(`
        INSERT INTO user_profiles (user_id, trade_url)
        VALUES (?, 'https://steamcommunity.com/tradeoffer/new/?partner=10000001&token=AdminSecretToken')
      `).run(adminId);
    }

    const demoUser = db.prepare('SELECT id FROM users WHERE username = ?').get('UzProPlayer');
    if (!demoUser) {
      const demoId = 'demo_user_001';
      db.prepare(`
        INSERT INTO users (id, username, role, is_banned, telegram_id)
        VALUES (?, 'UzProPlayer', 'USER', 0, 99890123456)
      `).run(demoId);

      db.prepare(`
        INSERT INTO wallets (id, user_id, balance, bonus_balance)
        VALUES (?, ?, 50000000, 0)
      `).run(uuidv4(), demoId); // 500,000 UZS

      db.prepare(`
        INSERT INTO user_profiles (user_id, trade_url)
        VALUES (?, 'https://steamcommunity.com/tradeoffer/new/?partner=20000002&token=PlayerSecretToken')
      `).run(demoId);
    }

    // 2. CS2 Skinlar bazasi
    const skinsData = [
      // Special (Pichoqlar)
      { name: 'Butterfly Knife | Fade', market_hash_name: 'Butterfly Knife | Fade (Factory New)', weapon_type: 'Knife', rarity: 'special', exterior: 'FN', base_price: 1800000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf1fLEcjVL49KJlY20k_jkI7fUhGJP68twj-3I4IG7jAzm_xVoYWr2doWRcARrZQ2F8wS3ye-61pW16ZzOyXBi7yV37SuPzBfhn1gSOa-QvLqQ' },
      { name: 'Karambit | Doppler', market_hash_name: 'Karambit | Doppler (Factory New)', weapon_type: 'Knife', rarity: 'special', exterior: 'FN', base_price: 1450000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20k_jkI7fUhGJP68tzteTE8DXi2Vbt-0ZoZTjydoXBcQc2N1jUrFS-x-rngZe77cmfznBi73Ym5SqMnwv3309aL0N4ug' },
      { name: 'M9 Bayonet | Gamma Doppler', market_hash_name: 'M9 Bayonet | Gamma Doppler (Factory New)', weapon_type: 'Knife', rarity: 'special', exterior: 'FN', base_price: 1300000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf3qr3czhx5ci5q5CKqPrxN7LEmyUB7ZYk0-vFpIrz2wzn_ENtYGD3LNPHdQBoZQvT81S4yLzuhMW_uZqanXBrsnI8pSGKw-L7K40' },
      { name: 'Skeleton Knife | Crimson Web', market_hash_name: 'Skeleton Knife | Crimson Web (Field-Tested)', weapon_type: 'Knife', rarity: 'special', exterior: 'FT', base_price: 950000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThH_9m7h5C0mfL1Ja_ummJW4NE_0ruS892njVC1_EY9Zjr3co7GIQJvZ12Fq1jvxrq715Xpu57JmnpguiMr-z-DyP2hP_d4' },

      // Covert (Qizil)
      { name: 'AWP | Dragon Lore', market_hash_name: 'AWP | Dragon Lore (Field-Tested)', weapon_type: 'Sniper Rifle', rarity: 'covert', exterior: 'FT', base_price: 4500000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0n_L1JaKfzzoGuMlOjede0uvFrInwigK2_UduYTjzJ4_AIA8-YlqErlnq35S7tJXBzXFiuCY8pSGK_kF_q08' },
      { name: 'M4A4 | Howl', market_hash_name: 'M4A4 | Howl (Field-Tested)', weapon_type: 'Rifle', rarity: 'covert', exterior: 'FT', base_price: 3200000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwW09izh5CAlvDzPYTZk2pH8Ytz2rqTrN-h2gTm-0BoMTigLdPAJ1VqZgnXqFe3l-ruh5fouZ2anHA1uyF35y2LmEOyghgZbeBr' },
      { name: 'AK-47 | Fire Serpent', market_hash_name: 'AK-47 | Fire Serpent (Field-Tested)', weapon_type: 'Rifle', rarity: 'covert', exterior: 'FT', base_price: 850000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV08y5nY6fqPP9ILrDhGpI18h0juDU-MKt0QLg_kdvamqlJITAdgA4aV-G-QC_yL3og5a8vZvOynI1uCIh-z-DyOCmJ9B4' },
      { name: 'AWP | Asiimov', market_hash_name: 'AWP | Asiimov (Field-Tested)', weapon_type: 'Sniper Rifle', rarity: 'covert', exterior: 'FT', base_price: 125000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17P7NdTRH-t26q4SZlvD7PYTQgXtu5Mx2gv2PoI-t3wW3_0VsMDr7coedegI_ZgvR_VO5k7q7jJTpu5_BmiZiu3Yn4SvczUGw1BlSLrs4003r-iM' },
      { name: 'AK-47 | Asiimov', market_hash_name: 'AK-47 | Asiimov (Field-Tested)', weapon_type: 'Rifle', rarity: 'covert', exterior: 'FT', base_price: 45000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV08-5lpKKqPrxN7LEmyUH68R32bzHp46t2wW2-BFlNW_2doXBcQFsNFrSrFi4xevuh8S57Zqbm3Zh6Sg8pSGK4E7a4Hk' },
      { name: 'USP-S | Kill Confirmed', market_hash_name: 'USP-S | Kill Confirmed (Field-Tested)', weapon_type: 'Pistol', rarity: 'covert', exterior: 'FT', base_price: 65000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j_OrfdqWhe5sN4mOTE8bP4jVC9vh5yZzzyc9TGc1M5NQqB-FS5kOm-05ftup6fznphuHIl4SvczkPjn1gSOY4lV8vE' },

      // Classified (Pushti)
      { name: 'AK-47 | Vulcan', market_hash_name: 'AK-47 | Vulcan (Field-Tested)', weapon_type: 'Rifle', rarity: 'classified', exterior: 'FT', base_price: 85000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV0924l4GSqP_xMq3ejlRd4cJ5nqfEp9rw0A2wqkRkNT_yItOXcgFsN1HYr1S9wbruh5fouZian3A1uCE8pSGKcZg0b1A' },
      { name: 'M4A4 | The Emperor', market_hash_name: 'M4A4 | The Emperor (Field-Tested)', weapon_type: 'Rifle', rarity: 'classified', exterior: 'FT', base_price: 32000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alIITfn2xV_Pp_g_eY99Sn0VDk_0Y-Z2CmJo6UIQ84aVnWr1i8k7vvh8Pq7smazCBgviQh4C2OmEbmhQYMMLInxX2s8A' },
      { name: 'Desert Eagle | Printstream', market_hash_name: 'Desert Eagle | Printstream (Field-Tested)', weapon_type: 'Pistol', rarity: 'classified', exterior: 'FT', base_price: 45000000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PDdTjlH_9mkgL-OlvD4NoTck29Y_cg_2rDHodSn3AHi_ERvYmGncNSddgc3NFnYr1O9wermjMTvuZ-byXBmuSE8pSGKhWc7_nU' },
      { name: 'USP-S | Cortex', market_hash_name: 'USP-S | Cortex (Field-Tested)', weapon_type: 'Pistol', rarity: 'classified', exterior: 'FT', base_price: 9500000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j_OrfdqWdY781lxOiSrNug0VXt_kdsZmrwJ4fAcwU4N12D-Vjqwb3rh8K6vcucnHdgvCI8pSGKG6zZ760' },

      // Restricted (Binafsha)
      { name: 'Glock-18 | Water Elemental', market_hash_name: 'Glock-18 | Water Elemental (Field-Tested)', weapon_type: 'Pistol', rarity: 'restricted', exterior: 'FT', base_price: 6500000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposbaqKA5v2t03iF195NOJh5SOkvPLPr7Vn35cpsB03-3A8Nug2Fbt-xVpMT_6INPAcA85YF-F_wO-wOft15G975_Kn3RruiMi4ivcnAv3309aL_T7Yg' },
      { name: 'AWP | Atheris', market_hash_name: 'AWP | Atheris (Field-Tested)', weapon_type: 'Sniper Rifle', rarity: 'restricted', exterior: 'FT', base_price: 4500000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17P7NdTRH-t26q4SZlvD7PYTQgXtu5Mx2gv2P8Nug31fkqUo-Zz_ydo_AdFQ3Ml2C-1i3xevrhMS_uZvBnXZjvCJ3-z-DyG2qS1zW' },
      { name: 'M4A1-S | Decimator', market_hash_name: 'M4A1-S | Decimator (Field-Tested)', weapon_type: 'Rifle', rarity: 'restricted', exterior: 'FT', base_price: 8500000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhz2v_Nfz5H_uO1gb-Gw_alIITfn2xV_Pp_g_eY99Sn0VDk_0Y-Z2CmJo6UIQ84aVnWr1i8k7vvh8Pq7smazCBgviQh4C2OmEbmhQYMMLInxX2s8A' },
      { name: 'MP9 | Mount Fuji', market_hash_name: 'MP9 | Mount Fuji (Field-Tested)', weapon_type: 'SMG', rarity: 'restricted', exterior: 'FT', base_price: 3500000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou6r8FABt177FSShS49Gzh4-0m_7zO6-fzj9V650p2rvE8Nus0AXi_UNrZ2rzdoGQJwVqYF2Cq1S-yee6hsC0vc7MyCR9-n51F7kK96U' },

      // Mil-spec (Ko'k) & Consumer
      { name: 'P250 | Valence', market_hash_name: 'P250 | Valence (Field-Tested)', weapon_type: 'Pistol', rarity: 'milspec', exterior: 'FT', base_price: 1200000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpopujwezhjxszYI2gS0924l4GSqP_xMq3ejlRd4cJ5nqfEp9rw0A2wqkRkNT_yItOXcgFsN1HYr1S9wbruh5fouZian3A1uCE8pSGKcZg0b1A' },
      { name: 'USP-S | Flashback', market_hash_name: 'USP-S | Flashback (Field-Tested)', weapon_type: 'Pistol', rarity: 'milspec', exterior: 'FT', base_price: 1500000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpoo6m1FBRp3_bGcjhQ09-jq5WYh8j_OrfdqWhe5sN4mOTE8bP4jVC9vh5yZzzyc9TGc1M5NQqB-FS5kOm-05ftup6fznphuHIl4SvczkPjn1gSOY4lV8vE' },
      { name: 'AK-47 | Safari Mesh', market_hash_name: 'AK-47 | Safari Mesh (Field-Tested)', weapon_type: 'Rifle', rarity: 'consumer', exterior: 'FT', base_price: 500000, image_url: 'https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV08y5nY6fqPP9ILrDhGpI18h0juDU-MKt0QLg_kdvamqlJITAdgA4aV-G-QC_yL3og5a8vZvOynI1uCIh-z-DyOCmJ9B4' },
    ];

    const insertedSkinMap: { [name: string]: string } = {};

    for (const skin of skinsData) {
      let existing = db.prepare('SELECT id FROM items WHERE market_hash_name = ?').get(skin.market_hash_name) as any;
      let itemId = existing?.id;
      if (!itemId) {
        itemId = uuidv4();
        db.prepare(`
          INSERT INTO items (
            id, market_hash_name, name, weapon_type, rarity, exterior, base_price, image_url
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          itemId,
          skin.market_hash_name,
          skin.name,
          skin.weapon_type,
          skin.rarity,
          skin.exterior,
          skin.base_price,
          skin.image_url
        );
      }
      insertedSkinMap[skin.name] = itemId;
    }

    // 3. Keyslar yaratish
    const casesData = [
      {
        slug: 'knife-odyssey',
        name: 'Knife Odyssey (Pichoqlar)',
        category: 'knives',
        price: 25000000, // 250,000 UZS
        image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=500&q=80',
        is_free: 0,
        sort_order: 1,
        items: [
          { name: 'Butterfly Knife | Fade', weight: 10 },
          { name: 'Karambit | Doppler', weight: 20 },
          { name: 'M9 Bayonet | Gamma Doppler', weight: 30 },
          { name: 'Skeleton Knife | Crimson Web', weight: 60 },
          { name: 'AWP | Asiimov', weight: 200 },
          { name: 'AK-47 | Vulcan', weight: 300 },
          { name: 'USP-S | Cortex', weight: 600 },
          { name: 'Glock-18 | Water Elemental', weight: 800 },
        ],
      },
      {
        slug: 'covert-dreams',
        name: 'Covert Dreams (Maxfiy)',
        category: 'popular',
        price: 6500000, // 65,000 UZS
        image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80',
        is_free: 0,
        sort_order: 2,
        items: [
          { name: 'Karambit | Doppler', weight: 5 },
          { name: 'AWP | Dragon Lore', weight: 2 },
          { name: 'AWP | Asiimov', weight: 50 },
          { name: 'AK-47 | Asiimov', weight: 120 },
          { name: 'AK-47 | Vulcan', weight: 180 },
          { name: 'M4A4 | The Emperor', weight: 350 },
          { name: 'USP-S | Cortex', weight: 1200 },
          { name: 'Glock-18 | Water Elemental', weight: 3500 },
          { name: 'P250 | Valence', weight: 4500 },
        ],
      },
      {
        slug: 'budget-rush',
        name: 'Budget Rush (Arzon)',
        category: 'budget',
        price: 1500000, // 15,000 UZS
        image_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=500&q=80',
        is_free: 0,
        sort_order: 3,
        items: [
          { name: 'AK-47 | Asiimov', weight: 15 },
          { name: 'USP-S | Cortex', weight: 80 },
          { name: 'Glock-18 | Water Elemental', weight: 250 },
          { name: 'AWP | Atheris', weight: 450 },
          { name: 'M4A1-S | Decimator', weight: 350 },
          { name: 'MP9 | Mount Fuji', weight: 900 },
          { name: 'USP-S | Flashback', weight: 3500 },
          { name: 'AK-47 | Safari Mesh', weight: 4400 },
        ],
      },
      {
        slug: 'daily-free-case',
        name: 'Kunlik Bepul Keys (Daily Free)',
        category: 'free',
        price: 0,
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
        is_free: 1,
        sort_order: 0,
        items: [
          { name: 'AWP | Asiimov', weight: 1 },
          { name: 'AK-47 | Vulcan', weight: 5 },
          { name: 'USP-S | Cortex', weight: 30 },
          { name: 'AWP | Atheris', weight: 150 },
          { name: 'MP9 | Mount Fuji', weight: 400 },
          { name: 'P250 | Valence', weight: 3000 },
          { name: 'AK-47 | Safari Mesh', weight: 6414 },
        ],
      },
    ];

    for (const c of casesData) {
      let caseRow = db.prepare('SELECT id FROM cases WHERE slug = ?').get(c.slug) as any;
      let caseId = caseRow?.id;

      if (!caseId) {
        caseId = uuidv4();
        db.prepare(`
          INSERT INTO cases (id, slug, name, category, price, image_url, is_free, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(caseId, c.slug, c.name, c.category, c.price, c.image_url, c.is_free, c.sort_order);
      }

      // Keys ichidagi skinlarni biriktirish
      for (const itemRef of c.items) {
        const itemId = insertedSkinMap[itemRef.name];
        if (itemId) {
          db.prepare(`
            INSERT OR REPLACE INTO case_items (id, case_id, item_id, drop_weight)
            VALUES (?, ?, ?, ?)
          `).run(uuidv4(), caseId, itemId, itemRef.weight);
        }
      }
    }

    // 4. Promo Kodlar
    const promoCodes = [
      { code: 'CSSKIN2026', bonus_percent: 15 },
      { code: 'WELCOME', bonus_percent: 20 },
      { code: 'VIPUZ', bonus_percent: 25 },
    ];

    for (const promo of promoCodes) {
      db.prepare(`
        INSERT OR IGNORE INTO promo_codes (id, code, bonus_percent, is_active)
        VALUES (?, ?, ?, 1)
      `).run(uuidv4(), promo.code, promo.bonus_percent);
    }

    console.log('✅ Ma\'lumotlar bazasi muvaffaqiyatli seeder orqali to\'ldirildi!');
  });
}

// Agar to'g'ridan-to'g'ri ishga tushirilsa
if (process.argv[1]?.includes('seeder')) {
  seedDatabase();
}
