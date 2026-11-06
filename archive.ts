import './archive.css'

const app = document.querySelector<HTMLElement>('#archive-app')

if (!app) {
  throw new Error('Archive app element not found')
}

/* =========================================================
   ARYA'S ARCHIVE — EDIT YOUR CONTENT HERE
========================================================= */

const letterboxdURL = 'https://boxd.it/iuv0p'
const substackURL = 'https://substack.com/@aryaahhh'

type Film = {
  title: string
  year: string
  director?: string
  poster: string
  rating?: number
  note?: string
  url?: string
}

type DiaryEntry = Film & {
  date: string
}

type Read = {
  title: string
  author: string
  description: string
  category?: string
  url: string
}

type Article = {
  title: string
  description: string
  date: string
  url: string
}

type Rant = {
  id: number
  name: string
  message: string
  date: string
}

/*
  Add your actual Letterboxd numbers below.
  Keep a value as null if you don't want to display it yet.
*/

const profileStats = {
  moviesAllTime: null as number | null,
  moviesThisYear: null as number | null,
  watchlist: null as number | null,
  likedMovies: null as number | null,
  substackReads: null as number | null,
}

/*
  Add your own films and poster image URLs.
  Poster URLs should be direct image links.
*/

const topTen: Film[] = [
  // Example:
  // {
  //   title: 'Past Lives',
  //   year: '2023',
  //   director: 'Celine Song',
  //   poster: 'https://image-url.jpg',
  //   rating: 5,
  //   note: 'A film that stayed with me.',
  //   url: 'https://letterboxd.com/film/past-lives-2023/',
  // },
]

const diaryEntries: DiaryEntry[] = [
  // Example:
  // {
  //   title: 'Past Lives',
  //   year: '2023',
  //   date: '2026-11-06',
  //   poster: 'https://image-url.jpg',
  //   rating: 4.5,
  //   note: 'Some films feel like memories.',
  // },
]

const favouriteReads: Read[] = [
  // Add your favourite Substack articles/publications here.
  // {
  //   title: 'Article title',
  //   author: 'Writer name',
  //   description: 'A little description of the article.',
  //   category: 'PERSONAL ESSAY',
  //   url: 'https://substack.com/...',
  // },
]

const articles: Article[] = [
  {
    title: 'A little piece of my mind',
    description: 'A few thoughts, finally put into words.',
    date: 'RECENTLY PUBLISHED',
    url: 'https://substack.com/home/post/p-206972357',
  },
  {
    title: 'Words I once left behind',
    description: 'Something from a different chapter.',
    date: 'FROM THE ARCHIVE',
    url: 'https://substack.com/home/post/p-166808166',
  },
  {
    title: 'Something worth remembering',
    description: 'A little reminder to keep.',
    date: 'A NOTE TO SELF',
    url: 'https://substack.com/home/post/p-221192148',
  },
]

/* =========================================================
   HELPERS
========================================================= */

const escapeHTML = (value: string): string =>
  value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }

    return entities[character]
  })

const safeURL = (value: string): string => {
  try {
    const url = new URL(value, window.location.origin)

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return escapeHTML(url.href)
    }
  } catch {
    // Invalid URLs fall through to the safe fallback.
  }

  return '#'
}

const displayNumber = (value: number | null): string =>
  value === null ? '—' : String(value)

const renderStars = (rating = 0): string => {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5

  return (
    '★'.repeat(fullStars) +
    (hasHalfStar ? '½' : '') +
    '☆'.repeat(Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0)))
  )
}

