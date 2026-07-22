# cPanel deploy (Git pull + NPM Install + upload `.next`)

Build only on your Mac. On cPanel: pull code, Run NPM Install, upload `.next`.

**Database:** create an empty MySQL database + user only.  
Do **not** import SQL. Tables and admin user are created automatically when the app starts.

## On your Mac (every update)

```bash
cd /Users/abhisek/projects2026/rent-kathmandu
git push origin main
npm run build:zip
```

That creates `next-build.zip` (contains `.next` only).

## On cPanel (one time)

1. Git clone/pull branch **`main`**
2. MySQL Databases → create empty database + user (ALL PRIVILEGES) — no phpMyAdmin import
3. Create `.env`:
```env
NODE_ENV=production
PORT=3000
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password
SESSION_SECRET=long-random-secret
DATABASE_DRIVER=mysql
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_cpanel_db_user
MYSQL_PASSWORD=your_db_password
MYSQL_DATABASE=your_cpanel_db_name
```
4. **Setup Node.js App** → root = app folder → Startup = `server.js` → **Run NPM Install**
5. Upload `next-build.zip` → extract so you have `app/.next/` → delete zip
6. **Restart** Node app (tables are created on startup)

## Later updates

1. Mac: `git push` + `npm run build:zip`
2. cPanel: Git **Pull**
3. Run NPM Install only if packages changed
4. Upload/extract new `next-build.zip`
5. Restart Node app

Do **not** run `npm run build` on cPanel.
