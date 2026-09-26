// =========================================================
// ABOUT: yeh website kisne, kab aur kyun banayi
// Photo:     assets/ajitabh.jpg   (na ho toh Profile photo, warna initials)
// Signature: assets/signature.png (na ho toh sundar handwriting font mein naam)
// =========================================================
const ABOUT = {
  name: "Ajitabh Kumar Jha",
  started: "2026-09-25",
  practice: "2026-09-27",
  version: "2026-09-27",
};

const AboutPage = {
  // Photo: assets file → profile photo → initials (jo mile)
  photoHtml(cls) {
    const fallback = Profile.data.photo
      ? `<img class="${cls}" src="${Profile.data.photo}" alt="${ABOUT.name}">`
      : `<span class="${cls} about-initials">${esc(Profile.initials())}</span>`;
    return `<img class="${cls}" src="assets/ajitabh.jpg" alt="${ABOUT.name}"
      onerror="this.outerHTML=this.dataset.fb" data-fb='${fallback.replace(/'/g, "&#39;")}'>`;
  },

  signatureHtml() {
    return `<img class="sig-img" src="assets/signature.png" alt="Signature of ${ABOUT.name}"
      onerror="this.outerHTML='<span class=&quot;sig-text&quot;>${ABOUT.name}</span>'">`;
  },

  longDate(d) {
    return parseDate(d).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  },

  async render() {
    const days = Math.max(1, daysBetween(parseDate(ABOUT.practice), parseDate(todayStr())) + 1);
    const features = [
      ["🧭", "A plan that knows your hours", "Every warm-up, problem and lecture is placed on a real calendar, and the plan re-shapes itself when a day is missed."],
      ["🎯", "Three tracks, one goal", "Warm-up for speed, Main Quest for depth, Lectures for concepts, all counted towards one finish date."],
      ["🏆", "Contests that feel real", "Timed topic, weekly, monthly, blind and custom contests, with focus mode and no peeking."],
      ["🧠", "Revision that sticks", "Review rounds, Problem of the Day, key points, hints and a flashcard-style Revision Mode."],
      ["📈", "Honest progress", "Streaks with freezes, activity heatmaps, mastery levels, weak areas and 30+ achievements."],
      ["🔒", "Private by design", "Everything lives in your own browser. No account, no tracking, no ads."],
    ];
    const stack = ["HTML", "CSS", "Vanilla JavaScript", "localStorage", "YouTube Data API", "LeetCode dataset", "Spring Boot (coming)", "MySQL (coming)"];

    return `
      <section class="about-hero card">
        <div class="about-glow" aria-hidden="true"></div>
        <div class="about-photo-wrap">${this.photoHtml("about-photo")}</div>
        <div class="about-hero-text">
          <span class="eyebrow">ABOUT THIS PROJECT</span>
          <h1 class="about-title">Designed, built &amp; used by <span class="grad">${ABOUT.name}</span></h1>
          <p class="about-sub">4th year Computer Science student at Parul University, preparing for placements in December 2026.</p>
          <div class="about-chips">
            <span class="chip">🛠️ Built from ${this.longDate(ABOUT.started)}</span>
            <span class="chip on">🚀 Practice started ${this.longDate(ABOUT.practice)}</span>
            <span class="chip">🔥 Day ${days} of the journey</span>
          </div>
        </div>
      </section>

      <div class="about-grid">
        <section class="card about-story">
          <span class="eyebrow">WHY I BUILT IT</span>
          <h2 class="section-title">One place to get placement-ready</h2>
          <p>I tried learning DSA from YouTube many times, and every time I ended up restarting from zero. What was missing was never motivation. It was <b>structure</b>: a plan for the day, a way to see progress, and something that kept me honest.</p>
          <p>Paid planners gave me that structure, but they were too expensive for me as a student. So on ${this.longDate(ABOUT.started)} I decided to build my own, and on ${this.longDate(ABOUT.practice)} I started practising with it, from zero. A planner that knows how many hours I can study, splits my syllabus into real days, times every problem, remembers what I got wrong, and turns lectures, warm-ups and problems into progress I can actually see.</p>
          <p><b>AlgoQuest</b> is built for one goal: to walk into my placement season in December 2026 confident and ready. It is also my proof of work. A real project, built from scratch, that I use every single day.</p>
          <div class="signature">
            ${this.signatureHtml()}
            <div class="sig-meta"><b>${ABOUT.name}</b><span class="muted small">${this.longDate(ABOUT.version)} · Vadodara, Gujarat</span></div>
          </div>
        </section>

        <aside class="about-side">
          <section class="card">
            <span class="eyebrow">WHAT'S INSIDE</span>
            <div class="feat-list">${features.map(([i, t, d]) => `
              <div class="feat"><span class="feat-icon">${i}</span><div><b>${t}</b><p class="muted small">${d}</p></div></div>`).join("")}</div>
          </section>
          <section class="card">
            <span class="eyebrow">BUILT WITH</span>
            <div class="chips">${stack.map(x => `<span class="chip">${x}</span>`).join("")}</div>
            <p class="muted small" style="margin:12px 0 0">Made with patience, chai and a lot of late nights. ☕</p>
          </section>
        </aside>
      </div>`;
  },
};
