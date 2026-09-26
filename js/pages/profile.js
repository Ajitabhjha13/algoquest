// =========================================================
// PROFILE: basic info + links + DSA stats (glance, year heatmap, pinned trophies)
// Data: Store.state.profile. Photo chhota karke (256px) data URL mein save hota hai.
// =========================================================
const BANNERS = {
  amber: "linear-gradient(120deg, #f4b740 0%, #b56a1c 100%)",
  ocean: "linear-gradient(120deg, #3a7bd5 0%, #0f2a55 100%)",
  forest: "linear-gradient(120deg, #2fb67c 0%, #0e4a3a 100%)",
  violet: "linear-gradient(120deg, #9b6bff 0%, #3b1f73 100%)",
  sunset: "linear-gradient(120deg, #ff7a59 0%, #8e2d5a 100%)",
  night: "linear-gradient(120deg, #2b3350 0%, #0e1320 100%)",
};

const LINKS = [
  ["github", "GitHub", "https://github.com/"],
  ["linkedin", "LinkedIn", "https://www.linkedin.com/in/"],
  ["leetcode", "LeetCode", "https://leetcode.com/u/"],
  ["gfg", "GeeksforGeeks", "https://www.geeksforgeeks.org/profile/"],
  ["tuf", "takeUforward", "https://takeuforward.org/profile/"],
  ["portfolio", "Portfolio", "https://"],
];

const LINK_ICONS = {
  github: `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2z"/></svg>`,
  linkedin: `<svg viewBox="0 0 24 24"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21H9z"/></svg>`,
  leetcode: `<svg viewBox="0 0 24 24"><path d="M14.5 3 7 10.6a3.4 3.4 0 0 0 0 4.8l4.6 4.6a3.4 3.4 0 0 0 4.8 0l2.1-2.1-1.5-1.5-2.1 2.1a1.3 1.3 0 0 1-1.8 0l-4.6-4.6a1.3 1.3 0 0 1 0-1.8L16 4.5zM10 12h10v2H10z"/></svg>`,
  gfg: `<svg viewBox="0 0 24 24"><path d="M3 12a5 5 0 0 1 9-3M21 12a5 5 0 0 0-9-3M3 12h8M13 12h8M3 12a5 5 0 0 0 8 4M21 12a5 5 0 0 1-8 4" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  tuf: `<svg viewBox="0 0 24 24"><path d="M4 5h11l-2 4H8v3h4l-2 4H8v3H4z"/><path d="M15 12h5l-2 4h-3z"/></svg>`,
  portfolio: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  email: `<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3z" fill="none" stroke="currentColor" stroke-width="2"/><path d="m3 6 9 7 9-7" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
};

const DEFAULT_PROFILE = {
  name: "Ajitabh Kumar Jha", username: "ajitabhjha13", headline: "4th year CSE · Java + DSA",
  college: "Parul University", gradYear: "2027", location: "Vadodara, Gujarat", email: "",
  photo: "", banner: "amber",
  links: {
    github: "https://github.com/Ajitabhjha13",
    linkedin: "https://www.linkedin.com/in/ajitabh-kumar-jha-476546283",
    leetcode: "https://leetcode.com/u/ajitabhjha13/",
    gfg: "https://www.geeksforgeeks.org/profile/ajitabhd87y",
    tuf: "https://takeuforward.org/profile/ajitabhjha13",
    portfolio: "https://ajitabh-portfolio.vercel.app/",
  },
  pinned: [],
};

const Profile = {
  get data() {
    const p = (Store.state.profile ??= structuredClone(DEFAULT_PROFILE));
    p.links ??= {}; p.pinned ??= [];
    if (!p.linksV2) {  // ek baar: tumhare diye hue sahi links bhar do
      Object.entries(DEFAULT_PROFILE.links).forEach(([k, v]) => { if (!p.links[k] || k === "tuf") p.links[k] = v; });
      if (p.username === "ajitabh13") p.username = "ajitabhjha13";
      p.linksV2 = true;
      Store.save();
    }
    return p;
  },
  firstName() { return (this.data.name || "there").trim().split(/\s+/)[0]; },
  initials() {
    const parts = (this.data.name || "?").trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || "")).toUpperCase(); // "Ajitabh Kumar Jha" → AK
  },
  // Photo: profile mein upload ki hui → assets/ajitabh.jpg → initials
  avatar(cls = "avatar") {
    const p = this.data;
    if (p.photo) return `<img class="${cls} has-photo" src="${p.photo}" alt="${esc(p.name)}">`;
    const fb = `<div class="${cls}">${esc(this.initials())}</div>`;
    return `<img class="${cls} has-photo" src="assets/ajitabh.jpg" alt="${esc(p.name)}" onerror="this.outerHTML=this.dataset.fb" data-fb='${fb.replace(/'/g, "&#39;")}'>`;
  },
  // Username ya poora link, dono chalenge
  url(key, v) {
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    const base = LINKS.find(l => l[0] === key)?.[2] || "https://";
    return base + v.replace(/^@/, "");
  },

  // Sidebar ke neeche naam/photo
  // Sidebar ke neeche About card ki chhoti photo
  refreshSidebar() {
    const el = document.getElementById("about-mini-photo");
    if (el) el.innerHTML = AboutPage.photoHtml("about-mini-img");
  },
};

