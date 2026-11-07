
import { inject } from '@vercel/analytics'
import './style.css'

const app = document.querySelector<HTMLElement>('#app')

if (!app) {
  throw new Error('App element not found')
}

/* =========================================================
   MATRIX BACKGROUND
========================================================= */

const matrixCanvas = document.createElement('canvas')
matrixCanvas.id = 'matrixCanvas'
document.body.prepend(matrixCanvas)

const ctx = matrixCanvas.getContext('2d')

if (ctx) {
  const characters =
    'アァカサタナハマヤャラワガザダバパパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789'

  const fontSize = 14
  let width = window.innerWidth
  let height = window.innerHeight
  let columns = Math.floor(width / fontSize)

  let drops: number[] = Array.from(
    { length: columns },
    () => Math.random() * -100,
  )

  const resize = () => {
    width = window.innerWidth
    height = window.innerHeight

    matrixCanvas.width = width
    matrixCanvas.height = height
    matrixCanvas.style.width = `${width}px`
    matrixCanvas.style.height = `${height}px`

    columns = Math.floor(width / fontSize)

    drops = Array.from(
      { length: columns },
      () => Math.random() * -100,
    )

    ctx.clearRect(0, 0, width, height)
  }

  const draw = () => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.055)'
    ctx.fillRect(0, 0, width, height)

    ctx.font = `${fontSize}px Arial, monospace`
    ctx.textBaseline = 'top'

    for (let i = 0; i < columns; i++) {
      const character =
        characters[Math.floor(Math.random() * characters.length)]

      const x = i * fontSize
      const y = drops[i] * fontSize
      const random = Math.random()

      if (random > 0.985) {
        ctx.fillStyle = '#d7ffd7'
        ctx.shadowColor = '#00ff41'
        ctx.shadowBlur = 8
      } else if (random > 0.92) {
        ctx.fillStyle = '#39ff66'
        ctx.shadowColor = '#00ff41'
        ctx.shadowBlur = 4
      } else {
        ctx.fillStyle = '#149b35'
        ctx.shadowBlur = 0
      }

      ctx.fillText(character, x, y)
      ctx.shadowBlur = 0

      drops[i] += 0.65

      if (
        drops[i] * fontSize > height &&
        Math.random() > 0.975
      ) {
        drops[i] = Math.random() * -30
      }
    }

    requestAnimationFrame(draw)
  }

  resize()
  window.addEventListener('resize', resize)
  draw()
}

/* =========================================================
   PORTFOLIO PAGE
========================================================= */

