// =========================================================
// SYNC ENGINE
// Poora planner data (Store.state) cloud pe save/load karta hai.
// Website OFFLINE-FIRST hai: data pehle hamesha localStorage mein,
// cloud sirf backup + doosre device ke liye. Internet/server na ho toh bhi kaam chalta rahe.
//
// Chhoti diary (META_KEY) mein 2 cheezein yaad rehti hain:
//   revision : cloud ka kaunsa version is device pe hai
//   dirty    : is device pe aise changes hain jo abhi cloud pe nahi gaye
// =========================================================
const Sync = {
  META_KEY: "dsaPlanner.sync",
  DEBOUNCE_MS: 5000,                  // aakhri change ke 5 sec baad bhejo
  MAX_WAIT_MS: 30000,                 // lagatar changes ho toh bhi max 30 sec mein ek baar
  RETRY_STEPS_MS: [10000, 30000, 60000, 300000], // fail hone pe: 10s, 30s, 1m, 5m

  meta: { revision: 0, dirty: false, lastSyncedAt: null },
  status: "off",   // off | synced | pending | syncing | paused | conflict | choice | error
  message: "",
  busy: false,
  applying: false, // cloud ka data lagate waqt "dirty" mat karo
  saveSeq: 0,      // har save pe +1 (bhejte waqt naya change aaya ya nahi, pata chale)
  debounceTimer: null,
  firstDirtyAt: 0,
  retryTimer: null,
  retryIndex: 0,
  cloudCopy: null,  // conflict/choice ke waqt cloud wala version (popup ke liye)
  syncedJson: null, // aakhri baar cloud mein jo data tha (bekaar "dirty" pakadne ke liye)

  // ---------- Diary ----------
  loadMeta() {
    try { this.meta = { ...this.meta, ...JSON.parse(localStorage.getItem(this.META_KEY)) }; }
    catch { /* pehli baar: default hi theek */ }
  },
  saveMeta() {
    localStorage.setItem(this.META_KEY, JSON.stringify(this.meta));
  },

  // ---------- Status (Settings / sidebar isi ko dikhayenge) ----------
  setStatus(status, message = "") {
    this.status = status;
    this.message = message;
    window.dispatchEvent(new CustomEvent("algoquest:sync", { detail: { status, message } }));
  },

  // Kya is device pe "asli" data hai? (sirf default settings = khali)
  hasRealData(s = Store.state) {
    const any = obj => obj && Object.keys(obj).length > 0;
    return any(s.progress) || any(s.log) || any(s.notes) || any(s.review)
      || any(s.warmup?.done) || any(s.warmup?.history)
      || !!s.videos || !!s.profile?.photo || (s.contestTemplates?.length > 0);
  },

  // ---------- Store.save() ke saath judna ----------
  // Store ko chhede bina uska save() "lapet" diya (wrapper): pehle asli save, phir sync ko khabar.
  hookStore() {
    const originalSave = Store.save.bind(Store);
    this.rawSave = originalSave;
    Store.save = () => {
      originalSave();
      if (!this.applying) this.markDirty();
    };
  },

  markDirty() {
    if (Store.isSandbox()) return; // guest ka sandbox kabhi sync nahi hota
    // Kai pages render hote waqt bhi save karte hain, bina kuch badle. Data cloud wale jaisa hi hai
    // toh kuch mat karo: na faltu request, na "Syncing…" ki baar-baar jhalak.
    if (!this.meta.dirty && this.syncedJson && JSON.stringify(Store.state) === this.syncedJson) return;
    this.saveSeq++;
    if (!this.meta.dirty) {
      this.meta.dirty = true;
      this.saveMeta();
      this.firstDirtyAt = Date.now();
    }
    if (!Auth.isSignedIn()) return; // login ke baad bhej denge (dirty yaad hai)
    if (this.status === "conflict" || this.status === "choice") return; // pehle user faisla kare
    this.setStatus("pending");
    clearTimeout(this.debounceTimer);
    const waited = Date.now() - this.firstDirtyAt;
    const delay = Math.max(0, Math.min(this.DEBOUNCE_MS, this.MAX_WAIT_MS - waited));
    this.debounceTimer = setTimeout(() => this.sync(), delay);
  },

  // ---------- Asli kaam ----------
  async sync() {
    clearTimeout(this.debounceTimer);
    if (!Auth.isSignedIn() || Store.isSandbox()) { this.setStatus("off"); return; }
    if (this.busy || this.status === "conflict" || this.status === "choice") return;
    if (!navigator.onLine) { this.pause("You're offline. Changes are saved on this device."); return; }

    this.busy = true;
    this.setStatus("syncing");
    try {
      this.loadMeta(); // doosri tab ne diary badli ho sakti hai: hamesha taaza padho
      const cloud = await Api.get("/api/sync/meta"); // halka: sirf revision
      const local = this.meta;

      if (local.revision === 0) {
        await this.firstSync(cloud);               // is device ka pehla sync
      } else if (cloud.revision === 0) {
        await this.push(0);                        // cloud khali ho gaya: apna data bhej do
      } else if (cloud.revision === local.revision) {
        if (local.dirty) await this.push(local.revision);
        else this.done();
      } else if (!local.dirty) {
        await this.pull(cloud);                    // doosre device pe naya kaam: le aao
      } else {
        await this.reconcile("conflict");         // dono jagah changes: pehle dekho sach mein alag hain?
      }
      this.retryIndex = 0;
    } catch (err) {
      this.handleError(err);
    } finally {
      this.busy = false;
    }
  },

  // Pehli baar is device pe: 4 cases
  async firstSync(cloud) {
    const localHas = this.hasRealData();
    const cloudHas = cloud.revision > 0;
    if (!cloudHas) {
      await this.push(0);                          // cloud khali: is device ka data upload
    } else if (!localHas) {
      await this.pull(cloud);                      // naya device: cloud ka data le aao
    } else {
      await this.reconcile("choice");
    }
  },

  // Cloud aur is device dono mein data. Agar dono HUBAHU same hain (jaise isi device ka
  // bheja hua data, jiska jawab kho gaya tha), toh koi jhagda nahi: bas revision le lo.
  // Sach mein alag hain toh ruk jao aur user se poochho.
  async reconcile(kind) {
    const r = await Api.get("/api/sync");
    if (r.data && JSON.stringify(r.data) === JSON.stringify(Store.state)) {
      this.meta.revision = r.revision;
      this.meta.dirty = false;
      this.meta.lastSyncedAt = Date.now();
      this.saveMeta();
      this.done();
      return;
    }
    this.cloudCopy = r; // popup mein dikhane ke liye (kab, kis device se)
    this.setStatus(kind, kind === "choice"
      ? "This device and the cloud both have progress."
      : "Your data changed on another device too.");
    this.openChoice(); // user se poochho (popup)
  },

  // ---------- Conflict popup ----------
  // Kisi state ka chhota hisaab (popup mein dono taraf dikhane ke liye)
  summarize(s) {
    const progress = s?.progress || {};
    const done = Object.values(progress).filter(p => p?.status === "done").length;
    const warm = Object.keys(s?.warmup?.done || {}).length;
    const days = Object.keys(s?.log || {}).sort();
    return { done, warm, lastActive: days[days.length - 1] || null };
  },

  fmtDay(ymd) {
    const today = todayStr();
    if (ymd === today) return "today";
    const d = new Date(ymd + "T00:00:00");
    return "on " + d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  },

  ago(iso) {
    if (!iso) return "some time ago";
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
    const days = Math.round(hrs / 24);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  },

  choiceOpen: false,

  async openChoice() {
    if (this.choiceOpen || !(this.status === "conflict" || this.status === "choice")) return;
    this.choiceOpen = true;
    try {
      if (!this.cloudCopy) this.cloudCopy = await Api.get("/api/sync");
      const c = this.cloudCopy;
      const me = this.summarize(Store.state);
      const cloud = this.summarize(c.data);
      const score = x => x.done + x.warm;
      const better = score(me) === score(cloud) ? null : score(me) > score(cloud) ? "local" : "cloud";
      const side = (title, x, extra, best) => `
        <div class="sync-side ${best ? "best" : ""}">
          ${best ? `<em>More progress</em>` : ""}
          <b>${title}</b>
          <span><strong>${x.done}</strong> tasks done</span>
          <span><strong>${x.warm}</strong> warm-ups done</span>
          <small>${extra}</small>
        </div>`;
      const localExtra = me.lastActive
        ? `Last active ${this.fmtDay(me.lastActive)}`
        : score(me) > 0 ? "Changes made on this device" : "No activity yet";
      const cloudExtra = `Updated ${this.ago(c.updatedAt)}${c.updatedDevice ? ` on ${esc(c.updatedDevice)}` : ""}`;
      const isChoice = this.status === "choice";

      const { action } = await Modal.open({
        title: isChoice ? "Which progress do you want to keep?" : "Your progress changed on another device",
        html: `
          <p>${isChoice
            ? "This device and the cloud both have progress. Pick the one to continue with."
            : "You made changes here and on another device. Pick the version to continue with."}</p>
          <div class="sync-compare">
            ${side("This device", me, localExtra, better === "local")}
            ${side("Cloud", cloud, cloudExtra, better === "cloud")}
          </div>
          <p class="hint">Nothing is deleted. The version you don't pick is saved as a backup.</p>`,
        actions: [
          { label: "Decide later", value: null },
          { label: "Keep this device", value: "local", kind: better === "local" ? "primary" : "" },
          { label: "Use cloud", value: "cloud", kind: better === "local" ? "" : "primary" },
        ],
      });

      if (action === "local") {
        await this.keepThisDevice();
        if (this.status === "synced") UI.toast("Kept this device's progress. The cloud copy is saved in Cloud versions.");
      } else if (action === "cloud") {
        await this.useCloud();
      }
    } catch (err) {
      this.handleError(err);
    } finally {
      this.choiceOpen = false;
    }
  },

  // ---------- Faisla (popup ke buttons yahi chalayenge) ----------
  // Pehle haarne wali copy bachao, taaki galat button dabane pe bhi kuch na khoye.
  keepSafetyCopy() {
    localStorage.setItem("dsaPlanner.safety", JSON.stringify({ savedAt: Date.now(), data: Store.state }));
  },

  // "Use cloud data": is device ka data safety copy mein, cloud ka data yahan
  async useCloud() {
    this.keepSafetyCopy();
    this.busy = true;
    this.setStatus("syncing");
    try {
      await this.pull(await Api.get("/api/sync/meta"));
    } catch (err) {
      this.handleError(err);
    } finally {
      this.busy = false;
    }
  },

  // "Keep this device": is device ka data cloud pe (cloud ka purana version snapshots mein safe rehta hai)
  async keepThisDevice() {
    this.busy = true;
    this.setStatus("syncing");
    try {
      const cloud = await Api.get("/api/sync/meta");
      await this.push(cloud.revision);
    } catch (err) {
      this.handleError(err);
    } finally {
      this.busy = false;
    }
  },

  async push(baseRevision) {
    const seqAtStart = this.saveSeq;
    const r = await Api.put("/api/sync", { baseRevision, data: Store.state });
    this.meta.revision = r.revision;
    this.meta.lastSyncedAt = Date.now();
    // Bhejte waqt koi naya change aaya? Toh dirty rehne do, thodi der mein phir bhejenge
    this.meta.dirty = this.saveSeq !== seqAtStart;
    this.saveMeta();
    if (this.meta.dirty) this.markDirty();
    else this.done();
  },

  async pull(cloud, { quiet = false } = {}) {
    const r = await Api.get("/api/sync");
    if (!r.data) { this.done(); return; }
    this.applyData(r.data);
    this.meta.revision = r.revision;
    this.meta.dirty = false;
    this.meta.lastSyncedAt = Date.now();
    this.saveMeta();
    this.done();
    const from = r.updatedDevice ? ` from ${r.updatedDevice}` : "";
    if (!quiet) UI.toast(`Updated with your latest progress${from}.`);
    if (typeof renderRoute === "function") renderRoute();
  },

  // Cloud ka data is device pe lagao (bina "dirty" kiye)
  applyData(data) {
    this.applying = true;
    try {
      localStorage.setItem(Store.MAIN_KEY, JSON.stringify(data));
      Store.load(); // defaults ke saath merge (naye fields bhi mil jayein)
    } finally {
      this.applying = false;
    }
  },

  done() {
    // "Last synced" = aakhri baar jab cloud se pakka hua ki sab barabar hai
    if (!this.meta.dirty) this.syncedJson = JSON.stringify(Store.state); // cloud = yeh data
    this.meta.lastSyncedAt = Date.now();
    this.saveMeta();
    this.retryIndex = 0;
    clearTimeout(this.retryTimer);
    this.setStatus("synced");
  },

  pause(message, retryAfterSec) {
    const step = this.RETRY_STEPS_MS[Math.min(this.retryIndex, this.RETRY_STEPS_MS.length - 1)];
    const wait = Math.max(step, (retryAfterSec || 0) * 1000);
    this.retryIndex++;
    this.setStatus("paused", message);
    clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.sync(), wait);
  },

  handleError(err) {
    if (err.status === 409) {
      this.setStatus("conflict", "Your data changed on another device too.");
      this.reconcile("conflict").catch(() => {}); // shayad dono same hi hon
    } else if (err.status === 401) {
      this.setStatus("off"); // auth.js khud logout karega
    } else if (err.temporary) {
      const msg = err.offline
        ? "Can't reach the server right now. Changes are saved on this device."
        : err.status === 429 ? "Too many requests. Trying again shortly." : "The server had a problem. Trying again shortly.";
      this.pause(msg, err.retryAfter);
    } else {
      // 400 / 413: data hi galat ya bahut bada. Baar-baar bhejne ka fayda nahi.
      this.setStatus("error", err.message);
    }
  },

  // "Also remove my progress from this browser" (shared computer): is browser se owner ka
  // data aur sync diary hata do. Cloud mein sab safe hai, agli baar sign in pe wapas aa jayega.
  forgetThisDevice() {
    clearTimeout(this.debounceTimer);
    clearTimeout(this.retryTimer);
    ["dsaPlanner.safety", "dsaPlanner.lastProvider", "dsaPlanner.offline", this.META_KEY]
      .forEach(k => localStorage.removeItem(k));
    localStorage.removeItem(Store.MAIN_KEY);
    this.meta = { revision: 0, dirty: false, lastSyncedAt: null };
    this.applying = true;
    try { Store.load(); } finally { this.applying = false; } // khali default data
    this.setStatus("off");
  },

  // Cloud versions se purana version wapas lao (server pe naya save banta hai, isliye undo possible)
  async restoreVersion(revision) {
    if (this.meta.dirty) await this.sync(); // pehle pending changes bhej do (woh bhi ek version ban jayein)
    if (this.meta.dirty || this.status === "conflict" || this.status === "choice") {
      throw new Error("Please let your changes finish syncing first.");
    }
    this.busy = true;
    this.setStatus("syncing");
    try {
      const r = await Api.post(`/api/sync/snapshots/${revision}/restore`, { baseRevision: this.meta.revision });
      await this.pull({ revision: r.revision }, { quiet: true });
    } catch (err) {
      this.handleError(err);
      throw err;
    } finally {
      this.busy = false;
    }
  },

  // Abhi ka haal, insaan ki bhasha mein (sidebar box, Settings card, phone dot sab yahi use karte hain)
  // tone: ok (hara) | busy (peela, chal raha) | warn (peela, ruka) | bad (laal) | off
  describe() {
    switch (this.status) {
      case "synced":
        return { tone: "ok", label: "Synced", detail: this.meta.lastSyncedAt ? this.ago(this.meta.lastSyncedAt) : "" };
      case "pending":
      case "syncing":
        return { tone: "busy", label: "Syncing…", detail: "" };
      case "paused":
        return { tone: "warn", label: "Sync paused", detail: this.message || "Trying again shortly." };
      case "conflict":
      case "choice":
        return { tone: "warn", label: "Sync paused", detail: "Choose which progress to keep." };
      case "error":
        return { tone: "bad", label: "Can't sync", detail: this.message || "Something went wrong." };
      default:
        return { tone: "off", label: "Sync is off", detail: "" };
    }
  },

  // "Sync now" / "Try now" button: intezaar chhodo, abhi koshish karo
  retryNow() {
    this.retryIndex = 0;
    clearTimeout(this.retryTimer);
    if (this.status === "conflict" || this.status === "choice") { this.openChoice(); return; }
    if (this.status === "error") this.status = "pending";
    this.sync();
  },

  // Test/debug ke liye: console mein Sync.info()
  info() {
    return {
      status: this.status,
      message: this.message,
      revision: this.meta.revision,
      dirty: this.meta.dirty,
      lastSyncedAt: this.meta.lastSyncedAt ? new Date(this.meta.lastSyncedAt).toLocaleString() : null,
    };
  },

  init() {
    this.loadMeta();
    this.hookStore();
    // Fresh start abhi-abhi hua (purana testing data saaf)? Toh yeh saaf data cloud pe bhi bhejo,
    // warna cloud mein purana data pada rehta aur doosre devices wahi le aate.
    if (Store.didFreshStart) { Store.didFreshStart = false; this.markDirty(); }

    // Kab sync karein:
    window.addEventListener("DOMContentLoaded", () => this.sync());          // website khulte hi
    window.addEventListener("online", () => { this.retryIndex = 0; this.sync(); }); // internet wapas
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") this.sync();             // tab pe wapas: kuch naya?
      else if (this.meta.dirty && Auth.isSignedIn()) this.sync();          // tab chhoda: pending turant bhejo
    });
    // Ek hi browser mein 2 tabs khule hon: dono ek hi localStorage share karte hain.
    // Doosri tab ne data ya diary badli toh is tab ki memory bhi taaza karo (warna purana data bhej dega).
    window.addEventListener("storage", e => {
      if (e.key === this.META_KEY) this.loadMeta();
      if (e.key === Store.key() && e.newValue) {
        this.applying = true;
        try { Store.load(); } finally { this.applying = false; }
        if (typeof renderRoute === "function") renderRoute();
      }
    });
    window.addEventListener("algoquest:auth-changed", e => {
      const reason = e.detail?.reason;
      if (reason === "refreshed" || reason === "renewed") this.sync();     // abhi login hua / token naya
      else if (["manual", "expired", "everywhere"].includes(reason)) {
        clearTimeout(this.debounceTimer);
        clearTimeout(this.retryTimer);
        this.setStatus("off");                                            // logout: sync band (data safe)
      }
    });
  },
};

Sync.init();
