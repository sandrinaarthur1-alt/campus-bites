# Campus Bites — Smart Canteen Ordering System

Web front end + **Node.js backend** (no npm packages to install).
Customers order from three counters, get an **order-confirmed page with a token number**, and can look up their
orders (with live status) under **My orders**. Counter staff manage orders on **/admin.html**.

## Step-by-step: run it (about 5 minutes)

1. **Install Node.js** (version 18 or newer) from https://nodejs.org (choose the LTS version).
   Check it worked: open a terminal and run `node -v`.
2. **Unzip** `campus-bites-v2.zip` and **open the `campus-bites` folder in VS Code** (File → Open Folder).
3. Open the VS Code terminal (**Terminal → New Terminal**) and run:
   ```
   npm start
   ```
   You should see `Campus Bites running at http://localhost:3000`. (No `npm install` is needed.)
4. Open **http://localhost:3000** in your browser. Do NOT use Live Server or double-click index.html,
   because the website needs the backend running to load the menu and save orders.
5. **Try a full order:** pick a counter → choose a category → press **+** on dishes → change quantity with **−/+**
   → tick extras → **Continue to checkout** → enter name + 10-digit mobile → **Pay & place order**.
   You land on the **Order confirmed** page with your token (e.g. `CB1001`) and a receipt.
6. Click **Track my order** (or **My orders** in the top bar) to see the order, its token and a status tracker.
7. Open **http://localhost:3000/admin.html** in a second tab, log in with PIN **1234**, and press
   **Start preparing → Mark ready → Mark collected**. The customer's *My orders* page updates by itself
   within about 5 seconds and shows "Your order is ready!".
8. Press `Ctrl + C` in the terminal to stop the server.

## Using it on your phone (same Wi-Fi)
Find your computer's IP (Windows: `ipconfig`, Mac: `ifconfig`), then open `http://<that-ip>:3000` on the phone.

## Settings (optional)
Copy `.env.example` to `.env` and edit:
- `PORT` – change if 3000 is busy.
- `ADMIN_PIN` – staff PIN (default 1234). **Change it before a public demo.**
- `TWILIO_*` – real SMS (order confirmed + order ready). Leave blank to run without SMS.
  Twilio trial accounts can only SMS verified numbers, and Indian numbers need DLT registration.

## Project structure
```
server.js          backend: API + serves the website (plain Node, no packages)
menu.js            ALL dishes and prices (edit here)
data/orders.json   saved orders (created automatically)
public/            website: index.html, script.js, style.css, admin.html
public/images/photos/<dish-slug>.jpg   real photos (19 dishes)
public/images/dishes/<dish-slug>.svg   unique illustration for every other dish
tools/make-images.js   regenerates the illustrations
```

## API (for your report)
| Method | URL | Purpose |
|---|---|---|
| GET | /api/menu | menu, prices, image for each dish, extras |
| POST | /api/orders | place order (server recalculates prices) → token |
| GET | /api/orders/CB1001?phone=98xxxxxxxx | one order (token + phone must match) |
| GET | /api/orders?phone=98xxxxxxxx | all orders for that mobile number |
| GET | /api/admin/orders | staff: list orders (header `x-admin-pin`) |
| PATCH | /api/admin/orders/CB1001 | staff: change status |

Order status flow: **Confirmed → Preparing → Ready → Collected** (or Cancelled).

## Food images
Every one of the 110 menu cards has its own food photo, including repeated dishes at different counters. Photos are stored in `public/images/photos/`.
**To replace a photo:** save it as `public/images/photos/<dish-slug>.jpg` (e.g. `chicken-momos.jpg` or `paneer-tikka.jpg`). For a repeated dish at a specific counter, use `<dish-slug>-<counter>.jpg` (`grains`, `tummy`, or `truck`).

## Change the menu
Edit `menu.js` (name, price) and restart the server. For a brand-new dish run `npm run build-images` to get its illustration.

## Troubleshooting
- *"Can't reach the Campus Bites server"* → run `npm start` and use http://localhost:3000.
- *Port already in use* → set `PORT=3001` in `.env`, or stop the other program.
- *Reset all orders* → stop the server, delete `data/orders.json`, start again.
- *Buttons not responding* → hard refresh with `Ctrl + Shift + R`.

## Limits of this student demo
Payment is simulated (no real money). Orders are stored in a JSON file (fine for a demo; use a database such as
SQLite or PostgreSQL for a real deployment). The "My orders" lookup uses mobile number + token without OTP login.
