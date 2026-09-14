# MAHSULOTNI ISHLAB CHIQARISH VA AMALGA OSHIRISH REJASI (IMPLEMENTATION PLAN)

**Loyiha:** CSSKINUZ (SKINOZ Uslubidagi Professional CS2 Skin Platformasi)  
**Versiya:** 1.0.0 Production Blueprint  
**Til:** O'zbek tili  
**Holati:** Bajarishga qabul qilingan  

---

## 1. TIZIM ARXITEKTURASI VA LOYIHA TUZILISHI

Platforma monolit yadroning modulli arxitekturasi (**Modular Monolith**) va asinxron workerlar asosida quriladi. Bu texnik barqarorlik, yuqori tezlik (low latency), atomik tranzaksiyalar xavfsizligi va qulay servis boshqaruvini ta'minlaydi.

### 1.1. Loyiha Katalogi Strukturasi
```text
csskinuz/
├── apps/
│   ├── web/                     # Frontend (React 19, Vite, TailwindCSS, Framer Motion, Zustand)
│   │   ├── src/
│   │   │   ├── components/      # Atomik UI komponentlar (Buttons, Modals, Cards, LiveBar)
│   │   │   ├── features/        # Modul bo'yicha komponentlar (cases, upgrade, battles, inventory)
│   │   │   ├── hooks/           # Maxsus React hooklar (useWallet, useAuth, useWebSocket)
│   │   │   ├── stores/          # Zustand holat menejerlari
│   │   │   ├── pages/           # Asosiy marshrutlar
│   │   │   ├── services/        # API va WebSocket klientlari
│   │   │   └── types/           # Frontend TypeScript turlari
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.ts
│   ├── api/                     # Backend API & WebSocket Server (Node.js, Express/Fastify, TypeScript)
│   │   ├── src/
│   │   │   ├── config/          # Muhit sozlamalari va konstantalar
│   │   │   ├── database/        # Ma'lumotlar bazasi adapteri, migratsiyalar va modellar
│   │   │   ├── modules/         # Biznes modullari
│   │   │   │   ├── auth/        # Telegram initData & Steam OpenID
│   │   │   │   ├── wallet/      # Hamyon va tranzaksion ledger
│   │   │   │   ├── inventory/   # Server-authoritative inventar
│   │   │   │   ├── cases/       # Keyslar ochish va drop ehtimolliklari
│   │   │   │   ├── provably-fair/# HMAC-SHA256 RNG mexanizmi
│   │   │   │   ├── upgrade/     # Apgreyd logikasi
│   │   │   │   ├── battles/     # Case Battle PvP & AI bots
│   │   │   │   ├── trade/       # Savdo va skin ayirboshlash
│   │   │   │   ├── payments/    # Payme, Click, Uzum, Crypto shlyuzlari
│   │   │   │   ├── steam/       # Steam Web API va Trade Bot service
│   │   │   │   ├── telegram/    # Telegram Bot & Notification Dispatcher
│   │   │   │   └── admin/       # Admin boshqaruv va audit
│   │   │   ├── middleware/      # Auth, RateLimit, Idempotency, ErrorHandler
│   │   │   ├── websocket/       # Realtime Live Drops & Battle Hub
│   │   │   └── index.ts         # Asosiy kirish nuqtasi
│   │   ├── package.json
│   │   └── tsconfig.json
├── docs/                        # Barcha tahlil va arxitektura hujjatlari
├── scripts/                     # Build, migratsiya va test skriptlari
├── build.sh                     # Ishlab chiqarish build skripti (Bash)
├── start.sh                     # Ishlab chiqarish ishga tushirish skripti (Bash)
├── package.json                 # Monorepo ildiz konfiguratsiyasi
└── README.md                    # Loyihani ishga tushirish qo'llanmasi
```

---

## 2. MODULLAR VA BOG'LIQLIKLAR MATRITSASI

