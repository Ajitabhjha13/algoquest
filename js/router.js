// =========================================================
// ROUTER
// URL ke # wale part ko dekh ke sahi page dikhata hai.
// Example: index.html#/problems  ->  Problems page
// Isse poori website ek hi HTML file mein chalti hai (Single Page App).
// =========================================================
const routes = {
  dashboard: DashboardPage,
  about: AboutPage,
  "plan/warmup": WarmupPage,
  "plan/main": MainQuestPage,
  plan2: Plan2Page,
  contest: ContestPage,
  lectures: VideosPage,
  problems: ProblemsPage,
  profile: ProfilePage,
  settings: SettingsPage,
};

let currentPage = null;
let lastPageName = null;

// ---------- THEME (dark / light / system) ----------
const Theme = {
  resolved() {
    const t = Store.settings.theme || "dark";
    return t === "system" ? (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark") : t;
  },
  apply() {
    document.documentElement.dataset.theme = this.resolved();
    // Java code colouring bhi theme ke saath
    const hl = document.querySelector('link[href*="highlight.js"]');
    if (hl) hl.href = hl.href.replace(/github(-dark)?\.min\.css/, this.resolved() === "light" ? "github.min.css" : "github-dark.min.css");
  },
  toggle() {
    Store.updateSettings({ theme: this.resolved() === "dark" ? "light" : "dark" });
    this.apply();
  },
};
matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => Theme.apply());
document.addEventListener("click", e => {
  if (e.target.closest("#theme-toggle")) Theme.toggle();
});

// ---------- SKELETON: page aate waqt halka placeholder ----------
const SKELETON = `
  <div class="skel skel-title"></div><div class="skel skel-sub"></div>
  <div class="skel-grid"><div class="skel skel-card"></div><div class="skel skel-card"></div><div class="skel skel-card"></div></div>
  <div class="skel skel-block"></div>`;

// ---------- TOAST: chhota popup jo kahin bhi click karne pe ya 4 sec mein gayab ----------
function showToast(msg) {
  document.querySelector(".gtoast")?.remove();
  const t = document.createElement("div");
  t.className = "gtoast";
  t.setAttribute("role", "status");
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  const hide = () => { t.classList.remove("show"); setTimeout(() => t.remove(), 200); document.removeEventListener("click", hide, true); };
  setTimeout(() => document.addEventListener("click", hide, true), 50);
  setTimeout(hide, 4000);
}

async function renderRoute() {
  // Purane page ki safai (jaise chalta hua setInterval band karna)
  if (currentPage?.cleanup) currentPage.cleanup();

  // "#/problems" -> "problems", "#/plan/main" -> "plan/main"
  let pageName = location.hash.replace("#/", "") || "dashboard";
  if (pageName === "plan") pageName = "plan/warmup"; // purane "#/plan" links ke liye
  if (pageName === "videos") pageName = "lectures";   // purana naam

  // FOCUS MODE: contest chal raha hai toh sirf contest page
  Contest.checkTimeout();
  const inContest = !!Contest.active;
  document.body.classList.toggle("contest-mode", inContest);
  if (inContest && pageName !== "contest") {
    pageName = "contest";
    history.replaceState(null, "", "#/contest");
  }
  // Contest page chhod diya toh purana result screen hata do
  if (pageName !== "contest" && Store.state.lastContestResult) {
    Store.state.lastContestResult = null;
    Store.save();
  }
  const page = routes[pageName] || routes.dashboard;
  const app = document.getElementById("app");

  // Sidebar mein active link highlight karo
  document.querySelectorAll(".nav-link").forEach(link => {
    link.classList.toggle("active", link.dataset.page === pageName);
  });
  // Plan group: kisi Plan page pe ho toh group khula aur parent highlighted
  const inPlan = pageName.startsWith("plan/");
  document.querySelector(".nav-parent")?.classList.toggle("active-parent", inPlan);
  if (inPlan) document.getElementById("nav-plan")?.classList.add("open");

  currentPage = page;
  Profile.refreshSidebar();

  // Naya page? Toh skeleton + halka fade-in. Same page ka re-render? Bina animation.
  const isNewPage = pageName !== lastPageName;
  lastPageName = pageName;
  const skelTimer = isNewPage ? setTimeout(() => { app.innerHTML = SKELETON; }, 120) : null;
  try {
    const html = await page.render();
    clearTimeout(skelTimer);
    app.innerHTML = html;
    if (isNewPage) {
      app.classList.remove("page-enter");
      void app.offsetWidth; // animation dobara chalane ke liye
      app.classList.add("page-enter");
      setTimeout(() => app.classList.remove("page-enter"), 1100); // baad ke re-render pe dobara animation nahi
      window.scrollTo(0, 0);
    }
    if (page.afterRender) page.afterRender(); // buttons wagairah ke liye (aage kaam aayega)
  } catch (err) {
    app.innerHTML = `<p class="error">Could not load page: ${err.message}</p>`;
    console.error(err);
  }
}

// Plan pe click: agar pehle se Plan ke andar ho toh sirf group khol/band karo,
// warna Warm-up page kholo (group apne aap khul jayega)
document.addEventListener("click", e => {
  const parent = e.target.closest(".nav-parent");
  if (!parent) return;
  const group = document.getElementById("nav-plan");
  if (location.hash.startsWith("#/plan/")) {
    e.preventDefault();
    group.classList.toggle("open");
  }
});

// Jab bhi URL ka # badle, ya page pehli baar khule
window.addEventListener("hashchange", renderRoute);
window.addEventListener("DOMContentLoaded", () => { Theme.apply(); renderRoute(); });
