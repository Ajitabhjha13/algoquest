// =========================================================
// AUTH
// Login/logout, token sambhalna aur "kaun logged in hai" ki jaankari.
// Token Api.TOKEN_KEY mein, user ki details ACCOUNT_KEY mein
// (dono planner data se ALAG keys hain, isliye backup file mein kabhi nahi jaate).
// =========================================================
const Auth = {
  ACCOUNT_KEY: "dsaPlanner.account",
  user: null, // { id, name, email, avatarUrl, githubLinked, googleLinked, ... }

  // JWT ke beech wala hissa (payload) padho: isme name, exp (expiry) hota hai.
  // Signature check server karta hai; hum sirf expiry jaanne ke liye padhte hain.
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

  // Pichhli baar ki user details (offline mein bhi naam/photo dikhane ke liye)
  loadCachedUser() {
    try { this.user = JSON.parse(localStorage.getItem(this.ACCOUNT_KEY)); }
    catch { this.user = null; }
  },

  // Server se taaza details lao
  async refreshUser() {
    this.user = await Api.get("/api/me");
    localStorage.setItem(this.ACCOUNT_KEY, JSON.stringify(this.user));
    this.changed("refreshed");
    return this.user;
  },

  // "Sign in with GitHub/Google": poora page backend ke login pe jaata hai
  signIn(provider) {
    location.href = Api.loginUrl(provider);
  },

  // Sirf IS device se logout (planner data waisa hi rehta hai)
  signOut(reason = "manual") {
    Api.clearToken();
    localStorage.removeItem(this.ACCOUNT_KEY);
    this.user = null;
    this.changed(reason);
  },

  // SAARE devices se logout: server pe token_version badal jaata hai
  async signOutEverywhere() {
    await Api.post("/api/auth/logout-all"); // fail hua toh error upar jayega, logout nahi hoga
    this.signOut("everywhere");
  },

  // Baaki website (Settings, sync) ko batao ki login ki halat badli
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
    this.refreshUser()
      .then(u => showToast(`Signed in as ${u.name}`))
      .catch(() => showToast("Signed in, but your profile could not be loaded yet."));
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
      showToast("Your session has ended. Please sign in again.");
    });
  },
};

Auth.init();