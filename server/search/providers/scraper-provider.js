import axios from 'axios'
import { load } from 'cheerio'
import { getAllScrapers } from '../../scrapers/loader.js'

export async function searchScraperSites(query, options = {}) {
  const { limit = 30 } = options
  const scrapers = getAllScrapers().slice(0, 30)
  const results = []

  for (const scraper of scrapers) {
    if (results.length >= limit) break
    try {
      // For each scraper, try to scrape its search page
      const pageResults = await tryScrapeSearch(scraper, query)
      results.push(...pageResults.slice(0, 5))
    } catch {}
  }

  return results
}

async function tryScrapeSearch(scraper, query) {
  const url = scraper.url
  if (!url) return []

  try {
    const searchUrl = constructSearchUrl(url, query)
    const { data } = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000,
    })
    const $ = load(data)

    // Generic content extraction
    const results = []
    $('article, .item, .video, .scene, .card, .thumb, .result').each((i, el) => {
      if (i >= 3) return false
      const title = $(el).find('h1, h2, h3, .title, .name').first().text().trim()
      const link = $(el).find('a').first().attr('href')
      if (title && link) {
        results.push({
          title,
          url: link.startsWith('http') ? link : new URL(link, url).href,
          source: scraper.name,
          score: 50,
          type: 'scrapesite',
        })
      }
    })

    return results
  } catch {
    return []
  }
}

function constructSearchUrl(baseUrl, query) {
  // Try common search URL patterns
  const patterns = [
    `/search/${encodeURIComponent(query)}`,
    `/search?q=${encodeURIComponent(query)}`,
    `/search/${encodeURIComponent(query)}/`,
    `/s/${encodeURIComponent(query)}`,
    `/videos/${encodeURIComponent(query)}`,
  ]
  return new URL(patterns[0], baseUrl).href
}