app.innerHTML = `

<header class="site-header">

  <a href="#home" class="brand">
    <span class="brand-dot">●</span>
    <span>aria.exe</span>
  </a>

  <nav class="main-nav" aria-label="Main navigation">
    <a href="#home" class="active">home</a>
    <a href="resume.html">resume</a>
    <a href="archive.html">archive</a>
    <a href="gallery.html">gallery</a>
  </nav>

</header>

<main id="home" class="bento-grid">

  <!-- WHOAMI -->

  <section class="card whoami-card">

    <div class="card-heading">
      <span>~/whoami</span>
      <span class="tiny-status">
        <i></i>
        idle
      </span>
    </div>

    <div class="whoami-body">

      <div class="profile-area">

        <div class="profile-image">
          <img src="/aria.jpeg" alt="Arya PL" />
          <span class="image-fallback">A</span>
        </div>

        <button
          type="button"
          class="heart-trigger"
          id="heart-trigger"
          aria-label="Open a little letter"
          aria-expanded="false"
        >
          <span class="heart-symbol">♥</span>
        </button>

        <div
          class="heart-letter"
          id="heart-letter"
          aria-hidden="true"
        >

          <div class="letter-paper">
          <figure class="letter-polaroid">
          <img src="/us.jpeg" alt="A little memory" loading="lazy">
          </figure>
            <button
              type="button"
              class="letter-close"
              id="letter-close"
              aria-label="Close letter"
            >
              ×
            </button>

            <div class="letter-line"></div>

            <p class="letter-greeting">
              hey, kuttu.
            </p>

            <p>
              just wanted to leave
              a tiny piece of my heart here
              for you to find.
            </p>

            <p>keep it safe. ♡</p>

            <p>
            — aria ♡
            </p>

          </div>

        </div>

      </div>

      <div class="whoami-text">

        <p class="hello">Hi there!</p>

        <p>
          This is <strong>Arya PL</strong>.
        </p>

        <p>
          <small>
            An aspiring
            <strong>Data Analyst</strong>
            currently pursuing
            <strong>
              MSc Computer Science with Data Analytics
            </strong>.
          </small>
        </p>

        <div class="identity-row">

          <div>
            <small>pronouns</small>
            <span>she/her</span>
          </div>

          <div>
            <small>MBTI</small>
            <span>INFP-T</span>
          </div>

          <div>
            <small>zodiac</small>
            <span>Taurus</span>
          </div>

        </div>

      </div>

    </div>

  </section>

  <!-- DATA -->

  <section class="card data-card">

    <div class="card-heading">
      <span>~/data</span>
    </div>

    <div class="data-body">

      <p class="big-line">
        Turning Data
        into Stories.
      </p>

      <p class="muted">
        curious about patterns,
        insights & visualizations
      </p>

      <div class="skill-mini-row">
        <span>Python</span>
        <span>SQL</span>
        <span>Excel</span>
      </div>

    </div>

  </section>

  <!-- SPOTIFY -->

  <section class="card spotify-card">

    <div class="card-heading">

      <span>~/spotify</span>

      <a
        href="https://open.spotify.com/user/snmtm82rsdg0jo7z8nnj32623"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open Spotify profile"
      >
        ↗
      </a>

    </div>

    <div class="spotify-body">

      <p class="muted">lately listening to</p>

      <a
        class="song"
        href="https://open.spotify.com/search/Baby%20Justin%20Bieber"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="song-number">01</span>

        <span class="song-info">
          <strong>Baby</strong>
          <small>Justin Bieber</small>
        </span>

        <span>↗</span>
      </a>

      <a
        class="song"
        href="https://open.spotify.com/track/7z7kvUQGwlC6iOl7vMuAr9?si=58255d3c33bb4b5b"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="song-number">02</span>

        <span class="song-info">
          <strong>Dancing in the Flames</strong>
          <small>The Weeknd</small>
        </span>

        <span>↗</span>
      </a>

      <a
        class="song"
        href="https://open.spotify.com/search/There's%20Nothing%20Holdin'%20Me%20Back%20Shawn%20Mendes"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span class="song-number">03</span>

        <span class="song-info">
          <strong>There's Nothing Holdin' Me Back</strong>
          <small>Shawn Mendes</small>
        </span>

        <span>↗</span>
      </a>

    </div>

  </section>

  <!-- LIKES -->

  <section class="card likes-card">

    <div class="card-heading">
      <span>~/likes</span>
    </div>

    <p class="muted">
      things that keep me alive offline ✧
    </p>

    <div class="likes-list">
      <span>movies</span>
      <span>series</span>
      <span>anime</span>
      <span>gaming</span>
      <span>music</span>
      <span>cooking</span>
      <span>conspiracy theories</span>
      <span>yapping</span>
    </div>

    <a
      href="/dinorun.html"
      class="xp-game-link"
      target="_blank"
      rel="noopener noreferrer"
    >

      <div class="xp-game-top">
        <span>~/side.quest</span>
      </div>

      <div class="xp-game-content">

        <span class="xp-game-icon">🦖</span>

        <div>
          <strong>wanna play a game?</strong>
          <p>i built a little dino game. come try it!</p>
        </div>

      </div>

      <div class="xp-game-bottom">
        <span>PLAY!</span>
      </div>

    </a>

  </section>

  <!-- TOOLKIT -->

  <section class="card toolkit-card">

    <div class="card-heading">
      <span>~/toolkit</span>
    </div>

    <div class="toolkit-list">
      <span>Python</span>
      <span>R</span>
      <span>C++</span>
      <span>SQL</span>
      <span>PL/SQL</span>
      <span>Power BI</span>
      <span>Tableau</span>
      <span>Figma</span>
      <span>GitHub</span>
      <span>AI Agents</span>
    </div>

  </section>

  <!-- JOURNEY -->

  <section class="card journey-card" id="resume">

    <div class="card-heading">
      <span>~/journey</span>
    </div>

    <article class="journey-item">

      <div class="journey-top">
        <strong>MSc Computer Science (Data Analytics)</strong>
        <small>jun'26 — mar'28</small>
      </div>

      <a
        href="https://rajagiri.edu/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Rajagiri College of Social Sciences ↗
      </a>

      <p>
        specialising in data analytics,
        visualization and business intelligence.
      </p>

    </article>

    <article class="journey-item">

      <div class="journey-top">
        <strong>Process Associate</strong>
        <small>aug'25 — may'26</small>
      </div>

      <a
        href="https://india.prochant.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Prochant India ↗
      </a>

      <p>
        worked in healthcare revenue cycle
        management and accounts receivable.
      </p>

    </article>

    <article class="journey-item">

      <div class="journey-top">
        <strong>Bachelor of Computer Applications</strong>
        <small>jun'22 — mar'25</small>
      </div>

      <a
        href="https://cnc.ac.in/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Christ Nagar College ↗
      </a>

      <p>
        foundation in programming, databases,
        software development and computer science.
      </p>

    </article>

  </section>

  <!-- PROJECTS -->

  <section class="card projects-card">

    <div class="card-heading">

      <span>~/projects</span>

      <a
        href="https://github.com/arya-prasanth"
        target="_blank"
        rel="noopener noreferrer"
      >
        all projects →
      </a>

    </div>

    <a
      class="project-row"
      href="https://github.com/arya-prasanth"
      target="_blank"
      rel="noopener noreferrer"
    >

      <span>
        <strong>TravelMate AI</strong>
        <small>AI travel assistant</small>
      </span>

      <span>↗</span>

    </a>

    <a
      class="project-row"
      href="https://github.com/arya-prasanth"
      target="_blank"
      rel="noopener noreferrer"
    >

      <span>
        <strong>UniCredit</strong>
        <small>banking web application</small>
      </span>

      <span>↗</span>

    </a>

  </section>

  <!-- SUBSTACK -->

  <section class="card posts-card" id="archive">

    <div class="card-heading">

      <span>~/words.that.stayed</span>

      <a
        href="https://substack.com/@aryaahhh"
        target="_blank"
        rel="noopener noreferrer"
      >
        ↗
      </a>

    </div>

    <a
      href="https://substack.com/home/post/p-206972357"
      class="post-row"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>01</span>
      <strong>› if a birds falls in love with a fish, where will they live?</strong>
      <span class="post-arrow">↗</span>
    </a>

    <a
      href="https://substack.com/home/post/p-166808166"
      class="post-row"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>02</span>
      <strong>› the poetry and science behind neuroplasticity</strong>
      <span class="post-arrow">↗</span>
    </a>

    <a
      href="https://substack.com/home/post/p-221192148"
      class="post-row"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>03</span>
      <strong>› nobody will ever fully understand you. that’s the best news you’ll read this year.</strong>
      <span class="post-arrow">↗</span>
    </a>

  </section>

  <!-- CERTIFICATIONS -->

  <section class="card certifications-card">

    <div class="card-heading">
      <span>~/certifications</span>
    </div>

    <div class="cert-list">
      <span>Data Analytics</span>
      <span>Machine Learning</span>
      <span>IoT Application Development</span>
      <span>UI / UX Design</span>
    </div>

  </section>

  <!-- GITHUB ACTIVITY -->

  <section class="card github-card">

    <div class="card-heading">

      <span>~/github.activity</span>

      <a
        href="https://github.com/arya-prasanth"
        target="_blank"
        rel="noopener noreferrer"
      >
        ↗
      </a>

    </div>

    <div class="github-status-row">
      <span class="live">●</span>
      <span id="github-status">connecting to GitHub …</span>
    </div>

    <p id="github-summary" class="muted">
      loading latest public activity …
    </p>

    <div id="github-activity-list"></div>

  </section>

  <!-- VISITORS -->

  <section class="card visitors-card">

    <div class="card-heading">
      <span>~/visitors</span>
      <span class="live">● live</span>
    </div>

    <div class="visitor-number">
      <span id="visitor-count">—</span>
      <small>page views</small>
    </div>

    <div class="visitor-map">
      <div class="map-grid"></div>
      <span class="map-label">VERCEL ANALYTICS</span>
    </div>

    <small class="visitor-info" id="visitor-info">
      🌏︎ · loading page views …
    </small>

  </section>

</main>
`

