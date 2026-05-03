import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

// Plugins & Routes
import { stremioPlugin } from './plugins/stremio.js'
import { plexPlugin } from './plugins/plex.js'
import { jellyfinPlugin } from './plugins/jellyfin.js'
import { stashPlugin } from './plugins/stash.js'
import { torrentPlugin } from './plugins/torrent.js'
import { saasRouter } from './routes/saas.js'
import { scraperRouter } from './routes/scraper.js'
import { metadataRouter } from './routes/metadata.js'
import { managerRouter } from './routes/manager.js'
import { loadScrapers } from './scrapers/loader.js'
import { searchEngine } from './search/engine.js'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 8085
const app = express()

// ============ Middleware ============
app.use(helmet({ 
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false 
}))
app.use(cors())
app.use(compression())
app.use(morgan('short'))
app.use(express.json({ limit: '10mb' }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// ============ Health & Status ============
app.get('/', (req, res) => {
  res.json({
    name: 'UniScrape - Universal Media Scraper',
    version: '1.0.0',
    endpoints: {
      stremio: '/stremio/manifest.json',
      plex: '/plex/api',
      jellyfin: '/jellyfin/api',
      stash: '/stash/api',
      scraper: '/api/v1/scrape',
      metadata: '/api/v1/metadata',
      manager: '/api/v1/manager',
      torrent: '/api/v1/torrent',
    },
    status: 'running',
    scrapers_loaded: global.scraperCount || 0,
    uptime: process.uptime(),
  })
})

app.get('/health', (req, res) => res.json({ status: 'ok' }))

// ============ Plugin Mounts ============
app.use('/stremio', stremioPlugin())
app.use('/plex', plexPlugin())
app.use('/jellyfin', jellyfinPlugin())
app.use('/stash', stashPlugin())
app.use('/torrent', torrentPlugin())

// ============ API Routes ============
app.use('/api/v1/scrape', scraperRouter)
app.use('/api/v1/metadata', metadataRouter)
app.use('/api/v1/manager', managerRouter)
app.use('/api/v1/saas', saasRouter)

// --- Serve Static Web UI ---
app.use('/search', express.static(join(__dirname, '..', 'webui', 'public')))
app.use('/', express.static(join(__dirname, '..', 'webui', 'public')))

// --- Start Server ---
async function start() {
  const count = await loadScrapers(join(__dirname, '..', '..', 'stash', 'scrapers'))
  global.scraperCount = count
  
  // Init search engine
  await searchEngine.init()
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════════╗
║   UniScrape v1.0.0 - Ready                 ║
╠══════════════════════════════════════════════╣
║  HTTP:        http://localhost:${PORT}         ║
║  Stremio:     http://localhost:${PORT}/stremio ║
║  Plex:        http://localhost:${PORT}/plex    ║
║  Jellyfin:    http://localhost:${PORT}/jellyfin║
║  Stash:       http://localhost:${PORT}/stash   ║
║  Scrapers:    ${count} loaded                    ║
╚══════════════════════════════════════════════╝
    `.trim())
  })
}

start().catch(console.error)
