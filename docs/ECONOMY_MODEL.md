# O'YIN IQTISODIYOTI VA MATEMATIK MODELLASHTIRISH (GAME ECONOMY & MATHEMATICAL RTP MODEL)

**Loyiha:** SKINOZ / csskinuz  
**Hujjat turi:** Ehtimolliklar nazariyasi, House Edge va Tokenomika  
**Til:** O'zbek tili  

---

## 1. IQTISODIYOTNING ASOSIY TAMOYILLARI VA FORMULALARI

Platformaning moliyaviy barqarorligi har bir o'yin rejimida aniq matematik ustunlikka (House Edge — $HE$) va o'yinchilarga qaytariladigan foizga (Return to Player — $RTP$) asoslanadi.

$$\text{RTP} + \text{House Edge} = 100\%$$

Sanoat standarti bo'yicha barqaror ko'rsatkichlar:
* **Pullik Keyslar (Standard Cases):** $\text{RTP} = 88\% - 92\%$ ($\text{House Edge} = 8\% - 12\%$)
* **Apgreyd (Upgrade):** $\text{RTP} = 92\% - 95\%$ ($\text{House Edge} = 5\% - 8\%$)
* **Keyslar Jangi (Case Battles):** $\text{RTP} = 100\%$ (Chunki o'yinchilar bir-birining pullarini oladi, platforma keys sotilishidagi $HE$ dan foyda oladi).

---

## 2. KEYSLAR MATEMATIKASI VA EXPECTED VALUE (EV) HISOBI

Har bir keysning narxi ($C$) uning kutilgan qiymati ($EV$) va platforma foydasi orqali belgilanadi:

$$EV = \sum_{i=1}^{n} \left( \frac{W_i}{\sum_{j=1}^{n} W_j} \times V_i \right)$$

$$C = \frac{EV}{\text{RTP}}$$

Bu yerda:
* $W_i$ — $i$-chi skinning og'irlik koeffitsiyenti (Drop Weight);
* $V_i$ — $i$-chi skinning nominal sotish narxi (UZS);
* $C$ — keysning sotuv narxi.

### Misol: "Covert Dreams" Keysi Matematik Taqsimoti

| Skin Nomi | Bozor Narxi ($V_i$) | Kamyoblik | Drop Og'irligi ($W_i$) | Tushish Ehtimolligi ($P_i$) | EV Hissasi ($P_i \times V_i$) |
|---|---|---|---|---|---|
| **Karambit \| Doppler** | 12,000,000 UZS | Special | 5 | 0.05% | 6,000 UZS |
| **AWP \| Asiimov** | 1,200,000 UZS | Covert | 50 | 0.50% | 6,000 UZS |
| **AK-47 \| Vulcan** | 800,000 UZS | Classified | 150 | 1.50% | 12,000 UZS |
| **M4A4 \| The Emperor** | 250,000 UZS | Classified | 400 | 4.00% | 10,000 UZS |
| **USP-S \| Cortex** | 45,000 UZS | Classified | 2,400 | 24.00% | 10,800 UZS |
| **Glock-18 \| Water** | 20,000 UZS | Restricted | 6,995 | 69.95% | 13,990 UZS |
| **JAMI** | - | - | **10,000** | **100.00%** | **EV = 58,790 UZS** |

* Agar maqsadli $\text{RTP} = 90\%$ ($\text{House Edge} = 10\%$) bo'lsa:
$$\text{Keys Narxi } (C) = \frac{58,790}{0.90} = 65,322\text{ UZS} \approx 65,000\text{ UZS}$$

---

## 3. APGREYD (UPGRADE) EHTIMOLLIK VA FOYDA MODELI

Apgreyd formulasida foydalanuvchi tikkan summa ($V_{bet}$) va maqsadli skin narxi ($V_{target}$) o'rtasidagi nisbat olinadi:

$$P_{win} = \frac{V_{bet}}{V_{target}} \times (1 - HE_{upg})$$

* Masalan: Foydalanuvchi $20,000\text{ UZS}$ tikib, $100,000\text{ UZS}$ lik skinni apgreyd qilmoqchi. Platforma komissiyasi $HE_{upg} = 6\%$ ($0.06$):
$$P_{win} = \frac{20,000}{100,000} \times (1 - 0.06) = 0.20 \times 0.94 = 18.80\%$$
* **Multiplikator:** $x5.00$
* **G'alaba burchagi:** $18.80\% \times 360^\circ = 67.68^\circ$.

---

## 4. REFERRAL VA BONUS IQTISODIYOTI (AFFILIATE TOKENOMICS)

1. **Referral Komissiyasi:** Foydalanuvchi taklif qilgan do'stining depozitidan 5% dan 10% gacha oladi. Platformaning o'rtacha $HE = 12\%$ bo'lgani uchun, referralga 5% ajratilganda ham platformada $7\%$ sof marja qoladi.
2. **Wager Talabi (Wager Multiplier):** Barcha berilgan depozit bonuslari (masalan, +20% promokod) uchun $x3$ wager talab qilinadi. Bu bonus pullarini to'g'ridan-to'g'ri yechib ketishning (Bonus Abuse) oldini oladi.
3. **Kunlik Bepul Keyslar Iqtisodiyoti:** Bepul keysning o'rtacha $EV$ qiymati juda kichik (masalan, 300 - 800 UZS) qilib belgilanadi. 1,000 ta faol kunlik foydalanuvchi (DAU) uchun kunlik xarajat $\approx 500,000\text{ UZS}$ ni tashkil qiladi, bu esa yangi foydalanuvchilarni jalb qilish (Customer Acquisition Cost — CAC) uchun eng arzon va samarali marketing kanali hisoblanadi.
