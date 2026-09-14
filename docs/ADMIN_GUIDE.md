# ADMINISTRATOR QO'LLANMASI (ADMIN BACKOFFICE MANUAL)

**Loyiha:** CSSKINUZ  
**Til:** O'zbek tili  
**Rol:** Tizim Administratorlari va Moliyaviy Nazoratchilar  

---

## 1. ADMIN PANELGA KIRISH VA XAVFSIZLIK

1. **Kirish:** Headerdagi "Admin Panel" tugmasi yoki `/admin` marshruti orqali.
2. **Ruxsatnomalar:** Faqat `role = 'ADMIN'` yoki `role = 'SUPER_ADMIN'` foydalanuvchilar kira oladi.
3. **Standart Super Admin Akkaunti (Seeder):**
   - Username: `Admin`
   - ID: `admin_user_001`
   - Boshlang'ich Balans: $100,000,000\text{ UZS}$

---

## 2. ASOSIY BOSHQARUV FUNKSIYALARI

### 2.1. Foydalanuvchilarni Bloklash va Blokdan Chiqarish (Ban / Unban)
* "Foydalanuvchilar" tabiga kiring.
* Kerakli foydalanuvchini qidiring va "Ban" tugmasini bosing.
* Sababni kiriting (masalan: "Multi-akkaunt firibgarligi").
* Foydalanuvchi bloklanadi va uning barcha amallari to'xtatiladi.

### 2.2. Balansni Qo'lda To'g'rilash (Manual Adjustment)
* Agar to'lov tizimida uzilish bo'lib, pul tushmagan bo'lsa:
  - "Balans +/-" tugmasini bosing.
  - Summani UZS da kiriting (Musbat: qo'shadi, Manfiy: yechadi).
  - Majburiy audit sababini yozing.
  - Har bir o'zgarish `admin_audit_logs` jadvaliga o'chmas tarzda qayd etiladi.

### 2.3. Jonli Ochilishlar va Moliyaviy KPI Nazorati
* Bosh sahifada jami foydalanuvchilar, 24 soatlik depozitlar va real vaqtda ochilayotgan keyslar auditini kuzatib boring.
