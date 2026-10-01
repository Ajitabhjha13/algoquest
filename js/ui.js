// =========================================================
// UI HELPERS (poori website ke liye)
// 1) Tooltip ki sahi jagah: neeche jagah na ho toh UPAR khule, kabhi screen se bahar nahi
// 2) Popover jaise dropdowns: bahar kahin bhi click ya Esc = band
// 3) Safe toast: page poora load hone se pehle bhi bula sakte ho
// =========================================================
const UI = {
  // showToast router.js mein hai (sabse aakhri script). Uske load hone se pehle koi toast bole
  // (jaise login ke baad turant "Signed in as..."), toh page load hone tak ruk ke dikhao.
  toast(msg) {
    if (typeof showToast === "function") showToast(msg);
    else window.addEventListener("DOMContentLoaded", () => showToast(msg), { once: true });
  },

  // tip = tooltip element, anchor = jis cheez pe mouse hai, container = tip ka positioned parent (card)
  placeTip(tip, anchor, container) {
    tip.hidden = false;
    const box = container.getBoundingClientRect();
    const r = anchor.getBoundingClientRect();
    const w = tip.offsetWidth, h = tip.offsetHeight, gap = 8, edge = 8;

    // Beech mein rakho, par screen ke kinaron ke andar
    let left = r.left - box.left + r.width / 2 - w / 2;
    const minLeft = edge - box.left;
    const maxLeft = window.innerWidth - edge - w - box.left;
    left = Math.max(minLeft, Math.min(maxLeft, left));

    // Neeche fit nahi hota (aur upar hota hai) toh upar. Isse page lamba nahi hota,
    // scrollbar nahi aata-jaata, aur screen "blink" nahi karti.
    const fitsBelow = r.bottom + gap + h <= window.innerHeight - edge;
    const fitsAbove = r.top - gap - h >= edge;
    const below = fitsBelow || !fitsAbove;

    tip.style.left = left + "px";
    tip.style.top = (below ? r.bottom - box.top + gap : r.top - box.top - h - gap) + "px";
    tip.classList.toggle("above", !below);
  },

  // Sirf "popover" jaise dropdowns (jo content ke upar khulte hain ya page ko bahut lamba karte hain).
  // Kaam wali lists (Main Quest topics, lecture sprints, Settings dropdowns) jaan-boojh ke ismein NAHI:
  // unke andar kaam karte waqt woh apne-aap band ho jayein toh bahut pareshani hogi.
  AUTO_CLOSE: ".trophy-cab, .badge-all, .vmenu",

  openPopovers() {
    return document.querySelectorAll(`details[open]:is(${this.AUTO_CLOSE})`);
  },

  initAutoClose() {
    document.addEventListener("click", e => {
      this.openPopovers().forEach(d => { if (!d.contains(e.target)) d.open = false; });
    });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") this.openPopovers().forEach(d => { d.open = false; });
    });
  },
};

UI.initAutoClose();
