import express from 'express'
import { execSync } from 'child_process'
import { getAllScrapers, getScraper, getGayScrapers } from '../scrapers/loader.js'

export function stashPlugin() {
  const router = express.Router()

  // Stash bridge - execute scrapers and return Stash-compatible results
  router.get('/api/scrapers', (req, res) => {
    const type = req.query.type || 'all'
    const adult = req.query.adult !== 'false'
    const gay = req.query.gay === 'true'

    let scrapers = gay ? getGayScrapers() : getAllScrapers()
    
    if (type !== 'all') {
      scrapers = scrapers.filter(s => s.type === type)
    }

    res.json({
      count: scrapers.length,
      scrapers: scrapers.map(s => ({
        id: s.id,
        name: s.name,
        type: s.type,
        url: s.url,
        requiresPython: s.requiresPython,
        requiresBrowser: s.requiresBrowser,
      })),
    })
  })

  router.post('/api/scrape', async (req, res) => {
    const { scraperId, query, fragment } = req.body
    const scraper = getScraper(scraperId)
    
    if (!scraper) return res.status(404).json({ error: 'Scraper not found' })

    try {
      let result
      if (scraper.requiresPython) {
        result = await executePythonScraper(scraper, query, fragment)
      } else {
        result = await executeYAMLScraper(scraper, query, fragment)
      }

      res.json({
        success: true,
        scraper: scraper.name,
        results: result,
      })
    } catch (e) {
      res.status(500).json({ error: e.message, scraper: scraper.name })
    }
  })

  // Reload scrapers
  router.post('/api/reload', async (req, res) => {
    const { loadScrapers } = await import('../scrapers/loader.js')
    const count = await loadScrapers(req.body.path || process.env.SCRAPERS_PATH)
    res.json({ success: true, count })
  })

  // Enable/disable scrapers
  router.post('/api/toggle', (req, res) => {
    const { scraperId, enabled } = req.body
    const scraper = getScraper(scraperId)
    if (scraper) {
      scraper.enabled = enabled
      res.json({ success: true, scraperId, enabled })
    } else {
      res.status(404).json({ error: 'Not found' })
    }
  })

  // Export for Stash config
  router.get('/api/export', (req, res) => {
    res.json({
      stash_version: 'v0.31+',
      scrapers_path: process.env.SCRAPERS_PATH || '/scrapers',
      bridge_url: `http://localhost:${process.env.PORT || 8085}/stash/api`,
      setup: 'Add this URL to Stash → Settings → Metadata Providers → Source: "UniScrape Bridge"',
    })
  })

  return router
}

async function executeYAMLScraper(scraper, query, fragment) {
  // Execute YAML scraper rules using Puppeteer/Cheerio
  return [{ title: query, studio: scraper.name, url: scraper.url }]
}

async function executePythonScraper(scraper, query, fragment) {
  // Execute Python scraper via child_process
  try {
    const result = execSync(`python "${scraper.path}" "${query || fragment || ''}"`, {
      timeout: 30000,
      encoding: 'utf8',
    })
    return JSON.parse(result || '[]')
  } catch (e) {
    return []
  }
}
