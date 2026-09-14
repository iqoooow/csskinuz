# MAHSULOT TALABLARI HUJJATI (PRODUCT REQUIREMENTS DOCUMENT — PRD)

**Loyiha:** SKINOZ / csskinuz — CS2 Skin Gaming & Case Platform  
**Hujjat versiyasi:** 1.0.0  
**Holati:** Tasdiqlangan / Arxitektura spetsifikatsiyasi  
**Til:** O'zbek tili  

---

## 1. MAHSULOT MAQSADI VA QAMROVI (EXECUTIVE SUMMARY & SCOPE)

### 1.1. Mahsulot Tavsifi
`csskinuz` (SKINOZ uslubidagi platforma) — bu O'zbekiston va MDH bozoridagi Counter-Strike 2 o'yinchilariga mo'ljallangan yuqori darajadagi virtual keys ochish, skinlarni yangilash (Upgrade), o'zaro bellashuvlar (Case Battle) va skinlar savdosi ekotizimidir. Platforma Web (Desktop/Mobile) hamda Telegram Mini App (TMA) orqali to'liq integratsiyalashgan holda ishlaydi.

### 1.2. Asosiy Biznes Maqsadlari
1. **Lokal Bozor Yetakchiligi:** Mahalliy to'lov tizimlari (Payme, Click, Uzum, USDT, Telegram Stars) orqali eng qulay va komissiyasiz depozit tajribasini yaratish.
2. **Yuqori Jalb Qilish (Engagement & Retention):** Jonli o'yinlar, real vaqtli yutuqlar lentasi, kunlik bepul keyslar va mukofotlar orqali kunlik faol foydalanuvchilar (DAU) sonini oshirish.
3. **Shaffoflik va Ishonch:** 100% matematik isbotlanuvchi Provably Fair tizimi orqali foydalanuvchilarning ishonchini qozonish.
4. **Tezkor Skin Yetkazib Berish:** Avtomatlashgan Steam botlari klasteri orqali yutilgan skinlarni 60 soniya ichida o'yinchining Steam hisobiga yuborish.

---

## 2. FOYDALANUVCHI PERSONAJLARI (USER PERSONAS)

### Persona 1: Sanjar — CS2 Ishqibozi (Casual Gamer)
* **Yoshi:** 19 yosh, talaba, Toshkent.
* **Qurilmasi:** Android smartfon (Telegram), noutbuk.
* **Xatti-harakati:** Telegram orqali kiradi, Payme orqali 20,000 - 50,000 UZS depozit qiladi, arzon keyslarni ochadi va tushgan skinni darhol CS2 inventariga yechib olishni xohlaydi.
* **Ehtiyoji:** Tezkor to'lov, chiroyli ochilish animatsiyasi, o'zbek tilidagi qulay interfeys.

### Persona 2: Bobur — High-Roller / Apgreyd Ishqibozi (Risk Taker)
* **Yoshi:** 24 yosh, dasturchi/treyder.
* **Qurilmasi:** Kuchli PC, monitor 144Hz.
* **Xatti-harakati:** 500,000 - 2,000,000 UZS depozit qiladi. Qimmatbaho pichoq keyslarini ochadi, xavfli (10-20% ehtimollikdagi) apgreydlarni o'ynaydi, Case Battle yaratadi.
* **Ehtiyoji:** Adolatli Provably Fair tizimi, yirik skinlar zaxirasi, VIP bonuslar.

### Persona 3: Jamshid — Strimer / Hamkor (Affiliate Marketer)
* **Yoshi:** 22 yosh, YouTube/Telegram strimeri.
* **Xatti-harakati:** O'z auditoriyasiga referral havolasini ulashadi, jonli efirda keyslar ochadi.
* **Ehtiyoji:** Yuqori referral komissiyasi (7-10%), maxsus shaxsiy promokodlar, tezkor daromad yechish.

---

## 3. FUNKSIONAL TALABLAR MATRITSASI (FEATURE REQUIREMENTS)