const renderPoster = (film: Film, className = ''): string => {
  const title = escapeHTML(film.title)
  const poster = film.poster.trim()

  if (poster) {
    return `
      <div class="poster-frame ${className}">
        <img
          src="${safeURL(poster)}"
          alt="${title} poster"
          loading="lazy"
          onerror="this.style.display='none'; this.nextElementSibling?.classList.remove('is-hidden')"
        />
        <div class="poster-fallback is-hidden">
          <span>✳</span>
          <strong>${title}</strong>
          <small>${escapeHTML(film.year)}</small>
        </div>
      </div>
    `
  }

  return `
    <div class="poster-frame ${className}">
      <div class="poster-fallback">
        <span>✳</span>
        <strong>${title}</strong>
        <small>${escapeHTML(film.year)}</small>
      </div>
    </div>
  `
}

const emptyState = (message: string, detail: string): string => `
  <div class="empty-state">
    <span class="empty-state-icon">◎</span>
    <h3>${escapeHTML(message)}</h3>
    <p>${escapeHTML(detail)}</p>
  </div>
`

const renderTopTen = (): string => {
  if (!topTen.length) {
    return emptyState(
      'the list is waiting.',
      'Add your ten favourite films in the topTen array in archive.ts.',
    )
  }

  return topTen.slice(0, 10).map((film, index) => {
    const content = `
      <span class="poster-rank">#${String(index + 1).padStart(2, '0')}</span>
      ${renderPoster(film)}
      <div class="film-card-info">
        <h3>${escapeHTML(film.title)}</h3>
        <span>${escapeHTML(film.year)}</span>
        <div class="film-stars">${renderStars(film.rating)}</div>
      </div>
    `

    if (film.url) {
      return `
        <a class="film-card" href="${safeURL(film.url)}"
          target="_blank" rel="noopener noreferrer">
          ${content}
        </a>
      `
    }

    return `<article class="film-card">${content}</article>`
  }).join('')
}

const renderDiary = (entries: DiaryEntry[]): string => {
  if (!entries.length) {
    return emptyState(
      'no entries in the diary yet.',
      'Your watched films, dates, posters and ratings will appear here.',
    )
  }

  return entries.map((film) => {
    const date = new Date(`${film.date}T12:00:00`)
    const formattedDate = Number.isNaN(date.getTime())
      ? film.date
      : date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })

    return `
      <article class="diary-entry">
        <time class="diary-date">${escapeHTML(formattedDate)}</time>
        ${renderPoster(film, 'diary-poster')}
        <div class="diary-info">
          <h3>${escapeHTML(film.title)}</h3>
          <span class="diary-year">${escapeHTML(film.year)}</span>
          <div class="film-stars">${renderStars(film.rating)}</div>
          ${film.note ? `<p>${escapeHTML(film.note)}</p>` : ''}
        </div>
        <span class="diary-entry-mark">✳</span>
      </article>
    `
  }).join('')
}

const renderFavouriteReads = (): string => {
  if (!favouriteReads.length) {
    return emptyState(
      'a shelf waiting to be filled.',
      'Add your favourite Substack reads to the favouriteReads array.',
    )
  }

  return favouriteReads.map((read, index) => `
    <a class="read-card" href="${safeURL(read.url)}"
      target="_blank" rel="noopener noreferrer">
      <div class="read-card-top">
        <span>READ / ${String(index + 1).padStart(2, '0')}</span>
        <span>↗</span>
      </div>
      <span class="read-category">${escapeHTML(read.category || 'SUBSTACK')}</span>
      <h3>${escapeHTML(read.title)}</h3>
      <span class="read-author">BY ${escapeHTML(read.author)}</span>
      <p>${escapeHTML(read.description)}</p>
      <span class="read-card-bottom">OPEN ARTICLE ↗</span>
    </a>
  `).join('')
}

const renderArticles = (): string =>
  articles.map((article, index) => `
    <a class="article-row" href="${safeURL(article.url)}"
      target="_blank" rel="noopener noreferrer">
      <span class="article-number">${String(index + 1).padStart(2, '0')}</span>
      <div class="article-copy">
        <h3>${escapeHTML(article.title)}</h3>
        <p>${escapeHTML(article.description)}</p>
      </div>
      <span class="article-date">${escapeHTML(article.date)}</span>
      <span class="article-arrow">↗</span>
    </a>
  `).join('')

