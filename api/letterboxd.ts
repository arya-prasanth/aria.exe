type VercelRequest = {
  method?: string
}

type VercelResponse = {
  setHeader(name: string, value: string): void
  status(code: number): VercelResponse
  json(body: unknown): VercelResponse
}

type DiaryItem = {
  id: string
  title: string
  year: number | null
  date: string
  rating: number | null
  liked: boolean
  image: string
  link: string
}

const USERNAME = 'ariaahhh'
const FEED_URL = `https://letterboxd.com/${USERNAME}/rss/`
const PROFILE_URL = `https://letterboxd.com/${USERNAME}/`

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n: string) =>
      String.fromCodePoint(Number(n)),
    )
    .replace(/&#x([\da-f]+);/gi, (_, n: string) =>
      String.fromCodePoint(parseInt(n, 16)),
    )
    .trim()
}

function getTag(item: string, tagName: string): string {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const match = item.match(
    new RegExp(
      `<(?:[\\w.-]+:)?${escaped}\\b[^>]*>([\\s\\S]*?)<\\/(?:[\\w.-]+:)?${escaped}\\s*>`,
      'i',
    ),
  )

  return match ? decodeXml(match[1]) : ''
}

function stripHtml(value: string): string {
  return decodeXml(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getImage(item: string): string {
  const image =
    item.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1] ||
    item.match(/<enclosure\b[^>]*\burl=["']([^"']+)["']/i)?.[1] ||
    item.match(/<media:content\b[^>]*\burl=["']([^"']+)["']/i)?.[1] ||
    ''

  return decodeXml(image)
}

function parseDiary(xml: string): DiaryItem[] {
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]

  return items
    .map((match, index) => {
      const item = match[1]

      const guid =
        getTag(item, 'guid') ||
        `letterboxd-${index}`

      const title =
        getTag(item, 'filmTitle') ||
        getTag(item, 'title') ||
        'Untitled film'

      const yearValue = getTag(item, 'filmYear')
      const date =
        getTag(item, 'watchedDate') ||
        getTag(item, 'pubDate') ||
        ''

      const ratingValue = getTag(item, 'memberRating')
      const ratingNumber = ratingValue ? Number(ratingValue) : null

      const likedValue =
        getTag(item, 'memberLike') ||
        getTag(item, 'memberLiked') ||
        ''

      const link = getTag(item, 'link')
      const review = stripHtml(getTag(item, 'description'))

      const isList = guid.includes('letterboxd-list-')

      if (isList) return null

      return {
        id: guid,
        title: stripHtml(title),
        year: yearValue ? Number(yearValue) : null,
        date,
        rating:
          ratingNumber !== null && Number.isFinite(ratingNumber)
            ? ratingNumber
            : null,
        liked: /^(true|1|yes)$/i.test(likedValue.trim()),
        image: getImage(item),
        link: link.trim(),
      }
    })
    .filter((entry): entry is DiaryItem => entry !== null)
    .filter((entry) => Boolean(entry.title && entry.link))
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method && req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({
      ok: false,
      error: 'Method not allowed',
    })
  }

  try {
    const response = await fetch(FEED_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; aria.exe archive reader)',
        Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!response.ok) {
      throw new Error(`Letterboxd returned HTTP ${response.status}`)
    }

    const xml = await response.text()

    if (!/<rss\b/i.test(xml) || !/<item\b/i.test(xml)) {
      throw new Error(
        'Letterboxd did not return a valid RSS feed. The profile may be temporarily blocked.',
      )
    }

    const diary = parseDiary(xml)

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=900, stale-while-revalidate=3600',
    )
    res.setHeader('Content-Type', 'application/json; charset=utf-8')

    return res.status(200).json({
      ok: true,
      source: 'Letterboxd',
      username: USERNAME,
      profile: PROFILE_URL,
      feed: FEED_URL,
      updatedAt: new Date().toISOString(),
      coverage: 'recent-feed-window',
      count: diary.length,
      diary,
      stats: {
        allTimeWatched: null,
        distinctFilmsThisYear: null,
        likedFilms: null,
        watchlist: null,
      },
    })
  } catch (error) {
    console.error('Letterboxd feed error:', error)

    res.setHeader('Cache-Control', 'no-store')

    return res.status(502).json({
      ok: false,
      source: 'Letterboxd',
      error: 'Unable to load the Letterboxd feed',
      details:
        error instanceof Error
          ? error.message
          : String(error),
      diary: [],
    })
  }
}