/* =========================================================
   FIND ME ELSEWHERE
========================================================= */

const socialCard = document.createElement('section')

socialCard.className = 'social-card'
socialCard.id = 'gallery'

socialCard.innerHTML = `

  <div class="card-heading">
    <span>//find me elsewhere</span>
  </div>

  <div class="social-content">

    <p class="social-text">
      always open to interesting conversations, collaborations & random internet rabbit holes :)
    </p>

    <div class="social-links">

      <a
        href="https://github.com/arya-prasanth"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        title="GitHub"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.16c-3.2.7-3.88-1.54-3.88-1.54-.53-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.67 1.24 3.32.95.1-.74.4-1.24.73-1.52-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.45.11-3.03 0 0 .96-.31 3.15 1.17a10.9 10.9 0 0 1 5.74 0c2.19-1.48 3.15-1.17 3.15-1.17.62 1.58.23 2.74.11 3.03.73.8 1.18 1.82 1.18 3.07 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.04.78 2.1v3.11c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"/>
        </svg>
      </a>

      <a
        href="https://www.linkedin.com/in/arya-pl/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        title="LinkedIn"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.32 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14ZM3.54 20.45H7.1V9H3.54v11.45Z"/>
        </svg>
      </a>

      <a
        href="https://open.spotify.com/user/snmtm82rsdg0jo7z8nnj32623"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Spotify"
        title="Spotify"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 1.5A10.5 10.5 0 1 0 12 22.5 10.5 10.5 0 0 0 12 1.5Zm4.81 15.16a.66.66 0 0 1-.91.22c-2.5-1.53-5.65-1.87-9.36-1.02a.66.66 0 1 1-.3-1.29c4.06-.93 7.54-.54 10.35 1.18.31.19.41.6.22.91Zm1.3-2.9a.82.82 0 0 1-1.13.27c-2.86-1.76-7.22-2.27-10.61-1.24a.82.82 0 1 1-.48-1.57c3.87-1.17 8.69-.6 11.95 1.4.39.24.51.74.27 1.14Zm.11-3.03C14.79 8.67 9.12 8.5 5.78 9.51a.98.98 0 1 1-.57-1.87c3.84-1.17 10.24-.94 14.06 1.33a.98.98 0 0 1-1.05 1.66Z"/>
        </svg>
      </a>

      <a
        href="https://boxd.it/iuv0p"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Letterboxd"
        title="Letterboxd"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" class="social-logo letterboxd-logo">
          <circle cx="7" cy="12" r="5.25"/>
          <circle cx="12" cy="12" r="5.25"/>
          <circle cx="17" cy="12" r="5.25"/>
        </svg>
      </a>

      <a
        href="https://www.instagram.com/a_ry.x/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram"
        title="Instagram"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"/>
        </svg>
      </a>

      <a
        href="mailto:aryaprasanth.official@gmail.com"
        aria-label="Email"
        title="Email"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M2 5.5A2.5 2.5 0 0 1 4.5 3h15A2.5 2.5 0 0 1 22 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-15A2.5 2.5 0 0 1 2 18.5v-13Zm2.5-.5a.5.5 0 0 0-.31.89l7.49 5.82a.5.5 0 0 0 .64 0l7.49-5.82A.5.5 0 0 0 19.5 5h-15ZM20 7.02l-6.46 5.02a2.5 2.5 0 0 1-3.08 0L4 7.02v11.48c0 .28.22.5.5.5h15a.5.5 0 0 0 .5-.5V7.02Z"/>
        </svg>
      </a>

    </div>

  </div>
`

