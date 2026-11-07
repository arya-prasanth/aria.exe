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

const profileStats = {
  moviesAllTime: letterboxdSnapshot.moviesAllTime as number | null,
  moviesThisYear: letterboxdSnapshot.moviesThisYear as number | null,
  watchlist: null as number | null,
  likedMovies: letterboxdSnapshot.likedMovies as number | null,
  substackReads: null as number | null,
}

/* =========================================================
   STATIC CONTENT
========================================================= */

const topFour: Film[] = [
  {
    title: 'Past Lives',
    year: '2023',
    poster:
      'https://image.tmdb.org/t/p/w1280/k3waqVXSnvCZWfJYNtdamTgTtTA.jpg',
  },
  {
    title: 'Your Name',
    year: '2016',
    poster:
      'https://image.tmdb.org/t/p/w1280/vfJFJPepRKapMd5G2ro7klIRysq.jpg',
  },
  {
    title: "Harry Potter and the Philosopher's Stone",
    year: '2001',
    poster:
      'https://image.tmdb.org/t/p/w1280/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg',
  },
  {
    title: 'Spirited Away',
    year: '2001',
    poster:
      'https://image.tmdb.org/t/p/w1280/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
  },
  {
    title: 'The Haunting of Hill House',
    year: '2018',
    poster:
      'https://image.tmdb.org/t/p/w1280/nWPZb800NCGiDPNGsKCfY0w44Z2.jpg',
  },
  {
    title: 'The Vampire Diaries',
    year: '2009',
    poster:
      'https://image.tmdb.org/t/p/original/nxUfTJ0LnIVpMohncfodChyOBiz.jpg',
  },
]

