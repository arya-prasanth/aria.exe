import './archive.css'

const app = document.querySelector<HTMLElement>('#archive-app')

if (!app) {
  throw new Error('Archive app element not found')
}

/* =========================================================
   PROFILE & LIVE FEED CONFIGURATION
========================================================= */

const letterboxdURL = 'https://boxd.it/iuv0p'
const substackURL = 'https://substack.com/@aryaahhh'

const LETTERBOXD_API = '/api/letterboxd'
const SUBSTACK_API = '/api/substack'

const REFRESH_INTERVAL = 5 * 60 * 1000

// Last figures personally verified on 06 November 2026.
// These are snapshots, NOT live totals from the RSS feed.

const letterboxdSnapshot = {
  moviesAllTime: 861,
  moviesThisYear: 91,
  likedMovies: 27,
  watchlist: null as number | null,
  verifiedAt: '06 NOV 2026',
}

/* =========================================================
   TYPES
========================================================= */

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
  liked?: boolean
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
  image?: string
}

type Rant = {
  id: number
  name: string
  message: string
  date: string
}

type LetterboxdResponse = {
  ok?: boolean
  count?: number
  diary?: Array<{
    id?: string
    title?: string
    link?: string
    date?: string
    year?: string | number | null
    rating?: string | number | null
    liked?: boolean
    image?: string
  }>
  error?: string
  details?: string
}

type SubstackResponse = {
  ok?: boolean
  count?: number
  posts?: Array<{
    id?: string
    title?: string
    description?: string
    date?: string
    link?: string
    image?: string
  }>
  error?: string
  details?: string
}

/* =========================================================
   CONTENT
========================================================= */

let diaryEntries: DiaryEntry[] = []
let articles: Article[] = []

let letterboxdLoaded = false
let substackLoaded = false
let refreshInProgress = false

let currentDiaryFilter: 'all' | 'five' | 'recent' = 'all'

const profileStats = {
  moviesAllTime: letterboxdSnapshot.moviesAllTime as number | null,
  moviesThisYear: letterboxdSnapshot.moviesThisYear as number | null,
  watchlist: letterboxdSnapshot.watchlist,
  likedMovies: letterboxdSnapshot.likedMovies as number | null,
  substackReads: null as number | null,
}

// Your confirmed Letterboxd top four, in the exact order supplied.

const topTen: Film[] = [
  {
    title: 'Past Lives',
    year: '2023',
    director: 'Celine Song',
    poster: '',
    note: 'Some people stay with us.',
  },
  {
    title: 'Your Name',
    year: '2016',
    director: 'Makoto Shinkai',
    poster: '',
    note: 'A story written in the stars.',
  },
  {
    title: 'Spirited Away',
    year: '2001',
    director: 'Hayao Miyazaki',
    poster: '',
    note: 'A world worth getting lost in.',
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    year: '2001',
    director: 'Chris Columbus',
    poster: '',
    note: 'A little bit of magic.',
  },
]

// Add your hand-picked articles here if you want.
// Live Substack posts are displayed separately.

const favouriteReads: Read[] = []

/* =========================================================
   HELPERS
========================================================= */

const escapeHTML = (value: string | number): string =>
  String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character] ?? character)

const safeURL = (value: string): string => {
  try {
    const url = new URL(value, window.location.origin)

    return url.protocol === 'http:' || url.protocol === 'https:'
      ? escapeHTML(url.href)
      : '#'
  } catch {
    return '#'
  }
}

const displayNumber = (value: number | null): string =>
  value === null ? '—' : String(value)

const renderStars = (rating?: number): string => {
  if (rating === undefined || !Number.isFinite(rating)) {
    return 'NOT RATED'
  }

  const safeRating = Math.max(0, Math.min(5, rating))
  const fullStars = Math.floor(safeRating)
  const hasHalfStar = safeRating % 1 >= 0.5

  return (
    '★'.repeat(fullStars) +
    (hasHalfStar ? '½' : '') +
    '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))
  )
}

