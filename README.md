# Mie Ayam Berteman

Website warung mie ayam yang nyatu sama scene musik: tiap pesanan = satu hak request lagu yang masuk leaderboard mingguan.

- **Frontend**: React + Vite + Tailwind v4 (folder `artifacts/mie-ayam-berteman`)
- **Backend**: Node.js + Express 5 (folder `artifacts/api-server`)
- **Database**: PostgreSQL + Drizzle ORM (schema di `lib/db/src/schema`)
- **Monorepo**: pnpm workspaces

Panduan ini fokus ke **deploy frontend di Vercel** dan **backend di VPS**.

---

## Daftar isi

1. [Persiapan lokal](#1-persiapan-lokal)
2. [Setup database PostgreSQL](#2-setup-database-postgresql)
3. [Setup backend di VPS](#3-setup-backend-di-vps)
4. [Setup frontend di Vercel](#4-setup-frontend-di-vercel)
5. [Cek end-to-end](#5-cek-end-to-end)
6. [Update di kemudian hari](#6-update-di-kemudian-hari)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Persiapan lokal

Yang harus ada di laptop kamu sebelum mulai:

- Node.js 20 atau lebih baru
- pnpm 10 (`corepack enable && corepack prepare pnpm@10 --activate`)
- Akun GitHub (untuk push repo ke Vercel)
- Akun Vercel
- Sebuah VPS (Ubuntu 22.04 LTS direkomendasikan) yang bisa di-SSH

Clone & install:

```bash
git clone <repo-kamu> mie-ayam-berteman
cd mie-ayam-berteman
pnpm install
```

Cek typecheck jalan:

```bash
pnpm run typecheck
```

---

## 2. Setup database PostgreSQL

Boleh pakai PostgreSQL di VPS yang sama, atau layanan terkelola (Neon / Supabase / RDS).

### Opsi A — PostgreSQL di VPS

SSH ke VPS, lalu:

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres psql
```

Di prompt psql:

```sql
CREATE USER mab WITH PASSWORD 'ganti-password-aman';
CREATE DATABASE mie_ayam_berteman OWNER mab;
GRANT ALL PRIVILEGES ON DATABASE mie_ayam_berteman TO mab;
\q
```

Connection string-nya:

```
postgres://mab:ganti-password-aman@127.0.0.1:5432/mie_ayam_berteman
```

### Opsi B — Layanan terkelola

Buat database, salin connection string yang mereka berikan.

### Push schema

Dari laptop kamu (sekali, plus setiap kali schema berubah):

```bash
DATABASE_URL="postgres://..." pnpm --filter @workspace/db run push
```

---

## 3. Setup backend di VPS

### 3.1. Persiapan VPS

SSH ke VPS, install runtime & tooling:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx ufw

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm + pm2
sudo corepack enable
sudo npm i -g pm2

# firewall dasar
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 3.2. Clone & build

```bash
cd /var/www
sudo git clone <repo-kamu> mie-ayam-berteman
sudo chown -R $USER:$USER mie-ayam-berteman
cd mie-ayam-berteman

pnpm install --frozen-lockfile
pnpm --filter @workspace/api-server run build
```

Hasil build berada di `artifacts/api-server/dist/index.mjs` — sudah di-bundle jadi satu file.

### 3.3. Environment variables

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
nano artifacts/api-server/.env
```

Isi:

| Variabel | Wajib | Contoh |
|---|---|---|
| `PORT` | ya | `8080` |
| `DATABASE_URL` | ya | `postgres://mab:...@127.0.0.1:5432/mie_ayam_berteman` |
| `CORS_ORIGIN` | ya (production) | `https://mieayamberteman.vercel.app,https://mieayamberteman.com` |
| `NODE_ENV` | ya | `production` |

### 3.4. Jalankan dengan PM2

```bash
cd /var/www/mie-ayam-berteman/artifacts/api-server

pm2 start dist/index.mjs \
  --name mab-api \
  --node-args="--enable-source-maps" \
  --update-env

pm2 save
pm2 startup    # ikuti perintah yang ditampilkan, lalu jalankan lagi `pm2 save`
```

Cek log:

```bash
pm2 logs mab-api
pm2 status
```

Cek dari dalam VPS:

```bash
curl http://127.0.0.1:8080/api/healthz
# -> {"status":"ok"}
```

### 3.5. Reverse proxy Nginx + HTTPS

Pasang domain. Misalnya kamu mau API di `api.mieayamberteman.com`. Arahkan record DNS `A` ke IP VPS dulu.

Buat file Nginx:

```bash
sudo nano /etc/nginx/sites-available/mab-api
```

Isi:

```nginx
server {
    listen 80;
    server_name api.mieayamberteman.com;

    location / {
        proxy_pass         http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header   Host              $host;
        proxy_set_header   X-Real-IP         $remote_addr;
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Aktifkan & reload:

```bash
sudo ln -s /etc/nginx/sites-available/mab-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Pasang TLS (Let's Encrypt):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.mieayamberteman.com
```

Verifikasi:

```bash
curl https://api.mieayamberteman.com/api/healthz
# -> {"status":"ok"}
```

---

## 4. Setup frontend di Vercel

Push repo kamu ke GitHub, lalu di Vercel: **New Project → Import Git Repository**.

### 4.1. Project settings

| Field | Nilai |
|---|---|
| **Root Directory** | `artifacts/mie-ayam-berteman` |
| **Framework Preset** | Vite |
| **Install Command** | `corepack enable && pnpm install --frozen-lockfile` |
| **Build Command** | `pnpm --filter @workspace/mie-ayam-berteman... run build` |
| **Output Directory** | `dist/public` |

> Kalau Vercel kesulitan dengan monorepo, set **Root Directory** ke folder root repo (kosongkan), lalu **Output Directory** ke `artifacts/mie-ayam-berteman/dist/public`.

### 4.2. Environment variables

| Variabel | Nilai |
|---|---|
| `BASE_PATH` | `/` |
| `PORT` | `5173` (formalitas; dipakai oleh `vite.config.ts` saat baca env) |
| `VITE_API_BASE_URL` | URL backend kamu, mis. `https://api.mieayamberteman.com` |

### 4.3. Deploy

Klik **Deploy**. Setelah selesai, Vercel kasih URL `https://<project>.vercel.app`.

### 4.4. Daftarkan domain Vercel di CORS backend

SSH lagi ke VPS, edit `.env` backend, tambahkan domain Vercel ke `CORS_ORIGIN`, lalu reload:

```bash
nano /var/www/mie-ayam-berteman/artifacts/api-server/.env
pm2 restart mab-api --update-env
```

---

## 5. Cek end-to-end

1. Buka `https://<project>.vercel.app/` — homepage muncul.
2. Buka tab **Menu** — daftar mie ayam keluar (artinya frontend sukses ngomong ke API).
3. Coba pesan satu porsi + isi request lagu — order masuk, lagu nongol di **Chart**.

Kalau langkah 2 gagal: buka DevTools → tab Network, cek panggilan ke `https://api.<domain>/api/menu`. Kalau error CORS, balik ke langkah [4.4](#44-daftarkan-domain-vercel-di-cors-backend).

---

## 6. Update di kemudian hari

### Backend

```bash
ssh user@vps
cd /var/www/mie-ayam-berteman
git pull
pnpm install --frozen-lockfile
pnpm --filter @workspace/api-server run build
pm2 restart mab-api --update-env
```

### Frontend

Cukup `git push` — Vercel otomatis build & deploy.

### Schema database berubah

Dari laptop:

```bash
DATABASE_URL="postgres://..." pnpm --filter @workspace/db run push
```

---

## 7. Troubleshooting

**Healthcheck OK tapi semua endpoint 500.** Cek `DATABASE_URL` dan apakah Postgres bisa diakses dari host backend (`psql "$DATABASE_URL" -c 'select 1'`).

**Frontend kena CORS.** Pastikan domain frontend persis ada di `CORS_ORIGIN` (termasuk `https://`, tanpa trailing slash). Restart pm2 dengan `--update-env`.

**Vite gagal build di Vercel** dengan pesan soal `BASE_PATH` atau `PORT`. Pastikan keduanya ada di Environment Variables Vercel.

**`pnpm install` di VPS lambat.** Tambah swap kalau RAM <2GB:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
```

**Port 8080 sudah dipakai.** Ganti `PORT` di `.env` (mis. `8090`), update `proxy_pass` di Nginx, reload Nginx, lalu `pm2 restart mab-api --update-env`.
