# TIZIM ARXITEKTURASI HUJJATI (SYSTEM ARCHITECTURE DESIGN)

**Loyiha:** SKINOZ / csskinuz  
**Hujjat versiyasi:** 1.0.0  
**Holati:** Ishlab chiqish uchun tasdiqlangan arxitektura  
**Til:** O'zbek tili  

---

## 1. YUQORI DARAJADAGI TIZIM STRUKTURASI (HIGH-LEVEL ARCHITECTURE)

Platforma yuqori unumdorlik, xavfsizlik va o'yin jarayonining kechikishsiz (low-latency) ishlashini ta'minlash uchun **Modulli Monolit (Modular Monolith) + Ixtisoslashtirilgan Workerlar Klasteri** arxitekturasi asosida quriladi.

```mermaid
graph TB
    subgraph "Clients Layer"
        WebClient["Web Brauzer (Desktop/Mobile)"]
        TMAClient["Telegram Mini App (TMA)"]
        AdminClient["Admin Boshqaruv Paneli"]
    end

    subgraph "Edge & Ingress Layer"
        Cloudflare["Cloudflare (DDoS, WAF, SSL, CDN)"]
        Nginx["Nginx Reverse Proxy & Load Balancer"]
    end

    subgraph "Application Core Layer"
        APIGateway["Core API Server (Fastify / NestJS)"]
        WSGateway["WebSocket Realtime Gateway"]
        AuthModule["Auth & Identity Engine"]
        WalletModule["Wallet & Ledger Engine"]
        GameModule["Game Engine (Cases, Upgrade, Battles)"]
        PFEngine["Provably Fair RNG Engine"]
    end

    subgraph "Asynchronous Workers & Queues"
        RedisQueue["Redis 7 (BullMQ Queues & Pub/Sub)"]
        SteamCluster["Steam Trade Bot Cluster (Workers)"]
        PaymentWorker["Payment Webhook & Reconciliation Worker"]
        NotificationWorker["Telegram Bot Notification Worker"]
    end

    subgraph "Storage & Data Persistence"
        Postgres[(PostgreSQL 16 Primary DB)]
        RedisCache[(Redis In-Memory Cache & Locks)]
        S3Storage[(S3 / MinIO Media CDN)]
    end

    subgraph "External Integrations"
        SteamAPI["Steam Community / Web API"]
        PaymentProviders["Payme / Click / Uzum / Crypto Gateways"]
        TelegramAPI["Telegram Bot API"]
    end

    WebClient --> Cloudflare
    TMAClient --> Cloudflare
    AdminClient --> Cloudflare
    Cloudflare --> Nginx
    Nginx --> APIGateway
    Nginx --> WSGateway

    APIGateway --> AuthModule
    APIGateway --> WalletModule
    APIGateway --> GameModule
    GameModule --> PFEngine

    APIGateway --> Postgres
    APIGateway --> RedisCache
    WSGateway --> RedisQueue

    APIGateway --> RedisQueue
    RedisQueue --> SteamCluster
    RedisQueue --> PaymentWorker
    RedisQueue --> NotificationWorker

    SteamCluster --> SteamAPI
    PaymentWorker --> PaymentProviders
    NotificationWorker --> TelegramAPI
    PaymentProviders --> APIGateway
```

---

## 2. ASOSIY KOMPONENTLAR VA ULARNING VAZIFALARI

### 2.1. Mijozlar Qatlami (Client Layer)
* **Web Ilova (Desktop & Mobile):** Next.js 14+ (App Router) yoki React 19 + Vite. SSR/SSG yordamida SEO optimallashtirilgan sahifalar, mijoz tomonida esa Canvas/Framer Motion bilan 60 FPS silliq ochilish animatsiyalari.
* **Telegram Mini App (TMA):** `@telegram-apps/sdk` orqali Telegram kontekstida ishlovchi, tebranish (Haptic Feedback), xavfsiz to'lov va yopilishni oldini olish xususiyatlariga ega mobil interfeys.
* **Admin Dashboard:** Xavfsiz, faqat oq ro'yxatdagi IP lar uchun ochiq boshqaruv tizimi (React + Shadcn UI).

### 2.2. Asosiy Backend Server (Core API Server)
* **Texnologiya:** Node.js (TypeScript) + Fastify (yoki NestJS) yuqori so'rov o'tkazish qobiliyati (RPS) uchun.
* **Asosiy Modullar:**
  1. `AuthModule`: Telegram `initData` HMAC tekshiruvi, Steam OpenID 2.0 sessiyalari, JWT rotatsiyasi.
  2. `WalletModule`: Tranzaksiyalar izolyatsiyasi, manfiy balansdan himoya, ikki tomonlama buxgalteriya.
  3. `GameModule`: Keys ochish, apgreyd ehtimolliklari, PvP janglar mantig'i.
  4. `ProvablyFairModule`: Kriptografik tasodifiylik generatsiyasi.

