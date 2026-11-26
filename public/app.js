// NOTE: a few photos are shared between similar dishes. Replace with your own
// images (e.g. put files in public/images/ and use "images/name.jpg") before the demo.
const PHOTO = {
    "Masala Dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
    "Ghee Roast": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
    "Plain Dosa": "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600",
    "Idli Vada": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600",
    "Bisi Bele Bath": "https://images.unsplash.com/photo-1547592180-85f173990554?w=600",
    "Puri and Baji": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600",
    "Veg Manchurian Dry": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600",
    "Veg Manchurian Gravy": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600",
    "Margherita Pizza": "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=600",
    "Farmhouse Pizza": "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=600",
    "Classic Veg Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
    "Cheese Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600",
    "French Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600",
    "Peri Peri Fries": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600",
    "Schezwan Noodles": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600",
    "Hakka Noodles": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600",
    // "Watermelon Juice": the original URL had a malformed photo ID, so the emoji fallback is used
    "Orange Juice": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600",
    "Apple Juice": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600",
    "Muskmelon Juice": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600",
    "Pomegranate Juice": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600"
};

const CATEGORY_EMOJI = {
    "Soups": "🍜", "Starters": "🍢", "Pizza": "🍕", "Burger": "🍔", "Chinese": "🥡",
    "Sandwich": "🥪", "Fries": "🍟", "Dosa": "🥞", "Breakfast": "🍛", "Juices": "🥤",
    "Manchurian": "🥡", "Noodles": "🍜"
};

const menus = {
    grains: {
        name: "Grains & Gossips",
        description: "Comfort food, snacks and café favourites.",
        categories: {
            "Soups": [["Sweet Corn Soup", 89], ["Tomato Soup", 89], ["Manchow Soup", 109]],
            "Starters": [["Veg Manchurian Dry", 99], ["Gobi 65", 79], ["Mushroom Chilli", 99]],
            "Pizza": [["Margherita Pizza", 269], ["Farmhouse Pizza", 299]],
            "Burger": [["Classic Veg Burger", 169], ["Cheese Burger", 189]],
            "Chinese": [["Schezwan Noodles", 149], ["Veg Fried Rice", 139], ["Veg Manchurian Gravy", 119]],
            "Sandwich": [["Veg Sandwich", 99], ["Cheese Sandwich", 129]],
            "Fries": [["French Fries", 69], ["Peri Peri Fries", 99]]
        }
    },
    tummy: {
        name: "Tummy Trails",
        description: "South Indian breakfast and fresh juices.",
        categories: {
            "Dosa": [["Masala Dosa", 70], ["Ghee Roast", 80], ["Plain Dosa", 50]],
            "Breakfast": [["Idli Vada", 50], ["Bisi Bele Bath", 70], ["Puri and Baji", 60]],
            "Juices": [["Watermelon Juice", 50], ["Orange Juice", 60], ["Apple Juice", 70], ["Muskmelon Juice", 60], ["Pomegranate Juice", 80]]
        }
    },
    truck: {
        name: "Food Truck",
        description: "Street-style Indo-Chinese and quick bites.",
        categories: {
            "Manchurian": [["Veg Manchurian Dry", 99], ["Veg Manchurian Gravy", 119]],
            "Noodles": [["Schezwan Noodles", 149], ["Hakka Noodles", 129]],
            "Pizza": [["Margherita Pizza", 269]],
            "Burger": [["Classic Veg Burger", 169]],
            "Fries": [["French Fries", 69], ["Peri Peri Fries", 99]]
        }
    }
};

let currentOutlet = "grains";
let activeCategory = "All";
let visibleItems = [];
let cart = [];

const $ = id => document.getElementById(id);
const money = value => "₹" + value;

function showToast(message) {
    $("toast").textContent = message;
    $("toast").classList.add("show");
    setTimeout(() => $("toast").classList.remove("show"), 2000);
}