document.body.appendChild(socialCard)

/* =========================================================
   FOOTER
========================================================= */

const footer = document.createElement('footer')

footer.innerHTML = `

  <span>
    ● connected ·
    <span id="india-time">--:--:--</span>
  </span>

  <span>
    built ·
    <span id="built-date"></span>
  </span>

`

document.body.appendChild(footer)

/* =========================================================
   INDIA TIME
========================================================= */

const indiaTime = document.querySelector<HTMLElement>('#india-time')

const updateTime = () => {
  if (!indiaTime) return

  const time = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date())

  indiaTime.textContent = `IST ${time}`
}

updateTime()
window.setInterval(updateTime, 1000)

/* =========================================================
   BUILT DATE
========================================================= */

const builtDate = document.querySelector<HTMLElement>('#built-date')

if (builtDate) {
  builtDate.textContent = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date())
}

/* =========================================================
   HEART / SECRET LETTER
========================================================= */

const heartTrigger =
  document.querySelector<HTMLButtonElement>('#heart-trigger')

const heartLetter =
  document.querySelector<HTMLElement>('#heart-letter')

const letterClose =
  document.querySelector<HTMLButtonElement>('#letter-close')

const openLetter = () => {
  heartTrigger?.setAttribute('aria-expanded', 'true')
  heartLetter?.setAttribute('aria-hidden', 'false')
  heartLetter?.classList.add('open')
  document.body.classList.add('letter-open')
}