const formatDate = (value: string): string => {
  if (!value) return 'DATE NOT PROVIDED'

  const direct = new Date(value)

  const parsed = Number.isNaN(direct.getTime())
    ? new Date(value.slice(0, 10) + 'T12:00:00')
    : direct

  if (Number.isNaN(parsed.getTime())) {
    return escapeHTML(value)
  }

  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()
}

const stripHTML = (value: string): string => {
  const element = document.createElement('div')
  element.innerHTML = value

  return element.textContent?.trim() || ''
}

const emptyState = (message: string, detail: string): string => `
  <div class="empty-state">
    <span class="empty-state-icon">◎</span>
    <h3>${escapeHTML(message)}</h3>
    <p>${escapeHTML(detail)}</p>
  </div>
`

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
        >
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

const setConnectionStatus = (
  id: string,
  message: string,
  success: boolean,
): void => {
  const element = document.getElementById(id)

  if (!element) return

  element.textContent = message
  element.dataset.status = success ? 'online' : 'offline'
}

const updateStat = (
  key: string,
  value: number | null,
): void => {
  const card = document.querySelector<HTMLElement>(
    `.stat-card[data-stat="${key}"]`,
  )

  const number = card?.querySelector<HTMLElement>('[data-count]')

  if (!number) return

  number.textContent = displayNumber(value)
  number.dataset.count = displayNumber(value)
}

/* =========================================================
   FILM & READING RENDERERS
========================================================= */

const renderTopTen = (): string =>
  topTen.map((film, index) => {
    const content = `
      <span class="poster-rank">
        #${String(index + 1).padStart(2, '0')}
      </span>

      ${renderPoster(film)}

      <div class="film-card-info">
        <h3>${escapeHTML(film.title)}</h3>
        <span>${escapeHTML(film.year)}</span>
        <div class="film-stars">${renderStars(film.rating)}</div>
      </div>
    `

    return film.url
      ? `
        <a
          class="film-card"
          href="${safeURL(film.url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${content}
        </a>
      `
      : `<article class="film-card">${content}</article>`
  }).join('')

const renderDiary = (entries: DiaryEntry[]): string => {
  if (!entries.length) {
    return emptyState(
      'no diary entries returned.',
      'The Letterboxd feed connected, but did not return any recent film diary entries.',
    )
  }

  return entries.map((film) => `
    <article
      class="diary-entry"
      data-rating="${film.rating ?? 0}"
      data-date="${escapeHTML(film.date)}"
    >
      <time class="diary-date">
        ${escapeHTML(formatDate(film.date))}
      </time>

      ${renderPoster(film, 'diary-poster')}

      <div class="diary-info">
        <h3>${escapeHTML(film.title)}</h3>

        <span class="diary-year">
          ${escapeHTML(film.year)}
        </span>

        <div class="film-stars">
          ${renderStars(film.rating)}
        </div>

        ${film.url ? `
          <a
            class="diary-open-link"
            href="${safeURL(film.url)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            OPEN ON LETTERBOXD ↗
          </a>
        ` : ''}
      </div>

      <span class="diary-entry-mark">✳</span>
    </article>
  `).join('')
}

const renderArticles = (): string => {
  if (!articles.length) {
    return emptyState(
      'no posts returned by the feed.',
      'The Substack feed connected, but returned no posts in this response.',
    )
  }

  return articles.map((article, index) => `
    <a
      class="article-row"
      href="${safeURL(article.url)}"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="article-number">
        ${String(index + 1).padStart(2, '0')}
      </span>

      <div class="article-copy">
        <h3>${escapeHTML(article.title)}</h3>
        <p>${escapeHTML(article.description)}</p>
      </div>

      <span class="article-date">
        ${escapeHTML(article.date)}
      </span>

      <span class="article-arrow">↗</span>
    </a>
  `).join('')
}

