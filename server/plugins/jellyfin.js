import express from 'express'
import { getAllScrapers, getScraper } from '../scrapers/loader.js'

export function jellyfinPlugin() {
  const router = express.Router()

  // Jellyfin metadata provider API
  router.get('/api/providers', (req, res) => {
    res.json({
      providers: getAllScrapers().map(s => ({
        id: s.id,
        name: `UniScrape - ${s.name}`,
        type: s.type,
        supportedTypes: ['movie', 'adult'],
        url: s.url,
      })),
    })
  })

  router.get('/api/search', async (req, res) => {
    const { name, year, providerId } = req.query
    
    const results = []
    const scrapers = providerId 
      ? [getScraper(providerId)].filter(Boolean)
      : getAllScrapers().slice(0, 20)

    for (const s of scrapers) {
      results.push({
        id: s.id,
        name: s.name,
        provider: s.name,
        url: s.url,
        year: year || '',
        type: s.type,
      })
    }

    res.json({ results })
  })

  router.get('/api/metadata/:scraperId', async (req, res) => {
    const scraper = getScraper(req.params.scraperId)
    if (!scraper) return res.status(404).json({ error: 'Not found' })

    res.json({
      id: scraper.id,
      name: scraper.name,
      provider: `UniScrape/${scraper.name}`,
      url: scraper.url,
      metadata: {
        title: `Search on ${scraper.name}`,
        description: `${scraper.type} scraper`,
        studio: scraper.name,
      },
    })
  })

  // Jellyfin plugin manifest
  router.get('/manifest.json', (req, res) => {
    res.json({
      name: 'UniScrape',
      id: 'uniscrape.jellyfin',
      version: '1.0.0',
      description: 'Universal adult media scraper - 800+ sources',
      category: 'Metadata',
      owner: 'UniScrape',
      overview: 'Provides metadata scraping from 800+ adult media sources',
    })
  })

  return router
}
