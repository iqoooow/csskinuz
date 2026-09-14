# XAVFSIZLIK VA TAHDIDLAR MODELI (SECURITY THREAT MODEL & DEFENSIVE AUDIT)

**Loyiha:** SKINOZ / csskinuz  
**Hujjat turi:** STRIDE Xavfsizlik Modeli va Mudofaa Strategiyasi  
**Holati:** Qat'iy talab  
**Til:** O'zbek tili  

---

## 1. STRIDE TAHDIDLAR TAHLILI (THREAT MATRIX)

| STRIDE Toifasi | Potentsial Hujum Ssenariysi | Ta'siri (Impact) | Xavf Darajasi | Texnik Himoya Mexanizmi (Mitigation) |
|---|---|---|---|---|
| **Spoofing (Soxtalashtirish)** | Hujumchi soxta Telegram `initData` yoki soxta to'lov webhook so'rovlarini yuboradi. | Asossiz balans to'ldirish, o'zga hisoblarga kirish. | **KRITIK** | HMAC-SHA256 imzolarini tekshirish, IP Whitelist, Webhook sirlarini `crypto.timingSafeEqual` bilan taqqoslash. |
| **Tampering (O'zgartirish)** | Klient brauzerda apgreyd ehtimolligi yoki keys narxini o'zgartirib yuboradi. | Noqonuniy yutuqlar olish. | **YUQORI** | Barcha narxlar, ehtimolliklar va yutuqlar faqat backendda hisoblanadi. Klient parametrlari inobatga olinmaydi. |
| **Repudiation (Inkor etish)** | Foydalanuvchi "men skinni sotmagan edim" yoki "pul yechmagan edim" deb da'vo qiladi. | Moliyaviy nizolar. | **O'RTA** | O'chmas audit jurnali (`wallet_transactions`, `admin_audit_logs`, IP va User-Agent qaydlari). |
| **Information Disclosure (Ma'lumot sizishi)** | Boshqa foydalanuvchilarning Trade URL yoki sessiya tokenlarining sizib chiqishi. | Maxfiylik buzilishi, fishing. | **YUQORI** | PII ma'lumotlarni shifrlash, API javoblarida faqat zaruriy maydonlarni qaytarish (Data Transfer Object validation). |
| **Denial of Service (DoS)** | Keys ochish yoki depozit yaratish endpointlarini botlar bilan to'ldirish. | Tizim to'xtashi, xizmat ko'rsata olmaslik. | **YUQORI** | Cloudflare WAF, Nginx Rate Limiting (IP bo'yicha 60 req/min), Redis Token Bucket algoritmi. |
| **Elevation of Privilege (Huquqlarni oshirish)** | Oddiy foydalanuvchi Admin API endpointlarini chaqirishga urinadi. | Platformani to'liq egallab olish. | **KRITIK** | Qat'iy RBAC (Role-Based Access Control) middleware, Admin panelni alohida ichki VPN/IP da ushlash. |

---

## 2. CHUQUR HIMOYA MEXANIZMLARI (DEFENSE-IN-DEPTH)

### 2.1. Poyga Holatlari va Parallelizmdan Himoya (Race Condition & Concurrency Defense)
* **Muammo:** Hujumchi 10 millisekund ichida 20 ta parallel keys ochish so'rovini yuboradi.
* **Yechim (2 Bosqichli Himoya):**
  1. **Taqsimlangan Qulf (Redis Distributed Lock):** Har bir foydalanuvchi uchun `lock:user:{user_id}` kaliti 3 soniyaga olinadi. Agar oldingi so'rov yakunlanmagan bo'lsa, yangi so'rov darhol `429 Too Many Requests` oladi.
  2. **PostgreSQL Qatori Qulfi:** Balansni o'qishda `SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE` qilinadi va tranzaksiya tugaguncha qulflanadi. Baza darajasida `CHECK (balance >= 0)` qoidasi mavjud.

### 2.2. Provably Fair Kriptografik Butunligi
* Server Seed tasodifiy 256-bitli kriptografik xavfsiz generator orqali hosil qilinadi (`crypto.randomBytes(32)`).
* O'yin boshlanishidan oldin foydalanuvchiga faqat uning `SHA256(Server_Seed)` heshi ko'rsatiladi (Commitment).
* Natija $Roll = \text{HMAC-SHA256}(Server\_Seed, Client\_Seed:Nonce)$ orqali hisoblanadi. Hech qanday shaxs (hatto tizim administratori ham) o'yin natijasini o'rtada o'zgartira olmaydi.

### 2.3. Multi-Akkaunt va Sybil Hujumlaridan Himoya
* **Muammo:** Bepul kunlik keyslarni yuzlab bot akkauntlar orqali ochib, skinlarni to'plash.
* **Mudofaa Qoidalari:**
  - Bepul keys ochish uchun kamida 1 marta muvaffaqiyatli minimal depozit (masalan, 10,000 UZS) talab etiladi.
  - Bitta IP va Qurilma Barmoq Izi (Device Fingerprint) bo'yicha 24 soat ichida faqat 1 ta bepul ochish ruxsat etiladi.
  - Yangi ro'yxatdan o'tgan akkauntlarga darhol yechish taqiqlanadi (Anti-fraud hold).

---

## 3. FAVQULODDA VAZIYATLAR VA TO'XTATISH TUGMASI (KILL SWITCH & HOT FREEZE)

Tizimda shubhali faollik (masalan, kutilmaganda juda ko'p qimmatbaho skinlar tushishi yoki balans nomutanosibligi) aniqlanganda quyidagi favqulodda protokollar ishga tushadi:
1. **Steam Botlarni Muzlatish (Trade Freeze):** Barcha yangi savdo takliflari darhol to'xtatiladi, botlar oflayn rejimga o'tadi.
2. **Depozit va Yechishlarni To'xtatish:** To'lov shlyuzlari qabul qilishni to'xtatadi.
3. **Admin Alert:** Telegram orqali bosh muhandis va xavfsizlik guruhiga favqulodda xabar yuboriladi.
