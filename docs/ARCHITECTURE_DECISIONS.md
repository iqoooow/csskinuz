# ARXITEKTURA QARORLARI VA TAHLILI (ARCHITECTURE DECISION RECORDS — ADR)

**Loyiha:** CSSKINUZ  
**Til:** O'zbek tili  
**Holati:** Qabul qilingan  

---

## ADR 1: Yagona Saqlash va Tranzaksiyalar Arxitekturasi

### Muammo (Problem)
Platforma yuqori tezlikdagi o'yin amallari (Keys ochish, Apgreyd, Case Battles) bilan bir qatorda moliyaviy hisob-kitoblar va inventar yaxlitligini ta'minlashi kerak. PostgreSQL to'liq ACID va `FOR UPDATE` qulflarini taqdim etadi. Mahalliy muhitda va ishlab chiqarishda tezkor deploy qilish va mustaqil ishlay olish uchun qanday ma'lumotlar bazasi drayveridan foydalanish lozim?

### Variantlar (Options)
1. **Faqat Tashqi PostgreSQL serveriga bog'lanish:** Lokal muhitda PostgreSQL o'rnatilmagan bo'lsa, loyiha ishlamay qolishi mumkin.
2. **SQLite (WAL rejimida) / PostgreSQL gibrid arxitekturasi:** Ishlab chiqish va mustaqil ishga tushirish uchun o'rnatilgan SQLite (Transaction Lock + WAL), ishlab chiqarish uchun esa PostgreSQL drayverini qo'llab-quvvatlovchi yagona Repository Pattern.

### Tanlangan Yechim (Chosen Solution)
**2-variant: Ko'p qatlamli Database Adapter (Repository Pattern):**
- Tizim ichki SQLite (WAL + Foreign Keys + Strict Integer) hamda tashqi PostgreSQL bilan bir xil ishlaydigan Universal Data Layer orqali quriladi.
- Barcha tranzaksiyalar `db.transaction()` bloki ichida atomik tarzda bajariladi.
- `BIGINT` butun sonlar (tiyinlar) orqali hisob-kitoblar har ikkala bazada 100% bir xil ishlaydi.

### Asos va Kompromisslar (Reason & Trade-offs)
* **Yutuq:** Tizim har qanday toza serverda (qo'shimcha tashqi DB talab qilmasdan) mustaqil ishga tushadi va `bash build.sh` hamda `bash start.sh` 100% muvaffaqiyatli ishlaydi.
* **Xavf yo'qligi:** SQL DDL va tranzaksiya izolyatsiyasi to'liq saqlanadi.

---

## ADR 2: WebSocket va Realtime Aloqa Texnologiyasi

### Muammo (Problem)
Live Drops, Case Battle sinxronizatsiyasi va shaxsiy bildirishnomalar real vaqtda kechikishsiz yetkazilishi shart.

### Variantlar (Options)
1. **Faqat Polling (Har 2 soniyada HTTP so'rov):** Serverga ortiqcha yuklama keltiradi.
2. **WebSocket (ws / Socket.io) Gateway:** Ikki tomonlama ochiq kanal, har bir hodisa (Drop, Trade) 50ms ichida klientga yetib boradi.

### Tanlangan Yechim (Chosen Solution)
**2-variant: WebSocket Gateway (`ws` / native lightweight WebSockets).**

### Asos va Kompromisslar (Reason & Trade-offs)
* Real vaqtda barcha o'yinchilar boshqalar nima ochayotganini ko'radi (Live Drop), bu esa platformaga bo'lgan qiziqish va ishonchni oshiradi.

---

## ADR 3: Provably Fair Kriptografik Algoritmi

### Muammo (Problem)
O'yinchilar keys ochish va apgreyd natijalarini server o'zgartirmaganiga ishonch hosil qilishlari shart.

### Tanlangan Yechim (Chosen Solution)
**HMAC-SHA256 Commit-Reveal Sxemasi:**
1. Server har bir foydalanuvchi uchun `ServerSeed` generatsiya qiladi va uning `SHA256(ServerSeed)` heshini oldindan ko'rsatadi.
2. Klient o'zining `ClientSeed` qiymatini kiritadi.
3. Natijaviy son: $\text{HMAC-SHA256}(ServerSeed, ClientSeed:Nonce)$ orqali aniqlanadi.
4. O'yin tugagach, ochiq `ServerSeed` ko'rsatiladi va foydalanuvchi uni istalgan kalkulyatorda mustaqil tekshirishi mumkin.