const favouriteReads: Read[] = [
  {
    title: 'if a birds falls in love with a fish, where will they live?',
    author: 'You had me at Hello',
    description:
      'A tender piece about love, incompatibility, and knowing when not to lose yourself.',
    category: 'LOVE & LIFE',
    url: 'https://seizei.substack.com/p/if-a-birds-falls-in-love-with-a-fish',
  },
  {
    title:
      'nobody will ever fully understand you. that’s the best news you’ll read this year.',
    author: 'ixcarus',
    description:
      'On self-understanding, connection, and accepting that nobody can hold every part of us.',
    category: 'SELF-DISCOVERY',
    url: 'https://ixcarus.substack.com/p/nobody-will-ever-fully-understand',
  },
  {
    title: 'the poetry and science behind neuroplasticity',
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
  if (rating === undefined || !Number.isFinite(rating)) return ''

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
    return value.toUpperCase()
  }

  return parsed
    .toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase()
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
   RENDER FUNCTIONS
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
        <span>✿</span>
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
        READ ↗
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

const updateLetterboxdStats = (): void => {
  updateStat('moviesAllTime', profileStats.moviesAllTime)
  updateStat('moviesThisYear', profileStats.moviesThisYear)
  updateStat('watchlist', profileStats.watchlist)
  updateStat('likedMovies', profileStats.likedMovies)
}

/* =========================================================
   LETTERBOXD API
========================================================= */

const fetchLetterboxd = async (): Promise<void> => {
  try {
    const response = await fetch(LETTERBOXD_API, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
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
   SUBSTACK API
========================================================= */

const fetchSubstack = async (): Promise<void> => {
  try {
    const response = await fetch(SUBSTACK_API, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
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
   MAIN WEBSITE HTML
========================================================= */

const currentYear = new Date().getFullYear()

app.innerHTML = `
  <div class="archive-shell" id="archive-top">

    <header class="site-header">
      <div class="header-inner">

        <a class="site-logo" href="#archive-top" aria-label="The Archive home">
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

      <!-- PROFILE -->

      <section class="profile-section" id="profile">

        <div class="profile-banner">
          <div class="banner-pattern"></div>

          <span class="banner-doodle doodle-one">✿</span>
          <span class="banner-doodle doodle-two">♡</span>
          <span class="banner-doodle doodle-three">✧</span>

          <span class="banner-label">A LITTLE COLLECTION OF EVERYTHING</span>
          <span class="banner-title">a little universe.</span>
          <span class="banner-coordinate">a tiny corner of the internet ♡</span>

          <button
            class="stardust-trigger"
            id="open-stardust"
            type="button"
            aria-label="Play Stardust Collector"
            title="wanna play a game? ✦"
          >
            <span>✦</span>
            <span class="sparkle-prompt">wanna play a game?</span>
          </button>
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
            <h1 class="aria-name">aria</h1>
            <p>collecting stories, films and little pieces of life.</p>
          </div>

        </div>

        <p class="profile-bio">
          A small corner of the internet for the things I write, the things I read, the films I watch and the thoughts that refuse to leave my head.
        </p>

        <div class="stats-grid" aria-label="Profile statistics">

          <div class="stat-card" data-stat="moviesAllTime">
            <strong data-count="861">861</strong>
            <span>FILMS WATCHED</span>
            <small>♡ ALL-TIME</small>
          </div>

          <div class="stat-card" data-stat="moviesThisYear">
            <strong data-count="91">91</strong>
            <span>WATCHED IN ${currentYear}</span>
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

            <a href="${safeURL(substackURL)}" target="_blank" rel="noopener noreferrer">
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
            <h3>my top five. plus one</h3>
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

          <a href="${safeURL(letterboxdURL)}" target="_blank" rel="noopener noreferrer">
            FULL FILM DIARY ↗
          </a>

          <a href="${safeURL('https://letterboxd.com/ariaahhh/watchlist/')}" target="_blank" rel="noopener noreferrer">
            MY WATCHLIST ↗
          </a>

          <a href="${safeURL('https://letterboxd.com/ariaahhh/likes/')}" target="_blank" rel="noopener noreferrer">
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
            <h3>the things on my mind.</h3>
            <p>
              Personal notes, midnight thoughts, tiny observations,
              dramatic paragraphs and everything in between.
              A little collection of things on my mind.
            </p>
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

      <!-- TINY GARDEN -->

      <section class="content-section tiny-garden-section" id="tiny-garden">

        <div class="section-heading">
          <div>
            <span class="section-index">A LITTLE PATCH OF PEACE ✿</span>
            <h2>tiny <em>garden.</em></h2>
          </div>

          <span class="game-side-note">A LITTLE WATER GOES A LONG WAY</span>
        </div>

        <div class="garden-card">

          <div class="garden-copy">
            <span class="eyebrow">A QUIET LITTLE CORNER</span>
            <h3>water a flower. watch it bloom.</h3>

            <p>
              A tiny garden with no tasks and no rush.
              Pick a flower, give it a little water,
              and watch it come alive.
            </p>

            <p class="garden-feedback" id="garden-feedback" aria-live="polite">
              choose a flower and give it a drink ♡
            </p>

            <button
              class="garden-water-button"
              id="garden-water-button"
              type="button"
              disabled
            >
              ☁ WATER THIS FLOWER
            </button>
          </div>

          <div class="garden-visual">

            <div class="garden-sky">
              <span class="garden-moon">☾</span>
              <span class="garden-star garden-star-one">✦</span>
              <span class="garden-star garden-star-two">✧</span>
              <span class="garden-cloud">﹏</span>
            </div>

            <div class="garden-ground">

              <div
                class="garden-flower-grid"
                id="garden-flower-grid"
                aria-label="Choose a flower to water"
              >
                <button class="garden-flower" type="button" data-flower="0" aria-pressed="false"><span>🌷</span></button>
                <button class="garden-flower" type="button" data-flower="1" aria-pressed="false"><span>🌼</span></button>
                <button class="garden-flower" type="button" data-flower="2" aria-pressed="false"><span>🌸</span></button>
                <button class="garden-flower" type="button" data-flower="3" aria-pressed="false"><span>🌻</span></button>
                <button class="garden-flower" type="button" data-flower="4" aria-pressed="false"><span>🪻</span></button>
                <button class="garden-flower" type="button" data-flower="5" aria-pressed="false"><span>🌺</span></button>
              </div>

            </div>

            <div class="garden-water-status">
              <span>✿</span>
              <strong id="garden-water-count">0</strong>
              little waterings
            </div>

          </div>
        </div>
      </section>

    </main>

    <!-- STARDUST GAME MODAL -->

    <div class="stardust-modal" id="stardust-modal" hidden>

      <div class="stardust-backdrop" data-close-stardust></div>

      <section
        class="stardust-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stardust-title"
      >

        <button
          class="stardust-close"
          id="close-stardust"
          type="button"
          aria-label="Close game"
        >
          ×
        </button>

        <h2 id="stardust-title">little stardust collector.</h2>

        <p class="stardust-instructions">
          Catch the falling stars, hearts and flowers before they disappear.
          You have 30 seconds. ♡
        </p>

        <div class="stardust-scorebar">
          <span>✦ SCORE <strong id="stardust-score">0</strong></span>
          <span>TIME <strong id="stardust-timer">30</strong></span>
          <span>BEST <strong id="stardust-best">0</strong></span>
        </div>

        <div class="stardust-field" id="stardust-field">

          <div class="stardust-start">
            <span>✦</span>
            <p>ready to collect a little magic?</p>
            <button id="stardust-start" type="button">LET'S PLAY ↗</button>
          </div>

        </div>

        <p class="stardust-result" id="stardust-result" aria-live="polite">
          a little moment of magic, just for you.
        </p>

      </section>
    </div>

    <!-- FOOTER -->

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

        <a href="${safeURL(letterboxdURL)}" target="_blank" rel="noopener noreferrer">
          LETTERBOXD ↗
        </a>

        <a href="${safeURL(substackURL)}" target="_blank" rel="noopener noreferrer">
          SUBSTACK ↗
        </a>

        <a href="${safeURL(spotifyURL)}" target="_blank" rel="noopener noreferrer">
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
   INITIAL STATS
========================================================= */

updateLetterboxdStats()

/* =========================================================
   PUBLIC RANT ROOM
========================================================= */

const rantList = document.getElementById('rant-list')

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

        ${title ? `<h3>${escapeHTML(title)}</h3>` : ''}

        <p>${escapeHTML(rant.message).replace(/\n/g, '<br>')}</p>

      </article>
    `
  }).join('')
}

const loadRants = async (): Promise<void> => {
  try {
    const response = await fetch(RANTS_API, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })

    const data = await response.json() as RantsResponse

    if (!response.ok || data.ok === false || data.error) {
      throw new Error(
        data.details || data.error || 'Unable to load thoughts',
      )
    }

    rants = Array.isArray(data.rants) ? data.rants : []
    renderRants()
  } catch (error) {
    console.error('Rant loading failed:', error)
  }
}

void loadRants()

/* =========================================================
   LITTLE STARDUST COLLECTOR
========================================================= */

const stardustModal = document.getElementById('stardust-modal')
const stardustField = document.getElementById('stardust-field')
const stardustStart = document.getElementById('stardust-start')
const stardustScore = document.getElementById('stardust-score')
const stardustTimer = document.getElementById('stardust-timer')
const stardustBest = document.getElementById('stardust-best')
const stardustResult = document.getElementById('stardust-result')

const openStardust = document.getElementById('open-stardust')
const closeStardust = document.getElementById('close-stardust')

let stardustPoints = 0
let stardustSeconds = 30
let stardustSpawnTimer = 0
let stardustClockTimer = 0
let stardustRunning = false

let stardustOpener: HTMLElement | null = null

const getStardustBest = (): number => {
  try {
    const value = Number(localStorage.getItem('aria-stardust-best') || 0)
    return Number.isFinite(value) ? Math.max(0, value) : 0
  } catch {
    return 0
  }
}

const updateStardustScore = (): void => {
  if (stardustScore) {
    stardustScore.textContent = String(stardustPoints)
  }

  if (stardustTimer) {
    stardustTimer.textContent = String(stardustSeconds)
  }

  if (stardustBest) {
    stardustBest.textContent = String(getStardustBest())
  }
}

const clearStardustTimers = (): void => {
  window.clearInterval(stardustSpawnTimer)
  window.clearInterval(stardustClockTimer)

  stardustSpawnTimer = 0
  stardustClockTimer = 0
}

const finishStardust = (): void => {
  if (!stardustRunning) return

  stardustRunning = false
  clearStardustTimers()

  const best = Math.max(stardustPoints, getStardustBest())

  try {
    localStorage.setItem('aria-stardust-best', String(best))
  } catch {
    // The game still works if local storage is unavailable.
  }

  stardustField
    ?.querySelectorAll('.falling-treasure')
    .forEach((item) => item.remove())

  const startPanel =
    stardustField?.querySelector<HTMLElement>('.stardust-start')

  if (startPanel) startPanel.hidden = false

  const message =
    stardustPoints >= 30
      ? 'you caught a whole pocketful of magic. the stars adore you ✨'
      : stardustPoints >= 15
        ? 'a lovely little collection. you have a talent for finding magic ♡'
        : stardustPoints >= 5
          ? 'a few little wishes found their way to you. keep looking ✿'
          : 'even one tiny star is worth catching. thanks for stopping by ♡'

  if (stardustResult) {
    stardustResult.textContent =
      `${message} · ${stardustPoints} points`
  }

  if (stardustStart) {
    stardustStart.textContent = 'PLAY AGAIN ↻'
    stardustStart.hidden = false
  }

  updateStardustScore()
}

const spawnStardust = (): void => {
  if (!stardustField || !stardustRunning) return

  const treasures = [
    { icon: '✦', points: 1, kind: 'star' },
    { icon: '♡', points: 2, kind: 'heart' },
    { icon: '✿', points: 3, kind: 'flower' },
  ]

  const treasure =
    treasures[Math.floor(Math.random() * treasures.length)]

  const item = document.createElement('button')

  item.type = 'button'
  item.className = `falling-treasure treasure-${treasure.kind}`
  item.textContent = treasure.icon
  item.dataset.points = String(treasure.points)
  item.setAttribute('aria-label', `Catch ${treasure.kind}`)
  item.style.left = `${5 + Math.random() * 86}%`

  item.addEventListener(
    'animationend',
    () => item.remove(),
    { once: true },
  )

  stardustField.append(item)
}

const startStardust = (): void => {
  if (!stardustField || !stardustModal || stardustModal.hidden) return

  clearStardustTimers()

  stardustField
    .querySelectorAll('.falling-treasure')
    .forEach((item) => item.remove())

  const startPanel =
    stardustField.querySelector<HTMLElement>('.stardust-start')

  if (startPanel) startPanel.hidden = true

  stardustPoints = 0
  stardustSeconds = 30
  stardustRunning = true

  if (stardustResult) {
    stardustResult.textContent = 'catch as many as you can ♡'
  }

  if (stardustStart) {
    stardustStart.hidden = true
  }

  updateStardustScore()
  spawnStardust()

  stardustSpawnTimer = window.setInterval(spawnStardust, 520)

  stardustClockTimer = window.setInterval(() => {
    if (!stardustRunning) return

    stardustSeconds -= 1
    updateStardustScore()

    if (stardustSeconds <= 0) {
      finishStardust()
    }
  }, 1000)
}

const openStardustGame = (): void => {
  if (!stardustModal) return

  stardustOpener =
    openStardust instanceof HTMLElement ? openStardust : null

  stardustModal.hidden = false
  updateStardustScore()

  window.setTimeout(() => {
    closeStardust?.focus()
  }, 50)
}

const closeStardustGame = (): void => {
  clearStardustTimers()
  stardustRunning = false

  stardustField
    ?.querySelectorAll('.falling-treasure')
    .forEach((item) => item.remove())

  if (stardustModal) {
    stardustModal.hidden = true
  }

  stardustOpener?.focus()
}

openStardust?.addEventListener('click', openStardustGame)
closeStardust?.addEventListener('click', closeStardustGame)

stardustModal
  ?.querySelectorAll('[data-close-stardust]')
  .forEach((element) => {
    element.addEventListener('click', closeStardustGame)
  })

stardustStart?.addEventListener('click', startStardust)

stardustField?.addEventListener('click', (event) => {
  const target = event.target

  if (!(target instanceof HTMLElement)) return
  if (!stardustRunning) return

  const treasure = target.closest<HTMLButtonElement>(
    '.falling-treasure',
  )

  if (!treasure) return

  stardustPoints += Number(treasure.dataset.points || 1)

  treasure.remove()
  updateStardustScore()
})

/* =========================================================
   STARDUST KEYBOARD ACCESSIBILITY
========================================================= */

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return
  if (!stardustModal || stardustModal.hidden) return

  closeStardustGame()
})

updateStardustScore()

/* =========================================================
   LITTLE WATERING GARDEN
========================================================= */

const GARDEN_STORAGE_KEY = 'aria-little-garden-waterings-v1'

const gardenGrid = document.getElementById('garden-flower-grid')

const gardenWaterButton =
  document.getElementById('garden-water-button') as HTMLButtonElement | null

const gardenFeedback = document.getElementById('garden-feedback')
const gardenWaterCount = document.getElementById('garden-water-count')

let selectedGardenFlower: number | null = null
let gardenWaterings = 0

try {
  const storedWaterings = Number(
    localStorage.getItem(GARDEN_STORAGE_KEY) || 0,
  )

  gardenWaterings =
    Number.isFinite(storedWaterings)
      ? Math.max(0, Math.floor(storedWaterings))
      : 0
} catch {
  gardenWaterings = 0
}

const setGardenFeedback = (message: string): void => {
  if (gardenFeedback) {
    gardenFeedback.textContent = message
  }
}

const updateGardenCount = (): void => {
  if (gardenWaterCount) {
    gardenWaterCount.textContent = String(gardenWaterings)
  }
}

gardenGrid?.addEventListener('click', (event) => {
  const target = event.target

  if (!(target instanceof HTMLElement)) return

  const flower = target.closest<HTMLButtonElement>('[data-flower]')
  if (!flower) return

  const flowerIndex = Number(flower.dataset.flower)

  if (
    !Number.isInteger(flowerIndex) ||
    flowerIndex < 0 ||
    flowerIndex > 5
  ) {
    return
  }

  selectedGardenFlower = flowerIndex

  gardenGrid
    .querySelectorAll<HTMLButtonElement>('.garden-flower')
    .forEach((item) => {
      const selected = item === flower

      item.classList.toggle('is-selected', selected)
      item.setAttribute('aria-pressed', String(selected))
    })

  if (gardenWaterButton) {
    gardenWaterButton.disabled = false
  }

  setGardenFeedback('this little flower is ready for a drink ♡')
})

gardenWaterButton?.addEventListener('click', () => {
  if (selectedGardenFlower === null || !gardenGrid) return

  const flower = gardenGrid.querySelector<HTMLButtonElement>(
    `[data-flower="${selectedGardenFlower}"]`,
  )

  if (!flower) return

  flower.classList.remove('is-watered')

  // Restart the bloom animation.
  void flower.offsetWidth

  flower.classList.add('is-watered')

  // Remove an earlier splash before creating another one.
  flower.querySelector('.garden-splash')?.remove()

  const splash = document.createElement('span')

  splash.className = 'garden-splash'
  splash.textContent = '💧'
  splash.setAttribute('aria-hidden', 'true')

  flower.append(splash)

  window.setTimeout(() => {
    splash.remove()
  }, 1100)

  gardenWaterings += 1

  try {
    localStorage.setItem(
      GARDEN_STORAGE_KEY,
      String(gardenWaterings),
    )
  } catch {
    // Watering still works when browser storage is unavailable.
  }

  updateGardenCount()

  setGardenFeedback(
    'a little drink for a little flower. look at it bloom! ✿',
  )
})

updateGardenCount()

/* =========================================================
   MOBILE NAVIGATION
========================================================= */

const mobileMenu = document.getElementById('mobile-menu')
const mainNav = document.getElementById('main-nav')

const closeMobileMenu = (): void => {
  mainNav?.classList.remove('nav-open')
  mobileMenu?.classList.remove('menu-open')
  mobileMenu?.setAttribute('aria-expanded', 'false')
}

mobileMenu?.addEventListener('click', () => {
  const isOpen = mainNav?.classList.toggle('nav-open') ?? false

  mobileMenu.classList.toggle('menu-open', isOpen)
  mobileMenu.setAttribute('aria-expanded', String(isOpen))
})

mainNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', closeMobileMenu)
})

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMobileMenu()
  }
})

/* =========================================================
   ACTIVE NAVIGATION + REVEAL ANIMATIONS
========================================================= */

const navLinks = document.querySelectorAll<HTMLAnchorElement>(
  '.main-nav a',
)

const pageSections = document.querySelectorAll<HTMLElement>(
  '#reads, #films, #rants',
)

const revealElements = document.querySelectorAll<HTMLElement>(
  '.content-section, .profile-section, .page-note',
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

  revealElements.forEach((element) => {
    revealObserver.observe(element)
  })
} else {
  revealElements.forEach((element) => {
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

      try {
        shelf.setPointerCapture(event.pointerId)
      } catch {
        // Pointer capture is optional.
      }
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
   PAGE READY
========================================================= */

document.documentElement.classList.add('archive-ready')