const renderFavouriteReads = (): string => {
  if (!favouriteReads.length) {
    return emptyState(
      'a shelf waiting to be filled.',
      'Add your favourite articles to the favouriteReads array in archive.ts.',
    )
  }

  return favouriteReads.map((read, index) => `
    <a
      class="read-card"
      href="${safeURL(read.url)}"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="read-card-top">
        <span>READ / ${String(index + 1).padStart(2, '0')}</span>
        <span>↗</span>
      </div>

      <span class="read-category">
        ${escapeHTML(read.category || 'SUBSTACK')}
      </span>

      <h3>${escapeHTML(read.title)}</h3>

      <span class="read-author">
        BY ${escapeHTML(read.author)}
      </span>

      <p>${escapeHTML(read.description)}</p>

      <span class="read-card-bottom">
        OPEN ARTICLE ↗
      </span>
    </a>
  `).join('')
}

const updateDiary = (): void => {
  const list = document.getElementById('diary-list')

  const count = document.querySelector<HTMLElement>(
    '.diary-count',
  )

  if (list) {
    list.innerHTML = renderDiary(diaryEntries)
  }

  if (count) {
    count.textContent =
      `${diaryEntries.length} RECENT FEED ENTRIES`
  }

  applyDiaryFilter()
}

const updateArticles = (): void => {
  const list = document.querySelector<HTMLElement>(
    '.article-list',
  )

  const shelf = document.querySelector<HTMLElement>(
    '.reads-shelf',
  )

  if (list) {
    list.innerHTML = renderArticles()
  }

  if (shelf) {
    shelf.innerHTML = renderFavouriteReads()
  }
}

/* =========================================================
   LETTERBOXD STATISTICS
========================================================= */

const updateLetterboxdStats = (): void => {
  // Do not calculate account totals from the limited RSS feed.

  profileStats.moviesAllTime =
    letterboxdSnapshot.moviesAllTime

  profileStats.moviesThisYear =
    letterboxdSnapshot.moviesThisYear

  profileStats.likedMovies =
    letterboxdSnapshot.likedMovies

  profileStats.watchlist =
    letterboxdSnapshot.watchlist

  updateStat(
    'moviesAllTime',
    profileStats.moviesAllTime,
  )

  updateStat(
    'moviesThisYear',
    profileStats.moviesThisYear,
  )

  updateStat(
    'watchlist',
    profileStats.watchlist,
  )

  updateStat(
    'likedMovies',
    profileStats.likedMovies,
  )
}

/* =========================================================
   LETTERBOXD API
========================================================= */

