# Rent Valley

Mobile-friendly rental listing platform for Kathmandu, Lalitpur, and Bhaktapur.

## Features

- **Tenants** — Browse featured and district-wise listings, view details, request visits
- **Owners / agents** — Submit listings with location, property type, price, and photo
- **Admin** — Approve listings, manage featured/stop/sold status, handle visit requests

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment

| Variable | Description |
|----------|-------------|
| `ADMIN_USERNAME` | Admin login username |
| `ADMIN_PASSWORD` | Admin login password |
| `SESSION_SECRET` | Secret for signed admin sessions |

## Admin

- URL: `/admin/login`
- Default credentials are in `.env.local` (change before deploying)

## Data

- SQLite database: `data/rent.db`
- Uploaded images: `public/uploads/`

## Scripts

```bash
npm run dev    # Development server
npm run build  # Production build
npm run start  # Run production server
```
