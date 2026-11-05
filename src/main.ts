import './style.css'

const app = document.querySelector('#app')

if (!app) {
  throw new Error('App element not found')
}

/* =========================================================
   MATRIX BACKGROUND
   Classic Matrix-style falling Katakana
========================================================= */

const matrixCanvas = document.createElement('canvas')

matrixCanvas.id = 'matrixCanvas'

document.body.prepend(matrixCanvas)

const ctx = matrixCanvas.getContext('2d')

if (ctx) {

  // Characters similar to the classic Matrix effect
  const characters =
    'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズヅブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン0123456789'

  const fontSize = 14

  let width = window.innerWidth
  let height = window.innerHeight

  let columns =
    Math.floor(width / fontSize)

  // Every column has its own falling position
  let drops: number[] =
    Array.from(
      { length: columns },
      () => Math.random() * -100,
    )


  /* =======================================================
     RESIZE
  ======================================================= */

  const resize = () => {

    width = window.innerWidth
    height = window.innerHeight

    matrixCanvas.width = width
    matrixCanvas.height = height

    matrixCanvas.style.width =
      `${width}px`

    matrixCanvas.style.height =
      `${height}px`

    columns =
      Math.floor(width / fontSize)

    drops =
      Array.from(
        { length: columns },
        () => Math.random() * -100,
      )

    // Clear canvas after resizing
    ctx.clearRect(
      0,
      0,
      width,
      height,
    )
  }


  /* =======================================================
     DRAW MATRIX
  ======================================================= */

  const draw = () => {

    /*
     * Black transparent layer.
     *
     * This is what creates the fading trail.
     */
    ctx.fillStyle =
      'rgba(0, 0, 0, 0.055)'

    ctx.fillRect(
      0,
      0,
      width,
      height,
    )


    /*
     * Matrix font
     */
    ctx.font =
      `${fontSize}px Arial, monospace`

    ctx.textBaseline =
      'top'


    /*
     * Draw every column
     */
    for (
      let i = 0;
      i < columns;
      i++
    ) {

      /*
       * Pick a random Matrix character
       */
      const text =
        characters[
          Math.floor(
            Math.random() *
            characters.length,
          )
        ]


      /*
       * X position of column
       */
      const x =
        i * fontSize


      /*
       * Y position of character
       */
      const y =
        drops[i] * fontSize


      /*
       * Most characters are dark green.
       */
      const random =
        Math.random()


      if (random > 0.985) {

        /*
         * Bright leading character
         */
        ctx.fillStyle =
          '#d7ffd7'

        ctx.shadowColor =
          '#00ff41'

        ctx.shadowBlur = 8

      } else if (random > 0.92) {

        /*
         * Medium green
         */
        ctx.fillStyle =
          '#39ff66'

        ctx.shadowColor =
          '#00ff41'

        ctx.shadowBlur = 4

      } else {

        /*
         * Normal Matrix green
         */
        ctx.fillStyle =
          '#149b35'

        ctx.shadowBlur = 0
      }


      /*
       * Draw character
       */
      ctx.fillText(
        text,
        x,
        y,
      )


      /*
       * Reset glow
       */
      ctx.shadowBlur = 0


      /*
       * Falling speed
       */
      drops[i] += 0.65


      /*
       * When a stream reaches the bottom,
       * randomly restart it from above.
       */
      if (
        drops[i] * fontSize > height &&
        Math.random() > 0.975
      ) {

        drops[i] =
          Math.random() * -30

      }

    }


    requestAnimationFrame(draw)

  }


  /* =======================================================
     START
  ======================================================= */

  resize()

  window.addEventListener(
    'resize',
    resize,
  )

  draw()

}

/* =========================================================
   PAGE
========================================================= */

