// =========================================================
// AUTH
// Login/logout, token sambhalna, auto-renew aur "kaun logged in hai" ki jaankari.
// Token Api.TOKEN_KEY mein, user ki details ACCOUNT_KEY mein
// (dono planner data se ALAG keys hain, isliye backup file mein kabhi nahi jaate).
// =========================================================
const Auth = {
  ACCOUNT_KEY: "dsaPlanner.account",
  LAST_PROVIDER_KEY: "dsaPlanner.lastProvider",

  // Token ke itne se kam din bache hon toh chupchaap naya token le lo
  RENEW_BEFORE_MS: 3 * 24 * 60 * 60 * 1000,
  // Renew fail ho (server so raha/down) toh itni der baad hi dobara koshish
  RETRY_GAP_MS: 10 * 60 * 1000,

  user: null,             // { id, name, email, avatarUrl, githubLinked, googleLinked, sessionEndsAt, ... }
  reauthRequired: false,  // 60 din poore: renew ab nahi hoga, asli login chahiye
  renewing: false,
  lastRenewTry: 0,

  // JWT ke beech wala hissa (payload) padho: isme name, exp (expiry), auth_time hota hai.
  // Signature check server karta hai; hum sirf dates jaanne ke liye padhte hain.
  payload(token = Api.token()) {
    try {
      const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
      const bytes = Uint8Array.from(atob(part), c => c.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return null;
    }
  },

  // Token kab expire hoga (milliseconds); 0 = token nahi hai
  expiresAt() {
    const p = this.payload();
    return p?.exp ? p.exp * 1000 : 0;
  },

  isSignedIn() {
    return !!Api.token() && this.expiresAt() > Date.now();
  },

  // Token jaldi khatam hone wala hai? (warning dikhane ke liye)
  expiringSoon() {
    return this.isSignedIn() && this.expiresAt() - Date.now() < this.RENEW_BEFORE_MS;
  },

  // Pichhli baar kis se login kiya tha ("Last used" badge ke liye)
  lastProvider() {
    return localStorage.getItem(this.LAST_PROVIDER_KEY);
  },

  // Pichhli baar ki user details (offline mein bhi naam/photo dikhane ke liye)
  loadCachedUser() {
    try { this.user = JSON.parse(localStorage.getItem(this.ACCOUNT_KEY)); }
    catch { this.user = null; }
  },

  saveUser(user) {
    this.user = user;
    localStorage.setItem(this.ACCOUNT_KEY, JSON.stringify(user));
  },

  // Server se taaza details lao
  async refreshUser() {
    this.saveUser(await Api.get("/api/me"));
    this.changed("refreshed");
    return this.user;
  },

  // "Sign in with GitHub/Google": poora page backend ke login pe jaata hai
  signIn(provider) {
    localStorage.setItem(this.LAST_PROVIDER_KEY, provider);
    location.href = Api.loginUrl(provider);
  },

  // Sirf IS device se logout (planner data waisa hi rehta hai)
  signOut(reason = "manual") {
    Api.clearToken();
    localStorage.removeItem(this.ACCOUNT_KEY);
    this.user = null;
    this.reauthRequired = false;
    this.changed(reason);
  },

  // SAARE devices se logout: server pe token_version badal jaata hai
  async signOutEverywhere() {
    await Api.post("/api/auth/logout-all"); // fail hua toh error upar jayega, logout nahi hoga
    this.signOut("everywhere");
  },

  // AUTO-RENEW: token ke 3 din se kam bache hon toh chupchaap naya token.
  // force = true: bina 3-din wale check ke (testing ke liye)
  async maybeRenew({ force = false } = {}) {
    if (!this.isSignedIn() || this.renewing || this.reauthRequired) return false;
    if (!force && this.expiresAt() - Date.now() > this.RENEW_BEFORE_MS) return false;
    if (!force && Date.now() - this.lastRenewTry < this.RETRY_GAP_MS) return false;

    this.renewing = true;
    this.lastRenewTry = Date.now();
    try {
      const r = await Api.post("/api/auth/refresh");
      Api.setToken(r.token);
      if (this.user) this.saveUser({ ...this.user, sessionEndsAt: r.sessionEndsAt });
      this.changed("renewed");
      return true;
    } catch (err) {
      if (err.status === 403 && err.body?.error === "reauth_required") {
        // 60 din poore: purana token abhi kuch din chalega, par ab asli login karna hoga
        this.reauthRequired = true;
        this.changed("reauth-required");
      }
      // Baaki errors (server so raha / internet nahi): chupchaap, 10 min baad phir koshish
      return false;
    } finally {
      this.renewing = false;
    }
  },

  // Baaki website (Settings, sync, warnings) ko batao ki login ki halat badli
  changed(reason) {
    window.dispatchEvent(new CustomEvent("algoquest:auth-changed", { detail: { reason } }));
  },

  // Login ke baad backend yahan bhejta hai: #/auth?token=...
  handleRedirect() {
    if (!location.hash.startsWith("#/auth")) return;
    const token = new URLSearchParams(location.hash.split("?")[1] || "").get("token");

    // URL TURANT saaf karo, taaki token browser history ya screenshot mein na rahe
    history.replaceState(null, "", location.pathname + location.search + "#/settings");

    if (!token || token.split(".").length !== 3) return; // galat/khali token
    Api.setToken(token);
    this.reauthRequired = false;
    this.refreshUser()
      .then(u => UI.toast(`Signed in as ${u.name}`))
      .catch(() => UI.toast("Signed in, but your profile could not be loaded yet."));
  },

  init() {
    this.handleRedirect();

    // Purana (expire ho chuka) token pada hai? Hata do
    if (Api.token() && !this.isSignedIn()) this.signOut("expired");

    this.loadCachedUser();

    // api.js ko 401 mila (token expire / "Log out everywhere" kisi aur device se)
    window.addEventListener("algoquest:signed-out", () => {
      if (!Api.token()) return;
      this.signOut("expired");
      UI.toast("Your session has ended. Please sign in again.");
    });

    // Auto-renew kab check karein:
    // 1) website khulte hi, 2) tab pe wapas aane pe, 3) tab khula rahe toh har 6 ghante
    this.maybeRenew();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") this.maybeRenew();
    });
    setInterval(() => this.maybeRenew(), 6 * 60 * 60 * 1000);
  },
};

Auth.init();
