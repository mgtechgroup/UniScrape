import axios from 'axios'
import { load } from 'cheerio'

// Web stream search providers (direct play)
const STREAM_SOURCES = [
  {
    name: 'Pornhub',
    search: async (query) => {
      try {
        const url = `https://www.pornhub.com/video/search?search=${encodeURIComponent(query)}`
        const { data } = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 15000,
        })
        const $ = load(data)
        const results = []
        $('.pcVideoListItem').each((i, el) => {
          if (i >= 10) return false
          const title = $(el).find('.title a').text().trim()
          const link = 'https://www.pornhub.com' + $(el).find('.title a').attr('href') || ''
          const duration = $(el).find('.duration').text().trim()
          const views = $(el).find('.views var').text().trim()
          const img = $(el).find('img').attr('data-thumb_url') || $(el).find('img').attr('src') || ''
          if (title) results.push({
            title, url: link, duration, views, thumbnail: img,
            source: 'Pornhub', score: 90, type: 'webstream',
          })
        })
        return results
      } catch { return [] }
    }
  },
  {
    name: 'XVideos',
    search: async (query) => {
      try {
        const url = `https://www.xvideos.com/?k=${encodeURIComponent(query)}`
        const { data } = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 15000,
        })
        const $ = load(data)
        const results = []
        $('.mozaique .thumb-block').each((i, el) => {
          if (i >= 10) return false
          const title = $(el).find('.title a').text().trim()
          const link = 'https://www.xvideos.com' + $(el).find('.title a').attr('href') || ''
          const duration = $(el).find('.duration').text().trim()
          if (title) results.push({
            title, url: link, duration,
            source: 'XVideos', score: 85, type: 'webstream',
          })
        })
        return results
      } catch { return [] }
    }
  },
  {
    name: 'XNXX',
    search: async (query) => {
      try {
        const url = `https://www.xnxx.com/search/${encodeURIComponent(query)}`
        const { data } = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 15000,
        })
        const $ = load(data)
        const results = []
        $('.mozaique .thumb-block').each((i, el) => {
          if (i >= 10) return false
          const title = $(el).find('.thumb-under a').text().trim()
          const link = 'https://www.xnxx.com' + $(el).find('.thumb-under a').attr('href') || ''
          if (title) results.push({
            title, url: link, source: 'XNXX', score: 80, type: 'webstream',
          })
        })
        return results
      } catch { return [] }
    }
  },
  {
    name: 'XHamster',
    search: async (query) => {
      try {
        const url = `https://xhamster.com/search/${encodeURIComponent(query)}`
        const { data } = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 15000,
        })
        const $ = load(data)
        const results = []
        $('.video-thumb').each((i, el) => {
          if (i >= 10) return false
          const title = $(el).find('.video-thumb__title').text().trim()
          const link = $(el).find('a.video-thumb__image-container').attr('href') || ''
          if (title) results.push({
            title, url: link, source: 'XHamster', score: 85, type: 'webstream',
          })
        })
        return results
      } catch { return [] }
    }
  },
  {
    name: 'RedTube',
    search: async (query) => {
      try {
        const url = `https://www.redtube.com/?search=${encodeURIComponent(query)}`
        const { data } = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 15000,
        })
        const $ = load(data)
        const results = []
        $('.video-box').each((i, el) => {
          if (i >= 10) return false
          const title = $(el).find('img').attr('alt') || ''
          const link = $(el).find('a').attr('href') || ''
          const duration = $(el).find('.duration').text().trim()
          if (title) results.push({
            title, url: link, duration, source: 'RedTube', score: 75, type: 'webstream',
          })
        })
        return results
      } catch { return [] }
    }
  },
  {
    name: 'YouPorn',
    search: async (query) => {
      try {
        const url = `https://www.youporn.com/search/?query=${encodeURIComponent(query)}`
        const { data } = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 15000,
        })
        const $ = load(data)
        const results = []
        $('.video-box').each((i, el) => {
          if (i >= 10) return false
          const title = $(el).find('.video-title').text().trim()
          const link = $(el).find('a').attr('href') || ''
          if (title) results.push({
            title, url: link, source: 'YouPorn', score: 80, type: 'webstream',
          })
        })
        return results
      } catch { return [] }
    }
  },
  {
    name: 'Motherless',
    search: async (query) => {
      try {
        const url = `https://motherless.com/term/videos/${encodeURIComponent(query)}?page=1`
        const { data } = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
          timeout: 15000,
        })
        const $ = load(data)
        const results = []
        $('.thumb').each((i, el) => {
          if (i >= 10) return false
          const title = $(el).find('.title').text().trim()
          const link = $(el).find('a').attr('href') || ''
          if (title) results.push({
            title, url: link, source: 'Motherless', score: 65, type: 'webstream',
          })
        })
        return results
      } catch { return [] }
    }
  },
]

export async function searchWebStreams(query, options = {}) {
  const { adultOnly = true, limit = 50 } = options
  const allResults = []

  const searches = STREAM_SOURCES.map(async source => {
    try {
      return await source.search(query)
    } catch {
      return []
    }
  })

  const settled = await Promise.allSettled(searches)
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      allResults.push(...result.value)
    }
  }

  return allResults.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, limit)
}

export { STREAM_SOURCES }