app.innerHTML = `

<header class="site-header">

  <a href="#home" class="brand">
    <span class="brand-dot">●</span>
    <span>aria.in</span>
  </a>

  <nav class="main-nav" aria-label="Main navigation">

    <a href="#home" class="active">
      home
    </a>

    <a href="#resume">
      resume
    </a>

    <a href="#blog">
      blog
    </a>

    <a href="#gallery">
      gallery
    </a>

  </nav>

</header>


<main id="home" class="bento-grid">


  <!-- =====================================================
       WHOAMI
  ====================================================== -->

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

          <img
            src="/aria.jpeg"
            alt="Arya PL"
          />

          <span class="image-fallback">
            A
          </span>

        </div>


        <!-- =================================================
             LITTLE HEART
        ================================================== -->

        <button
          type="button"
          class="heart-trigger"
          id="heart-trigger"
          aria-label="Open a little letter"
          aria-expanded="false"
        >
          <span class="heart-symbol">♥</span>
        </button>


        <!-- =================================================
             LETTER
        ================================================== -->

        <div
          class="heart-letter"
          id="heart-letter"
          aria-hidden="true"
        >

          <div class="letter-paper">

            <button
              type="button"
              class="letter-close"
              id="letter-close"
              aria-label="Close letter"
            >
              ×
            </button>

            <div class="letter-line">
        
            </div>

            <p class="letter-greeting">
              hi, kuttu.
            </p>

            <p>
              just wanted to leave
              a tiny piece of my heart here
              for you to find.
            </p>

            <p>
              keep it safe. ♡
            </p>


            <p class="letter-signoff">
              — aria ♡
            </p>

          </div>

        </div>

      </div>


      <div class="whoami-text">

        <p class="hello">
          Hi there!
        </p>

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


  <!-- =====================================================
       DATA
  ====================================================== -->

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


  <!-- =====================================================
       SPOTIFY
  ====================================================== -->

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

      <p class="muted">
        lately listening to
      </p>

      <a
        class="song"
        href="https://open.spotify.com/search/Baby%20Justin%20Bieber"
        target="_blank"
        rel="noopener noreferrer"
      >

        <span class="song-number">
          01
        </span>

        <span class="song-info">

          <strong>
            Baby
          </strong>

          <small>
            Justin Bieber
          </small>

        </span>

        <span>↗</span>

      </a>


      <a
        class="song"
        href="https://open.spotify.com/track/7z7kvUQGwlC6iOl7vMuAr9?si=58255d3c33bb4b5b"
        target="_blank"
        rel="noopener noreferrer"
      >

        <span class="song-number">
          02
        </span>

        <span class="song-info">

          <strong>
            Dancing in the Flames
          </strong>

          <small>
            Weekend
          </small>

        </span>

        <span>↗</span>

      </a>


      <a
        class="song"
        href="https://open.spotify.com/search/There's%20Nothing%20Holdin'%20Me%20Back%20Shawn%20Mendes"
        target="_blank"
        rel="noopener noreferrer"
      >

        <span class="song-number">
          03
        </span>

        <span class="song-info">

          <strong>
            There's Nothing Holdin' Me Back
          </strong>

          <small>
            Shawn Mendes
          </small>

        </span>

        <span>↗</span>

      </a>

    </div>

  </section>


  <!-- =====================================================
       LIKES
  ====================================================== -->

  <section class="card likes-card">

    <div class="card-heading">
      <span>~/likes</span>
    </div>

    <p class="muted">
      things that keep me alive offline
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


    <button
      type="button"
      class="xp-inline"
      id="xp-card"
      aria-expanded="false"
    >

      <span class="xp-arrow">
        ❯
      </span>

      <span class="xp-content">

        <small>
          currently in my
        </small>

        <strong>
          XP farming arc
        </strong>

        <span class="xp-description">
          collecting skills, side quests &
          questionable ideas
        </span>

      </span>

      <span class="xp-level">

        <small>
          LVL
        </small>

        <strong>
          67
        </strong>

      </span>

    </button>


    <div
      class="xp-expanded"
      id="xp-expanded"
      aria-hidden="true"
    >

      <span>▸ learning</span>
      <span>▸ building</span>
      <span>▸ experimenting</span>
      <span>▸ collecting XP</span>

    </div>

  </section>


  <!-- =====================================================
       TOOLKIT
  ====================================================== -->

  <section class="card toolkit-card">

    <div class="card-heading">
      <span>~/toolkit</span>
    </div>

    <div class="toolkit-list">

      <span>Python</span>
      <span>R</span>
      <span>C++</span>
      <span>SQL</span>
      <span>Excel</span>
      <span>Power BI</span>
      <span>Tableau</span>
      <span>Figma</span>
      <span>GitHub</span>
      <span>AI Agents</span>

    </div>

  </section>


  <!-- =====================================================
       JOURNEY
  ====================================================== -->

  <section
    class="card journey-card"
    id="resume"
  >

    <div class="card-heading">
      <span>~/journey</span>
    </div>


    <article class="journey-item">

      <div class="journey-top">

        <strong>
          MSc Computer Science (Data Analytics)
        </strong>

        <small>
          jun'26 — mar'28
        </small>

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

        <strong>
          Process Associate
        </strong>

        <small>
          aug'25 — may'26
        </small>

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

        <strong>
          Bachelor of Computer Applications
        </strong>

        <small>
          jun'22 — mar'25
        </small>

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


  <!-- =====================================================
       PROJECTS
  ====================================================== -->

  <section class="card projects-card">

    <div class="card-heading">

      <span>
        ~/projects
      </span>

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

        <strong>
          TravelMate AI
        </strong>

        <small>
          AI travel assistant
        </small>

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

        <strong>
          UniCredit
        </strong>

        <small>
          banking web application
        </small>

      </span>

      <span>↗</span>

    </a>

  </section>


  <!-- =====================================================
       POSTS
  ====================================================== -->

  <section
    class="card posts-card"
    id="blog"
  >

    <div class="card-heading">

      <span>
        ~/posts.recent
      </span>

      <a href="#blog">
        see all →
      </a>

    </div>


    <a href="#blog" class="post-row">

      <span>
        2026·08·01
      </span>

      <strong>
        › Starting my Data Analytics journey
      </strong>

    </a>


    <a href="#blog" class="post-row">

      <span>
        2026·07·20
      </span>

      <strong>
        › Building my first dashboard
      </strong>

    </a>


    <a href="#blog" class="post-row">

      <span>
        2026·07·10
      </span>

      <strong>
        › Things I'm learning
      </strong>

    </a>

  </section>


  <!-- =====================================================
       CERTIFICATIONS
  ====================================================== -->

  <section class="card certifications-card">

    <div class="card-heading">
      <span>~/certifications</span>
    </div>

    <div class="cert-list">

      <span>
        Accounts Receivable Management
      </span>

      <span>
        Data Analytics
      </span>

      <span>
        Machine Learning
      </span>

      <span>
        IoT Application Development
      </span>

      <span>
        UI / UX Design
      </span>

    </div>

  </section>


  <!-- =====================================================
       GITHUB
  ====================================================== -->

  <section class="card github-card">

    <div class="card-heading">

      <span>
        ~/github.activity
      </span>

      <a
        href="https://github.com/arya-prasanth"
        target="_blank"
        rel="noopener noreferrer"
      >
        @arya-prasanth ↗
      </a>

    </div>


    <div class="github-terminal">

      <span>$</span>

      <span id="github-status">
        activity fetch …
      </span>

    </div>


    <p
      id="github-summary"
      class="github-summary"
    >
      fetching GitHub activity…
    </p>


    <div
      id="github-activity-list"
      class="github-activity-list"
    ></div>


    <div class="github-controls">

      <button
        type="button"
        id="github-less"
      >
        less
      </button>

      <button
        type="button"
        id="github-more"
      >
        more
      </button>

    </div>

  </section>


  <!-- =====================================================
       VISITORS
  ====================================================== -->

  <section class="card visitors-card">

    <div class="card-heading">

      <span>
        ~/visitors
      </span>

      <span class="live">
        ● live
      </span>

    </div>


    <div class="visitor-number">

      <span id="visitor-count">
        1,247
      </span>

      <small>
        visitors
      </small>

    </div>


    <div class="visitor-map">

      <div class="map-grid"></div>

      <span class="map-dot d1"></span>
      <span class="map-dot d2"></span>
      <span class="map-dot d3"></span>
      <span class="map-dot d4"></span>
      <span class="map-dot d5"></span>

      <span class="map-label">
        LIVE WORLD
      </span>

    </div>


    <small class="visitor-info">
      live · analytics connecting
    </small>

  </section>

</main>
`