/* =========================================================
   PAGE STRUCTURE
========================================================= */

const currentYear = new Date().getFullYear()

app.innerHTML = `
  <div class="archive-shell" id="archive-top">

    <header class="site-header">
      <div class="header-inner">
        <a class="site-logo" href="#archive-top" aria-label="The Archive home">
          <span class="logo-mark">a.</span>
          <span>the archive</span>
        </a>

        <nav class="main-nav" id="main-nav" aria-label="Main navigation">
          <a href="/">aria.exe <span>(home)</span></a>
          <a href="#reads">Reads</a>
          <a href="#films">Films</a>
          <a href="#rants">Rants</a>
        </nav>

        <button class="mobile-menu" id="mobile-menu"
          type="button" aria-label="Toggle navigation"
          aria-expanded="false">
          <span></span>
          <span></span>
        </button>
      </div>
    </header>

    <main class="page-content">

      <!-- PROFILE -->

      <section class="profile-section" id="profile">
        <div class="profile-banner">
          <div class="banner-pattern"></div>
          <span class="banner-label">A PERSONAL COLLECTION OF THINGS</span>
          <span class="banner-title">a little universe.</span>
          <span class="banner-coordinate">USER: ARYA / ARCHIVE_001</span>
        </div>

        <div class="profile-heading">
          <div class="profile-avatar">a<span>.</span></div>
          <div class="profile-title">
            <span class="eyebrow">THE HUMAN BEHIND THE ARCHIVE</span>
            <h1>arya</h1>
            <p>collecting stories, films and little pieces of life.</p>
          </div>
          <a class="profile-link" href="${safeURL(letterboxdURL)}"
            target="_blank" rel="noopener noreferrer">
            LETTERBOXD ↗
          </a>
        </div>

        <p class="profile-bio">
          A small corner of the internet for the things I write,
          the things I read, the films I watch and the thoughts
          that refuse to leave my head.
        </p>

        <div class="stats-grid" aria-label="Profile statistics">
          <button class="stat-card" type="button" data-stat="moviesAllTime">
            <strong data-count="${displayNumber(profileStats.moviesAllTime)}">
              ${displayNumber(profileStats.moviesAllTime)}
            </strong>
            <span>FILMS WATCHED</span>
            <small>ALL TIME</small>
          </button>

          <button class="stat-card" type="button" data-stat="moviesThisYear">
            <strong data-count="${displayNumber(profileStats.moviesThisYear)}">
              ${displayNumber(profileStats.moviesThisYear)}
            </strong>
            <span>WATCHED IN ${currentYear}</span>
            <small>THIS YEAR</small>
          </button>

          <button class="stat-card" type="button" data-stat="watchlist">
            <strong data-count="${displayNumber(profileStats.watchlist)}">
              ${displayNumber(profileStats.watchlist)}
            </strong>
            <span>WATCHLIST</span>
            <small>UP NEXT</small>
          </button>

          <button class="stat-card" type="button" data-stat="likedMovies">
            <strong data-count="${displayNumber(profileStats.likedMovies)}">
              ${displayNumber(profileStats.likedMovies)}
            </strong>
            <span>LIKED FILMS</span>
            <small>FAVOURITES</small>
          </button>

          <button class="stat-card" type="button" data-stat="substackReads">
            <strong data-count="${displayNumber(profileStats.substackReads)}">
              ${displayNumber(profileStats.substackReads)}
            </strong>
            <span>SUBSTACK READS</span>
            <small>WORDS COLLECTED</small>
          </button>
        </div>

        <div class="stat-message" id="stat-message" hidden
          aria-live="polite"></div>
      </section>

      <div class="page-note">
        <span><i></i> A LITTLE CORNER OF THE INTERNET</span>
        <span>SCROLL TO EXPLORE ↓</span>
      </div>

      <!-- READS -->

      <section class="content-section" id="reads">
        <div class="section-heading">
          <div>
            <span class="section-index">01 / THE READING ROOM</span>
            <h2>words & <em>thoughts.</em></h2>
          </div>
          <a class="section-external" href="${safeURL(substackURL)}"
            target="_blank" rel="noopener noreferrer">
            MY SUBSTACK ↗
          </a>
        </div>

        <div class="substack-card">
          <div class="substack-symbol">a.</div>
          <div class="substack-copy">
            <span class="eyebrow">MY WRITING CORNER</span>
            <h3>little pieces of my mind.</h3>
            <p>
              Personal essays, random thoughts, little stories
              and words that needed somewhere to live.
            </p>
            <a href="${safeURL(substackURL)}"
              target="_blank" rel="noopener noreferrer">
              VISIT MY SUBSTACK ↗
            </a>
          </div>
          <span class="substack-decoration">✳</span>
        </div>

        <div class="subsection-heading">
          <h3>recently published</h3>
          <span>MY WRITING LOG</span>
        </div>

        <div class="article-list">
          ${renderArticles()}
        </div>

        <div class="subsection-heading shelf-heading">
          <div>
            <span class="eyebrow">THE LITTLE BOOKSHELF</span>
            <h3>favourite reads.</h3>
          </div>
          <span>SCROLL SIDEWAYS →</span>
        </div>

        <div class="horizontal-shelf reads-shelf">
          ${renderFavouriteReads()}
        </div>
      </section>

      <!-- FILMS -->

      <section class="content-section" id="films">
        <div class="section-heading">
          <div>
            <span class="section-index">02 / THE FILM CABINET</span>
            <h2>life in <em>frames.</em></h2>
          </div>
          <a class="section-external" href="${safeURL(letterboxdURL)}"
            target="_blank" rel="noopener noreferrer">
            MY LETTERBOXD ↗
          </a>
        </div>

        <div class="letterboxd-card">
          <div class="letterboxd-icon">L</div>
          <div>
            <span class="eyebrow">LETTERBOXD FILM DIARY</span>
            <h3>films, feelings & everything in between.</h3>
            <p>
              A collection of stories I've watched,
              loved, rated and probably overthought.
            </p>
            <a href="${safeURL(letterboxdURL)}"
              target="_blank" rel="noopener noreferrer">
              VIEW MY LETTERBOXD ↗
            </a>
          </div>
          <span class="lb-decoration">★★★★★</span>
        </div>

        <div class="subsection-heading top-ten-heading">
          <div>
            <span class="eyebrow">THE ALL-TIME LIST</span>
            <h3>my top ten.</h3>
          </div>
          <span>01 — 10 / PERSONAL RANKING</span>
        </div>

        <div class="horizontal-shelf film-shelf" id="top-ten-shelf">
          ${renderTopTen()}
        </div>

        <div class="subsection-heading diary-heading">
          <div>
            <span class="eyebrow">THE WATCHED LOG</span>
            <h3>recently watched.</h3>
          </div>
          <span>MY FILM DIARY</span>
        </div>

        <div class="diary-toolbar">
          <div class="diary-filters" role="group" aria-label="Filter diary">
            <button class="filter-button active" type="button"
              data-filter="all">ALL</button>
            <button class="filter-button" type="button"
              data-filter="five">FIVE STARS</button>
            <button class="filter-button" type="button"
              data-filter="recent">RECENT</button>
          </div>
          <span class="diary-count">${diaryEntries.length} ENTRIES</span>
        </div>

        <div class="diary-list" id="diary-list">
          ${renderDiary(diaryEntries)}
        </div>
      </section>

      <!-- RANTS -->

      <section class="content-section" id="rants">
        <div class="section-heading">
          <div>
            <span class="section-index">03 / THE UNFILTERED CORNER</span>
            <h2>the rant <em>room.</em></h2>
          </div>
          <span class="section-external">NO REVIEWS. JUST THOUGHTS.</span>
        </div>

        <div class="rant-intro">
          <span class="rant-stamp">NO<br>FILTER</span>
          <div>
            <h3>some thoughts don't need a rating.</h3>
            <p>
              Dramatic observations, midnight thoughts,
              tiny frustrations and everything in between.
              Leave a little piece of your mind.
            </p>
          </div>
        </div>

        <div class="rant-editor">
          <div class="editor-heading">
            <span>NEW THOUGHT.TXT</span>
            <span id="rant-today"></span>
          </div>

          <label for="rant-name">YOUR NAME / ALIAS</label>
          <input id="rant-name" type="text" maxlength="32"
            placeholder="anonymous, if you wish...">

          <label for="rant-message">WHAT'S ON YOUR MIND?</label>
          <textarea id="rant-message" maxlength="1000"
            placeholder="dear diary, i have something to say..."></textarea>

          <div class="editor-bottom">
            <span id="rant-character-count">0 / 1000</span>
            <button id="submit-rant" type="button">POST THOUGHT ↗</button>
          </div>

          <p class="rant-feedback" id="rant-feedback"
            aria-live="polite"></p>

          <small class="storage-note">
            POSTS ARE STORED IN THIS BROWSER ONLY.
            SHARED VISITOR POSTS REQUIRE A BACKEND.
          </small>
        </div>

        <div class="subsection-heading rant-log-heading">
          <h3>the thought log.</h3>
          <span>WORDS LEFT HERE</span>
        </div>

        <div class="rant-list" id="rant-list"></div>
      </section>

    </main>

    <!-- FOOTER -->

    <footer class="site-footer">
      <div class="footer-main">
        <div class="footer-logo">a.</div>
        <div class="footer-copy">
          <p>that's a wrap.<br><em>thanks for stopping by.</em></p>
          <span>A PERSONAL COLLECTION OF WORDS & FRAMES.</span>
        </div>
        <a class="back-to-top" href="#archive-top">BACK TO TOP ↑</a>
      </div>

      <div class="footer-links">
        <a href="${safeURL(letterboxdURL)}"
          target="_blank" rel="noopener noreferrer">LETTERBOXD ↗</a>
        <a href="${safeURL(substackURL)}"
          target="_blank" rel="noopener noreferrer">SUBSTACK ↗</a>
      </div>

      <div class="footer-bottom">
        <span>© ${currentYear} ARYA</span>
        <span>MADE WITH FEELING.</span>
        <a href="/">← aria.exe (home)</a>
      </div>
    </footer>

  </div>
`

