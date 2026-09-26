// =========================================================
// ANALYTICS: profile ke charts aur stats
//   XP & levels, daily chart, consistency heatmap, journey,
//   study patterns, records, milestones, monthly report,
//   weekly goals, shareable card
// =========================================================
const XP_RULES = { warmup: 5, basic: 10, core: 20, pro: 40, lecture: 10, contestPass: 50 };
const LEVELS = [
  [0, "Novice"], [200, "Apprentice"], [600, "Coder"], [1500, "Problem Solver"], [3000, "Algorithmist"], [6000, "Grandmaster"],
];
const TYPE_COLORS = { warmup: "var(--c-warmup)", main: "var(--c-main)", lecture: "var(--c-lectures)" };

const Analytics = {
  st(id) { return Store.state.progress[id]?.status; },

  // ---------------- XP & LEVELS ----------------
  async xp() {
    const problems = await Data.problems();
    const w = Store.state.warmup;
    let xp = 0;
    Object.values(w.history || {}).forEach(n => { xp += (n > 0 ? n : 0) * XP_RULES.warmup; });
    problems.forEach(p => { if (this.st(p.id) === "done") xp += XP_RULES[p.level] || 20; });
    (Store.state.videos?.items || []).forEach(v => { if (this.st(v.id) === "done") xp += XP_RULES.lecture; });
    xp += Contest.history.filter(h => h.passed).length * XP_RULES.contestPass;
    let i = LEVELS.length - 1;
    while (i > 0 && xp < LEVELS[i][0]) i--;
    const next = LEVELS[i + 1];
    return {
      xp, level: i + 1, title: LEVELS[i][1], nextTitle: next?.[1],
      into: xp - LEVELS[i][0], span: next ? next[0] - LEVELS[i][0] : 1,
      pct: next ? Math.round(((xp - LEVELS[i][0]) / (next[0] - LEVELS[i][0])) * 100) : 100,
    };
  },

  // Ek din ka XP (log ke counts se, taaki purane din bhi aayein)
  dayXp(l) {
    if (!l) return 0;
    return (l.warmup || 0) * XP_RULES.warmup + (l.main || 0) * 20 + (l.lecture || 0) * XP_RULES.lecture + (l.contestsPassed || 0) * XP_RULES.contestPass;
  },

  // ---------------- DAILY SERIES (month) ----------------
  monthDays(offset) {
    const now = parseDate(todayStr());
    const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const n = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    return { first, days: [...Array(n)].map((_, i) => formatDate(new Date(first.getFullYear(), first.getMonth(), i + 1))) };
  },

  // mode: tasks (stacked by type) | hours | xp
  dailyChart(offset, mode) {
    const { first, days } = this.monthDays(offset);
    const L = Store.state.log;
    const W = 720, H = 220, pl = 34, pb = 26, pt = 10, pr = 8;
    const cw = (W - pl - pr) / (days.length - 1);
    const val = (d, k) => (L[d]?.[k] || 0);
    let series;
    if (mode === "tasks") {
      series = days.map(d => {
        const w = val(d, "warmup"), m = val(d, "main"), l = val(d, "lecture");
        const other = Math.max(0, val(d, "done") - w - m - l); // purane din (breakdown se pehle)
        return { warmup: w, main: m + other, lecture: l };
      });
    } else if (mode === "hours") series = days.map(d => ({ v: val(d, "seconds") / 3600 }));
    else series = days.map(d => ({ v: this.dayXp(L[d]) }));

    const totals = series.map(s => mode === "tasks" ? s.warmup + s.main + s.lecture : s.v);
    const max = Math.max(1, ...totals);
    const niceMax = mode === "hours" ? Math.ceil(max) : Math.ceil(max / 5) * 5;
    const x = i => pl + i * cw, y = v => pt + (H - pt - pb) * (1 - v / niceMax);
    // Smooth path (monotone-ish) through points
    const smooth = pts => pts.reduce((acc, [px, py], i, a) => {
      if (!i) return `M${px},${py}`;
      const [qx, qy] = a[i - 1], cx = (qx + px) / 2;
      return `${acc} C${cx},${qy} ${cx},${py} ${px},${py}`;
    }, "");
    const area = (tops, bottoms, color, id) => {
      const top = smooth(tops.map((v, i) => [x(i), y(v)]));
      const back = bottoms.map((v, i) => [x(i), y(v)]).reverse();
      const bottom = smooth(back).replace(/^M/, "L");
      return `<defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="0.75"/><stop offset="1" stop-color="${color}" stop-opacity="0.08"/></linearGradient></defs>
        <path d="${top} ${bottom} Z" fill="url(#${id})"/><path d="${top}" fill="none" stroke="${color}" stroke-width="1.8"/>`;
    };
    let shapes = "";
    if (mode === "tasks") {
      const s1 = series.map(s => s.warmup), s2 = series.map((s, i) => s1[i] + s.main), s3 = series.map((s, i) => s2[i] + s.lecture);
      const zero = series.map(() => 0);
      shapes = area(s3, s2, "#5d8bff", "gL") + area(s2, s1, "#f4b740", "gM") + area(s1, zero, "#4ccf8a", "gW");
    } else {
      shapes = area(totals, series.map(() => 0), mode === "hours" ? "#5d8bff" : "#b57bff", "gV");
    }
    const grid = [0, 0.25, 0.5, 0.75, 1].map(f => {
      const v = niceMax * f;
      return `<line x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1"/>
        <text x="${pl - 6}" y="${y(v) + 4}" text-anchor="end" class="ax">${mode === "hours" ? v.toFixed(v % 1 ? 1 : 0) : Math.round(v)}</text>`;
    }).join("");
    const xlab = days.map((d, i) => (i % 5 === 0 || i === days.length - 1) ? `<text x="${x(i)}" y="${H - 6}" text-anchor="middle" class="ax">${i + 1}</text>` : "").join("");
    const hits = days.map((d, i) => `<rect class="hit" x="${x(i) - cw / 2}" y="${pt}" width="${cw}" height="${H - pt - pb}" data-date="${d}" fill="transparent"/>`).join("");
    const total = totals.reduce((a, b) => a + b, 0);
    return {
      title: first.toLocaleDateString("en-IN", { month: "long", year: "numeric" }),
      total: mode === "hours" ? `${total.toFixed(1)} h` : mode === "xp" ? `${Math.round(total)} XP` : `${total} tasks`,
      svg: `<svg class="dchart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${grid}${shapes}${xlab}${hits}</svg>`,
    };
  },

  // ---------------- CONSISTENCY (filter + range) ----------------
  THRESH: { warmup: [1, 4, 8, 10], main: [1, 2, 4, 6], lecture: [1, 2, 3, 4], contests: [1, 1, 2, 3] },

  levelFor(date, filter) {
    if (filter === "all") return DashboardPage.dayLevel(date);
    const n = Store.state.log[date]?.[filter] || 0;
    if (!n) return 0;
    const t = this.THRESH[filter];
    return n >= t[3] ? 4 : n >= t[2] ? 3 : n >= t[1] ? 2 : 1;
  },

  heatmap(months, filter) {
    const today = parseDate(todayStr());
    const weeks = Math.ceil((months * 30.5) / 7);
    const end = addDays(today, 6 - ((today.getDay() + 6) % 7));
    const start = addDays(end, -7 * weeks + 1);
    const cols = [], monthsLbl = [];
    let active = 0, contrib = 0, contests = 0, run = 0, best = 0;
    for (let w = 0; w < weeks; w++) {
      const cells = [];
      for (let d = 0; d < 7; d++) {
        const date = addDays(start, w * 7 + d), key = formatDate(date), future = date > today;
        const lvl = future ? 0 : this.levelFor(key, filter);
        const l = Store.state.log[key];
        if (!future) {
          const c = filter === "all" ? (l?.done || 0) : (l?.[filter] || 0);
          contrib += c; contests += l?.contests || 0;
          if (lvl) { active++; run++; best = Math.max(best, run); } else if (key !== todayStr()) run = 0;
        }
        cells.push(`<span class="hm-cell lvl${lvl} ${future ? "future" : ""}" data-date="${future ? "" : key}"></span>`);
        if (d === 0 && date.getDate() <= 7) monthsLbl.push({ w, label: date.toLocaleDateString("en-IN", { month: "short" }) });
      }
      cols.push(`<div class="hm-col">${cells.join("")}</div>`);
    }
    return {
      html: `<div class="hm-wrap"><div class="hm-months" style="grid-template-columns:repeat(${weeks},13px)">${monthsLbl.map(m => `<span style="grid-column:${m.w + 1}">${m.label}</span>`).join("")}</div>
        <div class="hm-body"><div class="hm-days"><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span></span></div>
        <div class="hm-grid">${cols.join("")}</div></div></div>`,
      active, contrib, contests, best,
    };
  },

  // ---------------- JOURNEY (cumulative solved) ----------------
  async journey() {
    const problems = await Data.problems();
    const dates = problems.filter(p => this.st(p.id) === "done").map(p => Store.state.progress[p.id].doneOn).filter(Boolean).sort();
    const start = [Store.settings.startDate, dates[0]].filter(Boolean).sort()[0];
    if (!start) return null;
    const days = [];
    for (let d = parseDate(start); formatDate(d) <= todayStr(); d = addDays(d, 1)) days.push(formatDate(d));
    let i = 0, c = 0;
    const vals = days.map(day => { while (i < dates.length && dates[i] <= day) { c++; i++; } return c; });
    if (vals.length < 2) { vals.unshift(0); days.unshift(start); }
    const W = 720, H = 180, pl = 34, pb = 24, pt = 10, pr = 10, max = Math.max(5, vals[vals.length - 1]);
    const x = k => pl + (k * (W - pl - pr)) / (vals.length - 1), y = v => pt + (H - pt - pb) * (1 - v / max);
    const line = vals.map((v, k) => `${x(k)},${y(v)}`).join(" ");
    const labels = [0, Math.floor((days.length - 1) / 2), days.length - 1].map(k => `<text x="${x(k)}" y="${H - 6}" text-anchor="${k === 0 ? "start" : k === days.length - 1 ? "end" : "middle"}" class="ax">${prettyDate(days[k])}</text>`).join("");
    return {
      total: vals[vals.length - 1], since: start,
      svg: `<svg class="dchart" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        <defs><linearGradient id="gJ" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f4b740" stop-opacity="0.5"/><stop offset="1" stop-color="#f4b740" stop-opacity="0"/></linearGradient></defs>
        ${[0, 0.5, 1].map(f => `<line x1="${pl}" x2="${W - pr}" y1="${y(max * f)}" y2="${y(max * f)}" stroke="var(--line)"/><text x="${pl - 6}" y="${y(max * f) + 4}" text-anchor="end" class="ax">${Math.round(max * f)}</text>`).join("")}
        <polygon points="${x(0)},${y(0)} ${line} ${x(vals.length - 1)},${y(0)}" fill="url(#gJ)"/>
        <polyline points="${line}" fill="none" stroke="#f4b740" stroke-width="2.5" stroke-linejoin="round"/>${labels}</svg>`,
    };
  },

  // ---------------- STUDY PATTERNS ----------------
  patterns() {
    const L = Store.state.log;
    const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const sum = Array(7).fill(0), cnt = Array(7).fill(0);
    Object.entries(L).forEach(([d, l]) => {
      const wd = (parseDate(d).getDay() + 6) % 7;
      const work = Math.max((l.seconds || 0) / 60, l.estMin || 0);
      if (work > 0) { sum[wd] += work; cnt[wd]++; }
    });
    const avg = sum.map((s, i) => cnt[i] ? s / cnt[i] : 0);
    const slots = [["Early morning", 5, 9], ["Morning", 9, 12], ["Afternoon", 12, 17], ["Evening", 17, 21], ["Night", 21, 24], ["Late night", 0, 5]];
    const hours = Array(24).fill(0);
    (Store.state.events || []).forEach(e => { if (e.type !== "contest") hours[new Date(e.t).getHours()]++; });
    const slotVals = slots.map(([n, a, b]) => [n, hours.slice(a, b).reduce((x, y) => x + y, 0)]);
    const bestDay = avg.indexOf(Math.max(...avg));
    const bestSlot = slotVals.reduce((a, b) => (b[1] > a[1] ? b : a));
    const bar = (label, v, max, color) => `<div class="pbar"><span>${label}</span><div class="bar"><div style="width:${max ? Math.round((v / max) * 100) : 0}%;background:${color}"></div></div><b>${v}</b></div>`;
    const dayMax = Math.max(...avg), slotMax = Math.max(...slotVals.map(s => s[1]));
    const fmt = m => m >= 60 ? `${Math.floor(m / 60)}h ${Math.round(m % 60)}m` : `${Math.round(m)}m`;
    return {
      insight: dayMax ? `You study best on <b>${names[bestDay]}s</b>${bestSlot[1] ? `, mostly in the <b>${bestSlot[0].toLowerCase()}</b>` : ""}.` : "Study for a few days and your patterns will show up here.",
      days: names.map((n, i) => bar(n, fmt(avg[i]), 1, "var(--c-lectures)").replace(/width:\d+%/, `width:${dayMax ? Math.round((avg[i] / dayMax) * 100) : 0}%`)).join(""),
      slots: slotVals.map(([n, v]) => bar(n, v, slotMax, "var(--c-main)")).join(""),
      hasTimes: (Store.state.events || []).length > 0,
    };
  },

  // ---------------- PERSONAL RECORDS ----------------
  async records() {
    const L = Store.state.log;
    const entries = Object.entries(L);
    const top = k => entries.reduce((a, [d, l]) => ((l[k] || 0) > (a[1] || 0) ? [d, l[k]] : a), [null, 0]);
    const bestTasks = top("done"), bestTime = top("seconds");
    const weeks = {};
    entries.forEach(([d, l]) => { const wk = Tracker.weekKey(d); weeks[wk] = (weeks[wk] || 0) + (l.done || 0); });
    const bestWeek = Object.entries(weeks).reduce((a, b) => (b[1] > a[1] ? b : a), [null, 0]);
    const problems = await Data.problems();
    const timed = problems.filter(p => this.st(p.id) === "done" && Store.state.progress[p.id].timeSpent >= 60)
      .map(p => ({ p, t: Store.state.progress[p.id].timeSpent }));
    const fastest = timed.sort((a, b) => a.t - b.t)[0], longest = [...timed].sort((a, b) => b.t - a.t)[0];
    const fastContest = Contest.history.filter(h => h.passed).sort((a, b) => a.usedSec - b.usedSec)[0];
    return [
      ["📈", "Most tasks in a day", bestTasks[0] ? `${bestTasks[1]} tasks` : "-", bestTasks[0] ? prettyDate(bestTasks[0]) : ""],
      ["⏱️", "Longest study day", bestTime[0] ? formatDuration(bestTime[1]) : "-", bestTime[0] ? prettyDate(bestTime[0]) : ""],
      ["📅", "Best week", bestWeek[0] ? `${bestWeek[1]} tasks` : "-", bestWeek[0] ? `Week of ${prettyDate(bestWeek[0])}` : ""],
      ["🔥", "Longest streak", `${Tracker.bestStreak()} days`, ""],
      ["⚡", "Fastest solve", fastest ? formatDuration(fastest.t) : "-", fastest ? fastest.p.title : "Use the timer to track"],
      ["🧗", "Toughest fight", longest ? formatDuration(longest.t) : "-", longest ? longest.p.title : ""],
      ["🏁", "Fastest contest pass", fastContest ? formatClock(fastContest.usedSec) : "-", fastContest ? fastContest.name : ""],
    ];
  },

  // ---------------- MILESTONES ----------------
  async milestones() {
    const out = [];
    const add = (date, icon, text) => { if (date) out.push({ date, icon, text }); };
    add(Store.settings.startDate, "🚀", "Started the plan");
    const problems = await Data.problems();
    const solved = problems.filter(p => this.st(p.id) === "done").map(p => ({ p, d: Store.state.progress[p.id].doneOn })).filter(x => x.d).sort((a, b) => a.d.localeCompare(b.d));
    if (solved[0]) add(solved[0].d, "✅", `First problem solved: ${solved[0].p.title}`);
    [10, 25, 50, 100, 150, 200, 250, 300].forEach(n => { if (solved[n - 1]) add(solved[n - 1].d, "🎯", `${n} problems solved`); });
    const lec = (Store.state.videos?.items || []).map(v => Store.state.progress[v.id]?.doneOn).filter(Boolean).sort();
    if (lec[0]) add(lec[0], "🎬", "First lecture watched");
    const firstC = Contest.history[0], firstP = Contest.history.find(h => h.passed);
    if (firstC) add(firstC.date, "🎟️", `First contest: ${firstC.name}`);
    if (firstP) add(firstP.date, "🏆", `First contest passed: ${firstP.name}`);
    (await Insights.mastery()).filter(m => m.level >= 3).forEach(m => {
      const d = problems.filter(p => p.topic === m.topic && p.tier === "core").map(p => Store.state.progress[p.id]?.doneOn).filter(Boolean).sort().pop();
      add(d, "⭐", `${m.topic} completed`);
    });
    Object.entries(Store.state.badges || {}).forEach(([id, iso]) => {
      const b = Insights.BADGES.find(x => x.id === id);
      if (b && (b.rarity === "epic" || b.rarity === "legendary")) add(String(iso).slice(0, 10), b.icon, `Earned ${b.name}`);
    });
    return out.sort((a, b) => b.date.localeCompare(a.date));
  },

  // ---------------- MONTHLY REPORT ----------------
  async monthReport(offset) {
    const sumMonth = off => {
      const { days } = this.monthDays(off);
      const r = { tasks: 0, secs: 0, active: 0, main: 0, contests: 0, passed: 0, xp: 0, best: [null, 0] };
      days.forEach(d => {
        const l = Store.state.log[d];
        if (!l) return;
        r.tasks += l.done || 0; r.secs += l.seconds || 0; r.main += l.main || 0; r.contests += l.contests || 0;
        r.passed += l.contestsPassed || 0; r.xp += this.dayXp(l);
        if (l.done || l.seconds) r.active++;
        if ((l.done || 0) > r.best[1]) r.best = [d, l.done];
      });
      return r;
    };
    const cur = sumMonth(offset), prev = sumMonth(offset - 1);
    const { first } = this.monthDays(offset);
    const mk = formatDate(first).slice(0, 7);
    const badges = Object.entries(Store.state.badges || {}).filter(([, iso]) => String(iso).startsWith(mk)).map(([id]) => Insights.BADGES.find(b => b.id === id)).filter(Boolean);
    const delta = (a, b) => b ? Math.round(((a - b) / b) * 100) : a ? 100 : 0;
    return { title: first.toLocaleDateString("en-IN", { month: "long", year: "numeric" }), cur, prev, badges, delta };
  },

  // ---------------- WEEKLY GOALS ----------------
  goals() {
    const g = (Store.state.goals ??= { targets: { main: 15, warmup: 50, lecture: 8, hours: 20 }, met: [] });
    const wk = Tracker.weekKey(todayStr());
    const prog = { main: 0, warmup: 0, lecture: 0, hours: 0 };
    for (let i = 0; i < 7; i++) {
      const l = Store.state.log[formatDate(addDays(parseDate(wk), i))];
      if (!l) continue;
      prog.main += l.main || 0; prog.warmup += l.warmup || 0; prog.lecture += l.lecture || 0; prog.hours += (l.seconds || 0) / 3600;
    }
    prog.hours += Tracker.timer ? (Date.now() - Tracker.timer.startedAt) / 3600000 : 0;
    const allMet = Object.entries(g.targets).every(([k, t]) => !t || prog[k] >= t);
    if (allMet && !g.met.includes(wk)) { g.met.push(wk); Store.save(); showToast("🎯 Weekly goals complete! Amazing week."); }
    return { targets: g.targets, prog, week: wk, allMet, metCount: g.met.length };
  },

  // ---------------- SHAREABLE CARD (PNG) ----------------
  async shareCard() {
    const p = Profile.data, xp = await this.xp(), ctx = await Insights.context();
    const W = 1200, H = 630, c = document.createElement("canvas");
    c.width = W; c.height = H;
    const g = c.getContext("2d");
    const grad = g.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0e1320"); grad.addColorStop(1, "#1d2436");
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    const bg = g.createLinearGradient(0, 0, W, 0);
    bg.addColorStop(0, "#f4b740"); bg.addColorStop(1, "#b57bff");
    g.fillStyle = bg; g.fillRect(0, 0, W, 10);
    const font = (w, s) => `${w} ${s}px "Plus Jakarta Sans", system-ui, sans-serif`;
    // Avatar
    const drawAvatar = () => new Promise(res => {
      g.save(); g.beginPath(); g.arc(120, 130, 60, 0, Math.PI * 2); g.closePath();
      if (p.photo) {
        const im = new Image();
        im.onload = () => { g.clip(); g.drawImage(im, 60, 70, 120, 120); g.restore(); res(); };
        im.onerror = () => { g.restore(); res(); };
        im.src = p.photo;
      } else {
        g.fillStyle = "#283149"; g.fill(); g.fillStyle = "#e8ebf2"; g.font = font(700, 44); g.textAlign = "center"; g.textBaseline = "middle";
        g.fillText(Profile.initials(), 120, 132); g.restore(); res();
      }
    });
    await drawAvatar();
    g.textAlign = "left"; g.textBaseline = "alphabetic";
    g.fillStyle = "#e8ebf2"; g.font = font(700, 44); g.fillText(p.name || "DSA Learner", 210, 120);
    g.fillStyle = "#8e97ac"; g.font = font(500, 24); g.fillText([p.college, p.gradYear && `Class of ${p.gradYear}`].filter(Boolean).join(" · "), 210, 158);
    g.fillStyle = "#f4b740"; g.font = font(700, 26); g.fillText(`Level ${xp.level} · ${xp.title} · ${xp.xp} XP`, 210, 196);
    const stats = [["Problems solved", ctx.solved], ["Hours studied", Math.floor(ctx.hours)], ["Best streak", `${ctx.best} days`], ["Contests passed", ctx.contestsPassed], ["Lectures", ctx.lecturesWatched], ["Trophies", Object.keys(Store.state.badges || {}).length]];
    stats.forEach(([l, v], i) => {
      const x = 60 + (i % 3) * 370, y = 270 + Math.floor(i / 3) * 150;
      g.fillStyle = "#161c2b"; g.beginPath(); g.roundRect(x, y, 340, 120, 18); g.fill();
      g.strokeStyle = "#283149"; g.lineWidth = 2; g.stroke();
      g.fillStyle = "#e8ebf2"; g.font = font(700, 48); g.fillText(String(v), x + 26, y + 66);
      g.fillStyle = "#8e97ac"; g.font = font(500, 22); g.fillText(l, x + 26, y + 100);
    });
    g.fillStyle = "#8e97ac"; g.font = font(500, 20); g.fillText(`AlgoQuest · ${prettyDate(todayStr())}`, 60, H - 30);
    const a = document.createElement("a");
    a.href = c.toDataURL("image/png");
    a.download = `dsa-stats-${todayStr()}.png`;
    a.click();
  },
};