const fetchLetterboxd = async (): Promise<void> => {
  try {
    const response = await fetch(LETTERBOXD_API, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    const data =
      await response.json() as LetterboxdResponse

    if (!response.ok || data.ok === false || data.error) {
      throw new Error(
        data.details ||
        data.error ||
        `Letterboxd API returned ${response.status}`,
      )
    }

    const entries = Array.isArray(data.diary)
      ? data.diary
      : []

    diaryEntries = entries.map((entry) => {
      const rating =
        entry.rating === undefined ||
        entry.rating === null ||
        entry.rating === ''
          ? undefined
          : Number(entry.rating)

      return {
        title: entry.title || 'Untitled film',
        year: String(entry.year || '—'),
        date: entry.date || '',
        poster: entry.image || '',
        rating:
          rating !== undefined && Number.isFinite(rating)
            ? rating
            : undefined,
        liked: entry.liked === true,
        url: entry.link || '',
      }
    }).sort((a, b) =>
      b.date.localeCompare(a.date),
    )

    letterboxdLoaded = true

    updateDiary()
    updateLetterboxdStats()

    setConnectionStatus(
      'letterboxd-status',
      `LIVE · ${diaryEntries.length} RECENT DIARY ENTRIES`,
      true,
    )
  } catch (error) {
    console.error('Letterboxd update failed:', error)

    setConnectionStatus(
      'letterboxd-status',
      'UNAVAILABLE · TRY AGAIN LATER',
      false,
    )

    if (!letterboxdLoaded) {
      const list = document.getElementById('diary-list')

      if (list) {
        list.innerHTML = emptyState(
          'the diary could not load.',
          'Please refresh the page in a little while.',
        )
      }

      const count = document.querySelector<HTMLElement>(
        '.diary-count',
      )

      if (count) {
        count.textContent = 'UNAVAILABLE'
      }
    }
  }
}

/* =========================================================
   SUBSTACK API
========================================================= */

const fetchSubstack = async (): Promise<void> => {
  try {
    const response = await fetch(SUBSTACK_API, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    const data =
      await response.json() as SubstackResponse

    if (!response.ok || data.ok === false || data.error) {
      throw new Error(
        data.details ||
        data.error ||
        `Substack API returned ${response.status}`,
      )
    }

    const posts = Array.isArray(data.posts)
      ? data.posts
      : []

    articles = posts.map((post) => ({
      title: post.title || 'Untitled post',
      description: stripHTML(
        post.description || '',
      ).slice(0, 220),
      date: formatDate(post.date || ''),
      url: post.link || substackURL,
      image: post.image || '',
    }))

    substackLoaded = true

    // This is the number returned by RSS, not a lifetime total.
    profileStats.substackReads = articles.length

    updateArticles()

    updateStat(
      'substackReads',
      profileStats.substackReads,
    )

    setConnectionStatus(
      'substack-status',
      articles.length
        ? `LIVE · ${articles.length} POSTS IN RSS RESPONSE`
        : 'CONNECTED · NO POSTS RETURNED BY RSS',
      true,
    )
  } catch (error) {
    console.error('Substack update failed:', error)

    setConnectionStatus(
      'substack-status',
      'UNAVAILABLE · TRY AGAIN LATER',
      false,
    )

    if (!substackLoaded) {
      const list = document.querySelector<HTMLElement>(
        '.article-list',
      )

      if (list) {
        list.innerHTML = emptyState(
          'the Substack feed could not load.',
          'Please try again later.',
        )
      }
    }
  }
}

/* =========================================================
   PAGE STRUCTURE
========================================================= */

const currentYear = new Date().getFullYear()

app.innerHTML = `
  <div class="archive-shell" id="archive-top">

    <header class="site-header">
      <div class="header-inner">

        <a
          class="site-logo"
          href="#archive-top"
          aria-label="The Archive home"
        >
          <span class="logo-mark">a.</span>
          <span>the archive</span>
        </a>

        <nav
          class="main-nav"
          id="main-nav"
          aria-label="Main navigation"
        >
          <a href="/">aria.exe <span>(home)</span></a>
          <a href="#reads">Reads</a>
          <a href="#films">Films</a>
          <a href="#rants">Rants</a>
        </nav>

        <button
          class="mobile-menu"
          id="mobile-menu"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded="false"
        >
          <span></span>
          <span></span>
        </button>

      </div>
    </header>

    <main class="page-content">

      <section class="profile-section" id="profile">

        <div class="profile-banner">
          <div class="banner-pattern"></div>
          <span class="banner-label">
            A PERSONAL COLLECTION OF THINGS
          </span>
          <span class="banner-title">
            a little universe.
          </span>
          <span class="banner-coordinate">
            USER: aria / ARCHIVE_001
          </span>
        </div>

        <div class="profile-heading">

          <div class="profile-avatar">
            a<span>.</span>
          </div>

          <div class="profile-title">
            <span class="eyebrow">
              THE HUMAN BEHIND THE ARCHIVE
            </span>
            <h1>aria</h1>
            <p>
              collecting stories, films and little pieces of life.
            </p>
          </div>

          <a
            class="profile-link"
            href="${safeURL(letterboxdURL)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            LETTERBOXD ↗
          </a>

        </div>

        <p class="profile-bio">
          A small corner of the internet for the things I write,
          the things I read, the films I watch and the thoughts
          that refuse to leave my head.
        </p>

        <div class="stats-grid" aria-label="Profile statistics">

          <button
            class="stat-card"
            type="button"
            data-stat="moviesAllTime"
          >
            <strong data-count="861">861</strong>
            <span>FILMS WATCHED</span>
            <small>LAST VERIFIED ↗</small>
          </button>

          <button
            class="stat-card"
            type="button"
            data-stat="moviesThisYear"
          >
            <strong data-count="91">91</strong>
            <span>WATCHED IN 2026</span>
            <small>DISTINCT FILMS ↗</small>
          </button>

          <button
            class="stat-card"
            type="button"
            data-stat="watchlist"
          >
            <strong data-count="—">—</strong>
            <span>WATCHLIST</span>
            <small>NOT VERIFIED</small>
          </button>

          <button
            class="stat-card"
            type="button"
            data-stat="likedMovies"
          >
            <strong data-count="27">27</strong>
            <span>LIKED FILMS</span>
            <small>LAST VERIFIED ↗</small>
          </button>

          <button
            class="stat-card"
            type="button"
            data-stat="substackReads"
          >
            <strong data-count="—">—</strong>
            <span>SUBSTACK POSTS</span>
            <small>LIVE RSS FEED ↗</small>
          </button>

        </div>

        <div
          class="stat-message"
          id="stat-message"
          hidden
          aria-live="polite"
        ></div>

        <p class="stats-note">
          Letterboxd totals are a last-verified snapshot from
          ${letterboxdSnapshot.verifiedAt}.
          Public RSS refreshes your recent diary, not complete
          account statistics.
        </p>

      </section>

      <div class="page-note">
        <span>
          <i></i> A LITTLE CORNER OF THE INTERNET
        </span>
        <span>SCROLL TO EXPLORE ↓</span>
      </div>

      <!-- READING ROOM -->

      <section class="content-section" id="reads">

        <div class="section-heading">
          <div>
            <span class="section-index">
              01 / THE READING ROOM
            </span>
            <h2>words & <em>thoughts.</em></h2>
          </div>

          <a
            class="section-external"
            href="${safeURL(substackURL)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            MY SUBSTACK ↗
          </a>
        </div>

        <div class="substack-card">

          <div class="substack-symbol">a.</div>

          <div class="substack-copy">
            <span class="eyebrow">
              MY WRITING CORNER
            </span>

            <h3>little pieces of my mind.</h3>

            <p>
              Personal essays, random thoughts, little stories
              and words that needed somewhere to live.
            </p>

            <a
              href="${safeURL(substackURL)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              VISIT MY SUBSTACK ↗
            </a>
          </div>

          <span class="substack-decoration">✳</span>

        </div>

        <div class="subsection-heading">
          <h3>recently published</h3>
          <span id="substack-status">CONNECTING...</span>
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

      <!-- FILM CABINET -->

      <section class="content-section" id="films">

        <div class="section-heading">
          <div>
            <span class="section-index">
              02 / THE FILM CABINET
            </span>
            <h2>life in <em>frames.</em></h2>
          </div>

          <a
            class="section-external"
            href="${safeURL(letterboxdURL)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            MY LETTERBOXD ↗
          </a>
        </div>

        <div class="letterboxd-card">

          <div class="letterboxd-icon">L</div>

          <div>
            <span class="eyebrow">
              LETTERBOXD FILM DIARY
            </span>

            <h3>
              films, feelings & everything in between.
            </h3>

            <p>
              A collection of stories I've watched, loved,
              rated and probably overthought.
            </p>

            <a
              href="${safeURL(letterboxdURL)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              VIEW MY LETTERBOXD ↗
            </a>
          </div>

          <span class="lb-decoration">★★★★★</span>

        </div>

        <div class="subsection-heading top-ten-heading">
          <div>
            <span class="eyebrow">THE ALL-TIME LIST</span>
            <h3>my top four.</h3>
          </div>

          <span>01 — 04 / PERSONAL RANKING</span>
        </div>

        <div
          class="horizontal-shelf film-shelf"
          id="top-ten-shelf"
        >
          ${renderTopTen()}
        </div>

        <div class="subsection-heading diary-heading">
          <div>
            <span class="eyebrow">THE WATCHED LOG</span>
            <h3>recently watched.</h3>
          </div>

          <span id="letterboxd-status">CONNECTING...</span>
        </div>

        <div class="diary-toolbar">

          <div
            class="diary-filters"
            role="group"
            aria-label="Filter diary"
          >
            <button
              class="filter-button active"
              type="button"
              data-filter="all"
            >
              ALL
            </button>

            <button
              class="filter-button"
              type="button"
              data-filter="five"
            >
              FIVE STARS
            </button>

            <button
              class="filter-button"
              type="button"
              data-filter="recent"
            >
              RECENT
            </button>
          </div>

          <span class="diary-count">
            LOADING...
          </span>

        </div>

        <div
          class="diary-list"
          id="diary-list"
        >
          ${emptyState(
            'loading your diary.',
            'Fetching your latest Letterboxd entries...',
          )}
        </div>

        <div class="film-shortcuts">

          <a
            href="${safeURL(letterboxdURL)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            FULL FILM DIARY ↗
          </a>

          <a
            href="${safeURL('https://letterboxd.com/ariaahhh/watchlist/')}"
            target="_blank"
            rel="noopener noreferrer"
          >
            MY WATCHLIST ↗
          </a>

          <a
            href="${safeURL('https://letterboxd.com/ariaahhh/likes/')}"
            target="_blank"
            rel="noopener noreferrer"
          >
            LIKED FILMS ↗
          </a>

        </div>

      </section>

      <!-- RANT ROOM -->

      <section class="content-section" id="rants">

        <div class="section-heading">
          <div>
            <span class="section-index">
              03 / THE UNFILTERED CORNER
            </span>
            <h2>the rant <em>room.</em></h2>
          </div>

          <span class="section-external">
            NO REVIEWS. JUST THOUGHTS.
          </span>
        </div>

        <div class="rant-intro">

          <span class="rant-stamp">
            NO<br>FILTER
          </span>

          <div>
            <h3>
              some thoughts don't need a rating.
            </h3>

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

          <label for="rant-name">
            YOUR NAME / ALIAS
          </label>

          <input
            id="rant-name"
            type="text"
            maxlength="32"
            placeholder="anonymous, if you wish..."
          >

          <label for="rant-message">
            WHAT'S ON YOUR MIND?
          </label>

          <textarea
            id="rant-message"
            maxlength="1000"
            placeholder="dear diary, i have something to say..."
          ></textarea>

          <div class="editor-bottom">
            <span id="rant-character-count">
              0 / 1000
            </span>

            <button id="submit-rant" type="button">
              POST THOUGHT ↗
            </button>
          </div>

          <p
            class="rant-feedback"
            id="rant-feedback"
            aria-live="polite"
          ></p>

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

    <footer class="site-footer">

      <div class="footer-main">
        <div class="footer-logo">a.</div>

        <div class="footer-copy">
          <p>
            that's a wrap.<br>
            <em>thanks for stopping by.</em>
          </p>

          <span>
            A PERSONAL COLLECTION OF WORDS & FRAMES.
          </span>
        </div>

        <a class="back-to-top" href="#archive-top">
          BACK TO TOP ↑
        </a>
      </div>

      <div class="footer-links">
        <a
          href="${safeURL(letterboxdURL)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          LETTERBOXD ↗
        </a>

        <a
          href="${safeURL(substackURL)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          SUBSTACK ↗
        </a>
      </div>

      <div class="footer-bottom">
        <span>© ${currentYear} aria</span>
        <span>MADE WITH FEELING.</span>
        <a href="/">← aria.exe (home)</a>
      </div>

    </footer>

  </div>
`

/* =========================================================
   STAT DETAILS
========================================================= */

const statCards =
  document.querySelectorAll<HTMLButtonElement>('.stat-card')

const statMessage =
  document.getElementById('stat-message')

const statDescriptions: Record<string, string> = {
  moviesAllTime:
    `861 films watched, last verified ${letterboxdSnapshot.verifiedAt}. The public Letterboxd RSS feed cannot provide your complete lifetime total.`,

  moviesThisYear:
    `91 distinct films watched in 2026, last verified ${letterboxdSnapshot.verifiedAt}. Rewatches are not counted as additional distinct films.`,

  watchlist:
    'Your current watchlist count is not available from the public diary RSS feed, so it is shown as unavailable instead of guessed.',

  likedMovies:
    `27 liked films, last verified ${letterboxdSnapshot.verifiedAt}. The public RSS feed does not provide a live liked-film total.`,

  substackReads:
    'This is the number of posts returned by the current Substack RSS response, not guaranteed to be the publication’s lifetime post count.',
}

statCards.forEach((card) => {
  card.addEventListener('click', () => {
    const key = card.dataset.stat || ''
    const description = statDescriptions[key]

    if (!statMessage || !description) return

    const wasActive = card.classList.contains('selected')

    statCards.forEach((item) =>
      item.classList.remove('selected'),
    )

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

const applyDiaryFilter = (): void => {
  const list = document.getElementById('diary-list')

  if (!list) return

  const entries = Array.from(
    list.querySelectorAll<HTMLElement>('.diary-entry'),
  )

  entries.forEach((entry) => {
    const rating = Number(entry.dataset.rating || 0)
    const date = entry.dataset.date || ''

    if (currentDiaryFilter === 'five') {
      entry.hidden = rating !== 5
    } else if (currentDiaryFilter === 'recent') {
      entry.hidden = !date
    } else {
      entry.hidden = false
    }
  })

  if (currentDiaryFilter === 'recent') {
    entries
      .sort((a, b) =>
        (b.dataset.date || '').localeCompare(
          a.dataset.date || '',
        ),
      )
      .forEach((entry) => list.appendChild(entry))
  }
}

const filterButtons =
  document.querySelectorAll<HTMLButtonElement>('.filter-button')

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    filterButtons.forEach((item) =>
      item.classList.remove('active'),
    )

    button.classList.add('active')

    currentDiaryFilter =
      (button.dataset.filter as 'all' | 'five' | 'recent') || 'all'

    applyDiaryFilter()
  })
})

/* =========================================================
   RANT ROOM — LOCAL STORAGE
========================================================= */

const RANT_STORAGE_KEY = 'aria-archive-rants-v1'

const rantName =
  document.getElementById('rant-name') as HTMLInputElement | null

const rantMessage =
  document.getElementById('rant-message') as HTMLTextAreaElement | null

const rantCount =
  document.getElementById('rant-character-count')

const rantFeedback =
  document.getElementById('rant-feedback')

const rantList =
  document.getElementById('rant-list')

const submitRant =
  document.getElementById('submit-rant')

const rantToday =
  document.getElementById('rant-today')

if (rantToday) {
  rantToday.textContent = new Date().toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  ).toUpperCase()
}

const getRants = (): Rant[] => {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(RANT_STORAGE_KEY) || '[]',
    )

    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item): item is Rant =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.id === 'number' &&
        typeof item.name === 'string' &&
        typeof item.message === 'string' &&
        typeof item.date === 'string',
    )
  } catch {
    return []
  }
}

