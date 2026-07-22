# cPanel Git-only deploy

Use the **`cpanel`** branch on the server. It is rebuilt by GitHub Actions whenever `main` is updated and already contains Linux `node_modules` + `.next`. You do **not** run `npm` on cPanel.

## One-time setup (cPanel)

1. Create MySQL DB/user, import `database/schema.sql` (from `main` repo or from the `cpanel` branch if present).
2. cPanel → **Git Version Control** → Clone:
   - Repository: `https://github.com/abhisek-dhungel/test-builthimalayas.git`
   - Branch: **`cpanel`** (not `main`)
   - Path: e.g. `~/test-builthimalayas`
3. In that folder create `.env` with MySQL + admin settings (`DATABASE_DRIVER=mysql`).
4. **Setup Node.js App**:
   - Application root = that folder
   - Startup file = `server.js`
   - Node 20 if available
   - Restart

## Updates later

1. Push code to `main` (from your Mac).
2. Wait for Actions → **Build cPanel branch** to finish (green).
3. cPanel Git → **Pull** (or Update) the `cpanel` branch.
4. Restart the Node.js app.

No `npm install` and no `.next` zip upload.