/* =========================================================
   FIND ME ELSEWHERE
========================================================= */

const socialCard =
  document.createElement('section')

socialCard.className =
  'social-card'

socialCard.id =
  'gallery'

socialCard.innerHTML = `

  <div class="card-heading">
    <span>// FIND ME ELSEWHERE</span>
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
        href="https://www.linkedin.com/in/arya-prasanth/"
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
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          class="social-logo letterboxd-logo"
        >
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
          <path d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0-0-6Zm5.25-3.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z"/>
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

document.body.appendChild(
  socialCard,
)

/* =========================================================
   FOOTER
========================================================= */

const footer =
  document.createElement('footer')

footer.innerHTML = `

  <span>
    ● connected ·
    <span id="india-time">
      --:--:--
    </span>
  </span>

  <span>
    built ·
    <span id="built-date"></span>
  </span>

`

document.body.appendChild(
  footer,
)

/* =========================================================
   INDIA TIME
========================================================= */

const indiaTime =
  document.querySelector(
    '#india-time',
  )

const updateTime = () => {
  if (!indiaTime)
    return

  const now =
    new Date()

  const time =
    new Intl.DateTimeFormat(
      'en-IN',
      {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      },
    ).format(now)

  indiaTime.textContent =
    `IST ${time}`
}

updateTime()

window.setInterval(
  updateTime,
  1000,
)

/* =========================================================
   BUILT DATE
========================================================= */

const builtDate =
  document.querySelector(
    '#built-date',
  )

if (builtDate) {
  builtDate.textContent =
    new Intl.DateTimeFormat(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      },
    ).format(
      new Date(),
    )
}

/* =========================================================
   HEART / SECRET LETTER
========================================================= */

const heartTrigger =
  document.querySelector(
    '#heart-trigger',
  ) as HTMLButtonElement | null

const heartLetter =
  document.querySelector(
    '#heart-letter',
  ) as HTMLElement | null

const letterClose =
  document.querySelector(
    '#letter-close',
  ) as HTMLButtonElement | null


const openLetter = () => {

  heartTrigger?.setAttribute(
    'aria-expanded',
    'true',
  )

  heartLetter?.setAttribute(
    'aria-hidden',
    'false',
  )

  heartLetter?.classList.add(
    'open',
  )

  document.body.classList.add(
    'letter-open',
  )

}


const closeLetter = () => {

  heartTrigger?.setAttribute(
    'aria-expanded',
    'false',
  )

  heartLetter?.setAttribute(
    'aria-hidden',
    'true',
  )

  heartLetter?.classList.remove(
    'open',
  )

  document.body.classList.remove(
    'letter-open',
  )

}


heartTrigger?.addEventListener(
  'click',
  openLetter,
)


letterClose?.addEventListener(
  'click',
  closeLetter,
)


heartLetter?.addEventListener(
  'click',
  event => {

    if (
      event.target === heartLetter
    ) {
      closeLetter()
    }

  },
)


document.addEventListener(
  'keydown',
  event => {

    if (
      event.key === 'Escape' &&
      heartLetter?.classList.contains(
        'open',
      )
    ) {
      closeLetter()
    }

  },
)

/* =========================================================
   XP INTERACTION
========================================================= */

const xpCard =
  document.querySelector(
    '#xp-card',
  ) as HTMLButtonElement | null

const xpExpanded =
  document.querySelector(
    '#xp-expanded',
  ) as HTMLElement | null

xpCard?.addEventListener(
  'click',
  () => {

    const expanded =
      xpCard.getAttribute(
        'aria-expanded',
      ) === 'true'

    xpCard.setAttribute(
      'aria-expanded',
      String(!expanded),
    )

    xpExpanded?.setAttribute(
      'aria-hidden',
      String(expanded),
    )

    xpExpanded?.classList.toggle(
      'open',
      !expanded,
    )
  },
)

/* =========================================================
   GITHUB ACTIVITY
========================================================= */

interface GitHubEvent {

  type?: string

  created_at?: string

  repo?: {
    name?: string
  }

  payload?: {
    commits?: Array<{
      message?: string
    }>
  }

}


const githubStatus =
  document.querySelector(
    '#github-status',
  )

const githubSummary =
  document.querySelector(
    '#github-summary',
  )

const githubList =
  document.querySelector(
    '#github-activity-list',
  )

const githubLess =
  document.querySelector(
    '#github-less',
  ) as HTMLButtonElement | null

const githubMore =
  document.querySelector(
    '#github-more',
  ) as HTMLButtonElement | null


let githubEvents: GitHubEvent[] = []

let visibleEvents = 3


/* =========================================================
   GITHUB EVENT LABEL
========================================================= */

const eventLabel =
  (
    event: GitHubEvent,
  ): string => {

    const repo =
      event.repo?.name ||
      'repository'

    switch (event.type) {

      case 'PushEvent':
        return `push → ${repo}`

      case 'CreateEvent':
        return `created → ${repo}`

      case 'PullRequestEvent':
        return `pull request → ${repo}`

      case 'IssuesEvent':
        return `issue activity → ${repo}`

      case 'IssueCommentEvent':
        return `comment → ${repo}`

      case 'WatchEvent':
        return `starred → ${repo}`

      case 'ForkEvent':
        return `forked → ${repo}`

      default:
        return `${event.type || 'activity'} → ${repo}`

    }
  }


/* =========================================================
   RENDER GITHUB
========================================================= */

const renderGithub =
  () => {

    if (!githubList)
      return

    const visible =
      githubEvents.slice(
        0,
        visibleEvents,
      )

    githubList.innerHTML =
      visible
        .map(
          event => {

            const date =
              event.created_at
                ? new Intl.DateTimeFormat(
                    'en-IN',
                    {
                      day: '2-digit',
                      month: 'short',
                    },
                  ).format(
                    new Date(
                      event.created_at,
                    ),
                  )
                : ''

            return `

              <div class="github-event">

                <span>
                  ${eventLabel(event)}
                </span>

                <small>
                  ${date}
                </small>

              </div>

            `
          },
        )
        .join('')


    if (githubLess) {

      githubLess.disabled =
        visibleEvents <= 3

    }


    if (githubMore) {

      githubMore.disabled =
        visibleEvents >=
        githubEvents.length

    }

  }


/* =========================================================
   FETCH GITHUB
========================================================= */

const fetchGithub =
  async () => {

    try {

      if (githubStatus) {

        githubStatus.textContent =
          'activity fetch …'

      }

      const response =
        await fetch(
          'https://api.github.com/users/arya-prasanth/events/public',
        )

      if (!response.ok) {

        throw new Error(
          `GitHub API ${response.status}`,
        )

      }

      githubEvents =
        await response.json()

      const oneYearAgo =
        new Date()

      oneYearAgo.setFullYear(
        oneYearAgo.getFullYear() - 1,
      )

      const recent =
        githubEvents.filter(
          event =>
            event.created_at &&
            new Date(
              event.created_at,
            ) >= oneYearAgo,
        )

      const commits =
        recent
          .filter(
            event =>
              event.type === 'PushEvent',
          )
          .reduce(
            (
              total,
              event,
            ) =>
              total +
              (
                event.payload
                  ?.commits
                  ?.length || 0
              ),
            0,
          )

      if (githubStatus) {

        githubStatus.textContent =
          'activity fetch complete'

      }

      if (githubSummary) {

        githubSummary.textContent =
          `${commits} commits last year · public activity live`

      }

      visibleEvents = 3

      renderGithub()

    } catch (error) {

      console.error(error)

      if (githubStatus) {

        githubStatus.textContent =
          'activity fetch failed'

      }

      if (githubSummary) {

        githubSummary.textContent =
          'GitHub activity unavailable right now'

      }

    }

  }


fetchGithub()

window.setInterval(
  fetchGithub,
  5 * 60 * 1000,
)

/* =========================================================
   BUY ME A COFFEE
========================================================= */

const coffeeCard =
  document.createElement('section')

coffeeCard.className =
  'coffee-card'

coffeeCard.innerHTML = `

  <div class="card-heading">

    <span>
      ~/support
    </span>

  </div>


  <div class="coffee-heading">

    <span class="coffee-eyebrow">
      a little support goes a long way
    </span>

    <h2>
      Buy me a coffee
    </h2>

  </div>


  <a
    href="#"
    class="coffee-content"
    aria-label="Buy me a coffee"
  >

    <span class="coffee-icon">
      ☕
    </span>

    <span class="coffee-text">

      <span>
        support my work & late-night builds
      </span>

    </span>

    <span class="coffee-arrow">
      ↗
    </span>

  </a>

