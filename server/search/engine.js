import axios from 'axios'
import { load } from 'cheerio'
import { getAllScrapers } from '../scrapers/loader.js'
import { searchTorrents } from './providers/torrent-provider.js'
import { searchDHT } from './providers/dht-provider.js'
import { searchLocalFiles } from './providers/files-provider.js'
import { searchWebStreams } from './providers/stream-provider.js'
import { searchScraperSites } from './providers/scraper-provider.js'

export class SearchEngine {
  constructor() {
    this.providers = new Map()
    this.index = []
    this.initialized = false
  }

  async init() {
    await this.loadScrapersIntoIndex()
    this.initialized = true
    console.log(`SearchEngine: ${this.index.length} scrapers indexed`)
  }

  async loadScrapersIntoIndex() {
    const scrapers = getAllScrapers()
    this.index = scrapers.map(s => ({
      id: s.id,
      name: s.name,
      url: s.url,
      type: s.type,
      keywords: [...s.name.toLowerCase().split(/\W+/), s.type, s.url.toLowerCase()],
      source: 'scraper',
    }))
  }

  async search(query, options = {}) {
    const {
      providers = ['scrapers', 'torrents', 'dht', 'webstreams', 'localfiles'],
      limit = 50,
      adultOnly = true,
      filterGay = false,
      sortBy = 'relevance',
    } = options

    const results = []

    // Run all provider searches in parallel
    const searches = []

    if (providers.includes('scrapers')) {
      searches.push(this.searchScrapers(query, filterGay))
    }
    if (providers.includes('torrents')) {
      searches.push(searchTorrents(query, { adultOnly, limit: Math.floor(limit / 2) }))
    }
    if (providers.includes('dht')) {
      searches.push(searchDHT(query, { limit: Math.floor(limit / 3) }))
    }
    if (providers.includes('webstreams')) {
      searches.push(searchWebStreams(query, { adultOnly, limit: Math.floor(limit / 2) }))
    }
    if (providers.includes('localfiles')) {
      searches.push(searchLocalFiles(query, { limit: Math.floor(limit / 2) }))
    }
    if (providers.includes('scrapesites')) {
      searches.push(searchScraperSites(query, { limit: Math.floor(limit / 3) }))
    }

    const allResults = await Promise.allSettled(searches)

    for (const result of allResults) {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        results.push(...result.value)
      }
    }

    // Deduplicate by URL
    const seen = new Set()
    const deduped = results.filter(r => {
      const key = r.url || r.magnet || r.id
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Sort by relevance or date
    if (sortBy === 'relevance') {
      return deduped.sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, limit)
    }
    return deduped.slice(0, limit)
  }

  async searchScrapers(query, filterGay = false) {
    const q = query.toLowerCase()
    let matches = this.index.filter(s => 
      s.keywords.some(kw => kw.includes(q)) ||
      s.name.toLowerCase().includes(q)
    )
    
    if (filterGay) {
      // Import and filter gay scrapers
    }

    return matches.slice(0, 20).map(s => ({
      id: s.id,
      title: s.name,
      url: s.url,
      type: s.type,
      source: 'scraper',
      score: this.calculateScore(s, q),
      description: `${s.type.toUpperCase()} scraper for ${s.url}`,
    }))
  }

  calculateScore(item, query) {
    const q = query.toLowerCase()
    let score = 0
    if (item.name.toLowerCase().includes(q)) score += 50
    if (item.name.toLowerCase() === q) score += 100
    if (item.url.toLowerCase().includes(q)) score += 20
    item.keywords?.forEach(kw => { if (kw.includes(q)) score += 10 })
    return score
  }

  // Unified search - searches everything at once
  async unifiedSearch(query) {
    return this.search(query, {
      providers: ['scrapers', 'torrents', 'webstreams', 'localfiles', 'scrapesites'],
      limit: 100,
      adultOnly: true,
    })
  }
}

export const searchEngine = new SearchEngine()
