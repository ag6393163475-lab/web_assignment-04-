# LifeLine — Blood Donation & Blood Bank Management

Express + EJS + Mongoose app for **PS 4**. Donors register and check 90-day eligibility. Anyone can search stock and submit emergency requests. Admins manage donors, inventory, and request status (`Pending` → `Processing` → `Fulfilled`).

## Folder structure

```
config/          MongoDB Atlas connection + seed
controllers/     Auth, public, donor, admin logic
middleware/      Session role guards
models/          User, Donor, Inventory, BloodRequest
public/css|js    Frontend assets
routes/          HTTP routes
utils/           Blood groups, eligibility helpers
views/pages      EJS screens
views/partials   Header / footer
server.js        App entry
```

## Setup

1. Copy env file and add your **MongoDB Atlas** URI:

```bash
cp .env.example .env
```

2. In Atlas: Network Access → allow your IP (or `0.0.0.0/0` for class demo). Database Access → database user. Paste the connection string as `MONGODB_URI`.

3. Install, then start. The first start creates the admin account and empty inventory rows:

```bash
npm install
npm start
```

Optional sample stock numbers:

```bash
npm run seed
```

Open [http://localhost:3000](http://localhost:3000).

Seeded admin: `admin@bloodbank.com` / `Admin@123` (override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`).

## Features

- Donor registration (blood group + last donation date)
- Search available units by group
- Emergency blood request form
- Admin donor records, inventory edits, request pipeline
- Dashboard: units by group, active requests, low-stock groups
- Eligibility: 90 days since last donation; recording a donation increments inventory