`


const bentoGrid =
  document.querySelector(
    '.bento-grid',
  )

if (bentoGrid) {

  bentoGrid.appendChild(
    coffeeCard,
  )

}

/* =========================================================
   GITHUB BUTTONS
========================================================= */

githubLess?.addEventListener(
  'click',
  () => {

    visibleEvents =
      Math.max(
        3,
        visibleEvents - 3,
      )

    renderGithub()

  },
)


githubMore?.addEventListener(
  'click',
  () => {

    visibleEvents =
      Math.min(
        githubEvents.length,
        visibleEvents + 3,
      )

    renderGithub()

  },
)

/* =========================================================
   SMOOTH NAVIGATION
========================================================= */

document
  .querySelectorAll(
    'a[href^="#"]',
  )
  .forEach(
    link => {

      link.addEventListener(
        'click',
        event => {

          const targetId =
            link.getAttribute(
              'href',
            )

          if (
            !targetId ||
            targetId === '#'
          ) {
            return
          }

          const target =
            document.querySelector(
              targetId,
            )

          if (!target)
            return

          event.preventDefault()

          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          })

          if (
            link.closest(
              '.main-nav',
            )
          ) {

            document
              .querySelectorAll(
                '.main-nav a',
              )
              .forEach(
                nav =>
                  nav.classList.remove(
                    'active',
                  ),
              )

            link.classList.add(
              'active',
            )

          }

        },
      )

    },
  )
