<div align="center">

<img src="docs/banner.png" alt="AlgoQuest: Grind · Track · Crack" width="100%">

<br>

**A full-stack, offline-first DSA planner that turns lectures, warm-ups and problems into a day-by-day plan,<br>syncs across devices, and keeps me honest until placement day.**

<br>

[![Live Demo](https://img.shields.io/badge/Live_Demo-Open_AlgoQuest-2ee6a6?style=for-the-badge&logo=githubpages&logoColor=white)](https://ajitabhjha13.github.io/algoquest/)
&nbsp;
[![API Status](https://img.shields.io/website?url=https%3A%2F%2Falgoquest-api-45ay.onrender.com%2Factuator%2Fhealth&style=for-the-badge&label=API&up_message=online&down_message=sleeping&logo=render&logoColor=white)](https://algoquest-api-45ay.onrender.com/api/hello)
&nbsp;
[![Deploy](https://img.shields.io/github/actions/workflow/status/Ajitabhjha13/algoquest/pages.yml?style=for-the-badge&label=Pages&logo=githubactions&logoColor=white)](https://github.com/Ajitabhjha13/algoquest/actions)

<br>

![JavaScript](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_4-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat-square&logo=springsecurity&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![TiDB](https://img.shields.io/badge/TiDB_Cloud_(MySQL)-DC150B?style=flat-square&logo=tidb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Render](https://img.shields.io/badge/Render-000000?style=flat-square&logo=render&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)

<br>

<img src="docs/screenshots/dashboard.png" alt="AlgoQuest dashboard" width="100%">

<sub>Screenshots use demo data.</sub>

</div>

<br>

## 📑 Contents

[Why I built it](#-why-i-built-it) · [Highlights](#-highlights) · [Screenshots](#-screenshots) · [Architecture](#%EF%B8%8F-architecture) · [Sign-in flow](#-sign-in-flow) · [Sync engine](#-sync-engine) · [Scheduler](#%EF%B8%8F-how-the-scheduler-works) · [Security](#-security) · [Tech stack](#%EF%B8%8F-tech-stack) · [Project structure](#-project-structure) · [Run locally](#-run-it-locally) · [Deployment](#-deployment)

---

## 💡 Why I built it

I tried learning DSA from YouTube many times, and every time I ended up restarting from zero. What was missing was never motivation. It was **structure**: a plan for the day, a way to see progress, and something that kept me honest.

Paid planners gave me that structure, but they were too expensive for me as a student. So I built my own, from scratch. AlgoQuest knows how many hours I can study, splits my syllabus into real days, times every problem, remembers what I got wrong, and shows me exactly how close I am to being placement-ready. Then I gave it a Spring Boot backend so my progress follows me from laptop to phone.

**I use it every day.**

---

## ✨ Highlights

<table>
<tr>
<td width="50%" valign="top">

### 🧭 A plan that knows your hours
A **greedy scheduler** places every warm-up, problem and lecture on a real calendar based on your hours per weekday. Miss a day and the plan re-shapes itself. After 15 timed problems it learns your speed and adjusts the whole plan.

</td>
<td width="50%" valign="top">

### 🎯 Three tracks, one goal
⚡ **Warm-up**: 322 coding-round questions in shuffled rounds<br>
🚩 **Main Quest**: 329 core problems (Striver A2Z + Love Babbar + roadmap, de-duplicated)<br>
🎬 **Lectures**: a YouTube playlist split into weekly sprints

</td>
</tr>
<tr>
<td valign="top">

### ☁️ Offline-first cloud sync
Works without internet, syncs in the background, **never loses data**: optimistic locking, conflict popup, safety copies and the last 10 versions with one-click restore (and undo).

</td>
<td valign="top">

### 🔐 Secure, private sign-in
GitHub or Google OAuth 2.0, **no passwords stored**, owner-only allowlist, sliding JWT sessions, new-device and blocked-attempt email alerts, and *log out everywhere*.

</td>
</tr>
<tr>
<td valign="top">

### 🏆 Contests that feel real
Topic, weekly, monthly, speed and grand contests plus a custom designer. **Focus mode**, no peeking, **blind mode**, and a confidence meter with history.

</td>
<td valign="top">

### 📈 Honest progress
KPI sparklines, progress rings, streaks with a weekly ❄️ freeze, heatmaps, topic mastery, weak-area detection and **35 achievements** in a trophy cabinet.

</td>
</tr>
<tr>
<td valign="top">

### 🧠 A question panel for every problem
166 full LeetCode statements, your own hidden solution, step-by-step hints, key points, notes, a timer and one-click review marking.

</td>
<td valign="top">

### 👀 Open to explore
Anyone can try it in **guest mode**, a separate sandbox that never touches the owner's data and never leaves the visitor's browser.

</td>
</tr>
</table>

---

## 📸 Screenshots

<table>
<tr>
<td width="50%"><b>Sign in</b><br><img src="docs/screenshots/login.png" alt="Login screen"></td>
<td width="50%"><b>Light mode</b><br><img src="docs/screenshots/dashboard-light.png" alt="Dashboard in light mode"></td>
</tr>
<tr>
<td><b>Main Quest</b><br><img src="docs/screenshots/main-quest.png" alt="Main Quest"></td>
<td><b>Question panel</b><br><img src="docs/screenshots/question-panel.png" alt="Question panel"></td>
</tr>
<tr>
<td><b>Lectures in sprints</b><br><img src="docs/screenshots/lectures.png" alt="Lectures"></td>
<td><b>Warm-up rounds</b><br><img src="docs/screenshots/warm-up.png" alt="Warm-up"></td>
</tr>
<tr>
<td><b>Contests</b><br><img src="docs/screenshots/contests.png" alt="Contests"></td>
<td><b>Problems library</b><br><img src="docs/screenshots/problems.png" alt="Problems"></td>
</tr>
<tr>
<td><b>Account, sync &amp; login history</b><br><img src="docs/screenshots/settings-sync.png" alt="Account and sync settings"></td>
<td><b>Conflict-safe sync</b><br><img src="docs/screenshots/conflict.png" alt="Sync conflict popup"></td>
</tr>
<tr>
<td><b>Profile</b><br><img src="docs/screenshots/profile.png" alt="Profile"></td>
<td><b>About</b><br><img src="docs/screenshots/about.png" alt="About page"></td>
</tr>
</table>

<p align="center"><b>📱 On the phone</b><br><img src="docs/screenshots/mobile.png" alt="Mobile views" width="100%"></p>

---

## 🏗️ Architecture

```mermaid
flowchart TB
    U(["👤 Browser<br/>laptop / phone"])

    subgraph GH["GitHub"]
        direction TB
        REPO["algoquest monorepo<br/>frontend/ · backend/"]
        ACT["GitHub Actions<br/>pages.yml"]
        PAGES["GitHub Pages<br/>static website"]
        REPO -- "push to frontend/" --> ACT --> PAGES
    end

    subgraph RD["Render · Singapore"]
        API["Spring Boot 4 API<br/>Docker · Java 21"]
    end

    subgraph EXT["External services"]
        direction TB
        DB[("TiDB Cloud<br/>MySQL · Singapore")]
        OAUTH["GitHub / Google<br/>OAuth 2.0"]
        MAIL["Resend<br/>alert emails"]
        YT["YouTube Data API"]
        CRON["cron-job.org<br/>keep-alive"]
    end

    U -- "HTML · CSS · JS" --> PAGES
    U -- "REST + JWT (CORS)" --> API
    U -. "playlist import" .-> YT
    REPO -- "push to backend/" --> API
    API -- "JPA · TLS" --> DB
    API -- "sign-in" --> OAUTH
    API -- "HTTPS API" --> MAIL
    CRON -. "/actuator/health" .-> API
```

| Part | Where it runs | Notes |
|---|---|---|
| **Frontend** | GitHub Pages (auto-deployed by GitHub Actions) | Vanilla JS single-page app, hash router, offline-first in `localStorage` |
| **Backend** | Render free tier, Singapore (Docker) | Stateless JWT REST API + session-based OAuth login chain |
| **Database** | TiDB Cloud Starter, Singapore | MySQL-compatible, serverless, auto-wakes, free |
| **Keep-alive** | cron-job.org | Pings `/actuator/health` every 10 min, 9 AM to 2 AM IST |

> The whole stack costs **₹0** a month.

---

## 🔑 Sign-in flow

```mermaid
sequenceDiagram
    autonumber
    actor U as Owner
    participant W as Website (GitHub Pages)
    participant A as API (Spring Boot)
    participant P as GitHub / Google
    participant D as TiDB

    U->>W: Continue with GitHub
    W->>A: /oauth2/authorization/github
    A->>P: Redirect to consent screen
    U->>P: Authorize AlgoQuest
    P->>A: Callback with code
    A->>P: Exchange code → profile
    A->>A: Owner allowlist check
    A->>D: Link account + log sign-in (IP, device)
    A-->>U: 📧 Alert email if it's a new device
    A->>W: Redirect back with a signed JWT
    W->>W: Save token, clean URL instantly
    W->>A: GET /api/me (Bearer JWT)
    A-->>W: Profile + session end date
    Note over W,A: Token auto-renews while in use,<br/>hard limit of 60 days, "log out everywhere" revokes all
```

A visitor who is not on the allowlist is sent back to the login screen with a friendly *"This is a private planner"* message, the attempt is logged, and the owner gets an email.

---

## 🔄 Sync engine

Every save is local first. The sync engine (`frontend/js/sync.js`) wraps `Store.save()` and pushes changes to the cloud a few seconds later.

```mermaid
flowchart TD
    S["Store.save()"] --> C{"Data really<br/>changed?"}
    C -- no --> X(["nothing to do"])
    C -- yes --> D["mark dirty<br/>debounce 5 s · max 30 s"]
    D --> M["GET /api/sync/meta"]
    M --> R{"Cloud revision<br/>vs mine"}
    R -- same --> P["PUT /api/sync<br/>baseRevision = mine"]
    P --> OK(["✅ Synced · new revision"])
    P -- "409 someone saved first" --> R
    R -- "cloud ahead, nothing local" --> L["Pull cloud copy"] --> OK
    R -- "cloud ahead + local changes" --> Q{"Same data?"}
    Q -- yes --> A["Adopt revision"] --> OK
    Q -- no --> POP["⚖️ Conflict popup<br/>Keep this device / Use cloud"]
    POP --> OK
    M -- "offline · 5xx · 429" --> B["Retry 10 s → 30 s → 1 m → 5 m"] --> M
```

- **Optimistic locking**: every save carries `baseRevision`; the database only accepts it if nobody saved in between (`UPDATE ... WHERE revision = ?`).
- **No data loss**: before anything is overwritten, the losing side is kept (a local safety copy or a cloud version). The last 10 versions can be restored, and a restore is itself undoable.
- **Multi-tab safe**, idempotent saves, retry with backoff, and a status that is always visible: sidebar on laptop, a coloured dot on phone.

---

## ⚙️ How the scheduler works

The heart of AlgoQuest is a **greedy day-filling scheduler** (`frontend/js/scheduler.js`):

1. Every pending item gets a time estimate: problems by topic and difficulty, lectures by `video length ÷ playback speed × study multiplier`, warm-ups at 5 minutes each.
2. Starting from today, each day's capacity is `hours for that weekday × 60` minutes.
3. Warm-ups are placed first. The remaining time is split between lectures and Main Quest using a configurable share, and each track is filled **in order** until its budget runs out.
4. When one track finishes, its time goes to the other. When everything is placed, the last day is the projected finish date.

Because the plan is always rebuilt from **today**, a missed day needs no special handling. Today's list is locked once generated, so ticking a task never reshuffles the day.

Other algorithms inside: **Fisher–Yates shuffle** with balanced buckets for warm-up rounds, **weighted random selection** for contest questions, a **median-ratio speed factor** to calibrate estimates, a **token bucket** rate limiter on the API, and **Catmull–Rom curves** for hand-drawn SVG charts.

---

## 🛡️ Security

| Layer | What it does |
|---|---|
| **OAuth 2.0 only** | No passwords are ever stored. GitHub and Google accounts both map to one owner. |
| **Allowlist** | Only the owner's GitHub login and email can sign in. |
| **JWT (HS256)** | Stateless API, 7-day token that renews while in use, 60-day absolute limit, token version for *log out everywhere*. |
| **Two security chains** | `/api/**` is stateless (no session cookie). Only the OAuth handshake uses a short session. |
| **CORS** | Only the website's origins can call the API. |
| **Rate limiting** | Token bucket per IP: 10/min on login, 60/min on the API. Real client IP read from Cloudflare headers, so spoofed `X-Forwarded-For` can't bypass it. |
| **Alerts** | Email on a new device and on blocked sign-in attempts, with a spam guard. |
| **Secrets** | Never in Git: local `secrets.properties` (git-ignored) and Render environment variables in production. |

---

## 🛠️ Tech stack

| Layer | Choice | Why |
|---|---|---|
| UI | HTML, CSS (design tokens, dark / light / system), Vanilla JavaScript | No framework, so every line is mine to explain |
| Routing | Hash-based single-page app | Works on any static host |
| Charts | Hand-written SVG | No chart library needed |
| Backend | Java 21, Spring Boot 4, Spring Security, OAuth2 Client, Resource Server (JWT), Spring Data JPA, Hibernate 7 | Industry-standard, strongly typed |
| Database | TiDB Cloud Starter (MySQL-compatible) | Free, serverless, never needs a manual "power on" |
| Email | Resend HTTPS API | Render's free tier blocks SMTP ports |
| DevOps | Docker (multi-stage), Render, GitHub Actions, GitHub Pages, cron-job.org | Free, automatic deploys on every push |
| Data | Striver A2Z, Love Babbar 450, LeetCode dataset, YouTube Data API v3 | Real content, de-duplicated |

---

## 📁 Project structure

```
algoquest/
├── frontend/                    # Website (GitHub Pages)
│   ├── index.html               # App shell: sidebar + main area
│   ├── privacy.html             # Privacy policy
│   ├── css/
│   │   ├── style.css            # Design tokens, themes, components
│   │   └── cloud.css            # Login, account, sync, popups
│   ├── data/                    # 522 problems · 322 warm-ups · 166 statements
│   └── js/
│       ├── store.js             # State + localStorage (owner / guest)
│       ├── api.js · auth.js     # REST client, sign-in, auto-renew
│       ├── sync.js              # Offline-first sync engine
│       ├── scheduler.js         # Greedy day-by-day planner
│       ├── tracker.js           # Done / timer / streaks / daily log
│       ├── contest.js · insights.js · analytics.js
│       ├── ui.js · modal.js     # Tooltips, popovers, popups
│       └── pages/               # One file per page
├── backend/                     # Spring Boot API (Render) · see backend/README.md
│   ├── Dockerfile
│   └── src/main/java/com/ajitabh/algoquest/
│       ├── config/              # Typed app properties
│       ├── controller/          # Me, Sync, LoginHistory, Hello
│       ├── model/ · repository/ # JPA entities and repositories
│       ├── security/            # Security chains, JWT, OAuth, CORS, rate limit
│       └── service/             # Sync, audit, alerts, owner account
├── docs/                        # README images
└── .github/workflows/pages.yml  # Deploys frontend/ to GitHub Pages
```

---

## 🚀 Run it locally

**Frontend**

```bash
git clone https://github.com/Ajitabhjha13/algoquest.git
cd algoquest
```
Open the folder in VS Code, start **Live Server**, and visit `http://localhost:5500/frontend/`. The site works on its own in guest mode.

**Backend** (needs Java 21+ and a MySQL-compatible database)

```bash
cd backend
cp secrets.properties.example secrets.properties   # fill in DB, OAuth, JWT and Resend values
./mvnw spring-boot:run                               # Windows: .\mvnw.cmd spring-boot:run
```
The API starts on `http://localhost:8080`. See [`backend/README.md`](backend/README.md) for every endpoint and setting.

**Lectures:** create a free YouTube Data API v3 key, restrict it to your site's address, and paste it on the Lectures page. It is stored only in your browser.

---

## ☁️ Deployment

| What | How |
|---|---|
| Website | Every push that touches `frontend/` runs `.github/workflows/pages.yml`, which publishes the folder to GitHub Pages. |
| API | Render builds `backend/Dockerfile` (Maven build stage → slim Java 21 runtime) on every push that touches `backend/`. Health check: `/actuator/health`. |
| Secrets | Render environment variables. A separate production OAuth app and JWT secret keep local and live environments apart. |
| Uptime | Render's free tier sleeps after 15 idle minutes. A cron job keeps it awake during my study hours, and the offline-first website keeps working while it wakes up. |

---

## 🗺️ Roadmap

- [x] Planner, scheduler and three tracks
- [x] Contests, analytics and achievements
- [x] UI makeover with light mode and mobile layout
- [x] Spring Boot backend with GitHub / Google sign-in
- [x] Offline-first sync across laptop and phone, with versions and conflict handling
- [x] Monorepo with CI/CD (GitHub Actions + Render)
- [ ] Unit tests for the sync service and rate limiter
- [ ] Installable app (PWA)
- [ ] Spaced repetition for revision

---

<div align="center">

### 👤 Author

**Ajitabh Kumar Jha**<br>
4th year CSE · Parul University · Vadodara, Gujarat

[![GitHub](https://img.shields.io/badge/GitHub-Ajitabhjha13-181717?style=flat-square&logo=github)](https://github.com/Ajitabhjha13)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ajitabh_Kumar_Jha-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/ajitabh-kumar-jha-476546283)
[![LeetCode](https://img.shields.io/badge/LeetCode-ajitabhjha13-FFA116?style=flat-square&logo=leetcode&logoColor=black)](https://leetcode.com/u/ajitabhjha13/)
[![Portfolio](https://img.shields.io/badge/Portfolio-Visit-2ee6a6?style=flat-square&logo=vercel&logoColor=white)](https://ajitabh-portfolio.vercel.app/)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/signature-white.png">
  <img src="frontend/assets/signature.png" alt="Signature of Ajitabh Kumar Jha" width="260">
</picture>

*Designed, built and used by me. Made with patience, chai and a lot of late nights.* ☕

</div>
