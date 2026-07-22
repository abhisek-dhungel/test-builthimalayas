#!/usr/bin/env bash
# Package a Linux-ready cPanel deploy folder (no npm needed on the server).
# Run on Linux (GitHub Actions) after: npm ci && npm run build
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -d .next/standalone ]]; then
  echo "Missing .next/standalone. Run: npm ci && npm run build"
  exit 1
fi

OUT="$ROOT/cpanel-deploy"
ZIP="$ROOT/cpanel-deploy.zip"
rm -rf "$OUT" "$ZIP"
mkdir -p "$OUT"

# Standalone server + traced node_modules (Linux)
cp -a .next/standalone/. "$OUT/"

# Static assets Next expects beside standalone
mkdir -p "$OUT/.next"
cp -a .next/static "$OUT/.next/static"
cp -a public "$OUT/public"
mkdir -p "$OUT/public/uploads"

# Helpful files for cPanel
cp -a package.json "$OUT/package.json"
cp -a .env.example "$OUT/.env.example"
if [[ -f database/schema.sql ]]; then
  mkdir -p "$OUT/database"
  cp -a database/schema.sql "$OUT/database/schema.sql"
fi

# Startup: standalone generates server.js at package root
cat > "$OUT/.env.example.cpanel" <<'EOF'
NODE_ENV=production
PORT=3000

ADMIN_USERNAME=admin
ADMIN_PASSWORD=change-this-password
SESSION_SECRET=use-a-long-random-string-here

DATABASE_DRIVER=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_cpanel_db_user
MYSQL_PASSWORD=your_db_password
MYSQL_DATABASE=your_cpanel_db_name
EOF

(
  cd "$OUT"
  zip -r "$ZIP" . -x "*.DS_Store" -x "**/.git/**"
)

echo "Created: $ZIP"
echo "Upload + extract this on cPanel, create .env, set startup file to server.js"
du -sh "$ZIP"
