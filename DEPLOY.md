# Deploy Mie Ayam Berteman

Frontend di **Vercel**, backend di **VPS**, database PostgreSQL.

---

## 1. Database (Postgres)

Buat sebuah Postgres di VPS atau pakai layanan terkelola (Neon, Supabase, RDS, dll).

Catat connection string-nya, contoh:

```
postgres://user:password@db-host:5432/mie_ayam_berteman
```

Lalu push schema dari mesin development kamu (sekali saja, atau setiap kali schema berubah):

```bash
DATABASE_URL="postgres://..." pnpm --filter @workspace/db run push
```

(Opsional) Jalankan ulang seed agar menu & sample lagu terisi.

---

## 2. Backend di VPS (Node.js)

### a. Install & build

Di VPS:

```bash
git clone <repo-kamu> mie-ayam-berteman
cd mie-ayam-berteman
corepack enable
pnpm install --frozen-lockfile
pnpm --filter @workspace/api-server run build
```

Hasil build berada di `artifacts/api-server/dist/index.mjs` (single file, sudah di-bundle).

### b. Environment variables

Copy contoh dan isi:

```bash
cp artifacts/api-server/.env.example artifacts/api-server/.env
```

Variabel penting:

| Variabel | Wajib | Catatan |
|---|---|---|
| `PORT` | ya | Port lokal yang didengar Express, mis. `8080`. |
| `DATABASE_URL` | ya | Connection string Postgres. |
| `CORS_ORIGIN` | ya (production) | Daftar origin frontend, dipisah koma. Contoh: `https://mieayamberteman.vercel.app,https://mieayamberteman.com`. |
| `NODE_ENV` | ya | Set ke `production`. |

### c. Jalankan dengan PM2 (rekomendasi)

```bash
npm i -g pm2
cd artifacts/api-server
pm2 start "node --enable-source-maps dist/index.mjs" --name mab-api --update-env
pm2 save
pm2 startup    # ikuti perintah yang ditampilkan
```

### d. Reverse proxy (Nginx) + HTTPS

Pasang Nginx, arahkan domain (mis. `api.mieayamberteman.com`) ke port lokal API. Contoh blok server:

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

Lalu pasang TLS dengan Certbot:

```bash
sudo certbot --nginx -d api.mieayamberteman.com
```

### e. Cek

```bash
curl https://api.mieayamberteman.com/api/healthz
# -> {"status":"ok"}
```

---

## 3. Frontend di Vercel

### a. Setting project di Vercel

- **Root directory**: `artifacts/mie-ayam-berteman`
- **Framework preset**: Vite (Vercel auto-deteksi)
- **Build command**: `pnpm --filter @workspace/mie-ayam-berteman... run build`
- **Output directory**: `dist/public`
- **Install command**: `corepack enable && pnpm install --frozen-lockfile`

> Tip: kalau Vercel kesulitan dengan monorepo, bisa juga set Root directory ke folder root repo, build command ke perintah di atas, output directory `artifacts/mie-ayam-berteman/dist/public`.

Frontend ini butuh `BASE_PATH` saat build. Karena di Vercel app di-host di root, set ke `/`:

| Env var | Nilai |
|---|---|
| `BASE_PATH` | `/` |
| `PORT` | `5173` (cuma dipakai dev; tetap isi supaya `vite.config.ts` tidak error saat build) |
| `VITE_API_BASE_URL` | URL backend kamu, mis. `https://api.mieayamberteman.com` |

### b. Deploy

Push ke Git, Vercel otomatis build & deploy. Hasil: `https://<project>.vercel.app`.

Pastikan `CORS_ORIGIN` di backend sudah memuat domain Vercel ini.

---

## 4. Cek end-to-end

1. Buka `https://<project>.vercel.app/` — homepage muncul.
2. Buka tab **Menu** — daftar mie ayam keluar (bukti API jalan).
3. Pesan satu porsi + isi request lagu — order masuk, lagu nongol di Chart.

Selesai.