/* =========================================================
   MOBILE NAVIGATION
========================================================= */

const mobileMenu = document.getElementById('mobile-menu')
const mainNav = document.getElementById('main-nav')

mobileMenu?.addEventListener('click', () => {
  const isOpen = mainNav?.classList.toggle('nav-open') ?? false

  mobileMenu.classList.toggle('menu-open', isOpen)
  mobileMenu.setAttribute('aria-expanded', String(isOpen))
})

mainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('nav-open')
    mobileMenu?.classList.remove('menu-open')
    mobileMenu?.setAttribute('aria-expanded', 'false')
  })
})

/* =========================================================
   ACTIVE NAVIGATION + SCROLL REVEAL
========================================================= */

const navLinks = document.querySelectorAll<HTMLAnchorElement>('.main-nav a')
const pageSections = document.querySelectorAll<HTMLElement>(
  '#reads, #films, #rants',
)

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        navLinks.forEach((link) => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === `#${entry.target.id}`,
          )
        })
      })
    },
    { rootMargin: '-25% 0px -65% 0px' },
  )

  pageSections.forEach((section) => sectionObserver.observe(section))

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    },
    { threshold: 0.08 },
  )

  document.querySelectorAll('.content-section, .profile-section, .page-note')
    .forEach((element) => revealObserver.observe(element))
}