### 2.3. Real Vaqt Gateway (WebSocket Gateway)
* **Texnologiya:** `Socket.io` yoki `uWebSockets.js` Redis Adapter bilan.
* **Kanallar (Rooms/Topics):**
  - `global:live_drops` — Butun platformadagi yangi yutuqlar oqimi.
  - `battle:{id}` — Jonli keys jangi xonasi o'yinchilari va tomoshabinlari uchun sinxron holat.
  - `user:{id}` — Shaxsiy bildirishnomalar (Trade taklifi keldi, depozit o'tdi).

### 2.4. Steam Savdo Botlari Klasteri (Steam Worker Cluster)
* **Vazifasi:** Steam platformasida skinlarni xavfsiz qabul qilish va foydalanuvchilarning Steam hisobiga Trade Offer orqali yetkazib berish.
* **Tuzilishi:**
  - Har bir bot alohida worker jarayoni sifatida ishlaydi (`node-steam-tradeoffer-manager`, `steam-totp`).
  - Botlarning holati (Online, Busy, RateLimited, Banned) Redis da saqlanadi.
  - Trade offerlar BullMQ navbati orqali taqsimlanadi.

---

## 3. MA'LUMOTLAR OQIMI VA KETMA-KETLIK DIAGRAMMASI (SEQUENCE FLOWS)

### 3.1. Keys Ochish Jarayoni (Case Opening Flow)

```mermaid
sequenceDiagram
    autonumber
    actor User as Foydalanuvchi
    participant FE as Frontend / TMA
    participant API as Core API
    participant Lock as Redis Distributed Lock
    participant DB as PostgreSQL
    participant PF as Provably Fair Engine
    participant WS as WebSocket Gateway

    User->>FE: "Keys Ochish" tugmasini bosadi (50,000 UZS)
    FE->>API: POST /api/v1/cases/:id/open { count: 1, client_seed: "xyz" }
    API->>Lock: Redis Lock olish (lock:user:user_id)
    alt Lock olinmadi (Spam / Parallel so'rov)
        API-->>FE: 429 Too Many Requests (Oldingi amal tugashini kuting)
    end
    API->>DB: BEGIN TRANSACTION (SERIALIZABLE)
    API->>DB: SELECT balance FROM wallets WHERE user_id = :id FOR UPDATE
    alt Balans yetarli emas
        API->>DB: ROLLBACK
        API->>Lock: Lockni bo'shatish
        API-->>FE: 402 Insufficient Balance
    end
    API->>DB: UPDATE wallets SET balance = balance - 50000 WHERE user_id = :id
    API->>PF: Natijani hisoblash (ServerSeed, ClientSeed, Nonce, CaseItems)
    PF-->>API: Yutilgan Skin: "AK-47 | Asiimov" (ID: 1042)
    API->>DB: INSERT INTO user_inventory (user_id, item_id, status: 'AVAILABLE')
    API->>DB: INSERT INTO wallet_transactions (amount: -50000, type: 'CASE_OPEN')
    API->>DB: COMMIT TRANSACTION
    API->>Lock: Lockni bo'shatish
    API->>WS: Emit to global:live_drops (User, Item, Case)
    API-->>FE: 200 OK { won_item: {...}, roulette_strip: [...], new_balance: 120000 }
    FE->>User: 60 FPS ruletka animatsiyasi va g'alaba nuri
```

---

## 4. MASSHTABLANISH VA YUKLAMAGA BARDOSHLILIK (SCALABILITY DESIGN)

1. **Gorizontal Kengayish (Stateless API):** Barcha API serverlar sessiya ma'lumotlarini o'z xotirasida emas, faqat Redis va JWT da saqlaydi. Natijada foydalanuvchilar soni oshganda yangi API nusxalarini (Replicas) osonlikcha qo'shish mumkin.
2. **Ma'lumotlar Bazasi O'qish/Yozish Ajratilishi (Read/Write Replicas):** 
   - Yozish (Write): Asosiy Primary DB ga barcha to'lovlar, ochishlar va savdolar yoziladi.
   - O'qish (Read): Keyslar katalogi, yordamchi sahifalar va yetakchilar jadvali Read Replica lardan o'qiladi.
3. **Kesh Strategiyasi (Cache-Aside):** Keyslar tarkibi, skinlar narxlari va statik ma'lumotlar Redis keshida 1 soatgacha saqlanadi va DB ga yuklamani 85% ga kamaytiradi.
