import express from 'express'
import { getAllScrapers, getScraper, getGayScrapers } from '../scrapers/loader.js'
import { searchEngine } from '../search/engine.js'

export const metadataRouter = express.Router()

// Search metadata across all scrapers
metadataRouter.get('/search', async (req, res) => {
  const { title, performer, studio, type } = req.query

  if (!title && !performer && !studio) {
    return res.status(400).json({ error: 'Provide title, performer, or studio' })
  }

  const query = title || performer || studio
  const results = []

  // Search using the search engine
  const searchResults = await searchEngine.search(query, { limit: 30 })

  res.json({
    query,
    total: searchResults.length,
    results: searchResults,
  })
})

// Get metadata from a specific scraper
metadataRouter.get('/:scraperId', (req, res) => {
  const scraper = getScraper(req.params.scraperId)
  if (!scraper) return res.status(404).json({ error: 'Scraper not found' })

  res.json({
    scraper: scraper.name,
    url: scraper.url,
    type: scraper.type,
  })
})

// List all available metadata sources
metadataRouter.get('/', (req, res) => {
  const scrapers = getAllScrapers().map(s => ({
    id: s.id, name: s.name, type: s.type, url: s.url,
  }))

  res.json({
    total: scrapers.length,
    sources: scrapers,
    gay_sources: getGayScrapers().length,
  })
})
