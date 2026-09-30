// =========================================================
// MODAL
// Chhota popup (browser ke saade confirm() ki jagah, website ke design mein).
// Modal.open({ title, html, actions }) -> Promise<{ action, checks }>
//   actions: [{ label, value, kind: "primary" | "danger" | "" }]
//   checks : popup ke andar ke checkboxes { name: true/false }
// Esc ya bahar click = pehla "cancel" jaisa action (value: null)
// =========================================================
const Modal = {
  open({ title, html = "", actions = [] }) {
    return new Promise(resolve => {
      document.getElementById("aq-modal")?.remove();
      const wrap = document.createElement("div");
      wrap.id = "aq-modal";
      wrap.className = "aq-modal";
      wrap.innerHTML = `
        <div class="aq-modal-box" role="dialog" aria-modal="true" aria-labelledby="aq-modal-title">
          <h2 id="aq-modal-title">${title}</h2>
          <div class="aq-modal-body">${html}</div>
          <div class="aq-modal-actions">
            ${actions.map((a, i) => `<button type="button" class="btn ${a.kind === "primary" ? "btn-primary" : a.kind === "danger" ? "btn-danger" : ""}" data-i="${i}">${a.label}</button>`).join("")}
          </div>
        </div>`;

      const close = action => {
        const checks = {};
        wrap.querySelectorAll("input[type=checkbox][name]").forEach(c => { checks[c.name] = c.checked; });
        document.removeEventListener("keydown", onKey);
        wrap.remove();
        resolve({ action, checks });
      };
      const onKey = e => { if (e.key === "Escape") close(null); };

      wrap.addEventListener("click", e => {
        if (e.target === wrap) return close(null);           // bahar click
        const b = e.target.closest("[data-i]");
        if (b) close(actions[+b.dataset.i].value);
      });
      document.addEventListener("keydown", onKey);
      document.body.appendChild(wrap);
      // Keyboard wale ke liye: aakhri (main) button pe focus
      wrap.querySelector(".aq-modal-actions button:last-child")?.focus();
    });
  },
};
