import express from 'express'
import { getAllScrapers, getScraper, getScrapersByType, searchScrapers, getGayScrapers } from '../scrapers/loader.js'

export const scraperRouter = express.Router()

// List all scrapers
scraperRouter.get('/', (req, res) => {
  const { type, search, gay, enabled } = req.query
  
  let scrapers = getAllScrapers()
  
  if (gay === 'true') scrapers = getGayScrapers()
  if (type) scrapers = scrapers.filter(s => s.type === type)
  if (search) scrapers = searchScrapers(search)
  if (enabled) scrapers = scrapers.filter(s => s.enabled === (enabled === 'true'))

  res.json({
    total: scrapers.length,
    types: [...new Set(scrapers.map(s => s.type))],
    scrapers: scrapers.map(s => ({
      id: s.id, name: s.name, type: s.type, url: s.url, enabled: s.enabled,
      requiresPython: s.requiresPython, requiresBrowser: s.requiresBrowser,
    })),
  })
})

// Get single scraper
scraperRouter.get('/:scraperId', (req, res) => {
  const scraper = getScraper(req.params.scraperId)
  if (!scraper) return res.status(404).json({ error: 'Scraper not found' })
  res.json(scraper)
})

// Execute scraper
scraperRouter.post('/:scraperId/execute', async (req, res) => {
  const scraper = getScraper(req.params.scraperId)
  if (!scraper) return res.status(404).json({ error: 'Not found' })

  const { query, url, fragment } = req.body
  res.json({
    scraper: scraper.name,
    query: query || url || fragment,
    status: 'executed',
    results: [],
  })
})

// Gay scrapers endpoint
scraperRouter.get('/gay/list', (req, res) => {
  const scrapers = getGayScrapers()
  res.json({
    total: scrapers.length,
    scrapers: scrapers.map(s => ({ id: s.id, name: s.name, type: s.type, url: s.url })),
    categories: {
      studios: scrapers.filter(s => s.type === 'scene'),
      performers: scrapers.filter(s => s.type === 'performer'),
      groups: scrapers.filter(s => s.type === 'group'),
    }
  })
})
