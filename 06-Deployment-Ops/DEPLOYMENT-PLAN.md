# Building Maintenance App — Deployment Plan

Last updated: 2026-02-28

---

## 1. Infrastructure Overview

| Component | Technology | Host |
|---|---|---|
| Frontend | React 18 + Vite (static) | Nginx on VPS |
| Backend API | Express + Prisma + Node 20 | PM2 on VPS |
| Database | PostgreSQL 16 | Native on VPS |
| File Storage | AWS S3 (`amzn-building-app`, us-east-1) | AWS |
| Reverse Proxy | Nginx | Same VPS |

### Production server
- **IP**: `159.203.83.145`
- **OS**: Ubuntu 24.04 LTS
- **RAM**: 1 GB (tight — avoid Docker)
- **Disk**: 24 GB
- **SSH**: `root@159.203.83.145` port 22 (password in root `.env`)

### Dev server (Tailscale)
- **IP**: `100.78.107.25`
- Backend: port 3002, Frontend: port 3000

---

## 2. Prerequisites (one-time, already done on current server)

```bash
# These are already installed on 159.203.83.145
apt-get update
apt-get install -y postgresql postgresql-contrib nginx git
npm install -g pm2
```

---

## 3. Environment Files

### Root `.env` (local machine only — never commit)
```
SERVER_HOST=http://159.203.83.145/
SERVER_USER=root
SSH_PASSWORD=<password>
SERVER_PORT=22
```

### Backend production `.env` — written to `/opt/building-maintenance/packages/backend/.env`
```env
NODE_ENV=production
PORT=3002

DATABASE_URL="postgresql://building_user:<db_password>@localhost:5432/building_maintenance"

JWT_SECRET="<32-byte hex random — generate with: openssl rand -hex 32>"
JWT_EXPIRES_IN="7d"

LOG_LEVEL=info

CORS_ORIGIN="http://159.203.83.145"

MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/gif,application/pdf"

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAXY2AGJ3GLEYFU2ON
AWS_SECRET_ACCESS_KEY=<secret>
S3_BUCKET_NAME=amzn-building-app
```

> **Note**: The IAM user is `amzn-building-app-uploader`. It has PUT/GET permissions on the bucket but NOT `PutBucketCORS`. CORS must be set manually via the AWS Console (see Section 6).

### Frontend build env vars (applied at build time, not stored as a file)
```
VITE_API_URL=http://159.203.83.145/api
VITE_ENABLE_MOCK_API=false
```

---

## 4. Database Setup (one-time)

```bash
# Create user and database
sudo -u postgres psql -c "CREATE USER building_user WITH PASSWORD '<password>';"
sudo -u postgres psql -c "CREATE DATABASE building_maintenance OWNER building_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE building_maintenance TO building_user;"

# Grant schema permissions (required before prisma db push)
sudo -u postgres psql -d building_maintenance -c "
GRANT ALL ON SCHEMA public TO building_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO building_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO building_user;
ALTER USER building_user CREATEDB;
"

# Set postgres superuser password (needed for prisma db push)
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD '<postgres_password>';"
```

---

## 5. Full Deploy Script (fresh server or re-deploy)

Run from your **local machine** using the credentials in the root `.env`:

```bash
# === STEP 1: Clone / pull repo ===
ssh root@159.203.83.145 '
  if [ -d /opt/building-maintenance/.git ]; then
    cd /opt/building-maintenance && git pull
  else
    git clone https://github.com/jroques1975/building-maintenance-app.git /opt/building-maintenance
  fi
'

# === STEP 2: Write backend .env ===
# (copy the template from Section 3 above with real values)

# === STEP 3: Install backend deps + push schema ===
ssh root@159.203.83.145 '
  cd /opt/building-maintenance/packages/backend
  npm install
  npx prisma generate
  DATABASE_URL="postgresql://postgres:<postgres_password>@localhost:5432/building_maintenance" \
    npx prisma db push --accept-data-loss

  # Re-grant permissions after schema push
  sudo -u postgres psql -d building_maintenance -c "
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO building_user;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO building_user;
  "

  npx tsx prisma/seed.ts
'

# === STEP 4: Build backend ===
ssh root@159.203.83.145 '
  cd /opt/building-maintenance/packages/backend
  npm run build
'

# === STEP 5: Build frontend LOCALLY (server has only 1 GB RAM) ===
cd packages/web
VITE_API_URL=http://159.203.83.145/api VITE_ENABLE_MOCK_API=false npm run build
cd ../..

# === STEP 6: Copy frontend dist to server ===
rsync -az --delete packages/web/dist/ root@159.203.83.145:/var/www/building-maintenance/

# === STEP 7: Configure Nginx ===
ssh root@159.203.83.145 '
cat > /etc/nginx/sites-available/building-maintenance << EOF
server {
    listen 80;
    server_name _;

    root /var/www/building-maintenance;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
  ln -sf /etc/nginx/sites-available/building-maintenance /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
'

# === STEP 8: Start/restart backend with PM2 ===
ssh root@159.203.83.145 '
  cd /opt/building-maintenance/packages/backend
  pm2 delete building-maintenance-api 2>/dev/null || true
  pm2 start dist/index.js --name building-maintenance-api
  pm2 save
  systemctl enable pm2-root
'
```

