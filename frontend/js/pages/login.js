// =========================================================
// LOGIN SCREEN
// Sign in nahi hai (aur guest mode bhi nahi) toh website se PEHLE yeh screen aati hai.
// About page sabke liye khula hai (recruiters ke liye).
// =========================================================

// Guest mode: bina login ke website ghoomna, ek ALAG sandbox dabbe mein.
// Owner ka asli data na dikhta hai, na badalta hai, aur guest ka data kabhi sync nahi hota.
const Guest = {
  KEY: GUEST_FLAG_KEY,
  active() { return localStorage.getItem(this.KEY) === "1"; },
  start() { localStorage.setItem(this.KEY, "1"); Store.load(); }, // sandbox dabba kholo
  stop() {
    if (!this.active()) return;
    localStorage.removeItem(this.KEY);
    Store.load(); // owner ka asli dabba wapas
  },
};

// Offline mode: server down tha toh owner ne "continue offline" dabaya.
// Yeh OWNER ka hi data hai: changes yaad rehte hain aur sign in ke baad sync ho jaate hain.
const Offline = {
  KEY: "dsaPlanner.offline",
  active() { return localStorage.getItem(this.KEY) === "1"; },
  start() { localStorage.setItem(this.KEY, "1"); },
  stop() { localStorage.removeItem(this.KEY); },
};

// Neeche dikhne wale chhote quotes (har baar alag)
const LOGIN_QUOTES = [
  "Consistency beats intensity.",
  "Understand the pattern, not just the problem.",
  "Dry run it before you run it.",
  "Every expert was once a beginner.",
  "One more problem. Then one more.",
  "Brute force first, then optimise.",
  "Small steps, every single day.",
  "Stuck is where the learning happens.",
];

