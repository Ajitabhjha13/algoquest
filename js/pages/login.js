// =========================================================
// LOGIN SCREEN
// Sign in nahi hai (aur guest mode bhi nahi) toh website se PEHLE yeh screen aati hai.
// About page sabke liye khula hai (recruiters ke liye).
// =========================================================

// Guest mode: bina login ke website ghoomna (data sirf isi browser mein)
const Guest = {
  KEY: "dsaPlanner.guest",
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

  // Kya login screen dikhani hai?
  shouldShow(pageName) {
    if (Auth.isSignedIn()) { Guest.stop(); return false; } // login ho gaya: guest mode khatam
    if (Guest.active()) return false;
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
    const returning = !!Auth.lastProvider();
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

          <h2 class="login-hello">${this.greeting()}, Ajitabh 👋</h2>
          <p class="login-line">From arrays to offer letters, your streak is waiting.</p>

          ${returning ? `<p class="login-note">Welcome back! Sign in to continue. Your progress on this device is safe and will sync after you sign in.</p>` : ""}

          <div class="login-buttons">
            ${githubFirst ? gh + gg : gg + gh}
          </div>

          <p class="login-status" aria-live="polite"></p>

          <p class="login-private">🔒 A private workspace. Only its owner can sign in,<br>but you're always welcome to explore as a guest.</p>
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
      Guest.start();
      location.hash = "#/dashboard"; // naya history entry: browser ka Back wapas login pe laayega
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
        <button type="button" data-login="retry">Try again</button> or
        <button type="button" data-login="guest">continue offline</button>`;
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
      return Guest.active() ? { type: "guest" } : null;
    }
    // Normal renew chal raha ho toh warning mat dikhao; sirf tab jab renew na ho paaye
    const failedRenew = Auth.expiringSoon() && Auth.lastRenewTry > 0 && !Auth.renewing;
    if (Auth.reauthRequired || failedRenew) {
      const days = Math.max(1, Math.ceil((Auth.expiresAt() - Date.now()) / 86400000));
      return { type: "expiry", days };
    }
    return null;
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
    const today = new Date().toDateString();
    if (!n || (n.type === "expiry" && localStorage.getItem(this.HIDE_KEY) === today)) {
      el.hidden = true;
      el.innerHTML = "";
      return;
    }
    el.hidden = false;
    el.className = `side-status ${n.type}`;
    el.innerHTML = n.type === "guest"
      ? `<b>👀 Guest mode</b>
         <span>Saved in this browser only.</span>
         <button type="button" data-notice="exit">Exit guest mode</button>`
      : `<button type="button" class="side-status-x" data-notice="hide" aria-label="Hide for today">×</button>
         <b>🔐 Sign-in expires in ${n.days} day${n.days > 1 ? "s" : ""}</b>
         <span>Renew it so your progress keeps syncing.</span>
         <button type="button" data-notice="renew">Renew now</button>`;
  },

  async onClick(e) {
    const b = e.target.closest("[data-notice]");
    if (!b) return;
    const action = b.dataset.notice;
    if (action === "signin") {
      location.hash = "#/login";
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

// Login ki halat badle ya tab pe wapas aao: notice dobara socho
window.addEventListener("algoquest:auth-changed", () => Notices.render());
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") Notices.render();
});
