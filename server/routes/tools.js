import express from 'express'
import { generateRSS } from '../search/providers/rss-generator.js'
import { extractMetadata, extractBulkMetadata } from '../search/providers/meta-extractor.js'

export const toolsRouter = express.Router()

// RSS generation from any URL
toolsRouter.get('/rss', async (req, res) => {
  const { url, titleSelector, itemSelector } = req.query
  if (!url) return res.status(400).json({ error: 'Missing ?url=' })
  
  const rss = await generateRSS(url, { titleSelector, itemSelector })
  res.type('application/xml').send(rss)
})

// OpenGraph / Link metadata extraction
toolsRouter.get('/meta', async (req, res) => {
  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'Missing ?url=' })
  
  const meta = await extractMetadata(url)
  res.json(meta)
})

// Bulk metadata extraction
toolsRouter.post('/meta/bulk', async (req, res) => {
  const { urls } = req.body
  if (!urls?.length) return res.status(400).json({ error: 'Missing urls array' })
  
  const results = await extractBulkMetadata(urls)
  res.json({ total: urls.length, results })
})

// Proxy management
toolsRouter.get('/proxies', (req, res) => {
  const { setProxies } = require('../search/providers/proxy-rotator.js')
  res.json({ message: 'Proxy management endpoint' })
})

toolsRouter.post('/proxies', (req, res) => {
  const { proxies } = req.body
  const { setProxies } = require('../search/providers/proxy-rotator.js')
  if (proxies?.length) setProxies(proxies)
  res.json({ success: true, count: proxies?.length || 0 })
})
