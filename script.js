const API_URL =
  "https://script.google.com/macros/s/AKfycbwMa5-K4O7xe3QwRlIJZm5pfd5cSYnbyRbk3VOw95qCcztX3nagp7eG7TdkYL1Eh5Tf5Q/exec";
let cart = [];

// 🥗 عرض العروض
async function renderOffers() {
  const res = await fetch(`${API_URL}?sheet=offers`);
  const offers = await res.json();
  const container = document.getElementById("offers");
  container.innerHTML = "";
  offers.forEach((offer) => {
    const card = document.createElement("div");
    card.className = "offer";
    card.innerHTML = `
      <h3>${offer["العرض"]}</h3>
      <p>${offer["التفاصيل"]}</p>
      <p><strong>${offer["السعر"]} ل.س</strong></p>
    `;
    container.appendChild(card);
  });
}

// 🍽️ عرض القائمة حسب الأقسام
async function renderMenu() {
  const res = await fetch(`${API_URL}?sheet=menu`);
  const items = await res.json();
  const container = document.getElementById("menu");
  container.innerHTML = "";

  const sections = {};
  items.forEach((item) => {
    const section = item["القسم"];
    if (!sections[section]) sections[section] = [];
    sections[section].push(item);
  });

  for (const section in sections) {
    const group = document.createElement("div");
    group.innerHTML = `<h2>${section}</h2>`;

    sections[section].forEach((item) => {
      const card = document.createElement("div");
      card.className = "menu-item";
      card.innerHTML = `
        <h3>${item["الاسم"]}</h3>
        <p>${item["الوصف"]}</p>
        <p>${item["السعر"]} ل.س</p>
        <button onclick="addToCart('${item["الاسم"]}', ${item["السعر"]})">🛒 إضافة للسلة</button>
      `;
      group.appendChild(card);
    });

    container.appendChild(group);
  }
}

// ➕ أضف إلى السلة
function addToCart(name, price) {
  const existing = cart.find((item) => item.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  updateCartUI();
}

// ➖ إزالة من السلة
function removeFromCart(index) {
  cart.splice(index, 1);
  updateCartUI();
}

// 🧺 تحديث واجهة السلة
function updateCartUI() {
  const container = document.getElementById("cart");
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<em>السلة فارغة</em>";
    updateTotal();
    return;
  }

  cart.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      ${item.qty} × ${item.name} – ${item.price * item.qty} ل.س
      <button onclick="removeFromCart(${index})">❌</button>
    `;
    container.appendChild(row);
  });

  updateTotal();
}

// 💰 عرض المجموع
function updateTotal() {
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("total").textContent = `الإجمالي: ${total} ل.س`;
}

// 🧼 زر لتفريغ السلة
function clearCart() {
  if (confirm("هل أنت متأكد من تفريغ السلة؟")) {
    cart = [];
    updateCartUI();
  }
}

function sendOrder() {
  const tableNumber = getTableNumberFromURL();
  if (!tableNumber || cart.length === 0 || tableNumber === "غير معروف") {
    alert("رقم الطاولة غير معروف أو السلة فارغة.");
    return;
  }

  ...

  cart.forEach((item) => {
    fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        tableNumber,
        item: item.name,
        qty: item.qty,
      }),
    })
      .then((res) => res.text())
      .then((txt) => console.log("✅", txt))
      .catch((err) => console.error("❌", err));
  });

  alert("🚀 تم إرسال الطلب!");
  cart = [];
  updateCartUI();
}

// 🔄 تحديث تلقائي من الشيت كل 60 ثانية
setInterval(() => {
  renderMenu();
  renderOffers();
  console.log("🔄 تم تحديث القائمة والعروض تلقائيًا");
}, 60000);

// 🕒 آخر وقت تحديث (اختياري)
setInterval(() => {
  const t = new Date().toLocaleTimeString();
  document.getElementById("last-updated").textContent = `آخر تحديث: ${t}`;
}, 1000);

// 🚀 عند تحميل الصفحة
window.onload = function () {
  renderOffers();
  renderMenu();
  updateCartUI();
};
