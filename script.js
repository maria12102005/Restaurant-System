const API_URL =
  "https://script.google.com/macros/s/AKfycbxNgSKbLOqyzlYeKZgRzAhF8Gi2xl9cF4sHNCGsnRKbAfqhT3xAl-SIQpJvS8B11nJNrw/exec"; // ← بدلي برابطك الحقيقي
let cart = [];

function getTableNumberFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("table") || sessionStorage.getItem("table") || "غير معروف";
}

function saveManualTable() {
  const val = document.getElementById("manualTable").value.trim();
  if (!val) return alert("رجاءً أدخل رقم الطاولة");
  sessionStorage.setItem("table", val);
  location.reload();
}

function renderMenu() {
  fetch(`${API_URL}?sheet=menu`)
    .then((res) => res.json())
    .then((items) => {
      const menu = document.getElementById("menu");
      menu.innerHTML = "";

      const order = ["أطباق رئيسية", "مقبلات", "مشروبات", "أراكيل"];

      order.forEach((sectionName, sectionIndex) => {
        const sectionItems = items.filter((i) => i["القسم"] === sectionName);
        if (!sectionItems.length) return;

        const sectionDiv = document.createElement("div");
        sectionDiv.style.marginTop = `${sectionIndex * 40}px`;
        sectionDiv.innerHTML = `<h2>${sectionName}</h2>`;
        const grid = document.createElement("div");
        grid.className = "grid";

        sectionItems.forEach((item, index) => {
          const qtyId = `qty-${sectionName}-${index}`;
          const div = document.createElement("div");
          div.className = "menu-item";
          div.innerHTML = `
            <strong>${item["الاسم"]}</strong>
            <small>${item["الوصف"] || ""}</small>
            <small>${item["السعر"]} ل.س</small>
            <input type="number" id="${qtyId}" value="1" min="1" />
            <button onclick="addToCart('${item["الاسم"]}', ${
            item["السعر"]
          }, '${qtyId}')">➕ أضف</button>
          `;
          grid.appendChild(div);
        });

        sectionDiv.appendChild(grid);
        menu.appendChild(sectionDiv);
      });
    });
}

function renderOffers() {
  fetch(`${API_URL}?sheet=offers`)
    .then((res) => res.json())
    .then((offers) => {
      const box = document.getElementById("offers");
      box.innerHTML = "";

      offers.forEach((offer, index) => {
        const qtyId = `offerQty-${index}`;
        const div = document.createElement("div");
        div.className = "offer-card";
        div.innerHTML = `
          <div class="offer-inner">
            <div class="offer-front">🎁 ${offer["العرض"]}</div>
            <div class="offer-back">
              ${offer["التفاصيل"]}<br>
              ${offer["السعر"]} ل.س<br>
              <input type="number" id="${qtyId}" value="1" min="1" />
              <button onclick="addToCart('${offer["العرض"]}', ${offer["السعر"]}, '${qtyId}')">➕ أضف</button>
            </div>
          </div>
        `;
        box.appendChild(div);
      });
    });
}

function addToCart(name, price, qtyId) {
  const input = document.getElementById(qtyId);
  const qty = parseInt(input.value || "1");
  if (qty < 1) return;

  const exist = cart.find((i) => i.name === name);
  if (exist) exist.qty += qty;
  else cart.push({ name, price, qty });

  input.value = 1;
  updateCartUI();
}

function updateCartUI() {
  const cartBox = document.getElementById("cart");
  if (!cart.length) {
    cartBox.innerHTML = "السلة فارغة";
    document.getElementById("total").textContent = "الإجمالي: 0 ل.س";
    return;
  }

  cartBox.innerHTML = cart
    .map((i) => `<div>${i.qty} × ${i.name}</div>`)
    .join("");
  const subtotal = cart.reduce((t, i) => t + i.price * i.qty, 0);
  const water = 1000;
  const service = 2000;
  const total = subtotal + water + service;
  document.getElementById("total").textContent = `الإجمالي: ${total} ل.س`;
}

function clearCart() {
  cart = [];
  updateCartUI();
}

function sendOrder() {
  const table = getTableNumberFromURL();
  if (!cart.length || table === "غير معروف") {
    alert("يرجى تعبئة السلة وإدخال رقم الطاولة");
    return;
  }

  const now = new Date().toLocaleString("ar-EG");
  const items = cart.map((i) => i.name).join("، ");
  const quantities = cart.map((i) => i.qty).join("، ");

  fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "text/plain;charset=utf-8" // ✅ ضروري لتجنّب preflight
  },
  body: JSON.stringify({
    "رقم الطاولة": table,
    "الصنف": items,
    "الكمية": quantities,
    "الوقت": now,
    "الحالة": "قيد التحضير"
  })
})

    .then(() => {
      alert(`✅ تم إرسال الطلب من الطاولة ${table}`);
      clearCart();
    })
    .catch((err) => {
      console.error("❌ خطأ بالإرسال:", err);
      alert("حدث خطأ، حاول لاحقًا");
    });
}

window.onload = function () {
  const table = getTableNumberFromURL();

  if (table === "غير معروف" && !window.location.search.includes("table")) {
    // ✅ ما فيه QR → نطلب منو يحط رقم الطاولة
    document.getElementById("tablePrompt").style.display = "block";
    document.getElementById("tablePrompt").innerHTML = `
      <h3>📍 رقم الطاولة</h3>
      <input id="manualTable" placeholder="اكتب رقم الطاولة" />
      <button onclick="saveManualTable()">✅ تأكيد</button>
    `;
  } else if (table !== "غير معروف") {
    // ✅ فيه رقم طاولة، من QR أو محفوظ
    sessionStorage.setItem("table", table);
  }

  renderMenu();
  renderOffers();
  updateCartUI();
};

// ✅ تحديث تلقائي كل دقيقة
setInterval(() => {
  renderMenu();
  renderOffers();
}, 60000);