const closeLetter = () => {
  heartTrigger?.setAttribute('aria-expanded', 'false')
  heartLetter?.setAttribute('aria-hidden', 'true')
  heartLetter?.classList.remove('open')
  document.body.classList.remove('letter-open')
}

heartTrigger?.addEventListener('click', openLetter)
letterClose?.addEventListener('click', closeLetter)

heartLetter?.addEventListener('click', event => {
  if (event.target === heartLetter) {
    closeLetter()
  }
})

document.addEventListener('keydown', event => {
  if (
    event.key === 'Escape' &&
    heartLetter?.classList.contains('open')
  ) {
    closeLetter()
  }
})

/* =========================================================
   GITHUB ACTIVITY — LATEST 3 ONLY
========================================================= */

interface GitHubEvent {
  id: string
  type: string
  created_at: string
  repo: {
    name: string
  }
  payload: {
    size?: number
    ref_type?: string
    action?: string
    commits?: Array<{
      message?: string
    }>
    pull_request?: {
      title?: string
    }
    issue?: {
      title?: string
    }
    release?: {
      name?: string
      tag_name?: string
    }
  }
}

const GITHUB_USERNAME = 'arya-prasanth'
const GITHUB_ACTIVITY_LIMIT = 3

const githubStatus =
  document.querySelector<HTMLElement>('#github-status')

const githubSummary =
  document.querySelector<HTMLElement>('#github-summary')

const githubList =
  document.querySelector<HTMLElement>('#github-activity-list')

let githubEvents: GitHubEvent[] = []

function githubTime(date: string): string {
  const timestamp = new Date(date).getTime()

  if (Number.isNaN(timestamp)) {
    return 'recently'
  }

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp) / 1000),
  )

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
  })
}

function githubEventText(event: GitHubEvent): string {
  const repo = event.repo.name.split('/').pop() || event.repo.name

  switch (event.type) {
    case 'PushEvent': {
      const count = event.payload.size || 1
      const commit = event.payload.commits?.[0]?.message

      return `pushed ${count} commit${count > 1 ? 's' : ''} to ${repo}${commit ? ` · ${commit}` : ''}`
    }

    case 'CreateEvent':
      return `created ${event.payload.ref_type || 'something'} in ${repo}`

    case 'DeleteEvent':
      return `deleted ${event.payload.ref_type || 'something'} in ${repo}`

    case 'PullRequestEvent':
      return `${event.payload.action || 'updated'} a pull request in ${repo}`

    case 'IssuesEvent':
      return `${event.payload.action || 'updated'} an issue in ${repo}`

    case 'WatchEvent':
      return `starred ${repo}`

    case 'ForkEvent':
      return `forked ${repo}`

    case 'ReleaseEvent':
      return `published a release in ${repo}`

    case 'IssueCommentEvent':
      return `commented on an issue in ${repo}`

    default:
      return `activity in ${repo}`
  }
}

/* RENDER ONLY THE LATEST THREE */

function renderGithubActivity(): void {
  if (!githubList) return

  githubList.replaceChildren()

  const displayed = githubEvents.slice(0, GITHUB_ACTIVITY_LIMIT)

  displayed.forEach(event => {
    const row = document.createElement('div')
    row.className = 'github-activity-item'

    const dot = document.createElement('span')
    dot.className = 'github-activity-dot'
    dot.textContent = '●'

    const content = document.createElement('div')
    content.className = 'github-activity-content'

    const description = document.createElement('p')
    description.textContent = githubEventText(event)

    const meta = document.createElement('span')
    meta.className = 'github-activity-meta'
    meta.textContent = githubTime(event.created_at)

    const link = document.createElement('a')
    link.href = `https://github.com/${event.repo.name}`
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.textContent = event.repo.name

    content.append(description, link, meta)
    row.append(dot, content)

    githubList.appendChild(row)
  })
}