| ID | Funksiya | Toifa | Prioritet | Tavsif | Qabul Qilish Mezoni (Acceptance Criteria) |
|---|---|---|---|---|---|
| **FR-01** | Telegram Login | Auth | **P0** | Telegram Mini App `initData` orqali 1-klikda kirish. | Imzo serverda HMAC-SHA256 bilan to'liq tekshiriladi, yangi user yaratiladi. |
| **FR-02** | Steam OpenID | Auth | **P0** | Steam hisobini veb-sayt orqali bog'lash. | SteamID64 olinadi va profilga biriktiriladi. |
| **FR-03** | Hamyon va Balans | Wallet | **P0** | Foydalanuvchining real va bonus balansi hisobi. | Balans tiyinlarda saqlanadi, manfiyga tushmaydi, barcha harakatlar loglanadi. |
| **FR-04** | Lokal Depozit | Payment | **P0** | Payme, Click, Uzum orqali balans to'ldirish. | Webhook kelgach, 1 soniyada balansga mablag' o'tadi. |
| **FR-05** | Kripto Depozit | Payment | **P1** | USDT (TRC20/TON) va Telegram Stars orqali to'lash. | Tarmoq tasdiqlangach avtomatik balansga o'tadi. |
| **FR-06** | Keyslar Katalogi | Game | **P0** | Narxlar, toifalar va mashhurlik bo'yicha keyslar gridi. | Keshdan 50ms ichida yuklanadi, har bir keys ichidagi skinlar ko'rinadi. |
| **FR-07** | Keys Ochish Mexanizmi | Game | **P0** | 1x-5x ruletka ochish, Fast Mode, Provably Fair. | Natija serverda 100ms da hisoblanadi, 60fps silliq animatsiya. |
| **FR-08** | Tezkor Sotish (Sell) | Inventory | **P0** | Yutilgan skinni platformaga qayta sotib pulini olish. | Skin holati `SOLD` bo'ladi, balansga belgilangan summa darhol tushadi. |
| **FR-09** | Upgrade Arenasi | Game | **P1** | Skin yoki balans tikib, qimmatroq skin yutish. | Ehtimollik doirada aniq ko'rsatiladi, natija serverda aniqlanadi. |
| **FR-10** | Case Battle | Game | **P1** | 2-4 o'yinchi yoki botlar o'rtasida sinxron ochish. | WebSocket orqali barcha o'yinchilar bir vaqtda ochadi, g'olib hammasini oladi. |
| **FR-11** | Steamga Yechib Olish | Steam | **P0** | Skinni o'yinchining Steam hisobiga Trade Offer yuborish. | Bot 60 soniya ichida trade yuboradi va 2FA tasdiqlaydi. |
| **FR-12** | Referral Tizimi | Marketing | **P1** | Do'stlarni taklif qilish va depozitidan % olish. | Har bir depozitdan avtomatik 5-10% referral hisobiga o'tadi. |
| **FR-13** | Kunlik Bepul Keys | Retention | **P1** | 24 soatda 1 marta bepul keys ochish. | Telegram kanal obunasi va 24 soatlik taymer tekshiriladi. |
| **FR-14** | Jonli Lenta (Live Feed) | Social | **P1** | Saytda ochilayotgan barcha yutuqlar oqimi. | WebSocket orqali barcha faol foydalanuvchilarga darhol tarqatiladi. |
| **FR-15** | Admin Panel | Backoffice | **P0** | Foydalanuvchilar, keyslar, botlar va moliyani boshqarish. | 2FA himoyasi, to'liq audit jurnali, kassa nazorati. |

---

## 4. NOFUNKSIONAL TALABLAR (NON-FUNCTIONAL REQUIREMENTS — NFR)

### 4.1. Ishlash Tezligi (Performance & Latency)
* Bosh sahifa va keyslar katalogining birinchi yuklanish vaqti (FCP): $\le 1.2\text{ soniya}$.
* Keys ochish API so'rovi javob vaqti (Server latency): $\le 120\text{ ms}$.
* WebSocket hodisalarining tarqalish kechikishi: $\le 50\text{ ms}$.
* 60 FPS silliq UI animatsiyalari (mobil brauzerlar va TMA ichida).

### 4.2. Xavfsizlik va Tranzaksiyalar Yaxlitligi (Security & ACID)
* Barcha moliyaviy amallar qat'iy PostgreSQL tranzaksiyalari (`ISOLATION LEVEL SERIALIZABLE` yoki `SELECT FOR UPDATE`) ichida bajarilishi shart.
* Takroriy so'rovlar (Idempotency) nazorati barcha to'lov va keys ochish so'rovlarida majburiy.
* DDoS va Brute-force himoyasi: Cloudflare va Nginx Rate-limiter (1 daqiqada 60 so'rov/IP).

### 4.3. Ishonchlilik va Omon Qolish (Reliability & Availability)
* Tizimning uzluksiz ishlash ko'rsatkichi (Uptime): $99.9\%$.
* Steam API uzilib qolgan taqdirda ham asosiy sayt ishlashda davom etishi va so'rovlarni xavfsiz navbatda saqlashi shart.
* Ma'lumotlar bazasining har 6 soatdagi avtomatik zaxira nusxasi (Automated Backups to S3).

---

## 5. FOYDALANISH QOIDALARI VA CHEKLOVLAR (CONSTRAINTS)

1. **Yosh Cheklovi:** Platforma faqat 18 yoshga to'lgan foydalanuvchilar uchun mo'ljallangan.
2. **Wager Requirement (Depozit aylanmasi):** Pul yuvishning (AML) oldini olish maqsadida, kiritilgan depozit summasi kamida 1 marta (100% wager) keys yoki apgreyd o'yinlarida ishlatilishi shart.
3. **Steam Trade Hold:** Foydalanuvchi hisobida Steam Guard kamida 15 kun oldin yoqilgan bo'lishi talab etiladi.
