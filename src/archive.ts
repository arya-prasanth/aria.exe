import './archive.css'

const app = document.querySelector<HTMLElement>('#archive-app')

if (!app) throw new Error('Archive app element not found')

/* =========================================================
   CONFIGURATION
========================================================= */

const letterboxdURL = 'https://boxd.it/iuv0p'
const substackURL = 'https://substack.com/@aryaahhh'
const spotifyURL =
  'https://open.spotify.com/user/snmtm82rsdg0jo7z8nnj32623?si=0503bca6ab054f8e'

const LETTERBOXD_API = '/api/letterboxd'
const SUBSTACK_API = '/api/substack'
const RANTS_API = '/api/rants'

const REFRESH_INTERVAL = 5 * 60 * 1000
const RANT_ADMIN_SESSION = 'aria-rant-admin-session'

const MAIN_PROFILE_IMAGE = '/images/aria-profile.jpg'
const SUBSTACK_PROFILE_IMAGE = '/images/substack-profile.jpg'

const letterboxdSnapshot = {
  moviesAllTime: 861,
  moviesThisYear: 91,
  likedMovies: 27,
}

/* =========================================================
   TYPES
========================================================= */

type Film = {
  title: string
  year: string
  poster: string
  rating?: number
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
  category: string
  url: string
}

type Article = {
  title: string
  description: string
  date: string
  url: string
}

type Rant = {
  id: string
  name: string
  title?: string
  message: string
  date: string
  owner?: boolean
}

type LetterboxdResponse = {
  ok?: boolean
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
  watchlist?: number | null
  error?: string
  details?: string
}

type SubstackResponse = {
  ok?: boolean
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

type RantsResponse = {
  ok?: boolean
  rants?: Rant[]
  error?: string
  details?: string
}

/* =========================================================
   STATE
========================================================= */

let diaryEntries: DiaryEntry[] = []
let articles: Article[] = []
let rants: Rant[] = []

let letterboxdLoaded = false
let substackLoaded = false
let refreshInProgress = false
let rantRequestInProgress = false

const profileStats = {
  moviesAllTime: letterboxdSnapshot.moviesAllTime as number | null,
  moviesThisYear: letterboxdSnapshot.moviesThisYear as number | null,
  watchlist: null as number | null,
  likedMovies: letterboxdSnapshot.likedMovies as number | null,
  substackReads: null as number | null,
}

/* =========================================================
   FAVOURITE FILMS
========================================================= */

const topFour: Film[] = [
  {
    title: 'Past Lives',
    year: '2023',
    poster:
      'https://dx35vtwkllhj9.cloudfront.net/a24films/past-lives/images/regions/us/onesheet.jpg',
  },
  {
    title: 'Your Name',
    year: '2016',
    poster:
      'https://cdn.posteritati.com/posters/000/000/049/033/your-name-md-web.jpg',
  },
  {
    title: 'Spirited Away',
    year: '2001',
    poster:
      'https://baseec-img-mng.akamaized.net/images/item/origin/05e4ce286f475a0e81f120d1590ddf01.jpg?im=Resize%2Cwidth%3D1200%2Ctype%3Dnormal&imformat=generic&q=90',
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    year: '2001',
    poster:
      'https://www.originalfilmart.com/cdn/shop/products/harry_potter_and_the_philosophers_stone_2001_australian_original_film_art_1600x.jpg?v=1568479585',
  },
]

/* =========================================================
   FAVOURITE READS
========================================================= */

const favouriteReads: Read[] = [
  {
    title: 'If a birds falls in love with a fish, where will they live?',
    author: 'You had me at Hello',
    description:
      'A tender piece about love, incompatibility, and knowing when not to lose yourself.',
    category: 'LOVE & LIFE',
    url: 'https://seizei.substack.com/p/if-a-birds-falls-in-love-with-a-fish',
  },
  {
    title:
      'Nobody Will Ever Fully Understand You. That’s the Best News You’ll Read This Year.',
    author: 'ixcarus',
    description:
      'On self-understanding, connection, and accepting that nobody can hold every part of us.',
    category: 'SELF-DISCOVERY',
    url: 'https://ixcarus.substack.com/p/nobody-will-ever-fully-understand',
  },
  {
    title: 'a little something worth reading',
    author: 'SUBSTACK',
    description:
      'A little saved corner of the internet. Open it and see where the words take you.',
    category: 'LITTLE DISCOVERIES',
    url: 'https://substack.com/home/post/p-211701002',
  },
  {
    title: 'unrot your brain',
    author: 'Kylee · plum pits',
    description:
      'A reminder to reclaim curiosity, attention, and the joy of thinking for yourself.',
    category: 'MIND & CURIOSITY',
    url: 'https://plumpits.substack.com/p/unrot-your-brain',
  },
]

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
    return ''
  }

  const safeRating = Math.max(0, Math.min(5, rating))
  const fullStars = Math.floor(safeRating)
  const halfStar = safeRating % 1 >= 0.5

  return (
    '★'.repeat(fullStars) +
    (halfStar ? '½' : '') +
    '☆'.repeat(5 - fullStars - (halfStar ? 1 : 0))
  )
}