/* =========================================================
   ANIMATED STAT COUNTERS + DETAILS
========================================================= */

const statCards = document.querySelectorAll<HTMLButtonElement>('.stat-card')
const statMessage = document.getElementById('stat-message')

const statDescriptions: Record<string, string> = {
  moviesAllTime: 'Total films logged on your Letterboxd account.',
  moviesThisYear: `Films watched during ${currentYear}.`,
  watchlist: 'Films currently waiting on your Letterboxd watchlist.',
  likedMovies: 'Films you have liked on Letterboxd.',
  substackReads: 'Articles you have read on Substack.',
}

const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)',
).matches

const animateCounter = (element: HTMLElement): void => {
  const rawValue = element.dataset.count

  if (!rawValue || rawValue === '—') return

  const target = Number(rawValue)

  if (!Number.isFinite(target)) return

  if (reducedMotion) {
    element.textContent = String(target)
    return
  }

  const startTime = performance.now()
  const duration = 850

  const update = (now: number): void => {
    const progress = Math.min((now - startTime) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)

    element.textContent = String(Math.round(target * eased))

    if (progress < 1) {
      requestAnimationFrame(update)
    }
  }

  requestAnimationFrame(update)
}

if ('IntersectionObserver' in window) {
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return

      animateCounter(entry.target as HTMLElement)
      observer.unobserve(entry.target)
    })
  })

  document.querySelectorAll<HTMLElement>('[data-count]').forEach((counter) => {
    counterObserver.observe(counter)
  })
}

