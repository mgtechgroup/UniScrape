import axios from 'axios'
import { load } from 'cheerio'

// Public torrent search sites
const TORRENT_SOURCES = [
  {
    name: '1337x',
    search: async (query) => {
      try {
        const url = `https://1337x.to/search/${encodeURIComponent(query)}/1/`
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 })
        const $ = load(data)
        const results = []
        $('table.table-list tbody tr').each((i, el) => {
          if (i >= 10) return false
          const name = $(el).find('td.name a').eq(1).text().trim()
          const link = 'https://1337x.to' + $(el).find('td.name a').eq(1).attr('href') || ''
          const seeds = parseInt($(el).find('td.seeds').text().trim()) || 0
          const leeches = parseInt($(el).find('td.leeches').text().trim()) || 0
          const size = $(el).find('td.size').text().trim()
          if (name) results.push({ title: name, url: link, seeds, leeches, size, source: '1337x', score: seeds * 3, type: 'torrent' })
        })
        return results
      } catch { return [] }
    }
  },
  {
    name: 'TorrentGalaxy',
    search: async (query) => {
      try {
        const url = `https://torrentgalaxy.to/torrents.php?search=${encodeURIComponent(query)}&sort=seeders&order=desc`
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 })
        const $ = load(data)
        const results = []
        $('.tgxtable .tgxtablerow').each((i, el) => {
          if (i >= 10) return false
          const name = $(el).find('.tgxtablecell a').first().text().trim()
          const link = 'https://torrentgalaxy.to' + $(el).find('.tgxtablecell a').first().attr('href') || ''
          const seeds = parseInt($(el).find('[color="green"]').text().trim()) || 0
          if (name) results.push({ title: name, url: link, seeds, source: 'TorrentGalaxy', score: seeds * 2, type: 'torrent' })
        })
        return results
      } catch { return [] }
    }
  },
  {
    name: 'YTS',
    search: async (query) => {
      try {
        const url = `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}&limit=10&sort_by=seeds`
        const { data } = await axios.get(url, { timeout: 10000 })
        return (data.data?.movies || []).map(m => ({
          title: m.title,
          url: m.url,
          seeds: m.torrents?.[0]?.seeds || 0,
          size: m.torrents?.[0]?.size || '',
          source: 'YTS',
          score: (m.torrents?.[0]?.seeds || 0) * 2,
          type: 'torrent',
        }))
      } catch { return [] }
    }
  },
  {
    name: 'Eporner',
    search: async (query) => {
      try {
        const url = `https://www.eporner.com/search/${encodeURIComponent(query)}/`
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 })
        const $ = load(data)
        const results = []
        $('.mb').each((i, el) => {
          if (i >= 10) return false
          const name = $(el).find('.mb-title a').text().trim()
          const link = 'https://www.eporner.com' + $(el).find('.mb-title a').attr('href') || ''
          const duration = $(el).find('.mb-length').text().trim()
          if (name) results.push({ title: name, url: link, duration, source: 'Eporner', score: 80, type: 'webstream' })
        })
        return results
      } catch { return [] }
    }
  },
  {
    name: 'SpankBang',
    search: async (query) => {
      try {
        const url = `https://spankbang.com/s/${encodeURIComponent(query)}/`
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 })
        const $ = load(data)
        const results = []
        $('.video-item').each((i, el) => {
          if (i >= 10) return false
          const name = $(el).find('.n a').text().trim()
          const link = 'https://spankbang.com' + $(el).find('a').attr('href') || ''
          const duration = $(el).find('.l').text().trim()
          if (name) results.push({ title: name, url: link, duration, source: 'SpankBang', score: 70, type: 'webstream' })
        })
        return results
      } catch { return [] }
    }
  },
]

export async function searchTorrents(query, options = {}) {
  const { adultOnly = true, limit = 50 } = options
  const allResults = []

  const searches = TORRENT_SOURCES.map(async source => {
    try {
      const results = await source.search(query)
      return results
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

// Generate magnet links
export function generateMagnet(hash, title = '', trackers = []) {
  const PUB = [
    'udp://tracker.opentrackr.org:1337/announce',
    'udp://open.tracker.cl:1337/announce',
    'udp://tracker.openbittorrent.com:6969/announce',
    'udp://tracker.coppersurfer.tk:6969/announce',
    'http://tracker.bt4g.com:2095/announce',
  ]
  const all = [...trackers, ...PUB]
  return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(title)}&tr=${all.join('&tr=')}`
}
