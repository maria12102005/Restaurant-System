// 🔗 رابط Google Apps Script الخاص بك مع doGet مفعل
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbwC287Ayt2nHUFh8KBug5pvF6J_CQn_xyNMUz-aCOcLSPfui7_DhRFjek8fnCCwSIAuwA/exec";

// ✅ جلب بيانات قائمة الطعام (menu)
function renderMenu() {
  fetch(`${API_BASE_URL}?sheet=menu`)
    .then(res => res.json())
    .then(data => {
      const menuContainer = document.getElementById("menu");
      menuContainer.innerHTML = "";

      data.slice(1).forEach(row => {
        const [name, description, price, category, active] = row;

        if (active?.toString().toLowerCase() === "yes") {
          const item = document.createElement("div");
          item.className = "menu-item";
          item.innerHTML = `
            <h3>${name}</h3>
            <p>${description}</p>
            <strong>${price} ل.س</strong>
          `;
          menuContainer.appendChild(item);
        }
      });
    })
    .catch(err => {
      console.error("🚫 خطأ أثناء جلب المينو:", err);
    });
}

// ✅ جلب بيانات العروض (offers)
function renderOffers() {
  fetch(`${API_BASE_URL}?sheet=offers`)
    .then(res => res.json())
    .then(data => {
      const offersContainer = document.getElementById("offers");
      offersContainer.innerHTML = "";

      data.slice(1).forEach(row => {
        const [title, details, price, validUntil] = row;

        const offer = document.createElement("div");
        offer.className = "offer";
        offer.innerHTML = `
          <h4>🎁 ${title}</h4>
          <p>${details}</p>
          <strong>${price} ل.س</strong>
          <small>متاح حتى: ${validUntil}</small>
        `;
        offersContainer.appendChild(offer);
      });
    })
    .catch(err => {
      console.error("🚫 خطأ أثناء جلب العروض:", err);
    });
}

// ✅ تحميل المينو والعروض عند تشغيل الصفحة
window.onload = () => {
  renderMenu();
  renderOffers();
};