statCards.forEach((card) => {
  card.addEventListener('click', () => {
    const key = card.dataset.stat || ''
    const description = statDescriptions[key]

    if (!statMessage || !description) return

    const wasActive = card.classList.contains('selected')

    statCards.forEach((item) => item.classList.remove('selected'))

    if (wasActive) {
      statMessage.hidden = true
      statMessage.textContent = ''
      return
    }

    card.classList.add('selected')
    statMessage.textContent = description
    statMessage.hidden = false
  })
})

/* =========================================================
   DIARY FILTERS
========================================================= */

const filterButtons = document.querySelectorAll<HTMLButtonElement>(
  '.filter-button',
)

const diaryList = document.getElementById('diary-list')

let currentDiaryFilter = 'all'

const applyDiaryFilter = (): void => {
  if (!diaryList) return

  const entries = Array.from(
    diaryList.querySelectorAll<HTMLElement>('.diary-entry'),
  )

  entries.forEach((entry) => {
    const stars = entry.querySelector('.film-stars')?.textContent || ''
    const isFiveStars = stars.trim() === '★★★★★'

    entry.hidden = currentDiaryFilter === 'five' && !isFiveStars
  })

  if (currentDiaryFilter === 'recent') {
    entries.reverse().forEach((entry) => diaryList.appendChild(entry))
  }
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) => item.classList.remove('active'))
    button.classList.add('active')

    currentDiaryFilter = button.dataset.filter || 'all'
    applyDiaryFilter()
  })
})

/* =========================================================
   RANT ROOM — LOCAL STORAGE
========================================================= */

const RANT_STORAGE_KEY = 'arya-archive-rants-v1'

const rantName = document.getElementById('rant-name') as HTMLInputElement | null
const rantMessage = document.getElementById('rant-message') as HTMLTextAreaElement | null
const rantCount = document.getElementById('rant-character-count')
const rantFeedback = document.getElementById('rant-feedback')
const rantList = document.getElementById('rant-list')
const submitRant = document.getElementById('submit-rant')

const rantToday = document.getElementById('rant-today')

if (rantToday) {
  rantToday.textContent = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()
}

const getRants = (): Rant[] => {
  try {
    const saved = localStorage.getItem(RANT_STORAGE_KEY)

    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)

    if (!Array.isArray(parsed)) return []

    return parsed.filter((item): item is Rant => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'number' &&
        typeof item.name === 'string' &&
        typeof item.message === 'string' &&
        typeof item.date === 'string'
      )
    })
  } catch {
    return []
  }
}

