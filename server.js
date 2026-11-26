// Campus Bites backend - plain Node.js, NO npm packages needed (Node 18+).
const http = require("http"), fs = require("fs"), path = require("path"), crypto = require("crypto");

// ---------- tiny .env loader ----------
try {
  fs.readFileSync(path.join(__dirname, ".env"), "utf8").split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  });
} catch (_) {}

const PORT = process.env.PORT || 3000;
const ADMIN_PIN = process.env.ADMIN_PIN || "1234";
const PUBLIC = path.join(__dirname, "public");
const DATA_FILE = path.join(__dirname, "data", "orders.json");
const MENU_SRC = require("./menu.js");

// ---------- menu ----------
const slugify = s => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
function imageFor(slug, outlet) {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const outletPhoto = `${slug}-${outlet}.${ext}`;
    if (fs.existsSync(path.join(PUBLIC, "images", "photos", outletPhoto))) return `images/photos/${outletPhoto}`;
  }
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    if (fs.existsSync(path.join(PUBLIC, "images", "photos", `${slug}.${ext}`))) return `images/photos/${slug}.${ext}`;
  }
  return `images/dishes/${slug}.svg`;
}
const EXTRAS = [{ name: "Cheese", price: 20 }, { name: "Sauce", price: 10 }, { name: "Tissue", price: 2 }, { name: "Cutlery", price: 5 }];
const DISHES = {}; // id -> {id,name,price,outlet,category,image}
function buildMenu() {
  const outlets = {};
  for (const [key, o] of Object.entries(MENU_SRC)) {
    const categories = {};
    for (const [cat, items] of Object.entries(o.categories)) {
      categories[cat] = items.map(([name, price]) => {
        const slug = slugify(name), id = `${key}:${slug}`;
        const dish = { id, name, price, category: cat, image: imageFor(slug, key) };
        DISHES[id] = { ...dish, outlet: key };
        return dish;
      });
    }
    outlets[key] = { key, name: o.name, eyebrow: o.eyebrow, subtitle: o.subtitle, theme: o.theme, hero: o.hero, categories };
  }
  return { outlets, extras: EXTRAS };
}
let MENU = buildMenu();

