// ======================
// بيانات الطلب
// ======================
let selectedItems = [];

function addItem(name) {
  const existingItem = selectedItems.find((item) => item.name === name);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    selectedItems.push({ name: name, qty: 1 });
  }
  updateCartUI();
}

function removeItem(name) {
  const index = selectedItems.findIndex((item) => item.name === name);
  if (index !== -1) {
    selectedItems.splice(index, 1);
  }
  updateCartUI();
}

function updateCartUI() {
  const cartList = document.getElementById("cart");
  cartList.innerHTML = "";
  selectedItems.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} × ${item.qty}`;
    cartList.appendChild(li);
  });
}

// ======================
// الإرسال إلى Google Sheet عبر Sheetson
// ======================
function sendOrder(tableNumber, items) {
  const SHEETSON_URL = "https://api.sheetson.com/v2/sheets/orders";
  const API_KEY =
    "Bearer _Fy2MfHB_rQe8fTAHFT1LOk6_ZaHPCedE3f0USxqC6jD5ViICKP1sk5G7ng";

  if (!tableNumber || items.length === 0) {
    alert("❗ يرجى إدخال رقم الطاولة واختيار عنصر واحد على الأقل");
    return;
  }

  items.forEach((item) => {
    fetch(SHEETSON_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: API_KEY,
      },
      body: JSON.stringify({
        data: {
          "رقم الطاولة": tableNumber,
          الصنف: item.name,
          الكمية: item.qty,
          الوقت: new Date().toLocaleString("ar-SY"),
          الحالة: "قيد التحضير",
        },
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("فشل الإرسال");
        console.log("✅ تم إرسال الطلب:", item.name);
      })
      .catch((err) => {
        console.error("❌ خطأ أثناء الإرسال:", err);
        alert("❌ حصل خطأ أثناء إرسال الطلب.");
      });
  });

  alert("✅ تم إرسال الطلب بنجاح!");
  selectedItems = [];
  updateCartUI();
  document.getElementById("table-number").value = "";
}

// ======================
// زر التأكيد
// ======================
document.getElementById("submit-order").addEventListener("click", function () {
  const tableNumber = document.getElementById("table-number").value.trim();
  sendOrder(tableNumber, selectedItems);
});
document.getElementById("confirmationMessage").textContent = "✅ تم إرسال الطلب! شكراً لكم";
document.getElementById("confirmationMessage").style.display = "block";
