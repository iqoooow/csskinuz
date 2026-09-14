# API SPETSIFIKATSIYASI (RESTFUL & WEBSOCKET API SPECIFICATION)

**Loyiha:** SKINOZ / csskinuz  
**Versiya:** v1.0.0  
**Asosiy URL:** `https://api.skinoz.uz/api/v1`  
**WebSocket URL:** `wss://api.skinoz.uz/ws`  
**Til:** O'zbek tili  

---

## 1. GLOBAL STANDARTLAR VA XATOLAR TUZILISHI

### 1.1. Sarlavhalar (Headers)
* `Authorization: Bearer <JWT_ACCESS_TOKEN>`
* `Content-Type: application/json`
* `Idempotency-Key: <UUID>` (Barcha to'lov, keys ochish va sotish amallari uchun majburiy)

### 1.2. Standart Xatolik Formati (RFC 7807)
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Keys ochish uchun hisobingizda mablag' yetarli emas.",
    "details": {
      "required_amount": 5000000,
      "current_balance": 1250000
    }
  }
}
```

---

## 2. AUTENTIFIKATSIYA VA FOYDALANUVCHI (AUTH & USER)

### 2.1. Telegram orqali kirish (TMA Login)
* **Marshrut:** `POST /api/v1/auth/telegram`
* **Auth:** Ommaviy (Public)
* **Request Body:**
```json
{
  "initData": "query_id=AAHd...&user=%7B%22id%22%3A123456...&auth_date=1726330000&hash=d82..."
}
```
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "refresh_token": "def456...",
    "user": {
      "id": "a9b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d",
      "telegram_id": 123456789,
      "username": "cs2_pro_uz",
      "avatar_url": "https://t.me/i/userpic/...",
      "role": "USER",
      "balance": 15000000
    }
  }
}
```

### 2.2. Trade URL ni sozlash
* **Marshrut:** `PATCH /api/v1/profile/trade-url`
* **Auth:** Bearer Token
* **Request Body:**
```json
{
  "trade_url": "https://steamcommunity.com/tradeoffer/new/?partner=12345678&token=AbCdEfGh"
}
```
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "trade_url_configured": true
  }
}
```

---

## 3. HAMYON VA TO'LOVLAR (WALLET & DEPOSITS)

### 3.1. Depozit yaratish
* **Marshrut:** `POST /api/v1/deposits/create`
* **Auth:** Bearer Token
* **Request Body:**
```json
{
  "amount": 5000000,
  "gateway": "PAYME",
  "promo_code": "PROMO2026"
}
```
* **Response 201 Created:**
```json
{
  "success": true,
  "data": {
    "deposit_id": "b1c2d3e4-f5a6-4b7c-8d9e-0f1a2b3c4d5e",
    "amount": 5000000,
    "bonus_amount": 500000,
    "payment_url": "https://checkout.paycom.uz/eyJhbGciOi...",
    "status": "PENDING"
  }
}
```

---

## 4. KEYSLAR VA OCHISH MEXANIZMI (CASES & OPENING)

### 4.1. Barcha Keyslar Ro'yxati
* **Marshrut:** `GET /api/v1/cases`
* **Query Params:** `?category=popular&page=1&limit=20`
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "cases": [
      {
        "id": "c1d2e3f4-a5b6-4c7d-8e9f-0a1b2c3d4e5f",
        "slug": "covert-dreams",
        "name": "Covert Dreams",
        "price": 5000000,
        "image_url": "https://cdn.skinoz.uz/cases/covert.png",
        "is_free": false,
        "best_item": {
          "name": "Karambit | Doppler",
          "price": 150000000
        }
      }
    ]
  }
}
```

### 4.2. Keys Ochish (Case Opening)
* **Marshrut:** `POST /api/v1/cases/:id/open`
* **Auth:** Bearer Token
* **Request Body:**
```json
{
  "count": 1,
  "client_seed": "my_custom_lucky_seed_2026"
}
```
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "opening_id": "d1e2f3a4-b5c6-4d7e-8f9a-0b1c2d3e4f5a",
    "won_item": {
      "inventory_item_id": "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
      "name": "AK-47 | Asiimov",
      "rarity": "COVERT",
      "exterior": "FIELD_TESTED",
      "price": 4500000,
      "image_url": "https://cdn.skinoz.uz/items/ak47_asiimov.png"
    },
    "roulette_strip": [
      { "id": "1", "name": "M4A4 | Evil Daimyo", "rarity": "RESTRICTED", "image_url": "..." },
      { "id": "2", "name": "AK-47 | Asiimov", "rarity": "COVERT", "image_url": "..." },
      { "id": "3", "name": "AWP | Atheris", "rarity": "RESTRICTED", "image_url": "..." }
    ],
    "winning_index": 45,
    "user_new_balance": 10000000,
    "provably_fair": {
      "roll_number": "42.849120",
      "nonce": 12
    }
  }
}
```

---

## 5. APGREYD (UPGRADE API)

### 5.1. Apgreydni Hisoblash
* **Marshrut:** `POST /api/v1/upgrades/calculate`
* **Request Body:**
```json
{
  "input_value": 2000000,
  "target_item_id": "e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b"
}
```
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "win_chance": 22.50,
    "multiplier": 4.00,
    "target_item_price": 8000000
  }
}
```

### 5.2. Apgreydni Bajarish (Execute)
* **Marshrut:** `POST /api/v1/upgrades/execute`
* **Request Body:**
```json
{
  "inventory_item_ids": ["f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c"],
  "target_item_id": "e1f2a3b4-c5d6-4e7f-8a9b-0c1d2e3f4a5b",
  "client_seed": "upgrade_seed"
}
```
* **Response 200 OK:**
```json
{
  "success": true,
  "data": {
    "is_won": true,
    "roll_number": 15.3401,
    "win_chance": 22.50,
    "target_angle": 55.22,
    "won_item": {
      "inventory_item_id": "new_uuid",
      "name": "AWP | Hyper Beast",
      "price": 8000000
    }
  }
}
```

---

## 6. STEAM YECHIB OLISH (WITHDRAWAL API)

### 6.1. Steamga Savdo Taklifi Yuborish
* **Marshrut:** `POST /api/v1/withdrawals/steam`
* **Request Body:**
```json
{
  "inventory_item_id": "f1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c"
}
```
* **Response 202 Accepted:**
```json
{
  "success": true,
  "data": {
    "withdrawal_id": "w1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c",
    "status": "QUEUED",
    "message": "Savdo taklifi navbatga qo'yildi. Steam ilovangizni tekshiring."
  }
}
```

---

## 7. WEBSOCKET HODISALARI VA PROTOKOL (REALTIME EVENTS)

### 7.1. Ulanish
`wss://api.skinoz.uz/ws?token=<JWT_TOKEN>`

### 7.2. Hodisalar (Events)
* **Server -> Client (`global:live_drops`):**
```json
{
  "event": "DROP_OCCURRED",
  "data": {
    "user": { "username": "Sanjar***", "avatar_url": "..." },
    "case": { "name": "Covert Dreams", "slug": "covert-dreams" },
    "item": { "name": "AWP | Asiimov", "price": 4500000, "rarity": "COVERT", "image_url": "..." }
  }
}
```
* **Server -> Client (`user:notify`):**
```json
{
  "event": "TRADE_OFFER_SENT",
  "data": {
    "trade_offer_id": "987654321",
    "message": "Bot sizga savdo taklifini yubordi! Qabul qilish uchun 15 daqiqangiz bor."
  }
}
```