/* FETCH GITHUB ACTIVITY */

async function fetchGithubActivity(): Promise<void> {
  if (githubStatus) {
    githubStatus.textContent = 'fetching activity …'
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
        },
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`)
    }

    const data: GitHubEvent[] = await response.json()

    githubEvents = data.sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime(),
    )

    if (githubStatus) {
      githubStatus.textContent = 'connection established ✓'
    }

    if (githubSummary) {
      const count = Math.min(
        githubEvents.length,
        GITHUB_ACTIVITY_LIMIT,
      )

      githubSummary.textContent =
        `${count} latest public activities · @${GITHUB_USERNAME}`
    }

    if (githubEvents.length === 0 && githubList) {
      githubList.textContent = 'No recent public activity found.'
    }

    renderGithubActivity()
  } catch (error) {
    console.error('GitHub activity error:', error)

    if (githubStatus) {
      githubStatus.textContent = 'connection failed ✕'
    }

    if (githubSummary) {
      githubSummary.textContent =
        'Unable to fetch GitHub activity. Try again later.'
    }

    if (githubList) {
      githubList.textContent = ''
    }
  }
}

fetchGithubActivity()

window.setInterval(fetchGithubActivity, 5 * 60 * 1000)

/* =========================================================
   VISITORS — REAL VERCEL PAGE VIEWS
========================================================= */

const visitorCount =
  document.querySelector<HTMLElement>('#visitor-count')

const visitorInfo =
  document.querySelector<HTMLElement>('#visitor-info')

async function fetchVisitorCount(): Promise<void> {
  if (!visitorCount) return

  try {
    visitorCount.textContent = '...'

    const response = await fetch('/api/visitors', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Visitors API error: ${response.status}`)
    }

    const result: { pageViews?: number } = await response.json()

    if (
      typeof result.pageViews !== 'number' ||
      !Number.isFinite(result.pageViews)
    ) {
      throw new Error('Invalid page views response')
    }

    visitorCount.textContent =
      result.pageViews.toLocaleString('en-IN')

    if (visitorInfo) {
      visitorInfo.textContent = '🌏︎ · total production page views'
    }
  } catch (error) {
    console.error('Visitor analytics error:', error)

    visitorCount.textContent = '—'

    if (visitorInfo) {
      visitorInfo.textContent = ' 🌏︎ · analytics enabled'
    }
  }
}

fetchVisitorCount()

window.setInterval(fetchVisitorCount, 5 * 60 * 1000)

/* =========================================================
   BUY ME A COFFEE
========================================================= */

const coffeeCard = document.createElement('section')

coffeeCard.className = 'coffee-card'

coffeeCard.innerHTML = `
  <div class="card-heading">
    <span>~/support</span>
  </div>

  <div class="coffee-heading">
    <span class="coffee-eyebrow">
      a little support goes a long way
    </span>

    <h1>buy me a coffee ☕︎</h1>
  </div>

  <a
    href="https://buymeacoffee.com/a.ryaahhh"
    class="coffee-content"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Buy me a coffee"
  >
    <span class="coffee-icon">♥</span>

    <span class="coffee-text">
      <span>support my work and late night builds</span>
    </span>

    <span class="coffee-arrow">↗</span>
  </a>
`

const bentoGrid =
  document.querySelector<HTMLElement>('.bento-grid')

if (bentoGrid) {
  bentoGrid.appendChild(coffeeCard)
}

/* =========================================================
   SMOOTH NAVIGATION
========================================================= */

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const targetId = link.getAttribute('href')

    if (!targetId || targetId === '#') {
      return
    }

    const target = document.querySelector(targetId)

    if (!target) return

    event.preventDefault()

    target.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })

    if (link.closest('.main-nav')) {
      document.querySelectorAll('.main-nav a').forEach(nav => {
        nav.classList.remove('active')
      })

      link.classList.add('active')
    }
  })
})

/* =========================================================
   VERCEL WEB ANALYTICS
========================================================= */

inject()
