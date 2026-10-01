// =========================================================
// STORE
// Saara user data browser ke localStorage mein save hota hai.
// Ek hi key ("dsaPlanner") ke andar poora object JSON ban ke jaata hai.
// Login ho toh sync.js yahi data cloud pe bhi rakhta hai (backup + doosre devices).
// =========================================================
const STORAGE_KEY = "dsaPlanner";                 // owner ka asli data (yahi cloud pe sync hota hai)
const GUEST_STORAGE_KEY = "dsaPlanner.guestData"; // "Explore as guest" ka alag dabba (kabhi sync nahi)
const GUEST_FLAG_KEY = "dsaPlanner.guest";        // "1" = guest mode chalu

// Local date "YYYY-MM-DD" (toISOString UTC deta hai, jo India mein subah galat date de sakta hai)
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DEFAULT_STATE = {
  version: 1,
  settings: {
    // Har din kitne ghante (0 = chhutti)
    hours: { mon: 3, tue: 3, wed: 3, thu: 3, fri: 3, sat: 5, sun: 5 },
    startDate: todayStr(), // aaj ki date "YYYY-MM-DD"
    targetDate: "2026-12-31",
    playbackSpeed: 1.5,     // YouTube kis speed pe dekhoge
    studyMultiplier: 1.5,   // video pause karke code likhne ka extra time
    warmupCount: 10,        // roz kitne warm-up questions
    lectureShare: 45,       // warm-up ke baad bache time ka kitna % Lectures ko
    theme: "dark",          // "dark" | "light" | "system"
  },
  // Warm-up shuffle bag
  warmup: { round: 0, mode: "full", order: [], done: {}, tooEasy: [], history: {} },
  // Har task ki progress: { "Q013": { status: "done", doneOn: "2026-09-26", timeSpent: 1800 } }
  progress: {},
  // Aaj ki fixed task list: { date: "2026-09-26", tasks: [{ id, type }] }
  today: null,
  // Roz ka hisaab: { "2026-09-26": { seconds: 5400, done: 6 } }
  log: {},
  // Chalta hua timer: { taskId, startedAt (ms) }
  timer: null,
  // Review ke liye mark kiye questions: { "Q013": true, "B04": true }
  review: {},
  // Har question ki apni notes:
  // { "Q013": { solution, hints: [], keyPoints, notes, help: "self" | "help", statement } }
  notes: {},
  // Imported playlist: { playlistId, title, importedAt, items: [{ id, videoId, title, durationSec, position, tier }] }
  videos: null,
};

const Store = {
  state: null,
  MAIN_KEY: STORAGE_KEY,
  GUEST_KEY: GUEST_STORAGE_KEY,

  // Abhi kaunsa dabba? Guest mode mein alag sandbox, taaki guest owner ka data na dekhe/badle
  key() {
    return localStorage.getItem(GUEST_FLAG_KEY) === "1" ? GUEST_STORAGE_KEY : STORAGE_KEY;
  },
  isSandbox() {
    return this.key() === GUEST_STORAGE_KEY;
  },

  // ---------------- FRESH START ----------------
  // Asli practice 2 October 2026 se shuru. Testing ka saara data (ticks, logs, notes, streaks) ek baar saaf,
  // lekin settings (hours, target), profile, imported playlist aur saved contest designs bache rehte hain.
  // Marker badalte hi har device pe yeh ek hi baar chalta hai, aur saaf data cloud pe bhi chala jata hai.
  FRESH_START: "2026-10-02",
  didFreshStart: false, // sync.js dekhta hai: abhi-abhi saaf hua toh cloud ko bhi saaf data bhejo

  freshStart() {
    const st = this.state;
    if (st.freshStart === this.FRESH_START) return;
    const keep = {
      settings: { ...st.settings, startDate: this.FRESH_START },
      profile: st.profile,
      videos: st.videos ? { ...st.videos, notice: null, sprintStart: this.FRESH_START } : null,
      contestTemplates: st.contestTemplates || [],
      goals: st.goals,
    };
    this.state = { ...structuredClone(DEFAULT_STATE), ...keep, freshStart: this.FRESH_START };
    this.save();
    this.didFreshStart = true;
  },

  load() {
    try {
      const saved = JSON.parse(localStorage.getItem(this.key()));
      // Default ke upar saved data merge karo, taaki naye fields bhi mil jayein
      this.state = saved
        ? { ...DEFAULT_STATE, ...saved, settings: { ...DEFAULT_STATE.settings, ...saved.settings }, progress: saved.progress || {}, warmup: { ...DEFAULT_STATE.warmup, ...saved.warmup }, log: saved.log || {}, review: saved.review || {}, notes: saved.notes || {}, videos: saved.videos || null }
        : structuredClone(DEFAULT_STATE);
    } catch {
      this.state = structuredClone(DEFAULT_STATE);
    }
    this.freshStart();
    return this.state;
  },

  save() {
    localStorage.setItem(this.key(), JSON.stringify(this.state));
  },

  get settings() {
    if (!this.state) this.load();
    return this.state.settings;
  },

  updateSettings(newSettings) {
    this.state.settings = { ...this.state.settings, ...newSettings };
    this.save();
  },

  // ---------- BACKUP ----------
  resetWarmup() {
    this.state.warmup = structuredClone(DEFAULT_STATE.warmup);
    this.save();
  },

  exportData() {
    const blob = new Blob([JSON.stringify(this.state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `algoquest-backup-${todayStr()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  },

  importData(jsonText) {
    const data = JSON.parse(jsonText); // galat file hui toh yahin error aayega
    if (!data.settings) throw new Error("This does not look like an AlgoQuest backup file");
    this.state = data;
    this.save();
  },

  reset() {
    localStorage.removeItem(this.key());
    this.load();
  },
};

Store.load();