const formatDate = (value: string): string => {
  if (!value) return 'DATE UNKNOWN'

  const parsed = new Date(value)

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
    <span class="empty-state-icon">✿</span>
    <h3>${escapeHTML(message)}</h3>
    <p>${escapeHTML(detail)}</p>
  </div>
`

const renderPoster = (film: Film, className = ''): string => {
  const title = escapeHTML(film.title)
  const poster = film.poster.trim()

  return `
    <div class="poster-frame ${className}">
      ${
        poster
          ? `
            <img
              src="${safeURL(poster)}"
              alt="${title} poster"
              loading="lazy"
              onerror="this.style.display='none'; this.nextElementSibling?.classList.remove('is-hidden')"
            >
          `
          : ''
      }

      <div class="poster-fallback ${poster ? 'is-hidden' : ''}">
        <span>✿</span>
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

const updateStat = (key: string, value: number | null): void => {
  const card = document.querySelector<HTMLElement>(
    `.stat-card[data-stat="${key}"]`,
  )

  const number = card?.querySelector<HTMLElement>('[data-count]')

  if (!number) return

  number.textContent = displayNumber(value)
  number.dataset.count = displayNumber(value)
}

/* =========================================================
   FILM RENDERERS
========================================================= */

const renderTopFour = (): string =>
  topFour.map((film) => `
    <article class="film-card">
      ${renderPoster(film)}

      <div class="film-card-info">
        <h3>${escapeHTML(film.title)}</h3>
        <span>${escapeHTML(film.year)}</span>
      </div>
    </article>
  `).join('')

const renderDiary = (entries: DiaryEntry[]): string => {
  if (!entries.length) {
    return emptyState(
      'your film diary is taking a little nap.',
      'Your recent watches will appear here when the feed is available.',
    )
  }

  return entries.slice(0, 15).map((film) => `
    <article class="diary-entry">
      <time class="diary-date">
        ${escapeHTML(formatDate(film.date))}
      </time>

      ${renderPoster(film, 'diary-poster')}

      <div class="diary-info">
        <h3>${escapeHTML(film.title)}</h3>

        <span class="diary-year">
          ${escapeHTML(film.year)}
        </span>

        ${
          film.rating !== undefined
            ? `<div class="film-stars">${renderStars(film.rating)}</div>`
            : ''
        }

        ${
          film.url
            ? `
              <a
                class="diary-open-link"
                href="${safeURL(film.url)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                OPEN ON LETTERBOXD ↗
              </a>
            `
            : ''
        }
      </div>

      <span class="diary-entry-mark">✿</span>
    </article>
  `).join('')
}

const renderFavouriteReads = (): string =>
  favouriteReads.map((read) => `
    <a
      class="read-card"
      href="${safeURL(read.url)}"
      target="_blank"
      rel="noopener noreferrer"
    >
      <div class="read-card-top">
        <span>✿ A LITTLE FAVOURITE</span>
        <span>↗</span>
      </div>

      <span class="read-category">
        ${escapeHTML(read.category)}
      </span>

      <h3>${escapeHTML(read.title)}</h3>

      <span class="read-author">
        BY ${escapeHTML(read.author)}
      </span>

      <p>${escapeHTML(read.description)}</p>

      <span class="read-card-bottom">
        READ THIS ONE ↗
      </span>
    </a>
  `).join('')

const renderArticles = (): string => {
  if (!articles.length) {
    return emptyState(
      'nothing new on the reading desk.',
      'New writing will find its way here when it is published.',
    )
  }

  return articles.map((article) => `
    <a
      class="article-row"
      href="${safeURL(article.url)}"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span class="article-number">✿</span>

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

const updateDiary = (): void => {
  const list = document.getElementById('diary-list')
  const count = document.querySelector<HTMLElement>('.diary-count')

  if (list) list.innerHTML = renderDiary(diaryEntries)

  if (count) {
    count.textContent = diaryEntries.length
      ? `${diaryEntries.length} LITTLE RECENT WATCHES`
      : 'WAITING FOR FILMS'
  }
}

const updateArticles = (): void => {
  const list = document.querySelector<HTMLElement>('.article-list')
  const shelf = document.querySelector<HTMLElement>('.reads-shelf')

  if (list) list.innerHTML = renderArticles()
  if (shelf) shelf.innerHTML = renderFavouriteReads()
}

/* =========================================================
   PROFILE STATISTICS
========================================================= */

const updateLetterboxdStats = (): void => {
  updateStat('moviesAllTime', profileStats.moviesAllTime)
  updateStat('moviesThisYear', profileStats.moviesThisYear)
  updateStat('watchlist', profileStats.watchlist)
  updateStat('likedMovies', profileStats.likedMovies)
}

/* =========================================================
   LETTERBOXD FEED
========================================================= */

const fetchLetterboxd = async (): Promise<void> => {
  try {
    const response = await fetch(LETTERBOXD_API, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    const data = await response.json() as LetterboxdResponse

    if (!response.ok || data.ok === false || data.error) {
      throw new Error(
        data.details || data.error || `HTTP ${response.status}`,
      )
    }

    const entries = Array.isArray(data.diary) ? data.diary : []

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
    })
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 15)

    profileStats.watchlist =
      typeof data.watchlist === 'number' &&
      Number.isFinite(data.watchlist)
        ? data.watchlist
        : null

    letterboxdLoaded = true

    updateDiary()
    updateLetterboxdStats()

    setConnectionStatus(
      'letterboxd-status',
      '✿ YOUR RECENT WATCHES',
      true,
    )
  } catch (error) {
    console.error('Letterboxd update failed:', error)

    setConnectionStatus(
      'letterboxd-status',
      'A LITTLE BREAK · TRY AGAIN SOON',
      false,
    )

    if (!letterboxdLoaded) {
      const list = document.getElementById('diary-list')

      if (list) {
        list.innerHTML = emptyState(
          'the diary is taking a little nap.',
          'Please come back in a moment.',
        )
      }
    }
  }
}

/* =========================================================
   SUBSTACK FEED
========================================================= */

const fetchSubstack = async (): Promise<void> => {
  try {
    const response = await fetch(SUBSTACK_API, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    const data = await response.json() as SubstackResponse

    if (!response.ok || data.ok === false || data.error) {
      throw new Error(
        data.details || data.error || `HTTP ${response.status}`,
      )
    }

    const posts = Array.isArray(data.posts) ? data.posts : []

    articles = posts.map((post) => ({
      title: post.title || 'Untitled post',
      description: stripHTML(post.description || '').slice(0, 220),
      date: formatDate(post.date || ''),
      url: post.link || substackURL,
    }))

    substackLoaded = true
    profileStats.substackReads = articles.length

    updateArticles()
    updateStat('substackReads', profileStats.substackReads)

    setConnectionStatus(
      'substack-status',
      articles.length
        ? '✿ FRESH WORDS FROM MY SUBSTACK'
        : 'THE READING DESK IS QUIET',
      true,
    )
  } catch (error) {
    console.error('Substack update failed:', error)

    setConnectionStatus(
      'substack-status',
      'THE READING DESK IS RESTING',
      false,
    )

    if (!substackLoaded) {
      const list = document.querySelector<HTMLElement>('.article-list')

      if (list) {
        list.innerHTML = emptyState(
          'the reading desk is resting.',
          'New posts will appear here when the feed is available.',
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
          <span class="logo-sparkle">✿</span>
        </a>

        <nav class="main-nav" id="main-nav" aria-label="Main navigation">
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
          <span class="banner-doodle doodle-one">✿</span>
          <span class="banner-doodle doodle-two">♡</span>
          <span class="banner-doodle doodle-three">✧</span>

          <span class="banner-label">A LITTLE COLLECTION OF EVERYTHING</span>
          <span class="banner-title">little things, lovely stories.</span>
          <span class="banner-coordinate">a tiny corner of the internet ♡</span>
        </div>

        <div class="profile-heading">

          <div class="profile-avatar">
            <img
              src="${MAIN_PROFILE_IMAGE}"
              alt="aria's profile"
              onerror="this.style.display='none'; this.parentElement.classList.add('avatar-placeholder')"
            >
            <span class="avatar-fallback">a.</span>
          </div>

          <div class="profile-title">
            <span class="eyebrow">A PERSON WITH TOO MANY FAVOURITES ✿</span>
            <h1>aria</h1>
            <p>collecting stories, films and little pieces of life.</p>
          </div>

        </div>

        <p class="profile-bio">
          A small corner of the internet for the things I write,
          the things I read, the films I watch and the thoughts
          that refuse to leave my head.
        </p>

        <div class="stats-grid" aria-label="Profile statistics">

          <div class="stat-card" data-stat="moviesAllTime">
            <strong data-count="861">861</strong>
            <span>FILMS WATCHED</span>
            <small>♡ ALL-TIME</small>
          </div>

          <div class="stat-card" data-stat="moviesThisYear">
            <strong data-count="91">91</strong>
            <span>WATCHED IN 2026</span>
            <small>♡ DISTINCT FILMS</small>
          </div>

          <div class="stat-card" data-stat="watchlist">
            <strong data-count="—">—</strong>
            <span>WATCHLIST</span>
            <small>♡ MY NEXT ADVENTURES</small>
          </div>

          <div class="stat-card" data-stat="likedMovies">
            <strong data-count="27">27</strong>
            <span>LIKED FILMS</span>
            <small>♡ ALL-TIME</small>
          </div>

          <div class="stat-card" data-stat="substackReads">
            <strong data-count="—">—</strong>
            <span>RECENT POSTS</span>
            <small>♡ SUBSTACK</small>
          </div>

        </div>

      </section>

      <div class="page-note">
        <span><i></i> MADE OF WORDS, FILMS & FEELINGS</span>
        <span>SCROLL A LITTLE ↓</span>
      </div>

      <!-- READING ROOM -->

      <section class="content-section" id="reads">

        <div class="section-heading">
          <div>
            <span class="section-index">01 / THE READING ROOM ✿</span>
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

          <div class="substack-symbol">
            <img
              src="${SUBSTACK_PROFILE_IMAGE}"
              alt="aria's Substack profile"
              onerror="this.style.display='none'; this.parentElement.classList.add('symbol-placeholder')"
            >
            <span>a.</span>
          </div>

          <div class="substack-copy">
            <span class="eyebrow">MY LITTLE WRITING CORNER</span>
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
              COME READ WITH ME ↗
            </a>
          </div>

          <span class="substack-decoration">✿</span>

        </div>

        <div class="subsection-heading">
          <h3>freshly written</h3>
          <span id="substack-status">A MOMENT PLEASE...</span>
        </div>

        <div class="article-list">
          ${renderArticles()}
        </div>

        <div class="subsection-heading shelf-heading">
          <div>
            <span class="eyebrow">A FEW THINGS I LOVE</span>
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
            <span class="section-index">02 / THE FILM CABINET ✿</span>
            <h2>life in <em>frames.</em></h2>
          </div>
        </div>

        <div class="letterboxd-card">

          <div class="letterboxd-icon">L</div>

          <div>
            <span class="eyebrow">MY LETTERBOXD DIARY</span>
            <h3>films, feelings & everything in between.</h3>
            <p>
              A collection of stories I've watched, loved,
              rated and probably overthought.
            </p>
          </div>

          <span class="lb-decoration">★★★★★</span>

        </div>

        <div class="subsection-heading top-ten-heading">
          <div>
            <span class="eyebrow">THE FOREVER FAVOURITES</span>
            <h3>my top four.</h3>
          </div>
          <span>THESE HAVE MY HEART ♡</span>
        </div>

        <div class="horizontal-shelf film-shelf" id="top-ten-shelf">
          ${renderTopFour()}
        </div>

        <div class="subsection-heading diary-heading">
          <div>
            <span class="eyebrow">THE WATCHED LOG</span>
            <h3>recently watched.</h3>
          </div>
          <span id="letterboxd-status">A MOMENT PLEASE...</span>
        </div>

        <div class="diary-toolbar">
          <span class="diary-count">LOADING MY FILM DIARY...</span>
        </div>

        <div class="diary-list" id="diary-list">
          ${emptyState(
            'fetching your films.',
            'A little moment while the diary loads...',
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
            <span class="section-index">03 / THE UNFILTERED CORNER ✿</span>
            <h2>the rant <em>room.</em></h2>
          </div>
          <span class="section-external">MY LITTLE BLOG</span>
        </div>

        <div class="rant-intro">
          <span class="rant-stamp">DEAR<br>DIARY</span>
          <div>
            <h3>some thoughts deserve their own little home.</h3>
            <p>
              Personal notes, midnight thoughts, tiny observations,
              dramatic paragraphs and everything in between.
              A little collection of things on my mind.
            </p>
          </div>
        </div>

        <div class="rant-editor">

          <div class="editor-heading">
            <span>A LITTLE NOTE TO THE UNIVERSE ✿</span>
            <span id="rant-today"></span>
          </div>

          <div class="owner-login" id="owner-login">
            <p>the writing desk is reserved for aria ♡</p>

            <label for="rant-admin-token">OWNER ACCESS KEY</label>

            <input
              id="rant-admin-token"
              type="password"
              autocomplete="current-password"
              placeholder="your private admin key"
            >

            <button id="rant-admin-unlock" type="button">
              UNLOCK MY WRITING DESK ↗
            </button>

            <span id="rant-admin-status" aria-live="polite"></span>
          </div>

          <div class="owner-composer" id="owner-composer" hidden>

            <div class="owner-composer-heading">
              <span>WELCOME BACK, ARIA ♡</span>
              <button id="rant-admin-lock" type="button">LOCK DESK</button>
            </div>

            <label for="rant-title">POST TITLE</label>
            <input
              id="rant-title"
              type="text"
              maxlength="100"
              placeholder="give this little thought a title..."
            >

            <label for="rant-message">YOUR THOUGHTS</label>
            <textarea
              id="rant-message"
              maxlength="5000"
              placeholder="dear diary, i have something to say..."
            ></textarea>

            <div class="editor-bottom">
              <span id="rant-character-count">0 / 5000</span>
              <button id="submit-rant" type="button">
                PUBLISH MY THOUGHT ↗
              </button>
            </div>

            <p class="rant-feedback" id="rant-feedback" aria-live="polite"></p>

          </div>

        </div>

        <div class="subsection-heading rant-log-heading">
          <div>
            <span class="eyebrow">LITTLE PIECES OF MY MIND</span>
            <h3>the thought log.</h3>
          </div>
          <span>FROM MY DESK ♡</span>
        </div>

        <div class="rant-list" id="rant-list">
          ${emptyState(
            'the room is quiet.',
            'My little thoughts will find their way here.',
          )}
        </div>

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
          <span>A LITTLE COLLECTION OF WORDS & FRAMES.</span>
        </div>

        <a class="back-to-top" href="#archive-top">BACK TO TOP ↑</a>
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

        <a
          href="${safeURL(spotifyURL)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          SPOTIFY ↗
        </a>
      </div>

      <div class="footer-bottom">
        <span>© ${currentYear} aria</span>
        <span>MADE WITH FEELING ♡</span>
        <a href="/">← aria.exe</a>
      </div>

    </footer>

  </div>
`

/* =========================================================
   INITIAL STATISTICS
========================================================= */

updateLetterboxdStats()

/* =========================================================
   RANT ROOM — OWNER-ONLY PUBLISHING
========================================================= */

const rantMessage =
  document.getElementById('rant-message') as HTMLTextAreaElement | null

const rantTitle =
  document.getElementById('rant-title') as HTMLInputElement | null

const rantCount = document.getElementById('rant-character-count')
const rantFeedback = document.getElementById('rant-feedback')
const rantList = document.getElementById('rant-list')
const submitRant = document.getElementById('submit-rant')
const rantToday = document.getElementById('rant-today')

const adminTokenInput =
  document.getElementById('rant-admin-token') as HTMLInputElement | null

const adminUnlock = document.getElementById('rant-admin-unlock')
const adminLock = document.getElementById('rant-admin-lock')
const adminStatus = document.getElementById('rant-admin-status')

const ownerLogin = document.getElementById('owner-login')
const ownerComposer = document.getElementById('owner-composer')

/* =========================================================
   ADMIN SESSION
========================================================= */

const getAdminToken = (): string => {
  try {
    return sessionStorage.getItem(RANT_ADMIN_SESSION) || ''
  } catch {
    return ''
  }
}

const setAdminToken = (token: string): void => {
  try {
    sessionStorage.setItem(RANT_ADMIN_SESSION, token)
  } catch {
    setAdminStatus('Your browser could not save the session.')
  }
}

const clearAdminToken = (): void => {
  try {
    sessionStorage.removeItem(RANT_ADMIN_SESSION)
  } catch {
    // Session storage is unavailable.
  }
}

const isAdminUnlocked = (): boolean => Boolean(getAdminToken())

const setRantFeedback = (message: string): void => {
  if (rantFeedback) rantFeedback.textContent = message
}

const setAdminStatus = (message: string): void => {
  if (adminStatus) adminStatus.textContent = message
}

const updateOwnerView = (): void => {
  const unlocked = isAdminUnlocked()

  if (ownerLogin) ownerLogin.hidden = unlocked
  if (ownerComposer) ownerComposer.hidden = !unlocked
}

/* =========================================================
   RANT DATE
========================================================= */

if (rantToday) {
  rantToday.textContent = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).toUpperCase()
}

/* =========================================================
   RANT RENDERING
========================================================= */

const renderRants = (): void => {
  if (!rantList) return

  if (!rants.length) {
    rantList.innerHTML = emptyState(
      'the room is quiet.',
      'My little thoughts will find their way here.',
    )
    return
  }

  rantList.innerHTML = rants.map((rant) => {
    const title = rant.title?.trim() || ''

    return `
      <article class="rant-entry">

        <div class="rant-entry-header">
          <strong>${escapeHTML(rant.name || 'aria')}</strong>
          <time>${escapeHTML(formatDate(rant.date))}</time>
        </div>

        ${
          title
            ? `<h3>${escapeHTML(title)}</h3>`
            : ''
        }

        <p>${escapeHTML(rant.message).replace(/\n/g, '<br>')}</p>

        ${
          isAdminUnlocked()
            ? `
              <button
                type="button"
                class="delete-rant"
                data-delete-rant="${escapeHTML(rant.id)}"
              >
                DELETE ENTRY ×
              </button>
            `
            : ''
        }

      </article>
    `
  }).join('')
}

/* =========================================================
   LOAD PUBLIC RANTS
========================================================= */

const loadRants = async (): Promise<void> => {
  try {
    const response = await fetch(RANTS_API, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    const data = await response.json() as RantsResponse

    if (!response.ok || data.ok === false) {
      throw new Error(
        data.details || data.error || 'Unable to load thoughts',
      )
    }

    rants = Array.isArray(data.rants) ? data.rants : []

    renderRants()
  } catch (error) {
    console.error('Rant loading failed:', error)

    if (rantList) {
      rantList.innerHTML = emptyState(
        'the thought room is resting.',
        'Please try again in a little while.',
      )
    }
  }
}

/* =========================================================
   CHARACTER COUNTER
========================================================= */

rantMessage?.addEventListener('input', () => {
  if (rantCount && rantMessage) {
    rantCount.textContent = `${rantMessage.value.length} / 5000`
  }
})

/* =========================================================
   ADMIN UNLOCK
========================================================= */

adminUnlock?.addEventListener('click', async () => {
  const token = adminTokenInput?.value.trim() || ''

  if (!token) {
    setAdminStatus('Enter your owner key first.')
    return
  }

  if (adminUnlock instanceof HTMLButtonElement) {
    adminUnlock.disabled = true
    adminUnlock.textContent = 'CHECKING...'
  }

  try {
    const response = await fetch(RANTS_API, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    })

    const data = await response.json() as RantsResponse

    if (!response.ok || data.ok === false) {
      throw new Error(
        data.details || data.error || 'Invalid owner key',
      )
    }

    setAdminToken(token)

    rants = Array.isArray(data.rants) ? data.rants : rants

    if (adminTokenInput) {
      adminTokenInput.value = ''
    }

    updateOwnerView()
    renderRants()

    setAdminStatus('Your writing desk is ready ♡')
  } catch {
    clearAdminToken()
    updateOwnerView()

    setAdminStatus('That key did not work. Try again.')
  } finally {
    if (adminUnlock instanceof HTMLButtonElement) {
      adminUnlock.disabled = false
      adminUnlock.textContent = 'UNLOCK MY WRITING DESK ↗'
    }
  }
})

/* =========================================================
   ADMIN LOCK
========================================================= */

adminLock?.addEventListener('click', () => {
  clearAdminToken()
  updateOwnerView()
  renderRants()

  setAdminStatus('Your writing desk is locked.')
})

/* =========================================================
   PUBLISH RANT
========================================================= */

submitRant?.addEventListener('click', async () => {
  if (rantRequestInProgress) return

  if (!isAdminUnlocked()) {
    setRantFeedback('Unlock your writing desk first ♡')
    return
  }

  const title = rantTitle?.value.trim() || ''
  const message = rantMessage?.value.trim() || ''

  if (!title) {
    setRantFeedback('Give your little thought a title first ♡')
    return
  }

  if (!message) {
    setRantFeedback('A little thought needs some words first ♡')
    return
  }

  if (title.length > 100 || message.length > 5000) {
    setRantFeedback('That post is a little too long.')
    return
  }

  rantRequestInProgress = true

  if (submitRant instanceof HTMLButtonElement) {
    submitRant.disabled = true
    submitRant.textContent = 'PUBLISHING...'
  }

  try {
    const response = await fetch(RANTS_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminToken()}`,
      },
      body: JSON.stringify({
        name: 'aria',
        title,
        message,
      }),
    })

    const data = await response.json() as RantsResponse

    if (!response.ok || data.ok === false) {
      throw new Error(
        data.details || data.error || 'Could not publish this thought',
      )
    }

    if (rantTitle) rantTitle.value = ''
    if (rantMessage) rantMessage.value = ''

    if (rantCount) {
      rantCount.textContent = '0 / 5000'
    }

    setRantFeedback('Your little thought has found its place ♡')

    await loadRants()
  } catch (error) {
    setRantFeedback(
      error instanceof Error
        ? error.message
        : 'Could not publish this thought. Please try again.',
    )
  } finally {
    rantRequestInProgress = false

    if (submitRant instanceof HTMLButtonElement) {
      submitRant.disabled = false
      submitRant.textContent = 'PUBLISH MY THOUGHT ↗'
    }
  }
})

/* =========================================================
   DELETE RANT
========================================================= */

rantList?.addEventListener('click', async (event) => {
  const target = event.target

  if (!(target instanceof HTMLElement)) return
  if (!isAdminUnlocked()) return

  const button = target.closest<HTMLButtonElement>(
    '[data-delete-rant]',
  )

  if (!button) return

  const id = button.dataset.deleteRant

  if (!id) return

  if (!window.confirm('Delete this thought permanently?')) {
    return
  }

  try {
    const response = await fetch(RANTS_API, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAdminToken()}`,
      },
      body: JSON.stringify({ id }),
    })

    const data = await response.json() as RantsResponse

    if (!response.ok || data.ok === false) {
      throw new Error(
        data.details || data.error || 'Unable to delete this thought',
      )
    }

    setRantFeedback('Thought removed ♡')

    await loadRants()
  } catch (error) {
    setRantFeedback(
      error instanceof Error
        ? error.message
        : 'Could not delete this thought.',
    )
  }
})

updateOwnerView()
void loadRants()

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
   SCROLL EFFECTS
========================================================= */

const navLinks = document.querySelectorAll<HTMLAnchorElement>(
  '.main-nav a',
)

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
    {
      rootMargin: '-25% 0px -65% 0px',
    },
  )

  pageSections.forEach((section) => {
    sectionObserver.observe(section)
  })

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
    .forEach((element) => {
      revealObserver.observe(element)
    })
} else {
  document
    .querySelectorAll(
      '.content-section, .profile-section, .page-note',
    )
    .forEach((element) => {
      element.classList.add('is-visible')
    })
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

void refreshLiveData()

window.setInterval(() => {
  if (!document.hidden) {
    void refreshLiveData()
  }
}, REFRESH_INTERVAL)

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    void refreshLiveData()
  }
})

window.addEventListener('focus', () => {
  void refreshLiveData()
})

/* =========================================================
   READY
========================================================= */

document.documentElement.classList.add('archive-ready')