// ---------- Counters ----------
document.querySelectorAll("[data-outlet]").forEach(button => {
    button.addEventListener("click", () => {
        currentOutlet = button.dataset.outlet;
        activeCategory = "All";
        $("searchInput").value = "";

        $("shop").classList.remove("hidden");
        $("outletTitle").textContent = menus[currentOutlet].name;
        $("outletDescription").textContent = menus[currentOutlet].description;
        $("shop").scrollIntoView({ behavior: "smooth" });

        renderCategories();
        renderMenu();
    });
});

$("backCounters").addEventListener("click", () => {
    $("shop").classList.add("hidden");
    $("counters").scrollIntoView({ behavior: "smooth" });
});

// ---------- Categories ----------
function categoryList() {
    return ["All", ...Object.keys(menus[currentOutlet].categories)];
}

function renderCategories() {
    $("categoryTabs").innerHTML = categoryList().map((category, index) => `
        <button class="category-btn ${category === activeCategory ? "active" : ""}"
            data-category-index="${index}" type="button">${category}</button>
    `).join("");
}

$("categoryTabs").addEventListener("click", event => {
    const button = event.target.closest("[data-category-index]");
    if (!button) return;
    activeCategory = categoryList()[Number(button.dataset.categoryIndex)];
    renderCategories();
    renderMenu();
});

// ---------- Menu ----------
$("searchInput").addEventListener("input", renderMenu);

