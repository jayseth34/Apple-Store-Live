# Apple Store Live (Accessories MVP)

This repo contains:
- Angular frontend (`/`) for browsing Apple-compatible accessories.
- Node/Express backend (`backend/`) with:
  - product catalog APIs
  - admin product upload (image upload)
  - Razorpay order creation + payment verification

## Prereqs
- Node.js 20+

## Backend (Express)
1. Install deps:
   - `cd backend`
   - `npm install`
2. Create env file:
   - copy `backend/.env.example` → `backend/.env`
   - set values:
     - `ADMIN_PASSWORD`
     - `JWT_SECRET` (min 16 chars)
     - `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`
     - (optional) `RAZORPAY_WEBHOOK_SECRET`
3. Run:
   - `npm run dev`

Backend runs on `http://localhost:4000` and serves uploaded images at `http://localhost:4000/uploads/...`.

## Frontend (Angular)
1. Install deps:
   - `npm install`
2. Run:
   - `npm start`
3. Open:
   - `http://localhost:4200`

Frontend uses `src/environments/environment*.ts` `apiBaseUrl` (default: `http://localhost:4000`).

## Admin
- Open `http://localhost:4200/admin/login`
- Login with `ADMIN_PASSWORD`
- Add/edit/delete products from `http://localhost:4200/admin/products`

## Products / Categories
Initial categories for this phase:
- power bank
- covers
- keyboard
- mouse
- pencil
- airpods
- whoop
- controller