const renderRants = (): void => {
  if (!rantList) return

  const rants = getRants()

  if (!rants.length) {
    rantList.innerHTML = `
      <div class="empty-state rant-empty">
        <span class="empty-state-icon">✳</span>
        <h3>the room is quiet.</h3>
        <p>Leave the first thought.</p>
      </div>
    `
    return
  }

  rantList.innerHTML = rants.map((rant) => `
    <article class="rant-entry">
      <div class="rant-entry-header">
        <strong>${escapeHTML(rant.name || 'ANONYMOUS')}</strong>
        <time>${escapeHTML(rant.date)}</time>
      </div>
      <p>${escapeHTML(rant.message).replace(/\n/g, '<br>')}</p>
      <button type="button" class="delete-rant"
        data-delete-rant="${rant.id}">
        DELETE ENTRY ×
      </button>
    </article>
  `).join('')
}

rantMessage?.addEventListener('input', () => {
  if (rantCount && rantMessage) {
    rantCount.textContent = `${rantMessage.value.length} / 1000`
  }
})

submitRant?.addEventListener('click', () => {
  const message = rantMessage?.value.trim() || ''

  if (!message) {
    if (rantFeedback) rantFeedback.textContent = 'Write something first :)'
    return
  }

  const newRant: Rant = {
    id: Date.now(),
    name: rantName?.value.trim() || 'anonymous',
    message,
    date: new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }

  try {
    const rants = getRants()
    rants.unshift(newRant)

    localStorage.setItem(RANT_STORAGE_KEY, JSON.stringify(rants))

    if (rantMessage) rantMessage.value = ''
    if (rantName) rantName.value = ''
    if (rantCount) rantCount.textContent = '0 / 1000'

    if (rantFeedback) {
      rantFeedback.textContent = 'Thought saved on this device. Thank you ✳'
    }

    renderRants()
  } catch {
    if (rantFeedback) {
      rantFeedback.textContent = 'Could not save. Browser storage may be unavailable.'
    }
  }
})

rantList?.addEventListener('click', (event) => {
  const target = event.target

  if (!(target instanceof HTMLElement)) return

  const button = target.closest<HTMLButtonElement>('[data-delete-rant]')

  if (!button) return

  const id = Number(button.dataset.deleteRant)

  try {
    const remaining = getRants().filter((rant) => rant.id !== id)

    localStorage.setItem(RANT_STORAGE_KEY, JSON.stringify(remaining))
    renderRants()
  } catch {
    if (rantFeedback) {
      rantFeedback.textContent = 'Could not delete this entry.'
    }
  }
})

renderRants()

/* =========================================================
   HORIZONTAL SHELF MOUSE DRAG
========================================================= */

document.querySelectorAll<HTMLElement>('.horizontal-shelf').forEach((shelf) => {
  let isDragging = false
  let startX = 0
  let initialScroll = 0

  shelf.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch') return

    const target = event.target

    if (target instanceof HTMLElement && target.closest('a, button')) {
      return
    }

    isDragging = true
    startX = event.clientX
    initialScroll = shelf.scrollLeft
    shelf.classList.add('is-dragging')
  })

  shelf.addEventListener('pointermove', (event) => {
    if (!isDragging) return

    shelf.scrollLeft = initialScroll - (event.clientX - startX)
  })

  const stopDragging = (): void => {
    isDragging = false
    shelf.classList.remove('is-dragging')
  }

  shelf.addEventListener('pointerup', stopDragging)
  shelf.addEventListener('pointerleave', stopDragging)
  shelf.addEventListener('pointercancel', stopDragging)
})

/* =========================================================
   FOOTER YEAR + PAGE READY
========================================================= */

document.documentElement.classList.add('archive-ready')