function renderMenu() {
    const groups = menus[currentOutlet].categories;
    const items = [];

    Object.entries(groups).forEach(([category, dishes]) => {
        if (activeCategory !== "All" && activeCategory !== category) return;
        dishes.forEach(([name, price]) => items.push({ name, price, category }));
    });

    const query = $("searchInput").value.toLowerCase().trim();
    visibleItems = items.filter(item => item.name.toLowerCase().includes(query));

    if (!visibleItems.length) {
        $("menuGrid").innerHTML = '<p class="empty-note">No dishes found.</p>';
        return;
    }

    $("menuGrid").innerHTML = visibleItems.map((item, index) => {
        const photo = PHOTO[item.name];
        const emoji = CATEGORY_EMOJI[item.category] || "🍽️";

        return `
            <div class="dish-card">
                ${photo ? `<img class="dish-image" src="${photo}" alt="${item.name}" loading="lazy"
                    onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">` : ""}
                <div class="dish-image-fallback" style="${photo ? "display:none" : ""}">${emoji}</div>
                <div class="dish-info">
                    <h3>${item.name}</h3>
                    <div class="dish-bottom">
                        <b>${money(item.price)}</b>
                        <button class="add-btn" data-add-index="${index}" type="button" aria-label="Add ${item.name}">+</button>
                    </div>
                </div>
            </div>`;
    }).join("");
}

// ---------- Cart ----------
// Items are keyed by counter + name so the same dish from two counters stays separate
$("menuGrid").addEventListener("click", event => {
    const button = event.target.closest("[data-add-index]");
    if (!button) return;

    const item = visibleItems[Number(button.dataset.addIndex)];
    if (!item) return;

    const key = currentOutlet + "|" + item.name;
    const existing = cart.find(x => x.key === key);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...item, key, outlet: menus[currentOutlet].name, qty: 1 });
    }

    renderCart();
    showToast(item.name + " added to cart!");
});

function changeQuantity(key, amount) {
    const item = cart.find(x => x.key === key);
    if (!item) return;
    item.qty += amount;
    if (item.qty <= 0) cart = cart.filter(x => x.key !== key);
    renderCart();
}

function removeItem(key) {
    cart = cart.filter(x => x.key !== key);
    renderCart();
}

function getExtras() {
    return [...document.querySelectorAll(".extra:checked")].map(x => ({
        name: x.value,
        price: Number(x.dataset.price)
    }));
}

function getTotals() {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    // No extras charge on an empty cart
    const extras = cart.length ? getExtras().reduce((sum, e) => sum + e.price, 0) : 0;
    return { subtotal, extras, total: subtotal + extras };
}

function renderCart() {
    $("cartCount").textContent = cart.reduce((sum, item) => sum + item.qty, 0);

    $("cartItems").innerHTML = cart.length
        ? cart.map(item => `
            <div class="cart-row">
                <div>
                    <b>${item.name}</b>
                    <p>${item.outlet} · ${money(item.price)} each</p>
                </div>
                <div class="qty-controls">
                    <button type="button" data-qty="-1" data-key="${item.key}">−</button>
                    <b>${item.qty}</b>
                    <button type="button" data-qty="1" data-key="${item.key}">+</button>
                    <button type="button" class="remove-item" data-remove="${item.key}">Remove</button>
                </div>
            </div>`).join("")
        : "<p>Your cart is empty.</p>";

    const totals = getTotals();
    $("subtotal").textContent = money(totals.subtotal);
    $("extrasTotal").textContent = money(totals.extras);
    $("grandTotal").textContent = money(totals.total);
}

$("cartItems").addEventListener("click", event => {
    const qty = event.target.closest("[data-qty]");
    const remove = event.target.closest("[data-remove]");
    if (qty) changeQuantity(qty.dataset.key, Number(qty.dataset.qty));
    if (remove) removeItem(remove.dataset.remove);
});

document.querySelectorAll(".extra").forEach(input => input.addEventListener("change", renderCart));

$("cartJump").addEventListener("click", () => {
    $("orderSection").scrollIntoView({ behavior: "smooth" });
});

$("checkoutButton").addEventListener("click", () => {
    if (!cart.length) {
        showToast("Please add food to your cart!");
        return;
    }
    $("checkoutSection").classList.remove("hidden");
    $("checkoutSection").scrollIntoView({ behavior: "smooth" });
});

// ---------- Place order ----------
$("checkoutForm").addEventListener("submit", async event => {
    event.preventDefault();

    const name = $("customerName").value.trim();
    const phone = $("customerPhone").value.trim();

    if (!cart.length) return showToast("Your cart is empty!");
    if (!name) return showToast("Please enter your name.");
    if (!/^[6-9]\d{9}$/.test(phone)) return showToast("Enter a valid 10-digit mobile number.");

    const token = "CB" + Math.floor(1000 + Math.random() * 9000);
    const totals = getTotals();

    const order = {
        name,
        phone,
        token,
        outlet: [...new Set(cart.map(item => item.outlet))].join(", "),
        orderType: document.querySelector('input[name="orderType"]:checked').value,
        payment: document.querySelector('input[name="payment"]:checked').value,
        extras: getExtras().map(e => e.name),
        total: totals.total
    };

    $("placeOrderButton").disabled = true;
    $("placeOrderButton").textContent = "Placing order...";

    $("checkoutSection").classList.add("hidden");
    $("successSection").classList.remove("hidden");
    $("successText").textContent = `Thank you ${name}! Your order is placed.`;
    $("tokenNumber").textContent = token;
    $("smsStatus").textContent = "Sending confirmation SMS...";
    $("successSection").scrollIntoView({ behavior: "smooth" });

    try {
        const response = await fetch("/api/order-confirmation", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order)
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.error);

        $("smsStatus").textContent = "✓ Confirmation SMS accepted by SMS provider.";
    } catch (error) {
        $("smsStatus").textContent = "Order placed, but SMS was not sent: " + error.message;
    } finally {
        $("placeOrderButton").disabled = false;
        $("placeOrderButton").textContent = "Place Order";
    }
});

// ---------- New order ----------
$("newOrder").addEventListener("click", () => {
    cart = [];
    $("checkoutForm").reset();
    document.querySelectorAll(".extra").forEach(x => { x.checked = false; });
    renderCart();

    $("successSection").classList.add("hidden");
    $("checkoutSection").classList.add("hidden");
    $("shop").classList.add("hidden");
    $("counters").scrollIntoView({ behavior: "smooth" });
});

renderCart();
