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

# Password-reset emails (create a Resend API key and verify this sender domain)
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=Built Himalayas <no-reply@your-domain.com>
APP_URL=https://your-domain.com
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

## Password-reset emails

1. Create an account at [Resend](https://resend.com), add and verify the domain that sends mail, then create an API key with sending permission.
2. Set `RESEND_API_KEY` and `EMAIL_FROM` in the app's `.env`; the `EMAIL_FROM` address must use the verified domain.
3. Set `APP_URL` to the public `https://` address of this site, then restart the Node app.

If any setting is missing or rejected by Resend, the Forgot password page now shows a delivery error instead of incorrectly saying a link was sent.