---

## 6. AWS S3 CORS Configuration (manual — IAM user lacks PutBucketCORS)

The IAM user (`amzn-building-app-uploader`) cannot set bucket CORS via CLI.
Must be done in the **AWS Console** each time the bucket is recreated:

1. AWS Console → S3 → `amzn-building-app` → **Permissions** tab
2. **Cross-origin resource sharing (CORS)** → Edit
3. Paste:

```json
[
  {
    "AllowedOrigins": [
      "http://100.78.107.25:3000",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://159.203.83.145"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

> When adding a new production domain/IP, add it to `AllowedOrigins` and save.

### Verify CORS is working
```bash
curl -s -D - -o /dev/null \
  -X OPTIONS "https://amzn-building-app.s3.us-east-1.amazonaws.com/" \
  -H "Origin: http://159.203.83.145" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: content-type" \
  | grep -iE "^HTTP|^access-control"
# Expect: HTTP 200 + Access-Control-Allow-Origin: http://159.203.83.145
```

---

## 7. Incremental Update (code change → production)

When source code changes, run only the steps that apply:

### Backend-only change
```bash
ssh root@159.203.83.145 '
  cd /opt/building-maintenance && git pull
  cd packages/backend && npm install && npm run build
  pm2 restart building-maintenance-api
'
```

### Frontend-only change
```bash
# Build locally
cd packages/web
VITE_API_URL=http://159.203.83.145/api VITE_ENABLE_MOCK_API=false npm run build
cd ../..

# Push to server
rsync -az --delete packages/web/dist/ root@159.203.83.145:/var/www/building-maintenance/
# Nginx serves static files — no restart needed
```

### Schema change (prisma db push)
```bash
ssh root@159.203.83.145 '
  cd /opt/building-maintenance && git pull
  cd packages/backend
  npm install && npx prisma generate
  DATABASE_URL="postgresql://postgres:<postgres_password>@localhost:5432/building_maintenance" \
    npx prisma db push --accept-data-loss
  sudo -u postgres psql -d building_maintenance -c "
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO building_user;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO building_user;
  "
  npm run build
  pm2 restart building-maintenance-api
'
```

### Full redeploy (backend + frontend)
```bash
# Pull + rebuild backend on server
ssh root@159.203.83.145 '
  cd /opt/building-maintenance && git pull
  cd packages/backend && npm install && npx prisma generate && npm run build
  pm2 restart building-maintenance-api
'

# Build frontend locally + push
cd packages/web
VITE_API_URL=http://159.203.83.145/api VITE_ENABLE_MOCK_API=false npm run build
cd ../..
rsync -az --delete packages/web/dist/ root@159.203.83.145:/var/www/building-maintenance/
```

---

## 8. PM2 Management

```bash
pm2 status                          # current state
pm2 logs building-maintenance-api   # live logs
pm2 logs building-maintenance-api --lines 100  # last 100 lines
pm2 restart building-maintenance-api
pm2 stop building-maintenance-api
```

---

## 9. Smoke Tests

```bash
# Health check
curl http://159.203.83.145/api/health

# Login
curl -s -X POST http://159.203.83.145/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@skylinemanagement.com","password":"password123"}'

# S3 CORS preflight
curl -s -D - -o /dev/null \
  -X OPTIONS "https://amzn-building-app.s3.us-east-1.amazonaws.com/" \
  -H "Origin: http://159.203.83.145" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: content-type" \
  | grep -iE "^HTTP|^access-control"
```

---

## 10. Known Constraints & Gotchas

| Issue | Detail | Workaround |
|---|---|---|
| 1 GB RAM | Vite build crashes on server | Always build frontend locally, rsync dist/ |
| `prisma db push` needs superuser | `building_user` lacks DDL rights | Use `postgres` superuser URL for push only |
| Re-grant after push | New tables don't inherit default privileges | Run `GRANT ALL PRIVILEGES ON ALL TABLES` after every schema push |
| S3 CORS | IAM user can't set `PutBucketCORS` | Set manually in AWS Console (see Section 6) |
| No migrations dir | Project uses `db push` not `migrate` | Use `prisma db push` for schema changes |
| PM2 startup | Must run `systemctl enable pm2-root` once | Already done on current server |