const LoginScreen = {
  el: null,
  serverState: "idle", // idle | waking | ready | down
  error: null,         // login fail hua toh backend ne kya bataya: not_owner | cancelled | failed

  // Backend login fail hone pe "#/login?error=..." pe bhejta hai. Code uthao aur URL saaf karo.
  readError() {
    if (!location.hash.startsWith("#/login?")) return;
    const code = new URLSearchParams(location.hash.split("?")[1]).get("error");
    history.replaceState(null, "", location.pathname + location.search + "#/login");
    if (!["not_owner", "cancelled", "failed"].includes(code)) return;
    this.error = code;
    // Owner nahi tha: is browser ko "welcome back / last used" mat dikhao
    if (code === "not_owner") localStorage.removeItem(Auth.LAST_PROVIDER_KEY);
  },

  errorHtml() {
    const msg = {
      not_owner: `<b>This is a private planner.</b> Only its owner can sign in, but you're welcome to
                  <button type="button" data-login="guest">explore as a guest</button>.`,
      cancelled: `Sign-in was cancelled. You can try again anytime.`,
      failed: `Sign-in didn't work this time. Please try again.`,
    }[this.error];
    this.error = null; // ek hi baar dikhao
    return msg ? `<p class="login-error" role="alert">${msg}</p>` : "";
  },

  // Kya login screen dikhani hai?
  shouldShow(pageName) {
    if (Auth.isSignedIn()) { Guest.stop(); Offline.stop(); return false; } // login ho gaya: guest/offline khatam
    if (Guest.active() || Offline.active()) return false;
    return pageName !== "about"; // About sabke liye khula
  },

  greeting() {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  },

  providerButton(provider, label, icon, primary) {
    const last = Auth.lastProvider() === provider;
    return `
      <button type="button" class="login-btn ${primary ? "primary" : ""}" data-login="${provider}">
        ${icon}<span>${label}</span>
        ${last ? `<em class="login-last">Last used</em>` : ""}
      </button>`;
  },

  html() {
    const quote = LOGIN_QUOTES[Math.floor(Math.random() * LOGIN_QUOTES.length)];
    // Pehle kabhi login kiya tha? Toh "welcome back" wala chhota note
    const errorBox = this.errorHtml();
    const returning = !errorBox && !!Auth.lastProvider();
    const last = Auth.lastProvider();
    // "Last used" wala button upar aur hara (primary)
    const githubFirst = last !== "google";
    const gh = this.providerButton("github", "Continue with GitHub", GITHUB_ICON, githubFirst);
    const gg = this.providerButton("google", "Continue with Google", GOOGLE_ICON, !githubFirst);

    return `
      <div class="login-bg" aria-hidden="true"></div>

      <header class="login-top">
        <div class="login-brand">
          <span class="login-logo"><img src="assets/brand/logo.png" alt=""></span>
          <span class="login-brand-text">
            <b>Algo<em>Quest</em></b>
            <small>Grind · Track · Crack</small>
          </span>
        </div>
        <nav class="login-links">
          <button type="button" class="login-link" data-login="guest">Explore as guest</button>
          <a class="login-link" href="#/about">About</a>
        </nav>
      </header>

      <main class="login-center">
        <section class="login-card" aria-labelledby="login-title">
          <h1 id="login-title">Algo<em>Quest</em></h1>
          <p class="login-tag">Grind · Track · Crack</p>

          <h2 class="login-hello">${this.greeting()}, Ajitabh&nbsp;👋</h2>
          <p class="login-line">From arrays to offer letters, your streak is waiting.</p>

          ${errorBox}
          ${returning ? `<p class="login-note">Welcome back! Sign in to continue. Your progress on this device is safe and will sync after you sign in.</p>` : ""}

          <div class="login-buttons">
            ${githubFirst ? gh + gg : gg + gh}
          </div>

          <p class="login-status" aria-live="polite"></p>

          <p class="login-private">🔒 A private workspace. Only its owner can sign in, <br>but you're always welcome to explore as a guest.</p>
        </section>
      </main>

      <footer class="login-quote">“${quote}”</footer>`;
  },

  show() {
    if (!this.el) {
      this.el = document.createElement("div");
      this.el.id = "login-screen";
      document.body.appendChild(this.el);
      this.el.addEventListener("click", e => this.onClick(e));
    }
    this.el.innerHTML = this.html();
    this.el.hidden = false;
    document.body.classList.add("login-open");
    this.paintStatus();
    this.wakeServer();
  },

  hide() {
    if (this.el) this.el.hidden = true;
    document.body.classList.remove("login-open");
  },

  // PUBLIC VIEW: login screen se About khola (bina login/guest) -> poori screen,
  // sidebar nahi, upar sirf logo + "Back to sign in"
  setPublicView(on) {
    document.body.classList.toggle("public-view", on);
    let bar = document.getElementById("public-bar");
    if (!on) { bar?.remove(); return; }
    if (bar) return;
    bar = document.createElement("header");
    bar.id = "public-bar";
    bar.innerHTML = `
      <a class="login-brand" href="#/login" aria-label="AlgoQuest sign-in page">
        <span class="login-logo"><img src="assets/brand/logo.png" alt=""></span>
        <span class="login-brand-text">
          <b>Algo<em>Quest</em></b>
          <small>Grind · Track · Crack</small>
        </span>
      </a>
      <nav class="login-links">
        <a class="login-link" href="#/login">← Back to sign in</a>
      </nav>`;
    document.body.appendChild(bar);
  },

  onClick(e) {
    const b = e.target.closest("[data-login]");
    if (!b) return;
    const action = b.dataset.login;
    if (action === "github" || action === "google") {
      b.classList.add("loading");
      b.disabled = true;
      Auth.signIn(action);
    } else if (action === "guest") {
      Offline.stop();
      Guest.start();
      location.hash = "#/dashboard"; // naya history entry: browser ka Back wapas login pe laayega
    } else if (action === "offline") {
      Guest.stop();
      Offline.start();
      location.hash = "#/dashboard";
    } else if (action === "retry") {
      this.serverState = "idle";
      this.wakeServer();
    }
  },

  // Free server so jaata hai: screen khulte hi use jagao, taaki button dabane tak woh ready ho.
  // "no-cors": humein jawab padhna nahi, bas server tak "knock" karna hai.
  async wakeServer() {
    if (this.serverState === "waking" || this.serverState === "ready") return;
    this.serverState = "waking";
    this.paintStatus();
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), Api.TIMEOUT_MS);
    try {
      await fetch(Api.BASE + "/actuator/health", { mode: "no-cors", cache: "no-store", signal: ctrl.signal });
      this.serverState = "ready";
    } catch {
      this.serverState = "down";
    } finally {
      clearTimeout(timer);
    }
    this.paintStatus();
  },

  paintStatus() {
    const s = this.el?.querySelector(".login-status");
    if (!s) return;
    s.className = `login-status ${this.serverState}`;
    if (this.serverState === "waking") {
      s.innerHTML = `<i></i>Connecting to the server… A free server can take up to a minute to wake up.`;
    } else if (this.serverState === "ready") {
      s.innerHTML = `<i></i>Server is ready`;
    } else if (this.serverState === "down") {
      s.innerHTML = `<i></i>The server is not reachable right now.
        <span class="login-status-actions">
          <button type="button" data-login="retry">Try again</button>
          <span aria-hidden="true">·</span>
          <button type="button" data-login="offline">Continue offline</button>
        </span>`;
    } else {
      s.innerHTML = "";
    }
  },
};