const renderRants = (): void => {
  if (!rantList) return

  const rants = getRants()

  if (!rants.length) {
    rantList.innerHTML = emptyState(
      'the room is quiet.',
      'Leave the first thought.',
    )

    return
  }

  rantList.innerHTML = rants.map((rant) => `
    <article class="rant-entry">

      <div class="rant-entry-header">
        <strong>
          ${escapeHTML(rant.name || 'ANONYMOUS')}
        </strong>

        <time>
          ${escapeHTML(rant.date)}
        </time>
      </div>

      <p>
        ${escapeHTML(rant.message).replace(/\n/g, '<br>')}
      </p>

      <button
        type="button"
        class="delete-rant"
        data-delete-rant="${rant.id}"
      >
        DELETE ENTRY ×
      </button>

    </article>
  `).join('')
}

rantMessage?.addEventListener('input', () => {
  if (rantCount && rantMessage) {
    rantCount.textContent =
      `${rantMessage.value.length} / 1000`
  }
})

submitRant?.addEventListener('click', () => {
  const message = rantMessage?.value.trim() || ''

  if (!message) {
    if (rantFeedback) {
      rantFeedback.textContent = 'Write something first :)'
    }

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

    localStorage.setItem(
      RANT_STORAGE_KEY,
      JSON.stringify(rants),
    )

    if (rantMessage) rantMessage.value = ''
    if (rantName) rantName.value = ''

    if (rantCount) {
      rantCount.textContent = '0 / 1000'
    }

    if (rantFeedback) {
      rantFeedback.textContent =
        'Thought saved on this device. Thank you ✳'
    }

    renderRants()
  } catch {
    if (rantFeedback) {
      rantFeedback.textContent =
        'Could not save. Browser storage may be unavailable.'
    }
  }
})