const ProfilePage = {
  editing: false,
  picking: false,
  chartMonth: 0,          // 0 = is mahina, -1 = pichhla...
  chartSeries: "main",

  // ---------------- DAILY CHART (TUF "Coins History" jaisa) ----------------
  SERIES: {
    main: { label: "Problems", color: "var(--c-main)", get: l => l.main || 0 },
    warmup: { label: "Warm-ups", color: "var(--c-warmup)", get: l => l.warmup || 0 },
    lecture: { label: "Lectures", color: "var(--c-lectures)", get: l => l.lecture || 0 },
    done: { label: "All tasks", color: "#b57bff", get: l => l.done || 0 },
    hours: { label: "Hours", color: "#ff7a59", get: l => +((l.seconds || 0) / 3600).toFixed(1) },
    xp: { label: "XP", color: "#f4b740", get: l => Analytics.dayXp(l) },
  },

  monthData() {
    const now = parseDate(todayStr());
    const first = new Date(now.getFullYear(), now.getMonth() + this.chartMonth, 1);
    const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const ser = this.SERIES[this.chartSeries];
    const pts = [];
    for (let d = 1; d <= days; d++) {
      const key = formatDate(new Date(first.getFullYear(), first.getMonth(), d));
      pts.push({ day: d, key, v: key > todayStr() ? null : ser.get(Store.state.log[key] || {}) });
    }
    return { first, pts, ser };
  },

  // Catmull-Rom se smooth curve (TUF jaisi gol lehar)
  smoothPath(xy) {
    if (xy.length < 2) return "";
    let d = `M${xy[0][0]},${xy[0][1]}`;
    for (let i = 0; i < xy.length - 1; i++) {
      const p0 = xy[i - 1] || xy[i], p1 = xy[i], p2 = xy[i + 1], p3 = xy[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0].toFixed(1)},${Math.min(c1[1], 170).toFixed(1)} ${c2[0].toFixed(1)},${Math.min(c2[1], 170).toFixed(1)} ${p2[0]},${p2[1]}`;
    }
    return d;
  },

  dailyChart() {
    const { first, pts, ser } = this.monthData();
    const W = 720, H = 200, L = 34, B = 170, T = 14;
    const vals = pts.filter(p => p.v !== null).map(p => p.v);
    const max = Math.max(1, ...vals);
    const step = (W - L - 10) / (pts.length - 1);
    const xy = pts.filter(p => p.v !== null).map(p => [L + (p.day - 1) * step, B - (p.v / max) * (B - T)]);
    const line = this.smoothPath(xy);
    const area = xy.length > 1 ? `${line} L${xy[xy.length - 1][0]},${B} L${xy[0][0]},${B} Z` : "";
    const grid = pts.map(p => `<line x1="${L + (p.day - 1) * step}" x2="${L + (p.day - 1) * step}" y1="${T}" y2="${B}" class="cg-v"/>`).join("");
    const ticks = [0, 0.5, 1].map(f => `<text x="${L - 6}" y="${B - f * (B - T) + 4}" class="cg-t" text-anchor="end">${+(max * f).toFixed(1)}</text>`).join("");
    const xl = pts.filter(p => p.day === 1 || p.day % 5 === 0).map(p => `<text x="${L + (p.day - 1) * step}" y="${B + 16}" class="cg-t" text-anchor="middle">${p.day}</text>`).join("");
    const total = vals.reduce((a, b) => a + b, 0);
    const bestDay = pts.reduce((b, p) => (p.v ?? -1) > (b?.v ?? -1) ? p : b, null);
    const now = parseDate(todayStr());
    const months = [...Array(12)].map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return `<option value="${-i}" ${this.chartMonth === -i ? "selected" : ""}>${d.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</option>`;
    }).join("");

    return `
      <div class="card pf-chart">
        <div class="dash-title-row">
          <h2 class="section-title">Daily history</h2>
          <select id="pf-month">${months}</select>
        </div>
        <div class="chips">${Object.entries(this.SERIES).map(([k, v]) =>
          `<button class="chip ${this.chartSeries === k ? "on" : ""}" data-action="series" data-v="${k}"><i class="dot-c" style="background:${v.color}"></i>${v.label}</button>`).join("")}</div>
        <div class="cg-wrap">
          <svg class="cg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" id="pf-chart-svg" data-step="${step}" data-left="${L}">
            <defs><linearGradient id="cg-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${ser.color}" stop-opacity="0.55"/><stop offset="100%" stop-color="${ser.color}" stop-opacity="0.02"/></linearGradient></defs>
            ${grid}
            <line x1="${L}" x2="${W - 10}" y1="${B}" y2="${B}" class="cg-axis"/>
            ${ticks}${xl}
            ${area ? `<path d="${area}" fill="url(#cg-fill)"/><path d="${line}" fill="none" stroke="${ser.color}" stroke-width="2.2"/>` : ""}
            <line id="cg-hover" x1="0" x2="0" y1="${T}" y2="${B}" class="cg-hover" visibility="hidden"/>
            <text x="12" y="${(B + T) / 2}" class="cg-t" transform="rotate(-90 12 ${(B + T) / 2})" text-anchor="middle">${ser.label}</text>
          </svg>
          <div class="cal-tip cg-tip" id="cg-tip" hidden></div>
        </div>
        <div class="cg-foot muted small">
          <span>${first.toLocaleDateString("en-IN", { month: "long" })}: <b>${+total.toFixed(1)}</b> ${ser.label.toLowerCase()}</span>
          ${bestDay?.v ? `<span>Best day: <b>${prettyDate(bestDay.key)}</b> (${bestDay.v})</span>` : ""}
          <span>Daily average: <b>${vals.length ? +(total / vals.length).toFixed(1) : 0}</b></span>
        </div>
      </div>`;
  },

  // ---------------- DSA PROGRESS (TUF jaisa donut + sections) ----------------
  async progressCard() {
    const problems = await Data.problems();
    const st = id => Store.state.progress[id]?.status;
    const core = problems.filter(p => p.tier === "core");
    const adv = problems.filter(p => p.tier === "advanced");
    const lv = l => ({ done: core.filter(p => p.level === l && st(p.id) === "done").length, total: core.filter(p => p.level === l).length });
    const parts = [["basic", "Basic", "#4ccf8a"], ["core", "Core", "#f4b740"], ["pro", "Pro", "#f26d6d"]].map(([k, l, c]) => ({ k, l, c, ...lv(k) }));
    const solved = parts.reduce((a, x) => a + x.done, 0), total = parts.reduce((a, x) => a + x.total, 0);

    // 3 arcs (Basic, Core, Pro), har ek mein solved hissa chamakta hua
    const r = 78, C = 2 * Math.PI * r, gap = 14, segLen = C / 3 - gap;
    const arcs = parts.map((x, i) => {
      const off = -(i * (C / 3));
      const fill = x.total ? (x.done / x.total) * segLen : 0;
      return `<circle r="${r}" cx="100" cy="100" fill="none" stroke="${x.c}" stroke-opacity="0.18" stroke-width="10" stroke-linecap="round"
                stroke-dasharray="${segLen} ${C}" stroke-dashoffset="${off}" transform="rotate(-80 100 100)"/>
              ${fill > 0 ? `<circle r="${r}" cx="100" cy="100" fill="none" stroke="${x.c}" stroke-width="10" stroke-linecap="round"
                stroke-dasharray="${Math.max(fill, 1)} ${C}" stroke-dashoffset="${off}" transform="rotate(-80 100 100)"/>` : ""}`;
    }).join("");

    // Sections: Warm-up, Main Quest, Lectures, Plan 2.0
    const w = Store.state.warmup;
    const wb = await Data.workbook();
    const wAct = wb.filter(x => Warmup.isActive(x.id));
    const vids = (Store.state.videos?.items || []).filter(v => v.tier === "core");
    const rows = [
      ["Main Quest", core.filter(p => st(p.id) === "done").length, core.length, "var(--c-main)", "#/plan/main"],
      ["Warm-up", wAct.filter(x => (w.history?.[x.id] || 0) > 0).length, wAct.length, "var(--c-warmup)", "#/plan/warmup"],
      ["Lectures", vids.filter(v => st(v.id) === "done" || st(v.id) === "skipped").length, vids.length, "var(--c-lectures)", "#/lectures"],
      ["Plan 2.0", adv.filter(p => st(p.id) === "done").length, adv.length, "#b57bff", "#/plan2"],
    ];
    const maxDone = Math.max(1, ...rows.map(x => x[1]));

    return `
      <div class="pf-progress">
        <div class="card pf-donut">
          <div class="muted small">DSA PROGRESS</div>
          <div class="donut-body">
            <svg viewBox="0 0 200 200" class="donut">${arcs}
              <text x="100" y="100" text-anchor="middle" class="cc-big">${solved}</text>
              <text x="100" y="122" text-anchor="middle" class="cc-small">/ ${total}</text></svg>
            <div class="donut-legend">${parts.map(x => `
              <div><span><i style="background:${x.c}"></i>${x.l}</span><b>${x.done}<span class="muted"> / ${x.total}</span></b></div>`).join("")}</div>
          </div>
        </div>
        <div class="card pf-sections">
          <div class="muted small">PROGRESS BY SECTION</div>
          <div class="sec-bars">${rows.map(([l, d, t, c, href]) => `
            <a class="sec-bar" href="${href}">
              <span class="sb-label">${l}</span>
              <span class="sb-track"><span class="sb-fill" style="width:${Math.max(d ? 8 : 0, Math.round((d / maxDone) * 100))}%;background:${c}">${d || ""}</span></span>
              <span class="sb-total muted small">${d} / ${t}</span>
            </a>`).join("")}</div>
        </div>
      </div>`;
  },
  chart: { offset: 0, mode: "tasks" },
  cons: { months: 12, filter: "all" },
  reportOffset: 0,
  allMilestones: false,

  // TUF jaisa donut: 3 hisse (Warm-up, Main Quest, Lectures), har hisse mein done bhara hua
  donut(parts) {
    const size = 200, r = 80, C = 2 * Math.PI * r, gap = 10;
    const total = parts.reduce((a, p) => a + p.total, 0) || 1;
    let angle = -90, arcs = "";
    parts.forEach(p => {
      if (!p.total) return;
      const seg = (p.total / total) * C - gap;
      const fill = Math.max(0, Math.min(seg, (p.done / p.total) * seg));
      const rot = `rotate(${angle} ${size / 2} ${size / 2})`;
      arcs += `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${p.color}" stroke-opacity="0.22" stroke-width="12" stroke-linecap="round" stroke-dasharray="${seg} ${C}" transform="${rot}"/>`;
      if (fill > 0) arcs += `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${p.color}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${fill} ${C}" transform="${rot}"><title>${p.label}: ${p.done}/${p.total}</title></circle>`;
      angle += ((p.total / total) * 360);
    });
    const done = parts.reduce((a, p) => a + p.done, 0);
    return `<svg class="pdonut" viewBox="0 0 200 200">${arcs}
      <text x="100" y="98" text-anchor="middle" class="cc-big">${done}</text>
      <text x="100" y="120" text-anchor="middle" class="cc-small">/ ${total}</text></svg>`;
  },

  monthOptions(sel) {
    const now = parseDate(todayStr());
    return [...Array(12)].map((_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return `<option value="${-i}" ${sel === -i ? "selected" : ""}>${d.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</option>`;
    }).join("");
  },

  editForm(p) {
    return `
      <div class="card pf-edit">
        <h2 class="section-title">Edit profile</h2>
        <div class="pf-photo-row">
          ${Profile.avatar("pf-avatar-lg")}
          <div class="btn-row">
            <label class="btn btn-sm">Upload photo<input type="file" id="pf-photo" accept="image/*" hidden></label>
            ${p.photo ? `<button class="btn btn-sm btn-danger" data-action="photo-remove">Remove photo</button>` : ""}
          </div>
        </div>
        <div class="pf-form">
          ${[["name", "Full name"], ["username", "Username"], ["headline", "Headline"], ["college", "College"], ["gradYear", "Graduation year"], ["location", "Location"], ["email", "Email"]]
            .map(([k, l]) => `<label class="field"><span>${l}</span><input data-f="${k}" value="${esc(p[k] || "")}" ${k === "email" ? 'type="email"' : ""}></label>`).join("")}
        </div>
        <h3 class="section-title pf-h">Links <span class="muted small">(full link or just your username)</span></h3>
        <div class="pf-form">
          ${LINKS.map(([k, l]) => `<label class="field"><span>${l}</span><input data-l="${k}" value="${esc(p.links[k] || "")}" placeholder="username or https://..."></label>`).join("")}
        </div>
        <h3 class="section-title pf-h">Banner colour</h3>
        <div class="banner-picks">${Object.entries(BANNERS).map(([k, g]) =>
          `<button class="banner-pick ${p.banner === k ? "on" : ""}" data-action="banner" data-v="${k}" style="background:${g}" title="${k}"></button>`).join("")}</div>
        <div class="btn-row" style="margin-top:18px">
          <button class="btn btn-primary" data-action="save">Save profile</button>
          <button class="btn" data-action="cancel">Cancel</button>
        </div>
      </div>`;
  },

  async render() {
    const p = Profile.data;
    const badges = await Insights.achievements();
    const earned = badges.filter(b => b.done).sort((a, b) => String(b.on).localeCompare(String(a.on)));
    const pinned = p.pinned.map(id => earned.find(b => b.id === id)).filter(Boolean);
    const showcase = (pinned.length ? pinned : earned.slice(0, 3)).slice(0, 3);
    const ctx = await Insights.context();
    const si = Tracker.streakInfo();
    const xp = await Analytics.xp();
    const st = id => Store.state.progress[id]?.status;

    // Progress numbers
    const problems = await Data.problems();
    const core = problems.filter(x => x.tier === "core"), adv = problems.filter(x => x.tier === "advanced");
    const wb = await Data.workbook();
    const w = Store.state.warmup;
    const wDone = wb.filter(x => (w.history?.[x.id] || 0) > 0).length;
    const mDone = core.filter(x => st(x.id) === "done").length;
    const lec = (Store.state.videos?.items || []).filter(v => v.tier === "core");
    const lDone = lec.filter(v => st(v.id) === "done").length;
    const aDone = adv.filter(x => st(x.id) === "done").length;
    const parts = [
      { label: "Warm-up", done: wDone, total: wb.length, color: "#4ccf8a" },
      { label: "Main Quest", done: mDone, total: core.length, color: "#f4b740" },
      { label: "Lectures", done: lDone, total: lec.length, color: "#5d8bff" },
    ];
    const bars = [
      ["Warm-up", wDone, wb.length, "var(--c-warmup)"], ["Main Quest", mDone, core.length, "var(--c-main)"],
      ["Lectures", lDone, lec.length, "var(--c-lectures)"], ["Contests passed", ctx.contestsPassed, Math.max(ctx.contestsTaken, 1), "var(--r-epic)"],
      ["Plan 2.0", aDone, adv.length, "var(--muted)"],
    ];
    const barMax = Math.max(...bars.map(b => b[1]), 1);

    const chart = Analytics.dailyChart(this.chart.offset, this.chart.mode);
    const cons = Analytics.heatmap(this.cons.months, this.cons.filter);
    const journey = await Analytics.journey();
    const pat = Analytics.patterns();
    const recs = await Analytics.records();
    const miles = await Analytics.milestones();
    const rep = await Analytics.monthReport(this.reportOffset);

    const links = [
      ...LINKS.filter(([k]) => p.links[k]).map(([k, l]) => `<a class="plink" href="${esc(Profile.url(k, p.links[k]))}" target="_blank" rel="noopener">${LINK_ICONS[k]}<span>${l}</span></a>`),
      p.email ? `<span class="plink"><a href="mailto:${esc(p.email)}">${LINK_ICONS.email}<span>${esc(p.email)}</span></a><button class="linkbtn" data-action="copy-email" title="Copy email">Copy</button></span>` : "",
    ].join("");

    const glance = [
      ["XP", xp.xp], ["Problems solved", ctx.solved], ["Hours studied", Math.floor(ctx.hours)],
      ["Current streak", `${si.current} 🔥`], ["Best streak", si.best], ["Contests passed", ctx.contestsPassed], ["Trophies", `${earned.length}/${badges.length}`],
    ];
    const seg = (group, k, list) => `<div class="segs">${list.map(([v, l]) => `<button class="seg ${this[group][k] === v ? "on" : ""}" data-action="set" data-g="${group}" data-k="${k}" data-v="${v}">${l}</button>`).join("")}</div>`;
    const dlt = (a, b) => { const d = rep.delta(a, b); return `<span class="${d >= 0 ? "ok" : "late"} small">${d >= 0 ? "▲" : "▼"} ${Math.abs(d)}%</span>`; };

    return `
      <div class="pf-card card">
        <div class="pf-banner" style="background:${BANNERS[p.banner] || BANNERS.amber}"></div>
        <div class="pf-head">
          ${Profile.avatar("pf-avatar")}
          <div class="pf-id">
            <h1 class="page-title">${esc(p.name || "Your name")} <span class="lvl-pill" title="${xp.xp} XP">Lv ${xp.level} · ${xp.title}</span></h1>
            <div class="muted">${p.username ? `@${esc(p.username)}` : ""}${p.headline ? ` · ${esc(p.headline)}` : ""}</div>
            <div class="pf-meta">
              ${p.college ? `<span>🎓 ${esc(p.college)}${p.gradYear ? `, Class of ${esc(p.gradYear)}` : ""}</span>` : ""}
              ${p.location ? `<span>📍 ${esc(p.location)}</span>` : ""}
            </div>
            <div class="xp-row"><div class="bar xp-bar"><div style="width:${xp.pct}%"></div></div>
              <span class="muted small">${xp.nextTitle ? `${xp.into} / ${xp.span} XP to ${xp.nextTitle}` : "Max level reached 👑"}</span></div>
          </div>
          <div class="pf-actions">
            <button class="btn btn-sm" data-action="share">🖼️ Share stats card</button>
            ${this.editing ? "" : `<button class="btn btn-sm" data-action="edit">✏️ Edit profile</button>`}
          </div>
        </div>
        ${links ? `<div class="pf-links">${links}</div>` : `<p class="muted small pf-links">No links yet. Click Edit profile to add them.</p>`}
      </div>

      ${this.editing ? this.editForm(p) : ""}

      <div class="card pf-glance">${glance.map(([l, v]) => `<div><b>${v}</b><span>${l}</span></div>`).join("")}</div>

      ${await this.progressCard()}
      ${this.dailyChart()}

      <div class="card pf-heat">
        <div class="dash-title-row">
          <h2 class="section-title">Consistency</h2>
          <select id="cons-range">${[[12, "12 months"], [6, "6 months"], [3, "3 months"]].map(([v, l]) => `<option value="${v}" ${this.cons.months === v ? "selected" : ""}>${l}</option>`).join("")}</select>
        </div>
        <div class="chips">${[["all", "All"], ["warmup", "Warm-up"], ["main", "Main Quest"], ["lecture", "Lectures"], ["contests", "Contests"]].map(([v, l]) =>
          `<button class="chip ${this.cons.filter === v ? "on" : ""}" data-action="set" data-g="cons" data-k="filter" data-v="${v}">${l}</button>`).join("")}</div>
        ${cons.html}
        <div class="cons-stats">
          <div><b>${cons.contrib}</b><span>Contributions · ${this.cons.months} mos</span></div>
          <div><b>${cons.active}</b><span>Active days</span></div>
          <div><b>${cons.best}</b><span>Best streak</span></div>
          <div><b>${cons.contests}</b><span>Contests</span></div>
          <span class="cal-legend"><span class="muted small">Less</span>${[1, 2, 3, 4].map(l => `<i class="lvl${l}"></i>`).join("")}<span class="muted small">More</span></span>
        </div>
        <div class="cal-tip" id="hm-tip" hidden></div>
      </div>

      <div class="pf-row">
        <div class="card">
          <div class="dash-title-row"><h2 class="section-title">📈 Your journey</h2>
            ${journey ? `<span class="muted small">${journey.total} problems since ${prettyDate(journey.since)}</span>` : ""}</div>
          ${journey ? journey.svg : `<p class="muted small">Solve your first problem to start the graph.</p>`}
        </div>
        <div class="card">
          <h2 class="section-title">🕐 Study patterns</h2>
          <p class="pattern-insight">${pat.insight}</p>
          <div class="pattern-grid">
            <div><div class="muted small">AVG PER DAY OF WEEK</div>${pat.days}</div>
            <div><div class="muted small">TASKS BY TIME OF DAY</div>${pat.hasTimes ? pat.slots : `<p class="muted small">Starts filling up from today, as you complete tasks.</p>`}</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="section-title">🏅 Personal records</h2>
        <div class="records">${recs.map(([i, l, v, sub]) => `<div class="record"><span class="rec-icon">${i}</span><div><span class="muted small">${l}</span><b>${esc(String(v))}</b><span class="muted small">${esc(sub)}</span></div></div>`).join("")}</div>
      </div>

      <div class="pf-row">
        <div class="card">
          <h2 class="section-title">🗺️ Milestones</h2>
          ${miles.length ? `<ol class="timeline">${(this.allMilestones ? miles : miles.slice(0, 8)).map(m => `
            <li><span class="tl-dot">${m.icon}</span><div><b>${esc(m.text)}</b><span class="muted small">${prettyDate(m.date)}</span></div></li>`).join("")}</ol>
            ${miles.length > 8 ? `<button class="linkbtn" data-action="miles">${this.allMilestones ? "Show less" : `Show all ${miles.length}`}</button>` : ""}`
          : `<p class="muted small">Your milestones will appear here as you go.</p>`}
        </div>
        <div class="card">
          <div class="dash-title-row"><h2 class="section-title">📅 Monthly report</h2>
            <select id="report-month">${this.monthOptions(this.reportOffset)}</select></div>
          <div class="report">
            <div><span class="muted small">Tasks done</span><b>${rep.cur.tasks}</b>${dlt(rep.cur.tasks, rep.prev.tasks)}</div>
            <div><span class="muted small">Hours studied</span><b>${(rep.cur.secs / 3600).toFixed(1)}</b>${dlt(rep.cur.secs, rep.prev.secs)}</div>
            <div><span class="muted small">Active days</span><b>${rep.cur.active}</b>${dlt(rep.cur.active, rep.prev.active)}</div>
            <div><span class="muted small">Problems solved</span><b>${rep.cur.main}</b>${dlt(rep.cur.main, rep.prev.main)}</div>
            <div><span class="muted small">Contests passed</span><b>${rep.cur.passed} / ${rep.cur.contests}</b></div>
            <div><span class="muted small">XP earned</span><b>${rep.cur.xp}</b>${dlt(rep.cur.xp, rep.prev.xp)}</div>
          </div>
          <p class="muted small">${rep.cur.best[0] ? `Best day: <b>${prettyDate(rep.cur.best[0])}</b> with ${rep.cur.best[1]} tasks. ` : ""}${rep.badges.length ? `Trophies this month: ${rep.badges.map(b => `${b.icon} ${b.name}`).join(", ")}.` : "No new trophies this month yet."}
            <span class="muted">Compared with the month before.</span></p>
        </div>
      </div>

      <div class="card">
        <div class="dash-title-row"><h2 class="section-title">🏆 Pinned trophies</h2>
          ${earned.length ? `<button class="linkbtn" data-action="pick">${this.picking ? "Done" : "Choose trophies"}</button>` : ""}</div>
        ${!earned.length ? `<p class="muted small">No trophies yet. Solve your first problem to earn 🚀 First Step.</p>`
          : this.picking ? `
            <p class="muted small">Pick up to 3 trophies to show on your profile.</p>
            <div class="pin-grid">${earned.map(b => `
              <button class="pin-opt r-${b.rarity} ${p.pinned.includes(b.id) ? "on" : ""}" data-action="pin" data-id="${b.id}">
                <span class="bicon">${b.icon}</span><b>${b.name}</b><span class="rar r-${b.rarity}">${Insights.RARITY[b.rarity]}</span></button>`).join("")}</div>`
          : `<div class="showcase">${showcase.map(b => `
              <div class="trophy r-${b.rarity}">
                <span class="trophy-icon">${b.icon}</span><b>${b.name}</b>
                <span class="rar r-${b.rarity}">${Insights.RARITY[b.rarity]}</span>
                <span class="muted small">${b.desc}</span><span class="muted small">Earned ${Insights.earnedText(b.on)}</span>
              </div>`).join("")}</div>`}
      </div>`;
  },

  afterRender() {
    const app = document.getElementById("app");
    const p = Profile.data;

    // Hover tooltips: heatmap cells aur chart ke din
    const place = (tip, el, boxSel) => {
      const box = el.closest(boxSel).getBoundingClientRect(), r = el.getBoundingClientRect();
      tip.style.left = Math.min(box.width - 240, Math.max(8, r.left - box.left + r.width / 2 - 115)) + "px";
      tip.style.top = (r.bottom - box.top + 8) + "px";
    };
    app.onmouseover = e => {
      const hmTip = document.getElementById("hm-tip"), chTip = document.getElementById("chart-tip");
      const cell = e.target.closest(".hm-cell[data-date]");
      if (cell && cell.dataset.date) { hmTip.innerHTML = DashboardPage.dayTip(cell.dataset.date); hmTip.hidden = false; place(hmTip, cell, ".pf-heat"); }
      else if (hmTip) hmTip.hidden = true;
      const hit = e.target.closest("rect.hit[data-date]");
      if (hit) {
        const l = Store.state.log[hit.dataset.date] || {};
        chTip.innerHTML = DashboardPage.dayTip(hit.dataset.date) + `<div class="tip-grid"><span>XP</span><b>${Analytics.dayXp(l)}</b></div>`;
        chTip.hidden = false;
        const box = hit.closest(".pf-chart").getBoundingClientRect(), r = hit.getBoundingClientRect();
        chTip.style.left = Math.min(box.width - 240, Math.max(8, r.left - box.left - 110)) + "px";
        chTip.style.top = "90px";
      } else if (chTip) chTip.hidden = true;
    };

    // Daily history chart: mouse jahan, us din ka hisaab
    const svg = document.getElementById("pf-chart-svg"), ctip = document.getElementById("cg-tip"), hl = document.getElementById("cg-hover");
    svg?.addEventListener("mousemove", e => {
      const box = svg.getBoundingClientRect();
      const vx = (e.clientX - box.left) * (720 / box.width);
      const { pts, ser } = this.monthData();
      const step = Number(svg.dataset.step), L = Number(svg.dataset.left);
      const i = Math.max(0, Math.min(pts.length - 1, Math.round((vx - L) / step)));
      const pt = pts[i];
      if (pt.v === null) { ctip.hidden = true; hl.setAttribute("visibility", "hidden"); return; }
      hl.setAttribute("x1", L + i * step); hl.setAttribute("x2", L + i * step); hl.setAttribute("visibility", "visible");
      const l = Store.state.log[pt.key] || {};
      ctip.innerHTML = `<b>${parseDate(pt.key).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</b>
        <div class="tip-grid">${["main", "warmup", "lecture"].includes(this.chartSeries) ? "" : `<span>${ser.label}</span><b>${pt.v}</b>`}<span class="c-main">Problems</span><b>${l.main || 0}</b>
        <span class="c-warm">Warm-ups</span><b>${l.warmup || 0}</b><span class="c-lec">Lectures</span><b>${l.lecture || 0}</b>
        <span>Time studied</span><b>${formatDuration(l.seconds || 0)}</b></div>`;
      ctip.hidden = false;
      const card = svg.closest(".pf-chart").getBoundingClientRect();
      ctip.style.left = Math.min(card.width - 200, Math.max(8, e.clientX - card.left + 14)) + "px";
      ctip.style.top = Math.max(8, e.clientY - card.top - 60) + "px";
    });
    svg?.addEventListener("mouseleave", () => { ctip.hidden = true; hl.setAttribute("visibility", "hidden"); });

    app.onchange = e => {
      if (e.target.id === "pf-month") { this.chartMonth = Number(e.target.value); renderRoute(); return; }
      if (e.target.id === "chart-month") { this.chart.offset = Number(e.target.value); renderRoute(); return; }
      if (e.target.id === "cons-range") { this.cons.months = Number(e.target.value); renderRoute(); return; }
      if (e.target.id === "report-month") { this.reportOffset = Number(e.target.value); renderRoute(); return; }
      if (e.target.id !== "pf-photo") return;
      const file = e.target.files[0];
      if (!file) return;
      // Photo ko 256x256 mein chhota karo, taaki storage kam le
      const img = new Image();
      img.onload = () => {
        const size = 256, c = document.createElement("canvas");
        c.width = c.height = size;
        const sd = Math.min(img.width, img.height);
        c.getContext("2d").drawImage(img, (img.width - sd) / 2, (img.height - sd) / 2, sd, sd, 0, 0, size, size);
        p.photo = c.toDataURL("image/jpeg", 0.85);
        URL.revokeObjectURL(img.src);
        Store.save();
        renderRoute();
      };
      img.src = URL.createObjectURL(file);
    };

    app.onclick = async e => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      switch (btn.dataset.action) {
        case "set": this[btn.dataset.g][btn.dataset.k] = btn.dataset.v; break;
        case "miles": this.allMilestones = !this.allMilestones; break;
        case "share": await Analytics.shareCard(); showToast("Stats card downloaded 🖼️"); return;
        case "edit": this.editing = true; break;
        case "series": this.chartSeries = btn.dataset.v; break;
        case "cancel": this.editing = false; break;
        case "banner": p.banner = btn.dataset.v; Store.save(); break;
        case "photo-remove": p.photo = ""; Store.save(); break;
        case "save":
          app.querySelectorAll("[data-f]").forEach(i => { p[i.dataset.f] = i.value.trim(); });
          app.querySelectorAll("[data-l]").forEach(i => { p.links[i.dataset.l] = i.value.trim(); });
          p.username = (p.username || "").replace(/^@/, "");
          Store.save();
          this.editing = false;
          showToast("Profile saved ✓");
          break;
        case "copy-email":
          try { await navigator.clipboard.writeText(p.email); showToast("Email copied"); } catch { showToast("Could not copy"); }
          return;
        case "pick": this.picking = !this.picking; break;
        case "pin": {
          const id = btn.dataset.id, i = p.pinned.indexOf(id);
          if (i !== -1) p.pinned.splice(i, 1);
          else if (p.pinned.length < 3) p.pinned.push(id);
          else { showToast("You can pin up to 3 trophies"); return; }
          Store.save();
          break;
        }
        default: return;
      }
      const y = window.scrollY;
      await renderRoute();
      window.scrollTo(0, y);
    };
  },
};