// =========================================================
// NOTICES: sidebar mein About ke upar chhota status box
// Guest mode, ya sign-in jaldi khatam hone wala ho (60-din ki deewar / renew fail)
// =========================================================
const Notices = {
  HIDE_KEY: "dsaPlanner.noticeHiddenOn", // × dabaya toh aaj ke liye chhupao

  // Abhi kaunsa notice dikhana hai? (null = kuch nahi)
  current() {
    if (!Auth.isSignedIn()) {
      if (Guest.active()) return { type: "guest" };
      if (Offline.active()) return { type: "offline" };
      return null;
    }
    // Sync ruka hai: dono jagah alag progress, user ko chunna hai
    if (Sync.status === "conflict" || Sync.status === "choice") return { type: "conflict" };
    // Normal renew chal raha ho toh warning mat dikhao; sirf tab jab renew na ho paaye
    const failedRenew = Auth.expiringSoon() && Auth.lastRenewTry > 0 && !Auth.renewing;
    const hiddenToday = localStorage.getItem(this.HIDE_KEY) === new Date().toDateString();
    if ((Auth.reauthRequired || failedRenew) && !hiddenToday) {
      const days = Math.max(1, Math.ceil((Auth.expiresAt() - Date.now()) / 86400000));
      return { type: "expiry", days };
    }
    return { type: "sync" }; // baaki time: sync ka haal
  },

  // Sidebar mein (About ke theek upar) ek chhoti jagah. Page ke content ke upar kabhi nahi aata.
  // Phone pe sidebar neeche ki patti ban jaata hai, wahan yeh chhup jaata hai (Settings mein sab dikhta hai).
  slot() {
    let el = document.getElementById("sidebar-status");
    if (!el) {
      const about = document.querySelector(".sidebar .about-link");
      if (!about) return null;
      el = document.createElement("div");
      el.id = "sidebar-status";
      el.addEventListener("click", e => this.onClick(e));
      about.before(el);
    }
    return el;
  },

  render() {
    const el = this.slot();
    if (!el) return;
    const n = document.body.classList.contains("login-open") ? null : this.current();
    this.renderNavDot(n);
    if (!n) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    el.hidden = false;
    if (n.type === "sync") {
      // Chhoti ek-line wali patti: "● Synced · 2 min ago" (click = Settings)
      const d = Sync.describe();
      const problem = d.tone === "warn" || d.tone === "bad";
      el.className = `side-status sync ${d.tone}`;
      el.innerHTML = `
        <button type="button" class="sync-line" data-notice="sync-open" title="Open sync settings">
          <i></i><span>${d.label}${!problem && d.detail ? ` · ${d.detail}` : ""}</span>
        </button>
        ${problem ? `<span class="sync-detail">${esc(d.detail)}</span>
          <button type="button" data-notice="sync-now">Try now</button>` : ""}`;
      return;
    }
    el.className = `side-status ${n.type}`;
    el.innerHTML = n.type === "guest"
      ? `<b>👀 Guest mode</b>
         <span>Saved in this browser only.</span>
         <button type="button" data-notice="exit">Exit guest mode</button>`
      : n.type === "conflict"
      ? `<b>⚖️ Sync paused</b>
         <span>Choose which progress to keep.</span>
         <button type="button" data-notice="review">Review</button>`
      : n.type === "offline"
      ? `<b>📴 Offline mode</b>
         <span>Syncs after you sign in.</span>
         <button type="button" data-notice="signin">Sign in</button>`
      : `<button type="button" class="side-status-x" data-notice="hide" aria-label="Hide for today">×</button>
         <b>🔐 Sign-in expires in ${n.days} day${n.days > 1 ? "s" : ""}</b>
         <span>Renew it so your progress keeps syncing.</span>
         <button type="button" data-notice="renew">Renew now</button>`;
  },

  // Phone pe sidebar nahi dikhta: Settings icon pe chhota rangin dot (hara/peela/laal)
  renderNavDot(n) {
    const link = document.querySelector('.nav-link[data-page="settings"]');
    if (!link) return;
    let dot = link.querySelector(".nav-sync-dot");
    if (!dot) {
      dot = document.createElement("span");
      dot.className = "nav-sync-dot";
      link.appendChild(dot);
    }
    let tone = "";
    if (n?.type === "sync") tone = Sync.describe().tone;
    else if (n?.type === "conflict" || n?.type === "expiry") tone = "warn";
    else if (n?.type === "offline") tone = "warn";
    dot.className = `nav-sync-dot ${tone === "off" ? "" : tone}`;
  },

  async onClick(e) {
    const b = e.target.closest("[data-notice]");
    if (!b) return;
    const action = b.dataset.notice;
    if (action === "signin") {
      location.hash = "#/login";
    } else if (action === "sync-open") {
      location.hash = "#/settings";
    } else if (action === "sync-now") {
      Sync.retryNow();
    } else if (action === "review") {
      Sync.openChoice();
    } else if (action === "exit") {
      Guest.stop();
      location.hash = "#/login";
    } else if (action === "hide") {
      localStorage.setItem(this.HIDE_KEY, new Date().toDateString());
      this.render();
    } else if (action === "renew") {
      // Pehle chupchaap renew try karo; na ho (60 din poore) toh asli login
      const ok = !Auth.reauthRequired && await Auth.maybeRenew({ force: true });
      if (ok) { showToast("You're signed in for another week."); this.render(); }
      else Auth.signIn(Auth.lastProvider() || "github");
    }
  },
};

// Login ki halat ya sync ki halat badle, ya tab pe wapas aao: notice dobara socho
window.addEventListener("algoquest:auth-changed", () => Notices.render());
window.addEventListener("algoquest:sync", () => Notices.render());
// "2 min ago" jaisa time har minute taaza rahe
setInterval(() => { if (Sync.status === "synced") Notices.render(); }, 60000);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") Notices.render();
});

// Router chalne se PEHLE login error padh lo (URL saaf ho jaye)
LoginScreen.readError();