rantList?.addEventListener('click', (event) => {
  const target = event.target

  if (!(target instanceof HTMLElement)) return

  const button =
    target.closest<HTMLButtonElement>('[data-delete-rant]')

  if (!button) return

  const id = Number(button.dataset.deleteRant)

  try {
    localStorage.setItem(
      RANT_STORAGE_KEY,
      JSON.stringify(
        getRants().filter((rant) => rant.id !== id),
      ),
    )

    renderRants()
  } catch {
    if (rantFeedback) {
      rantFeedback.textContent =
        'Could not delete this entry.'
    }
  }
})

renderRants()

/* =========================================================
   MOBILE NAVIGATION
========================================================= */

const mobileMenu =
  document.getElementById('mobile-menu')

const mainNav =
  document.getElementById('main-nav')

mobileMenu?.addEventListener('click', () => {
  const isOpen =
    mainNav?.classList.toggle('nav-open') ?? false

  mobileMenu.classList.toggle('menu-open', isOpen)

  mobileMenu.setAttribute(
    'aria-expanded',
    String(isOpen),
  )
})

mainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('nav-open')

    mobileMenu?.classList.remove('menu-open')

    mobileMenu?.setAttribute(
      'aria-expanded',
      'false',
    )
  })
})

/* =========================================================
   SCROLL EFFECTS
========================================================= */

