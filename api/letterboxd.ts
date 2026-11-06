
type LetterboxdEntry = {
  title: string
  link: string
  date: string
  year: string
  rating: string
  liked: boolean
  image: string
}

const FEED_URL = 'https://letterboxd.com/ariaahhh/rss/'
const PROFILE_URL = 'https://letterboxd.com/ariaahhh/'

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .trim()
}

function getTag(item: string, tag: string): string {
  const escaped = tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const match = item.match(
    new RegExp(
      `<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}\\s*>`,
      'i'
    )
  )

  return match ? decodeXml(match[1]) : ''
}

function getImage(description: string, item: string): string {
  const html = decodeXml(description)

  return (
    html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1] ||
    item.match(/<media:thumbnail\b[^>]*\burl=["']([^"']+)["']/i)?.[1] ||
    ''
  )
}

function parseDiary(xml: string): LetterboxdEntry[] {
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]

  return items
    .map((match) => {
      const item = match[1]

      const filmTitle = getTag(item, 'letterboxd:filmTitle')
      const link = getTag(item, 'link')

      // Only include actual film diary entries.
      if (!filmTitle || !/letterboxd\.com\/[^/]+\/film\//i.test(link)) {
        return null
      }

      const description = getTag(item, 'description')
      const likedValue = getTag(item, 'letterboxd:memberLike')

      return {
        title: filmTitle,
        link,
        date:
          getTag(item, 'letterboxd:watchedDate') ||
          getTag(item, 'pubDate'),
        year: getTag(item, 'letterboxd:filmYear'),
        rating: getTag(item, 'letterboxd:memberRating'),
        liked: /true|1/i.test(likedValue),
        image: getImage(description, item),
      }
    })
    .filter((entry): entry is LetterboxdEntry => entry !== null)
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await fetch(FEED_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 ArchiveWebsite/1.0',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(20000),
    })

    if (!response.ok) {
      throw new Error(`Letterboxd returned HTTP ${response.status}`)
    }

    const xml = await response.text()

    if (!xml.includes('<rss') || !xml.includes('<item')) {
      throw new Error('Letterboxd returned an unexpected feed format')
    }

    const diary = parseDiary(xml)

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=900, stale-while-revalidate=3600'
    )

    return res.status(200).json({
      source: 'Letterboxd',
      profile: PROFILE_URL,
      updatedAt: new Date().toISOString(),
      count: diary.length,
      diary,
    })
  } catch (error) {
    console.error('Letterboxd feed error:', error)

    return res.status(502).json({
      error: 'Unable to load the Letterboxd feed',
      details:
        error instanceof Error ? error.message : String(error),
      diary: [],
    })
  }
}
