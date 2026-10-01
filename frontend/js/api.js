// =========================================================
// API
// Backend (Spring Boot) se baat karne ka EK HI darwaza.
// Server ka pata, token lagana, timeout aur errors: sab yahin.
// =========================================================

// Har API error isi shape mein aata hai, taaki baaki code ko ek hi tarah handle karna pade
class ApiError extends Error {
  constructor(status, body, message, retryAfter = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;         // 0 = server/internet mila hi nahi
    this.body = body;             // server ka JSON (jaise 409 mein serverRevision)
    this.retryAfter = retryAfter; // 429 pe: kitne second baad try karna hai
  }
  // Server tak pahunch hi nahi paye (internet band / server so raha / timeout)
  get offline() { return this.status === 0; }
  // Thodi der baad dobara try karne layak error
  get temporary() { return this.status === 0 || this.status === 429 || this.status >= 500; }
}

const Api = {
  // Local pe laptop wala server; GitHub Pages pe Render wala.
  // TODO (Step 8): deploy ke baad asli Render URL yahan daalna hai.
  BASE: ["localhost", "127.0.0.1"].includes(location.hostname)
    ? "http://localhost:8080"
    : "https://algoquest-api.onrender.com",

  // Render free server so jaata hai; jaagne mein 30-60 sec lagte hain
  TIMEOUT_MS: 70000,

  // Token planner data se ALAG key mein, taaki backup file ya sync mein kabhi na jaye
  TOKEN_KEY: "dsaPlanner.auth",

  token() {
    try { return JSON.parse(localStorage.getItem(this.TOKEN_KEY))?.token || null; }
    catch { return null; }
  },
  setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, JSON.stringify({ token, savedAt: Date.now() }));
  },
  clearToken() {
    localStorage.removeItem(this.TOKEN_KEY);
  },

  // "Sign in with GitHub/Google" button isi link pe bhejega (poora page jaata hai, fetch nahi)
  loginUrl(provider) {
    return `${this.BASE}/oauth2/authorization/${provider}`;
  },

  async request(path, { method = "GET", body, auth = true, timeout = this.TIMEOUT_MS } = {}) {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (auth) {
      const t = this.token();
      if (!t) throw new ApiError(401, null, "Not signed in"); // server tak jaane ki zaroorat hi nahi
      headers.Authorization = `Bearer ${t}`;
    }

    // Timeout: itni der mein jawab na aaye toh request cancel
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);

    let res;
    try {
      res = await fetch(this.BASE + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: ctrl.signal,
      });
    } catch (err) {
      const msg = err.name === "AbortError" ? "The server took too long to respond" : "Cannot reach the server";
      throw new ApiError(0, null, msg);
    } finally {
      clearTimeout(timer);
    }

    // Jawab JSON hai toh padho (khali ya text bhi ho sakta hai)
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (res.ok) return data;

    // Token galat/expire/"log out everywhere": poori website ko bata do
    if (res.status === 401 && auth) {
      window.dispatchEvent(new CustomEvent("algoquest:signed-out"));
    }
    const retryAfter = Number(res.headers.get("Retry-After")) || null;
    throw new ApiError(res.status, data, data?.message || `Request failed (${res.status})`, retryAfter);
  },

  get(path, opts) { return this.request(path, { ...opts, method: "GET" }); },
  put(path, body, opts) { return this.request(path, { ...opts, method: "PUT", body }); },
  post(path, body, opts) { return this.request(path, { ...opts, method: "POST", body }); },
};