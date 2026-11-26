// Campus Bites front end. All buttons use data-action + one delegated click handler,
// so nothing depends on inline onclick="" strings.
const $ = id => document.getElementById(id);
const rupees = n => "₹" + Number(n).toLocaleString("en-IN");
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const VIEWS = ["homeView", "shopView", "checkoutView", "successView", "ordersView"];

let MENU = null, currentOutlet = null, activeCategory = "All", visibleItems = [];
let cart = [], cartOutlet = null, orderType = "Dine-in", pollTimer = null, lastStatus = {};

// ---------- small helpers ----------
function show(view) {
  VIEWS.forEach(v => $(v).classList.toggle("hidden", v !== view));
  if (view !== "ordersView") stopPoll();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function toast(msg) {
  const t = $("toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}
async function api(url, options) {
  const res = await fetch(url, options);
  let data = {}; try { data = await res.json(); } catch (_) {}
  if (!res.ok) throw new Error(data.error || "Something went wrong (" + res.status + ")");
  return data;
}
function savedOrders() { try { return JSON.parse(localStorage.getItem("cb_orders") || "[]"); } catch (_) { return []; } }
function saveOrderRef(token, phone) {
  try { const l = savedOrders().filter(o => o.token !== token); l.push({ token, phone }); localStorage.setItem("cb_orders", JSON.stringify(l.slice(-30))); } catch (_) {}
}

// ---------- load menu from the backend ----------
async function loadMenu() {
  try {
    MENU = await api("/api/menu");
    $("apiError").classList.add("hidden");
    renderExtras(); renderCart();
  } catch (e) { $("apiError").classList.remove("hidden"); }
}

// ---------- counters & menu ----------
function openOutlet(key) {
  if (!MENU) { toast("Menu is still loading..."); loadMenu(); return; }
  if (cart.length && cartOutlet !== key) {
    if (!confirm(`Your cart has items from ${MENU.outlets[cartOutlet].name}. Each counter prepares its own order. Clear the cart and switch to ${MENU.outlets[key].name}?`)) return;
    cart = []; cartOutlet = null;
  }
  currentOutlet = key; activeCategory = "All"; $("searchBox").value = "";
  const d = MENU.outlets[key];
  $("shopTitle").innerHTML = esc(d.name).replace(" &amp; ", " &amp;<br>").replace(/^(Tummy|Food) /, "$1<br>");
  $("shopEyebrow").textContent = d.eyebrow; $("shopSubtitle").textContent = d.subtitle; $("shopHeroArt").textContent = d.hero;
  $("shopHero").className = "shop-hero " + d.theme;
  renderCategories(); renderMenu(); renderCart(); show("shopView");
}
function categoryList() { return ["All", ...Object.keys(MENU.outlets[currentOutlet].categories)]; }
function renderCategories() {
  $("categoryTabs").innerHTML = categoryList().map(c =>
    `<button type="button" class="${c === activeCategory ? "active" : ""}" data-action="choose-category" data-category="${esc(c)}">${esc(c)}</button>`).join("");
}
function renderMenu() {
  const cats = MENU.outlets[currentOutlet].categories, q = $("searchBox").value.trim().toLowerCase();
  const items = [];
  Object.entries(cats).forEach(([cat, dishes]) => { if (activeCategory === "All" || activeCategory === cat) dishes.forEach(d => items.push(d)); });
  visibleItems = items.filter(i => i.name.toLowerCase().includes(q));
  $("menuGrid").innerHTML = visibleItems.length ? visibleItems.map((i, idx) => `
    <article class="dish-card">
      <div class="dish-photo"><img src="${esc(i.image)}" alt="${esc(i.name)}" loading="lazy"></div>
      <div class="dish-info"><h3>${esc(i.name)}</h3><p>${esc(i.category)}</p>
        <div class="dish-bottom"><span class="dish-price">${rupees(i.price)}</span>
        <button class="add-btn" type="button" data-action="add" data-index="${idx}" aria-label="Add ${esc(i.name)}">+</button></div></div>
    </article>`).join("") : '<p class="muted">No dishes found. Try another search.</p>';
}
// if an image ever fails to load, show a plate instead of a broken icon
document.addEventListener("error", e => {
  if (e.target.tagName === "IMG" && e.target.closest(".dish-photo")) e.target.replaceWith(document.createTextNode("🍽️"));
}, true);

// ---------- cart ----------
function renderExtras() {
  const checked = new Set([...document.querySelectorAll("#extrasGrid input:checked")].map(x => x.value));
  $("extrasGrid").innerHTML = (MENU ? MENU.extras : []).map(e =>
    `<label><input type="checkbox" value="${esc(e.name)}" data-price="${e.price}" ${checked.has(e.name) ? "checked" : ""}> ${esc(e.name)} <b>+₹${e.price}</b></label>`).join("");
}
function getExtras() { return [...document.querySelectorAll("#extrasGrid input:checked")].map(x => ({ name: x.value, price: Number(x.dataset.price) })); }
function totals() {
  const items = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const extras = cart.length ? getExtras().reduce((s, e) => s + e.price, 0) : 0;
  return { items, extras, total: items + extras };
}
function renderCart() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  $("cartCount").textContent = count; $("cartPanelCount").textContent = "(" + count + ")";
  $("cartItems").innerHTML = cart.length ? cart.map(i => `
    <div class="cart-line">
      <div><div class="cart-line-name">${esc(i.name)}</div><div class="cart-line-price">${rupees(i.price)} each · ${rupees(i.price * i.qty)}</div></div>
      <div class="qty-control">
        <button type="button" data-action="qty" data-id="${esc(i.id)}" data-delta="-1" aria-label="Remove one">−</button>
        <span>${i.qty}</span>
        <button type="button" data-action="qty" data-id="${esc(i.id)}" data-delta="1" aria-label="Add one">+</button>
      </div>
    </div>`).join("")
    : '<div class="empty-cart"><span>🛍️</span><b>Your cart is waiting</b><small>Add something delicious from the menu.</small></div>';
  const t = totals();
  $("itemsTotal").textContent = rupees(t.items); $("extrasTotal").textContent = rupees(t.extras); $("grandTotal").textContent = rupees(t.total);
}

// ---------- checkout & placing the order ----------
async function placeOrder(e) {
  e.preventDefault();
  const err = $("formError"); err.classList.add("hidden");
  const fail = m => { err.textContent = m; err.classList.remove("hidden"); toast(m); };
  if (!cart.length) { toast("Your cart is empty"); show("shopView"); return; }
  const name = $("customerName").value.trim(), phone = $("customerPhone").value.trim();
  if (name.length < 2) return fail("Please enter your name.");
  if (!/^[6-9]\d{9}$/.test(phone)) return fail("Enter a valid 10-digit Indian mobile number.");
  const btn = $("placeBtn"); btn.disabled = true; btn.firstChild.textContent = "Placing order... ";
  try {
    const r = await api("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, phone, outlet: cartOutlet, orderType,
        payment: document.querySelector('input[name="payment"]:checked').value,
        items: cart.map(i => ({ id: i.id, qty: i.qty })), extras: getExtras().map(x => x.name)
      })
    });
    saveOrderRef(r.order.token, phone);
    lastStatus[r.order.token] = r.order.status;
    $("successMessage").textContent = `Thanks, ${name}! Your ${r.order.orderType.toLowerCase()} order from ${r.order.outletName} is confirmed.`;
    $("tokenNumber").textContent = r.order.token;
    $("receipt").innerHTML = orderCard(r.order, true);
    $("smsNote").textContent = r.sms && r.sms.sent ? "✓ Confirmation SMS sent." : "Tip: keep this token. You can look up your order any time under “My orders”.";
    cart = []; cartOutlet = null; document.querySelectorAll("#extrasGrid input").forEach(x => x.checked = false); renderCart();
    $("checkoutForm").reset(); $("toast").classList.remove("show"); show("successView");
  } catch (ex) { fail(ex.message); }
  finally { btn.disabled = false; btn.firstChild.textContent = "Pay & place order "; }
}

