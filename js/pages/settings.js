const DAYS = [
  ["mon", "Monday"], ["tue", "Tuesday"], ["wed", "Wednesday"], ["thu", "Thursday"],
  ["fri", "Friday"], ["sat", "Saturday"], ["sun", "Sunday"],
];

// Sign-in buttons ke chhote logos
const GITHUB_ICON = `<svg viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>`;
const GOOGLE_ICON = `<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;

const SettingsPage = {
  // ---------- ACCOUNT & SYNC card (sabse upar) ----------
  accountCard() {
    // Guest mode: sign-in buttons ki zaroorat nahi, bas guest mode ki jaankari + bahar nikalne ka button
    if (!Auth.isSignedIn() && Guest.active()) {
      return `
      <section class="card form-section account-card guest-card">
        <h2 class="section-title">👀 Guest mode</h2>
        <p class="hint">You're exploring AlgoQuest as a guest. Your progress is saved in this browser only and is not backed up to the cloud.</p>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" data-account="exit-guest">Exit guest mode</button>
        </div>
        <p class="hint guest-owner">Are you the owner? Exit guest mode to sign in.</p>
      </section>`;
    }

    // Logged out: sign-in buttons
    if (!Auth.isSignedIn()) {
      return `
      <section class="card form-section account-card">
        <h2 class="section-title">☁️ Account & Sync</h2>
        <p class="hint">Sign in to back up your progress and continue on any device. Everything keeps working on this device too.</p>
        <div class="btn-row">
          <button type="button" class="btn btn-primary" data-account="github">${GITHUB_ICON} Sign in with GitHub</button>
          <button type="button" class="btn" data-account="google">${GOOGLE_ICON} Sign in with Google</button>
        </div>
      </section>`;
    }

    // Logged in: photo, naam, email, kaunse accounts jude hain
    const u = Auth.user || {};
    const initial = esc((u.name || "?").trim().charAt(0).toUpperCase());
    const avatar = u.avatarUrl
      ? `<img class="acct-avatar" src="${esc(u.avatarUrl)}" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none'">`
      : `<span class="acct-avatar fallback">${initial}</span>`;
    // Auto-renew ki wajah se asli "deewar" 60-din wali hai (sessionEndsAt)
    const fmt = t => new Date(t).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const sessionNote = Auth.reauthRequired
      ? `Your sign-in ends on ${fmt(Auth.expiresAt())}. Sign in again to keep syncing.`
      : u.sessionEndsAt
        ? `You stay signed in while you use AlgoQuest. For security, you'll sign in again by ${fmt(u.sessionEndsAt)}.`
        : `You stay signed in on this device until ${fmt(Auth.expiresAt())}.`;
    const chip = (label, on) => `<span class="acct-chip ${on ? "on" : ""}">${label}${on ? " ✓" : ""}</span>`;

    return `
      <section class="card form-section account-card">
        <h2 class="section-title">☁️ Account & Sync</h2>
        <div class="acct-row">
          ${avatar}
          <div class="acct-info">
            <b>${esc(u.name || "Loading your profile…")}</b>
            <span class="acct-email">${esc(u.email || "")}</span>
            <span class="acct-chips">${chip("GitHub", u.githubLinked)}${chip("Google", u.googleLinked)}</span>
          </div>
        </div>
        <p class="hint acct-note">${sessionNote}</p>
        <div class="btn-row">
          <button type="button" class="btn" data-account="logout">Log out</button>
          <button type="button" class="btn btn-danger" data-account="logout-all">Log out everywhere</button>
        </div>
      </section>`;
  },

  // Account card ke buttons
  async handleAccount(action, btn) {
    if (action === "github" || action === "google") {
      Auth.signIn(action);
      return;
    }
    if (action === "exit-guest") {
      Guest.stop();
      location.hash = "#/login";
      return;
    }
    if (action === "logout") {
      Auth.signOut();
      showToast("Logged out on this device. Your data is still here.");
      return;
    }
    if (action === "logout-all") {
      if (!confirm("Log out on every device where you are signed in? You will need to sign in again here too.")) return;
      btn.disabled = true;
      try {
        await Auth.signOutEverywhere();
        showToast("Logged out on all devices.");
      } catch (err) {
        btn.disabled = false;
        showToast(`Could not log out everywhere: ${err.message}`);
      }
    }
  },

  async render() {
    const s = Store.settings;

    const dayInputs = DAYS.map(([key, label]) => `
      <label class="day-input">
        <span>${label.slice(0, 3)}</span>
        <input type="number" name="hours-${key}" min="0" max="16" step="0.5" value="${s.hours[key]}">
        <small>hrs</small>
      </label>
    `).join("");

    const speedOptions = [1, 1.25, 1.5, 1.75, 2]
      .map(v => `<option value="${v}" ${v === s.playbackSpeed ? "selected" : ""}>${v}x</option>`)
      .join("");

    return `
      <h1 class="page-title">Settings</h1>
      <p class="page-sub">Your daily plan and finish date are calculated from these settings.</p>

      ${this.accountCard()}

      <section class="card form-section appearance">
        <div>
          <h2 class="section-title">🎨 Appearance</h2>
          <p class="hint">Choose how the website looks. System follows your computer's setting.</p>
        </div>
        <div class="theme-cards">
          ${[["dark", "🌙", "Dark"], ["light", "☀️", "Light"], ["system", "💻", "System"]].map(([v, i, l]) => `
            <button type="button" class="theme-card ${(Store.settings.theme || "dark") === v ? "on" : ""}" data-theme-set="${v}">
              <span class="tc-preview tc-${v}"><i></i><i></i><i></i></span>
              <span>${i} ${l}</span>
            </button>`).join("")}
        </div>
      </section>

      <form id="settings-form">
        <section class="card form-section">
          <h2 class="section-title">Weekly study hours</h2>
          <p class="hint">How many hours can you study each day? Use 0 for days off.</p>
          <div class="days-grid">${dayInputs}</div>
        </section>

        <section class="card form-section">
          <h2 class="section-title">Timeline</h2>
          <div class="row">
            <label class="field">
              <span>Start date</span>
              <input type="date" name="startDate" value="${s.startDate}">
            </label>
            <label class="field">
              <span>Target date (placement ready)</span>
              <input type="date" name="targetDate" value="${s.targetDate}">
            </label>
          </div>
        </section>

        <section class="card form-section">
          <h2 class="section-title">Study style</h2>
          <div class="row">
            <label class="field">
              <span>YouTube playback speed</span>
              <select name="playbackSpeed">${speedOptions}</select>
            </label>
            <label class="field">
              <span>Study multiplier</span>
              <input type="number" name="studyMultiplier" min="1" max="3" step="0.1" value="${s.studyMultiplier}">
              <small class="hint">1.5 means a 1-hour video takes 1.5 hours (pausing and coding along)</small>
            </label>
            <label class="field">
              <span>Warm-up questions per day</span>
              <input type="number" name="warmupCount" min="0" max="20" value="${s.warmupCount}">
              <small class="hint">About 5 min each. Plan only; Plan 2.0 has no warm-ups.</small>
            </label>
            <label class="field">
              <span>Lecture share: <b id="share-val">${s.lectureShare}%</b></span>
              <input type="range" name="lectureShare" min="0" max="100" step="5" value="${s.lectureShare}">
              <small class="hint">Share of the time left after warm-ups that goes to videos. The rest goes to Main Quest.</small>
            </label>
          </div>
        </section>

        <div id="summary" class="card summary"></div>

        <button type="submit" class="btn btn-primary">Save settings</button>
      </form>

      <section class="card form-section danger-zone">
        <h2 class="section-title">Backup</h2>
        <p class="hint">Your data is saved only in this browser. Download a backup once a week.</p>
        <div class="btn-row">
          <button id="export-btn" class="btn">Download backup</button>
          <label class="btn">
            Restore backup
            <input type="file" id="import-file" accept=".json" hidden>
          </label>
          <button id="reset-warmup-btn" class="btn">Restart warm-up rounds</button>
          <button id="reset-btn" class="btn btn-danger">Reset everything</button>
        </div>
      </section>

      <p class="muted small settings-about">AlgoQuest · <a href="#/about">About this project</a></p>
      <div id="toast" class="toast" role="status"></div>
    `;
  },

  // Form ki values padh ke ek settings object banao
  readForm() {
    const f = document.getElementById("settings-form");
    const hours = {};
    DAYS.forEach(([key]) => {
      hours[key] = Math.max(0, parseFloat(f[`hours-${key}`].value) || 0);
    });
    return {
      hours,
      startDate: f.startDate.value,
      targetDate: f.targetDate.value,
      playbackSpeed: parseFloat(f.playbackSpeed.value),
      studyMultiplier: parseFloat(f.studyMultiplier.value) || 1,
      warmupCount: parseInt(f.warmupCount.value) || 0,
      lectureShare: parseInt(f.lectureShare.value),
    };
  },

  // Live summary: jaise hi kuch badlo, numbers turant update
  updateSummary() {
    const s = this.readForm();
    const weekly = Object.values(s.hours).reduce((a, b) => a + b, 0);

    const start = new Date(s.startDate);
    const end = new Date(s.targetDate);
    const days = Math.round((end - start) / 86400000) + 1;
    const weeks = days / 7;

    const box = document.getElementById("summary");
    if (!s.startDate || !s.targetDate || days <= 0) {
      box.innerHTML = `<p class="error">The target date must be after the start date.</p>`;
      return;
    }

    document.getElementById("share-val").textContent = s.lectureShare + "%";

    box.innerHTML = `
      <div class="summary-item"><b>${weekly}</b><span>hours / week</span></div>
      <div class="summary-item"><b>${days}</b><span>days left</span></div>
      <div class="summary-item"><b>${Math.round(weekly * weeks)}</b><span>total hours available</span></div>
    `;
  },

  toast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 2200);
  },

  afterRender() {
    document.getElementById("app").onclick = e => {
      const acct = e.target.closest("[data-account]");
      if (acct) { this.handleAccount(acct.dataset.account, acct); return; }
      const b = e.target.closest("[data-theme-set]");
      if (!b) return;
      Store.updateSettings({ theme: b.dataset.themeSet });
      Theme.apply();
      document.querySelectorAll(".theme-card").forEach(x => x.classList.toggle("on", x === b));
    };
    const form = document.getElementById("settings-form");
    this.updateSummary();

    form.addEventListener("input", () => this.updateSummary());

    form.addEventListener("submit", e => {
      e.preventDefault(); // page reload hone se roko
      Store.updateSettings(this.readForm());
      this.toast("Settings saved");
    });

    document.getElementById("export-btn").addEventListener("click", () => {
      Store.exportData();
      this.toast("Backup downloaded");
    });

    document.getElementById("import-file").addEventListener("change", async e => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        Store.importData(await file.text());
        await renderRoute(); // naye data ke saath page dobara banao
        this.toast("Backup restored");
      } catch (err) {
        this.toast("Restore failed: " + err.message);
      }
    });

    document.getElementById("reset-warmup-btn").addEventListener("click", () => {
      if (!confirm("Warm-ups will restart from Round 1 with a new shuffle. The Too easy list will also be cleared.")) return;
      Store.resetWarmup();
      this.toast("Warm-up restarted");
    });

    document.getElementById("reset-btn").addEventListener("click", async () => {
      if (!confirm("This will delete all your data. Are you sure?")) return;
      Store.reset();
      await renderRoute();
      this.toast("Everything reset");
    });
  },
};

// Login/logout hua (kisi bhi wajah se) aur Settings khula hai? Account card dobara banao
window.addEventListener("algoquest:auth-changed", () => {
  if (location.hash.startsWith("#/settings")) renderRoute();
});
