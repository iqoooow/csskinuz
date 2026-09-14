# CSSKINUZ — Professional CS2 Skin Gaming & Case Platform

[![Node.js](https://img.shields.io/badge/Node.js-v22+-green.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-cyan.svg)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**CSSKINUZ** — bu O'zbekiston va MDH bozoriga mo'ljallangan, zamonaviy kiberpank dizayniga ega bo'lgan original Counter-Strike 2 (CS2) skin ochish, apgreyd (Upgrade), keyslar jangi (Case Battles) va ayirboshlash (Trade) platformasidir. Loyiha Desktop/Mobile Web hamda **Telegram Mini App (TMA)** kontekstida to'liq ishlaydi.

---

## ⚡ ASOSIY IMKONIYATLAR

* **🎮 O'yin Turlari:**
  * **Keyslar Katalogi & Ochish:** 60 FPS silliq gorizontal ruletka animatsiyasi, 1x-5x multiplikator, Fast Mode, kunlik bepul keyslar.
  * **Upgrade Arenasi:** 360-darajali doiraviy sektor, moslashuvchan multiplikatorlar (1.5x dan 20x gacha) va aylanuvchi strelka.
  * **Case Battles (PvP):** 2-4 o'yinchi yoki AI Botlar o'rtasida sinxron ochilishlar, Crazy Mode (kam yutgan oladi).
  * **Savdo (Trade / Exchange):** Inventardagi skinlarni platforma botlari zaxirasiga narxlar farqi bilan darhol almashtirish.
* **🔒 100% Provably Fair:** HMAC-SHA256 Commit-Reveal kriptografik adolat kafolati.
* **💳 Mahalliy To'lovlar:** Payme, Click, Uzum, USDT, Telegram Stars (0% komissiya va promo-kodlar).
* **📦 Steam Integratsiyasi:** 60 soniyada Trade Offer orqali skinni CS2 inventariga yetkazib berish.
* **📱 Telegram Mini App (TMA):** Haptic tebranishlar, bot xabarnomalari va virusli referral tizimi.
* **🛡️ Xavfsizlik:** Atomik buxgalteriya balansi (Double-entry ledger), poyga holatlaridan (Race Conditions) to'liq himoya, IDOR va CSRF himoyasi.

---

## 🚀 TEZKOR ISHGA TUSHIRISH (QUICKSTART)

### 1. Bog'liqliklarni o'rnatish va Build qilish
```bash
bash build.sh
```

### 2. Tizimni Ishga Tushirish
```bash
bash start.sh
```
* **Frontend Web:** `http://localhost:3000`
* **Backend API & WebSocket:** `http://localhost:4000`

### 3. Avtomatlashgan Testlarni Yurgizish
```bash
npm run test --prefix apps/api
```

---

## 📁 LOYIHA HUJJATLARI (`/docs/`)

* [SKINOZ_REVERSE_ENGINEERING.md](docs/SKINOZ_REVERSE_ENGINEERING.md) — 24 bosqichli Master Reverse-Engineering tahlili.
* [PRODUCT_REQUIREMENTS.md](docs/PRODUCT_REQUIREMENTS.md) — Mahsulot talablari hujjati (PRD).
* [ARCHITECTURE.md](docs/ARCHITECTURE.md) — Tizim arxitekturasi va ma'lumotlar oqimi.
* [DATABASE_DESIGN.md](docs/DATABASE_DESIGN.md) — Relyatsion DDL sxemalari va indekslar.
* [API_SPECIFICATION.md](docs/API_SPECIFICATION.md) — REST va WebSocket API spetsifikatsiyasi.
* [SECURITY_THREAT_MODEL.md](docs/SECURITY_THREAT_MODEL.md) — STRIDE xavfsizlik tahdidlari modeli.
* [SECURITY_AUDIT_FINAL.md](docs/SECURITY_AUDIT_FINAL.md) — Yakuniy Red-Team audit hisoboti.
* [ECONOMY_MODEL.md](docs/ECONOMY_MODEL.md) — RTP va House Edge matematik hisob-kitoblari.
* [TELEGRAM_ARCHITECTURE.md](docs/TELEGRAM_ARCHITECTURE.md) — Telegram Mini App va Bot integratsiyasi.
* [STEAM_INTEGRATION.md](docs/STEAM_INTEGRATION.md) — Steam OpenID va Botlar klasteri.
* [ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) — Administrator boshqaruv qo'llanmasi.
* [DEPLOYMENT.md](docs/DEPLOYMENT.md) — Ishlab chiqarishga joylashtirish yo'riqnomasi.
* [IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) — Ishlab chiqarish rejasi.

---

## ⚖️ Litsenziya
Ushbu loyiha MIT litsenziyasi asosida himoyalangan.
