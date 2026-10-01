// =========================================================
// ABOUT: yeh website kisne aur kyun banayi
// Photo:     assets/ajitabh.jpg   (na ho toh Profile photo, warna initials)
// Signature: assets/signature.png (na ho toh sundar handwriting font mein naam)
// =========================================================
const ABOUT = {
  name: "Ajitabh Kumar Jha",
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

  async render() {
    const features = [
      ["🧭", "A plan that knows your hours", "Every warm-up, problem and lecture is placed on a real calendar, and the plan re-shapes itself when a day is missed."],
      ["🎯", "Three tracks, one goal", "Warm-up for speed, Main Quest for depth, Lectures for concepts, all counted towards one finish date."],
      ["🏆", "Contests that feel real", "Timed topic, weekly, monthly, blind and custom contests, with focus mode and no peeking."],
      ["🧠", "Revision that sticks", "Review rounds, Problem of the Day, key points, hints and a flashcard-style Revision Mode."],
      ["📈", "Honest progress", "Streaks with freezes, activity heatmaps, mastery levels, weak areas and 30+ achievements."],
      ["☁️", "Cloud sync that never loses data", "Works offline first, syncs in the background, settles conflicts safely and keeps the last 10 versions, so any change can be undone."],
      ["🔐", "Secure, private sign-in", "GitHub or Google sign-in with no passwords stored, alerts for new devices and blocked attempts, and one-click log out everywhere."],
      ["👀", "Open to explore", "Anyone can try it in guest mode, kept completely separate from the owner's data."],
    ];
    const stack = [
      ["Frontend", ["HTML", "CSS", "Vanilla JavaScript", "localStorage"]],
      ["Backend", ["Java 21", "Spring Boot 4", "Spring Security", "OAuth 2.0 (GitHub & Google)", "JWT", "Spring Data JPA", "Hibernate"]],
      ["Data & cloud", ["TiDB Cloud (MySQL)", "Render", "Docker", "GitHub Pages", "Resend"]],
      ["APIs & data", ["YouTube Data API", "LeetCode dataset"]],
    ];

    return `
      <section class="about-hero card">
        <div class="about-glow" aria-hidden="true"></div>
        <div class="about-photo-wrap">${this.photoHtml("about-photo")}</div>
        <div class="about-hero-text">
          <span class="eyebrow">ABOUT THIS PROJECT</span>
          <h1 class="about-title">Designed, built &amp; used by <span class="grad">${ABOUT.name}</span></h1>
          <p class="about-sub">4th year Computer Science student at Parul University, preparing for placements in December 2026.</p>
          <div class="about-chips">
            <span class="chip">🛠️ Built from scratch</span>
            <span class="chip on">☁️ Synced across devices</span>
            <span class="chip">🔥 Used every day</span>
          </div>
        </div>
      </section>

      <div class="about-grid">
        <section class="card about-story">
          <span class="eyebrow">WHY I BUILT IT</span>
          <h2 class="section-title">One place to get placement-ready</h2>
          <p>I tried learning DSA from YouTube many times, and every time I ended up restarting from zero. What was missing was never motivation. It was <b>structure</b>: a plan for the day, a way to see progress, and something that kept me honest.</p>
          <p>Paid planners gave me that structure, but they were too expensive for me as a student. So I decided to build my own, and I practise with it every day, starting from zero. A planner that knows how many hours I can study, splits my syllabus into real days, times every problem, remembers what I got wrong, and turns lectures, warm-ups and problems into progress I can actually see.</p>
          <p><b>AlgoQuest</b> is built for one goal: to walk into my placement season in December 2026 confident and ready. It is also my proof of work. A real project, built from scratch, that I use every single day.</p>
          <div class="signature">
            ${this.signatureHtml()}
            <div class="sig-meta"><b>${ABOUT.name}</b><span class="muted small">Vadodara, Gujarat</span></div>
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
            ${stack.map(([group, items]) => `
              <div class="stack-group">
                <span class="stack-label">${group}</span>
                <div class="chips">${items.map(x => `<span class="chip">${x}</span>`).join("")}</div>
              </div>`).join("")}
            <p class="muted small" style="margin:12px 0 0">Made with patience, chai and a lot of late nights. ☕</p>
          </section>
        </aside>
      </div>`;
  },
};
