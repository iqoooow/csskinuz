# UI/UX TAHLILI VA DIZAYN TIZIMI HUJJATI (UI/UX FORENSICS & DESIGN SYSTEM)

**Loyiha:** SKINOZ / csskinuz  
**Mavzu:** Cyberpunk / Neo-Dark Glassmorphic CS2 Gaming Interface  
**Til:** O'zbek tili  

---

## 1. VIZUAL STRATEGIYA VA EMOTSIONAL TA'SIR

CS2 skin platformalarining muvaffaqiyati foydalanuvchida **hayajon, eksklyuzivlik va g'alaba hissi**ni uyg'otishga tayanadi.
* **Asosiy Fon:** Chuqur kosmik qora va to'q grafit ranglar (`#0a0b0e`, `#12141a`), bu esa o'yindagi yorqin skinlar va kamyoblik nurlarini (Rarity Glow) yorqinroq bo'rtib ko'rsatadi.
* **Yorug'lik va Neon Effektlari:** Qizil (Covert), Oltin (Knives/Gloves), Moviy (Tech) neon nurlari o'yinchining diqqatini asosiy harakatlarga qaratadi.
* **Haptika va Ovoz:** Telegram Mini App ichida barmoq harakatlarida sezilarli tebranish (TMA Haptic Feedback) va lentaning har bir chertishida maxsus audio signal (Web Audio API).

---

## 2. DIZAYN TIZIMI SPETSIFIKATSIYASI (DESIGN TOKENS)

### 2.1. Rang Palitrasi (Color Tokens)
* **`--bg-primary`:** `#0a0b0e` (Asosiy sahifa foni)
* **`--bg-surface`:** `#12141a` (Kartalar, vidjetlar foni)
* **`--bg-elevated`:** `#1a1d26` (Inputlar, modallar)
* **`--accent-gold`:** `#f59e0b` (Asosiy g'alaba, VIP aksenti)
* **`--accent-cyan`:** `#06b6d4` (Texnologik amallar, balans)
* **`--accent-green`:** `#10b981` (Depozit, yutuq, tasdiqlash)
* **`--accent-red`:** `#ef4444` (Xavf, bekor qilish)

### 2.2. Kamyoblik Ranglari (CS2 Official Rarity Colors)
* **Consumer Grade (Oqish):** `#b0c3d9`
* **Mil-Spec (Ko'k):** `#4b69ff`
* **Restricted (Binafsha):** `#8847ff`
* **Classified (Pushti):** `#d32ce6`
* **Covert (Qizil):** `#eb4b4b`
* **Special / Knives (Oltin):** `#ffd700`

---

## 3. ASOSIY KOMPONENTLAR ARXITEKTURASI

### 3.1. Jonli Drop Lentasi (Live Drops Bar)
* **Joylashuvi:** Sahifaning eng yuqori qismida doimiy qotirilgan (Sticky Header).
* **Xatti-harakati:** Har safar yangi yutuq tushganda, yangi skin chap tomondan silliq animatsiya bilan (`transition: transform 0.4s ease-out`) kirib keladi, o'ngdagi eng eski skin esa o'chib ketadi.
* **Interaktivlik:** Skin ustiga bosilganda o'sha keysga to'g'ridan-to'g'ri o'tish yoki foydalanuvchi profilini ko'rish.

### 3.2. Gorizontal Ruletka Lentasi (Horizontal Roulette Reel)
* **Tuzilishi:** Gorizontal yo'nalishdagi 60-80 ta skin kartasidan iborat lenta.
* **Animatsiya:** 
  - Aylanish vaqti: $5.5\text{ soniya}$.
  - Harakat egri chizig'i: `cubic-bezier(0.12, 0.8, 0.2, 1.0)` (Dastlab juda tez, oxirida keskin sekinlashib to'xtash).
  - Markaziy nishon chizig'i (Pointer) yorug'lik bilan miltillaydi va skin har safar markazdan o'tganda kichik `tick.mp3` ovozi chiqadi.

### 3.3. Apgreyd Disk Arenasi (Upgrade Circle Wheel)
* **Tuzilishi:** SVG/Canvas asosidagi 360 darajali doiraviy sektor.
* **Ko'rsatkichlar:** Markazda yutish ehtimolligi (`25.00%`) va multiplikator (`x4.00`), doira bo'ylab yutuq sektori (yashil neon) va yutqazish sektori (qizil).
* **Animatsiya:** Strelka tasodifiy bir necha to'liq aylanishdan so'ng sekinlashib, server ko'rsatgan burchakda to'xtaydi.

---

## 4. TELEGRAM MINI APP (TMA) MAXSUS UX TALABLARI

1. **Moslashuvchanlik (Viewport Lock):** Mini App ochilganda ekranning tortilishi va yopilib ketishining oldini olish (`Telegram.WebApp.expand()` va `Telegram.WebApp.disableVerticalSwipes()`).
2. **Tebranishlar (Haptics):**
   - Ruletka aylanayotganda: `Telegram.WebApp.HapticFeedback.impactOccurred('light')`.
   - Yutuq chiqqanda: `Telegram.WebApp.HapticFeedback.notificationOccurred('success')`.
   - Yutqazganda: `Telegram.WebApp.HapticFeedback.notificationOccurred('error')`.
3. **Pastki Navigatsiya (Bottom Navigation Bar):** Mobil qurilmalarda bir qo'l bilan boshqarish qulayligi uchun pastda 5 ta asosiy bo'lim: `[Bosh sahifa]`, `[Keyslar]`, `[Upgrade]`, `[Inventar]`, `[Profil]`.
