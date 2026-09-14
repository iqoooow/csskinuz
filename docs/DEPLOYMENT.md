# ISHLAB CHIQARISHGA JOYLASHTIRISH QO'LLANMASI (PRODUCTION DEPLOYMENT GUIDE)

**Loyiha:** CSSKINUZ  
**Til:** O'zbek tili  

---

## 1. SERVER TALABLARI (SYSTEM REQUIREMENTS)

* **Operatsion Tizim:** Ubuntu 22.04 LTS / Debian 12 / Linux
* **CPU:** Kamida 2 vCPU (Tavsiya etiladi: 4 vCPU)
* **RAM:** Kamida 4 GB (Tavsiya etiladi: 8 GB)
* **Dasturiy Ta'minot:** Node.js v20+ yoki v22+, npm v10+, Nginx, PM2

---

## 2. BOSQICHMA-BOSQICH ISHGA TUSHIRISH (STEP-BY-STEP DEPLOY)

### 2.1. Loyihani Serverga Yuklash
```bash
git clone https://github.com/your-repo/csskinuz.git
cd csskinuz
```

### 2.2. Muhit O'zgaruvchilarini (.env) Sozlash
```bash
cp .env.example .env
nano .env
```
Quyidagi parametrlarni to'ldiring:
```env
PORT=4000
NODE_ENV=production
JWT_SECRET=super_secret_jwt_random_key_production_2026
TELEGRAM_BOT_TOKEN=your_official_telegram_bot_token
STEAM_API_KEY=your_steam_web_api_key
```

### 2.3. Build Qilish va Testlarni Tekshirish
```bash
bash build.sh
```

### 2.4. PM2 Orqali Doimiy Ishga Tushirish (Process Manager)
```bash
pm2 start dist/index.js --name "csskinuz-api" --cwd "apps/api"
pm2 save
pm2 startup
```

### 2.5. Nginx Reverse Proxy Konfiguratsiyasi
```nginx
server {
    listen 80;
    server_name skinoz.uz api.skinoz.uz;

    # Frontend Static
    location / {
        root /var/www/csskinuz/apps/web/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend REST API
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

### 2.6. SSL Sertifikatini O'rnatish (Certbot HTTPS)
```bash
sudo certbot --nginx -d skinoz.uz -d api.skinoz.uz
```