// ---------- order storage (JSON file) ----------
fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
let DB = { counter: 1000, orders: [] };
try { DB = JSON.parse(fs.readFileSync(DATA_FILE, "utf8")); } catch (_) {}
function saveDB() {
  const tmp = DATA_FILE + ".tmp";
  fs.writeFileSync(tmp, JSON.stringify(DB, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}

// ---------- optional SMS (Twilio REST API, no package needed) ----------
async function sendSms(phone, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID, auth = process.env.TWILIO_AUTH_TOKEN, from = process.env.TWILIO_FROM_NUMBER;
  if (!sid || !auth || !from) return { sent: false, note: "SMS not configured (optional)" };
  try {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: { Authorization: "Basic " + Buffer.from(`${sid}:${auth}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ To: "+91" + phone, From: from, Body: body })
    });
    const j = await r.json();
    return r.ok ? { sent: true, note: "SMS accepted by provider" } : { sent: false, note: j.message || "SMS provider rejected the message" };
  } catch (e) { return { sent: false, note: "SMS failed: " + e.message }; }
}

// ---------- helpers ----------
const STATUSES = ["Confirmed", "Preparing", "Ready", "Collected", "Cancelled"];
const publicOrder = o => ({ ...o, phone: "******" + o.phone.slice(-4) });
function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", c => { data += c; if (data.length > 50000) { reject(new Error("Body too large")); req.destroy(); } });
    req.on("end", () => { try { resolve(data ? JSON.parse(data) : {}); } catch (_) { reject(new Error("Invalid JSON")); } });
  });
}
function send(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}
function isAdmin(req) {
  const given = Buffer.from(String(req.headers["x-admin-pin"] || ""));
  const real = Buffer.from(ADMIN_PIN);
  return given.length === real.length && crypto.timingSafeEqual(given, real);
}

// ---------- API ----------
async function api(req, res, url) {
  const p = url.pathname, m = req.method;

  if (p === "/api/health") return send(res, 200, { status: "Server running", orders: DB.orders.length });

  if (p === "/api/menu" && m === "GET") { MENU = buildMenu(); return send(res, 200, MENU); }

  // Place an order
  if (p === "/api/orders" && m === "POST") {
    const b = await readJson(req);
    const name = String(b.name || "").trim(), phone = String(b.phone || "").trim();
    if (name.length < 2 || name.length > 70) return send(res, 400, { error: "Please enter your name (2-70 characters)." });
    if (!/^[6-9]\d{9}$/.test(phone)) return send(res, 400, { error: "Enter a valid 10-digit Indian mobile number." });
    if (!MENU.outlets[b.outlet]) return send(res, 400, { error: "Unknown food counter." });
    if (!["Dine-in", "Takeaway"].includes(b.orderType)) return send(res, 400, { error: "Choose Dine-in or Takeaway." });
    if (!["UPI", "Card", "Cash"].includes(b.payment)) return send(res, 400, { error: "Choose a payment method." });
    if (!Array.isArray(b.items) || !b.items.length || b.items.length > 40) return send(res, 400, { error: "Your cart is empty." });

    const items = [];
    for (const it of b.items) {
      const d = DISHES[it && it.id], qty = Number(it && it.qty);
      if (!d || d.outlet !== b.outlet) return send(res, 400, { error: "A dish in your cart is not available at this counter." });
      if (!Number.isInteger(qty) || qty < 1 || qty > 20) return send(res, 400, { error: "Invalid quantity." });
      const ex = items.find(x => x.id === d.id);
      if (ex) ex.qty += qty; else items.push({ id: d.id, name: d.name, price: d.price, qty });
    }
    const extras = [...new Set(Array.isArray(b.extras) ? b.extras : [])].map(n => EXTRAS.find(e => e.name === n)).filter(Boolean);
    const itemsTotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const extrasTotal = extras.reduce((s, e) => s + e.price, 0);
    const now = new Date().toISOString();

    DB.counter += 1;
    const order = {
      token: "CB" + DB.counter, name, phone, outlet: b.outlet, outletName: MENU.outlets[b.outlet].name,
      orderType: b.orderType, payment: b.payment,
      paymentStatus: b.payment === "Cash" ? "Pay at counter" : "Paid (demo)",
      items, extras, itemsTotal, extrasTotal, total: itemsTotal + extrasTotal,
      status: "Confirmed", createdAt: now, updatedAt: now, history: [{ status: "Confirmed", at: now }]
    };
    DB.orders.push(order); saveDB();

    const sms = await sendSms(phone, `Campus Bites: order ${order.token} confirmed at ${order.outletName}. Total Rs.${order.total}. We will SMS you when it is ready.`);
    return send(res, 201, { order: publicOrder(order), sms });
  }

  // Customer: find orders by phone  or  one order by token + phone
  if (p === "/api/orders" && m === "GET") {
    const phone = String(url.searchParams.get("phone") || "");
    if (!/^[6-9]\d{9}$/.test(phone)) return send(res, 400, { error: "Enter a valid 10-digit mobile number." });
    const list = DB.orders.filter(o => o.phone === phone).slice(-20).reverse().map(publicOrder);
    return send(res, 200, { orders: list });
  }
  let t = p.match(/^\/api\/orders\/(CB\d+)$/i);
  if (t && m === "GET") {
    const o = DB.orders.find(x => x.token === t[1].toUpperCase());
    if (!o || o.phone !== String(url.searchParams.get("phone") || "")) return send(res, 404, { error: "No order found for that token and mobile number." });
    return send(res, 200, { order: publicOrder(o) });
  }

  // Staff
  if (p.startsWith("/api/admin/")) {
    if (!isAdmin(req)) return send(res, 401, { error: "Wrong staff PIN." });
    if (p === "/api/admin/orders" && m === "GET") {
      const status = url.searchParams.get("status"), outlet = url.searchParams.get("outlet");
      const list = DB.orders.filter(o => (!status || o.status === status) && (!outlet || o.outlet === outlet)).slice().reverse();
      return send(res, 200, { orders: list });
    }
    t = p.match(/^\/api\/admin\/orders\/(CB\d+)$/i);
    if (t && m === "PATCH") {
      const b = await readJson(req), o = DB.orders.find(x => x.token === t[1].toUpperCase());
      if (!o) return send(res, 404, { error: "Order not found." });
      if (!STATUSES.includes(b.status)) return send(res, 400, { error: "Invalid status." });
      if (["Collected", "Cancelled"].includes(o.status)) return send(res, 409, { error: `Order is already ${o.status}.` });
      o.status = b.status; o.updatedAt = new Date().toISOString(); o.history.push({ status: o.status, at: o.updatedAt }); saveDB();
      let sms = null;
      if (o.status === "Ready") sms = await sendSms(o.phone, `Campus Bites: order ${o.token} is READY. Please collect it from ${o.outletName}.`);
      return send(res, 200, { order: o, sms });
    }
  }
  send(res, 404, { error: "Not found" });
}

// ---------- static files ----------
const MIME = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".json": "application/json", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
function serveStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname); if (rel === "/") rel = "/index.html";
  const file = path.join(PUBLIC, path.normalize(rel));
  if (!file.startsWith(PUBLIC + path.sep)) { res.writeHead(403); return res.end("Forbidden"); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain" }); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream" });
    res.end(buf);
  });
}

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    serveStatic(req, res, url);
  } catch (e) {
    console.error(e);
    if (!res.headersSent) send(res, e.message === "Invalid JSON" || e.message === "Body too large" ? 400 : 500, { error: e.message || "Server error" });
  }
}).listen(PORT, () => {
  console.log(`Campus Bites running at http://localhost:${PORT}`);
  console.log(`Staff page: http://localhost:${PORT}/admin.html  (PIN: ${ADMIN_PIN})`);
});