// ---------- order card (used on success page and My orders) ----------
const STEPS = ["Confirmed", "Preparing", "Ready", "Collected"];
function orderCard(o, receiptOnly) {
  const idx = STEPS.indexOf(o.status), cancelled = o.status === "Cancelled";
  const tracker = cancelled ? '<div class="cancelled">This order was cancelled.</div>'
    : '<ol class="steps">' + STEPS.map((s, i) => `<li class="${i < idx ? "done" : i === idx ? "current" : ""}"><i>${i < idx ? "✓" : i + 1}</i><span>${s}</span></li>`).join("") + "</ol>";
  const when = new Date(o.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const lines = o.items.map(i => `<div class="r-row"><span>${i.qty} × ${esc(i.name)}</span><b>${rupees(i.price * i.qty)}</b></div>`).join("")
    + (o.extras.length ? `<div class="r-row"><span>Extras: ${o.extras.map(e => esc(e.name)).join(", ")}</span><b>${rupees(o.extrasTotal)}</b></div>` : "");
  const head = receiptOnly ? "" : `<div class="oc-head"><div><div class="oc-token">${esc(o.token)}</div><div class="oc-sub">${esc(o.outletName)} · ${when}</div></div><span class="pill ${o.status}">${o.status.toUpperCase()}</span></div>`;
  const body = `<div class="receipt">${receiptOnly ? `<p class="r-meta">${esc(o.outletName)} · ${esc(o.orderType)} · ${when}</p>` : `<p class="r-meta">${esc(o.name)} · ${esc(o.orderType)}</p>`}${lines}
      <div class="r-row r-total"><span>Total</span><span>${rupees(o.total)}</span></div>
      <div class="r-row"><span>Payment</span><span>${esc(o.payment)} · ${esc(o.paymentStatus)}</span></div></div>`;
  const ready = o.status === "Ready" ? '<div class="ready-banner">🎉 Your order is ready! Please collect it from the counter with your token.</div>' : "";
  return receiptOnly ? `${tracker}${body}${ready}` : `<div class="order-card ${o.status === "Ready" ? "is-ready" : ""}">${head}${tracker}${body}${ready}</div>`;
}

// ---------- My orders ----------
async function loadMyOrders(silent) {
  const refs = savedOrders(); const out = [];
  for (const r of refs.slice().reverse()) {
    try { out.push((await api(`/api/orders/${encodeURIComponent(r.token)}?phone=${r.phone}`)).order); } catch (_) {}
  }
  out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  renderOrders(out, silent);
}
function renderOrders(list, silent) {
  list.forEach(o => {
    if (silent && lastStatus[o.token] && lastStatus[o.token] !== o.status && o.status === "Ready") toast(`🎉 Order ${o.token} is ready for pick-up!`);
    lastStatus[o.token] = o.status;
  });
  $("ordersList").innerHTML = list.length ? list.map(o => orderCard(o)).join("")
    : '<div class="empty-orders">No orders yet on this device.<br>Place an order, or enter your mobile number above to find earlier ones.</div>';
}
function showOrders() {
  show("ordersView"); loadMyOrders(false);
  stopPoll(); pollTimer = setInterval(() => loadMyOrders(true), 5000);
}
function stopPoll() { if (pollTimer) { clearInterval(pollTimer); pollTimer = null; } }
async function lookupOrder(e) {
  e.preventDefault();
  const phone = $("lookupPhone").value.trim(), token = $("lookupToken").value.trim().toUpperCase();
  if (!/^[6-9]\d{9}$/.test(phone)) return toast("Enter the 10-digit mobile number used for the order.");
  try {
    const list = token ? [(await api(`/api/orders/${encodeURIComponent(token)}?phone=${phone}`)).order] : (await api(`/api/orders?phone=${phone}`)).orders;
    if (!list.length) { toast("No orders found for that number."); return; }
    list.forEach(o => saveOrderRef(o.token, phone));
    await loadMyOrders(false); toast(`Found ${list.length} order${list.length > 1 ? "s" : ""}.`);
  } catch (ex) { toast(ex.message); }
}

// ---------- ONE click handler for every button ----------
const actions = {
  home() { show("homeView"); },
  explore() { $("outlets").scrollIntoView({ behavior: "smooth" }); },
  retry() { loadMenu(); },
  "open-outlet"(el) { openOutlet(el.dataset.outlet); },
  "choose-category"(el) { activeCategory = el.dataset.category; renderCategories(); renderMenu(); },
  add(el) {
    const item = visibleItems[Number(el.dataset.index)]; if (!item) return;
    cartOutlet = currentOutlet;
    const found = cart.find(i => i.id === item.id);
    if (found) found.qty++; else cart.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
    renderCart(); toast(item.name + " added to cart");
  },
  qty(el) {
    const it = cart.find(i => i.id === el.dataset.id); if (!it) return;
    it.qty += Number(el.dataset.delta); if (it.qty <= 0) cart = cart.filter(i => i !== it);
    if (!cart.length) cartOutlet = null; renderCart();
  },
  "clear-cart"() {
    if (!cart.length) return toast("Your cart is already empty");
    if (confirm("Remove all items from your cart?")) { cart = []; cartOutlet = null; document.querySelectorAll("#extrasGrid input").forEach(x => x.checked = false); renderCart(); toast("Cart cleared"); }
  },
  "order-type"(el) { orderType = el.dataset.type; document.querySelectorAll("[data-order-type],[data-action='order-type']").forEach(b => b.classList.toggle("selected", b.dataset.type === orderType)); },
  "scroll-cart"() {
    if ($("shopView").classList.contains("hidden")) { if (cart.length && cartOutlet) openOutlet(cartOutlet); else toast("Open a counter and add some food first"); }
    setTimeout(() => $("cartPanel").scrollIntoView({ behavior: "smooth", block: "center" }), 60);
  },
  checkout() {
    if (!cart.length) return toast("Add at least one dish first");
    $("checkoutTotal").textContent = rupees(totals().total); $("formError").classList.add("hidden"); show("checkoutView");
  },
  "back-shop"() { show("shopView"); },
  "show-orders"() { showOrders(); },
  "new-order"() { show("homeView"); }
};
document.addEventListener("click", e => {
  const el = e.target.closest("[data-action]"); if (!el) return;
  if (el.tagName === "A") e.preventDefault();
  const fn = actions[el.dataset.action]; if (fn) fn(el, e);
});
document.addEventListener("change", e => {
  if (e.target.matches("#extrasGrid input")) renderCart();
  if (e.target.matches('input[name="payment"]')) $("paymentHint").textContent = "Demo mode: " + e.target.value + " payment will be marked as " + (e.target.value === "Cash" ? "pay at the counter." : "simulated.");
});
$("searchBox").addEventListener("input", () => { if (MENU && currentOutlet) renderMenu(); });
$("checkoutForm").addEventListener("submit", placeOrder);
$("lookupForm").addEventListener("submit", lookupOrder);
["customerPhone", "lookupPhone"].forEach(id => $(id).addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, ""); }));

renderCart();
loadMenu();
