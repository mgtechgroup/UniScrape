import express from 'express'
import { getAllScrapers, getScraper } from '../scrapers/loader.js'

export function plexPlugin() {
  const router = express.Router()

  // Plex metadata agent endpoint
  router.post('/api/search', async (req, res) => {
    const { title, year, type } = req.body
    
    const scrapers = getAllScrapers()
      .filter(s => s.enabled && s.type === (type || 'scene'))
      .slice(0, 10)

    res.json({
      agent: 'com.uniscrape.plex',
      results: scrapers.map(s => ({
        id: s.id,
        name: s.name,
        url: s.url,
        scraper: true,
        score: 100,
      })),
    })
  })

  router.post('/api/metadata/:scraperId', async (req, res) => {
    const scraper = getScraper(req.params.scraperId)
    const { query } = req.body

    if (!scraper) return res.status(404).json({ error: 'Scraper not found' })

    try {
      const result = await executeScraper(scraper, query)
      res.json(result)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // Plex scanner info
  router.get('/api/scanners', (req, res) => {
    res.json({
      scanners: getAllScrapers().map(s => ({
        id: s.id,
        name: s.name,
        type: s.type,
        url: s.url,
      })),
    })
  })

  return router
}

async function executeScraper(scraper, query) {
  // In production: execute the scraper YAML rules or Python script
  return {
    scraper: scraper.name,
    query,
    title: `Results from ${scraper.name}`,
    performers: [],
    tags: [],
    studio: scraper.name,
    url: scraper.url,
  }
}
