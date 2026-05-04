/**
 * Torrent updater service - monitors RSS feeds and auto-downloads new content
 * Cannibalized from Torrent-Updater, bzTorrent, OpenTor-X
 */
import Parser from 'rss-parser'
import axios from 'axios'
import { setProxies, getAxiosConfig } from './proxy-rotator.js'

const rssParser = new Parser()

const TORRENT_FEEDS = [
  { name: '1337x Movies', url: 'https://1337x.to/rss/full/1/' },
  { name: '1337x Adult', url: 'https://1337x.to/rss/full/47/' },
  { name: 'TorrentGalaxy Movies', url: 'https://torrentgalaxy.to/rss' },
  { name: 'YTS Movies', url: 'https://yts.mx/rss/0/all/all/0/en' },
  { name: 'EZTV', url: 'https://eztv.re/ezrss.xml' },
  { name: 'Nyaa Anime', url: 'https://nyaa.si/?page=rss' },
  { name: 'PornRips', url: 'https://pornrips.to/rss' },
  { name: 'MagnetDL', url: 'https://www.magnetdl.com/rss.xml' },
]

const SEARCH_PROVIDERS = [
  {
    name: 'TorrentGalaxy',
    search: async (q) => {
      const { data } = await axios.get(`https://torrentgalaxy.to/torrents.php?search=${encodeURIComponent(q)}&sort=seeders&order=desc`, getAxiosConfig())
      const results = []
      const regex = /\/torrent\/(\d+)\/[^"]+/g
      let m
      while ((m = regex.exec(data)) !== null) {
        results.push({ id: m[1], url: 'https://torrentgalaxy.to' + m[0], source: 'TorrentGalaxy' })
        if (results.length >= 25) break
      }
      return results
    }
  },
  {
    name: '1337x',
    search: async (q) => {
      const { data } = await axios.get(`https://1337x.to/search/${encodeURIComponent(q)}/1/`, getAxiosConfig())
      const results = []
      const regex = /\/torrent\/(\d+)\/[^"]+/g
      let m
      while ((m = regex.exec(data)) !== null) {
        results.push({ id: m[1], url: 'https://1337x.to' + m[0], source: '1337x' })
        if (results.length >= 25) break
      }
      return results
    }
  },
]

export class TorrentUpdater {
  constructor() {
    this.feeds = [...TORRENT_FEEDS]
    this.providers = [...SEARCH_PROVIDERS]
    this.cache = new Map()
  }

  async fetchFeed(feedName) {
    const feed = this.feeds.find(f => f.name === feedName)
    if (!feed) throw new Error(`Feed not found: ${feedName}`)
    
    if (this.cache.has(feedName)) {
      const cached = this.cache.get(feedName)
      if (Date.now() - cached.time < 300000) return cached.data
    }

    try {
      const data = await rssParser.parseURL(feed.url)
      this.cache.set(feedName, { data, time: Date.now() })
      return data
    } catch (e) {
      return { error: e.message }
    }
  }

  async searchAll(query) {
    const results = []
    for (const provider of this.providers) {
      try {
        const items = await provider.search(query)
        results.push(...items.slice(0, 10))
      } catch {}
    }
    return results
  }

  getFeeds() {
    return this.feeds
  }

  addFeed(name, url) {
    if (!this.feeds.find(f => f.name === name)) {
      this.feeds.push({ name, url })
    }
  }
}

export const torrentUpdater = new TorrentUpdater()