1. **`AuthModule`**: Foydalanuvchini identifikatsiya qiladi, JWT generatsiya qiladi. Bog'liq: `Database`.
2. **`ProvablyFairModule`**: Tasodifiylik urug'lari (`ServerSeed`, `ClientSeed`, `Nonce`) va xeshlarini yaratadi. Hech qanday tashqi modulga bog'liq emas.
3. **`WalletModule`**: Balansni atomik tarzda o'zgartiradi, `wallet_transactions` ga o'chmas ledger yozadi. Bog'liq: `Database`.
4. **`InventoryModule`**: Skinlar holatini (`AVAILABLE`, `LOCKED`, `SOLD`, `WITHDRAWN`, `UPGRADED`) boshqaradi. Bog'liq: `Database`.
5. **`CaseEngine`**: Balansdan pul yechadi (`WalletModule`), RNG orqali yutuqni aniqlaydi (`ProvablyFairModule`), inventarga skin qo'shadi (`InventoryModule`) va real-time broadcast yuboradi (`WebSocketGateway`).
6. **`UpgradeEngine`**: Tikilgan skin yoki balansni qulflaydi/yechadi, maqsadli skin uchun ehtimollikni hisoblaydi, g'alaba bo'lsa yangi skin beradi, yutqazsa tikilgan skinni yo'q qiladi.
7. **`BattleEngine`**: 2-4 o'yinchili xonalarni sinxronlashtiradi, har bir raund uchun drop beradi va eng yuqori summa yig'ganga barcha skinlarni o'tkazadi.
8. **`SteamService`**: Trade offerlar navbatini qayta ishlaydi, botlar zaxirasini tekshiradi va 2FA orqali o'yinchiga yuboradi.
9. **`TelegramService`**: Mini App `initData` tekshiruvi, bot buyruqlari va muhim tranzaksiyalar (depozit, yechish) haqida shaxsiy xabarnomalar.
10. **`AdminModule`**: Barcha o'yinlar, moliyaviy oqimlar, foydalanuvchilar va audit jurnallarini boshqarish.

---

## 3. MA'LUMOTLAR BAZASI VA TRANZAKSIYALAR XAVFSIZLIGI STRATEGIYASI

1. **Butun Sonli Pul Birligi:** Suzuvchi nuqta (float) muammosidan qochish uchun barcha balanslar va narxlar butun sonlarda (integer minor units — tiyinlarda) saqlanadi. Masalan, $10,000\text{ UZS} = 1000000\text{ tiyin}$.
2. **Tranzaksion Qulflar (Row-Level Locking):** Har qanday moliyaviy yoki inventar amali bajarilishida `BEGIN TRANSACTION` ichida `SELECT ... FOR UPDATE` orqali balans va skin qatori qulflanadi. Bu poyga holatlarini (Race Conditions) 100% bartaraf etadi.
3. **Idempotency Nazorati:** Barcha to'lov va keys ochish amallari mijozdan `Idempotency-Key` (UUID) talab qiladi. Bir xil kalit bilan takroriy so'rov kelsa, operatsiya qayta bajarilmay, avvalgi natija qaytariladi.

---

## 4. XAVFSIZLIK VA RED-TEAM HIMOYA QATLAMLARI

* **Rate Limiting:** IP va User ID bo'yicha cheklovlar (masalan, 1 daqiqada 60 ta umumiy API so'rovi, 1 daqiqada 10 ta keys ochish so'rovi).
* **IDOR Himoyasi:** Har bir inventar so'rovida `WHERE id = :item_id AND user_id = :auth_user_id` sharti qat'iy tekshiriladi.
* **Telegram Auth Soxtalashtirishiga Qarshi:** Bot tokeni orqali HMAC-SHA256 imzosi tekshiriladi va `auth_date` muddati 24 soatdan oshmaganligi nazorat qilinadi.
* **Steam Trade Hold Filtratsiyasi:** Foydalanuvchining Steam Guard holati tekshirilib, savdo cheklovi (Escrow Hold) bo'lsa, skin chiqarish rad etiladi.

---

## 5. SINOV VA VALIDATSIYA STRATEGIYASI (TESTING BLUEPRINT)

1. **Unit Testlar:**
   - Provably Fair matematik algoritmi (HMAC-SHA256) kutilgan natija berishini tekshirish.
   - Apgreyd ehtimolligi va House Edge hisob-kitoblari.
   - Telegram `initData` imzo tekshiruvchisi.
2. **Integratsion va Konkursiya Testlari:**
   - Parallel 10 ta keys ochish so'rovi (Balans manfiyga tushmasligi va faqat yetarli pulga ochilishi).
   - Bir vaqtda bitta skinni ikkita alohida apgreydga tikishga urinish (faqat bittasi o'tishi kerak).
   - Takroriy depozit webhooki (faqat 1 marta hisob to'ldirilishi kerak).
3. **E2E Oqim Sinovlari:**
   - Ro'yxatdan o'tish $\rightarrow$ Depozit $\rightarrow$ Keys ochish $\rightarrow$ Skinni sotish $\rightarrow$ Apgreyd qilish $\rightarrow$ Steamga yechib olish so'rovi.

---

## 6. PRODUCTION DEPLOYMENT VA ISHGA TUSHIRISH

* **Build:** `bash build.sh` — Barcha paketlarni o'rnatadi, TypeScript kodini kompilyatsiya qiladi va Frontend static assetlarini ishlab chiqarish rejimida optimallashtiradi.
* **Start:** `bash start.sh` — Backend API serverini va Frontend servisini production portlarida ishga tushiradi, sog'lomlik tekshiruvini (Healthcheck) amalga oshiradi.
