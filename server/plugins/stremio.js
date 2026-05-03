import express from 'express'
import { getAllScrapers, getGayScrapers } from '../scrapers/loader.js'

export function stremioPlugin() {
  const router = express.Router()
  
  const MANIFEST = {
    id: 'org.uniscrape.stremio',
    version: '1.0.0',
    name: 'UniScrape',
    description: 'Universal adult media scraper - 800+ sources',
    catalogs: [
      { id: 'uniscrape_scenes', type: 'movie', name: 'Scenes', extra: [{ name: 'search', isRequired: false }, { name: 'genre', isRequired: false }] },
      { id: 'uniscrape_performers', type: 'movie', name: 'By Performer', extra: [{ name: 'search' }] },
      { id: 'uniscrape_gay', type: 'movie', name: 'Gay / Queer', extra: [{ name: 'search', isRequired: false }, { name: 'genre', isRequired: false }] },
      { id: 'uniscrape_torrents', type: 'movie', name: 'Torrents', extra: [{ name: 'search' }] },
    ],
    resources: ['catalog', 'meta', 'stream'],
    types: ['movie'],
    idPrefixes: ['tt', 'uniscrape_'],
    logo: 'https://blbgensixai.club/logo.png',
    behaviorHints: { adult: true },
  }

  router.get('/manifest.json', (req, res) => res.json(MANIFEST))

  router.get('/catalog/:type/:id.json', (req, res) => {
    const { id } = req.params
    const search = req.query.search || ''
    const genre = req.query.genre || ''
    
    let scrapers = getAllScrapers()
    
    if (id === 'uniscrape_gay') {
      scrapers = getGayScrapers()
    } else if (id === 'uniscrape_torrents') {
      scrapers = scrapers.filter(s => s.name.toLowerCase().includes('torrent'))
    }

    if (search) {
      scrapers = scrapers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    }

    const metas = scrapers.map(s => ({
      id: `uniscrape_${s.id}`,
      type: 'movie',
      name: s.name,
      releaseInfo: s.type,
      poster: `https://via.placeholder.com/300x450/8B5CF6/FFFFFF?text=${encodeURIComponent(s.name.substring(0, 20))}`,
      description: `${s.type.toUpperCase()} scraper — ${s.url}`,
    }))

    res.json({ metas })
  })

  router.get('/meta/:type/:id.json', (req, res) => {
    const { id } = req.params
    const scraperId = id.replace('uniscrape_', '')
    const scraper = getAllScrapers().find(s => s.id === scraperId)
    
    if (!scraper) return res.json({ meta: null })
    
    res.json({
      meta: {
        id,
        type: 'movie',
        name: scraper.name,
        releaseInfo: scraper.type,
        website: scraper.url,
        description: `Scrape ${scraper.type}s from ${scraper.url}`,
      }
    })
  })

  router.get('/stream/:type/:id.json', (req, res) => {
    const { id } = req.params
    const scraperId = id.replace('uniscrape_', '')
    const scraper = getAllScrapers().find(s => s.id === scraperId)
    
    res.json({
      streams: [{
        name: `[UniScrape] ${scraper?.name || id}`,
        title: `Scrape via UniScrape`,
        url: `http://localhost:${process.env.PORT || 8085}/api/v1/scrape/${scraperId}`,
        behaviorHints: { notWebReady: true },
      }]
    })
  })

  return router
}
