type VercelRequest = {
  method?: string
}

type VercelResponse = {
  setHeader(name: string, value: string): void
  status(code: number): VercelResponse
  json(body: unknown): VercelResponse
}

type SubstackPost = {
  id: string
  title: string
  link: string
  date: string
  description: string
  image: string
}

const PUBLICATION = 'aryaahhh'

const FEED_URL = `https://${PUBLICATION}.substack.com/feed`
const PROFILE_URL = `https://substack.com/@${PUBLICATION}`
const PUBLICATION_URL = `https://${PUBLICATION}.substack.com`

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, number: string) =>
      String.fromCodePoint(Number(number)),
    )
    .replace(/&#x([\da-f]+);/gi, (_, number: string) =>
      String.fromCodePoint(parseInt(number, 16)),
    )
    .trim()
}

function getTag(item: string, tagName: string): string {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const tagPattern = tagName.includes(':')
    ? escaped
    : `(?:[\\w.-]+:)?${escaped}`

  const match = item.match(
    new RegExp(
      `<${tagPattern}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tagPattern}\\s*>`,
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

function getImage(content: string, item: string): string {
  const html = decodeXml(content)

  const image =
    item.match(/<enclosure\b[^>]*\burl=["']([^"']+)["']/i)?.[1] ||
    item.match(/<media:content\b[^>]*\burl=["']([^"']+)["']/i)?.[1] ||
    html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1] ||
    ''

  return decodeXml(image)
}

function parsePosts(xml: string): SubstackPost[] {
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]

  return items
    .map((match, index) => {
      const item = match[1]

      const content =
        getTag(item, 'content:encoded') ||
        getTag(item, 'description')

      const title = stripHtml(getTag(item, 'title'))
      const link = getTag(item, 'link').trim()

      const date =
        getTag(item, 'pubDate') ||
        getTag(item, 'published') ||
        getTag(item, 'dc:date')

      const guid =
        getTag(item, 'guid') ||
        link ||
        `substack-${index}`

      return {
        id: guid,
        title,
        link,
        date,
        description: stripHtml(content).slice(0, 260),
        image: getImage(content, item),
      }
    })
    .filter((post) =>
      Boolean(
        post.title &&
        /^https:\/\//i.test(post.link),
      ),
    )
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
      throw new Error(`Substack returned HTTP ${response.status}`)
    }

    const xml = await response.text()

    if (!/<rss\b/i.test(xml)) {
      throw new Error('Substack did not return a valid RSS feed')
    }

    const posts = parsePosts(xml)

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=900, stale-while-revalidate=3600',
    )

    res.setHeader('Content-Type', 'application/json; charset=utf-8')

    return res.status(200).json({
      ok: true,
      source: 'Substack',
      profile: PROFILE_URL,
      publication: PUBLICATION_URL,
      feed: FEED_URL,
      updatedAt: new Date().toISOString(),
      coverage: 'posts-returned-by-rss',
      count: posts.length,
      posts,
    })
  } catch (error) {
    console.error('Substack feed error:', error)

    res.setHeader('Cache-Control', 'no-store')

    return res.status(502).json({
      ok: false,
      source: 'Substack',
      error: 'Unable to load the Substack feed',
      details:
        error instanceof Error
          ? error.message
          : String(error),
      posts: [],
    })
  }
}