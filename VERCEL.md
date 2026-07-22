# Deploy on Vercel + Cloudinary (+ free MySQL)

Photos and videos upload straight to Cloudinary (works for large videos).  
Vercel hosts the Next.js app. MySQL holds listing data (empty DB; tables auto-create).

## 1. Cloudinary (free)

1. Sign up: https://cloudinary.com  
2. Dashboard → copy **Cloud name**, **API Key**, **API Secret**  
3. **Settings → Upload → Upload presets → Add upload preset**
   - Signing mode: **Unsigned**
   - Folder: `builthimalayas` (optional)
   - Save the **Preset name**

## 2. Free MySQL

Create an empty MySQL database (any free host), for example:
- Railway → New → MySQL  
- or Aiven MySQL free trial  

Copy: host, port, user, password, database name.  
Do **not** import SQL — the app creates tables on start.

## 3. Push code to GitHub

```bash
cd /Users/abhisek/projects2026/rent-kathmandu
git add .
git commit -m "Add Cloudinary uploads for Vercel"
git push origin main
```

## 4. Vercel

1. https://vercel.com → Sign in with GitHub  
2. **Add New Project** → import `test-builthimalayas`  
3. Framework: Next.js  
4. Environment variables:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password
SESSION_SECRET=long-random-secret

DATABASE_DRIVER=mysql
MYSQL_HOST=...
MYSQL_PORT=3306
MYSQL_USER=...
MYSQL_PASSWORD=...
MYSQL_DATABASE=...
MYSQL_SSL=true

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset_name
```

`MYSQL_SSL=true` is usually required for Railway / Aiven / cloud MySQL.

5. Deploy  
6. Open the Vercel URL → test list property with photo/video  

## If you see “This page couldn’t load”

1. Vercel → Project → **Settings → Environment Variables**  
   Confirm `DATABASE_DRIVER=mysql` and all `MYSQL_*` values  
2. Add `MYSQL_SSL=true` if missing, then **Redeploy**  
3. Vercel → **Deployments** → latest → **Logs** / **Functions** for the exact error  

## Local development

Without Cloudinary env vars, uploads still go to `public/uploads/` (SQLite).  
With Cloudinary env in `.env.local`, local uploads also use Cloudinary.