const navLinks =
  document.querySelectorAll<HTMLAnchorElement>('.main-nav a')

const pageSections =
  document.querySelectorAll<HTMLElement>(
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
            link.getAttribute('href') ===
              `#${entry.target.id}`,
          )
        })
      })
    },
    {
      rootMargin: '-25% 0px -65% 0px',
    },
  )

  pageSections.forEach((section) =>
    sectionObserver.observe(section),
  )

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    },
    {
      threshold: 0.08,
    },
  )

  document
    .querySelectorAll(
      '.content-section, .profile-section, .page-note',
    )
    .forEach((element) =>
      revealObserver.observe(element),
    )
} else {
  document
    .querySelectorAll(
      '.content-section, .profile-section, .page-note',
    )
    .forEach((element) =>
      element.classList.add('is-visible'),
    )
}

/* =========================================================
   HORIZONTAL SHELF DRAG
========================================================= */

document
  .querySelectorAll<HTMLElement>('.horizontal-shelf')
  .forEach((shelf) => {
    let isDragging = false
    let startX = 0
    let initialScroll = 0

    shelf.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'touch') return

      const target = event.target

      if (
        target instanceof HTMLElement &&
        target.closest('a, button')
      ) {
        return
      }

      isDragging = true
      startX = event.clientX
      initialScroll = shelf.scrollLeft

      shelf.classList.add('is-dragging')
    })

    shelf.addEventListener('pointermove', (event) => {
      if (!isDragging) return

      shelf.scrollLeft =
        initialScroll - (event.clientX - startX)
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
   LIVE DATA REFRESH
========================================================= */

const refreshLiveData = async (): Promise<void> => {
  if (refreshInProgress) return

  refreshInProgress = true

  try {
    await Promise.allSettled([
      fetchLetterboxd(),
      fetchSubstack(),
    ])
  } finally {
    refreshInProgress = false
  }
}

// Render the verified Letterboxd snapshot immediately.
updateLetterboxdStats()

// Fetch the two live feeds.
void refreshLiveData()

// Refresh every five minutes.
window.setInterval(() => {
  if (!document.hidden) {
    void refreshLiveData()
  }
}, REFRESH_INTERVAL)

// Refresh when the visitor returns to the tab.
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    void refreshLiveData()
  }
})

// Refresh when the visitor focuses the window.
window.addEventListener('focus', () => {
  void refreshLiveData()
})

document.documentElement.classList.add('archive-ready')