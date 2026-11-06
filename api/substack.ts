
type SubstackPost = {
  title: string
  link: string
  date: string
  description: string
  image: string
}

const FEED_URL = 'https://aryaahhh.substack.com/feed'
const PROFILE_URL = 'https://substack.com/@aryaahhh'

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

function getImage(content: string, item: string): string {
  const html = decodeXml(content)

  return (
    item.match(/<enclosure\b[^>]*\burl=["']([^"']+)["']/i)?.[1] ||
    html.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1] ||
    ''
  )
}

function stripHtml(value: string): string {
  return decodeXml(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parsePosts(xml: string): SubstackPost[] {
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]

  return items
    .map((match) => {
      const item = match[1]

      const content =
        getTag(item, 'content:encoded') ||
        getTag(item, 'description')

      return {
        title: stripHtml(getTag(item, 'title')),
        link: getTag(item, 'link'),
        date: getTag(item, 'pubDate'),
        description: stripHtml(content),
        image: getImage(content, item),
      }
    })
    .filter((post) => post.title && post.link)
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
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
      throw new Error(`Substack returned HTTP ${response.status}`)
    }

    const xml = await response.text()

    if (!/<(?:rss|feed)\b/i.test(xml)) {
      throw new Error(
        'The Substack URL did not return an RSS or Atom feed. Verify the publication URL.'
      )
    }

    const posts = parsePosts(xml)

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=900, stale-while-revalidate=3600'
    )

    return res.status(200).json({
      source: 'Substack',
      profile: PROFILE_URL,
      updatedAt: new Date().toISOString(),
      count: posts.length,
      posts,
    })
  } catch (error) {
    console.error('Substack feed error:', error)

    return res.status(502).json({
      error: 'Unable to load the Substack feed',
      details:
        error instanceof Error ? error.message : String(error),
      posts: [],
    })
  }
}
